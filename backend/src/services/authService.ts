import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { UnauthorizedError } from '../middleware/errorHandler';

interface LoginResult {
    token: string;
    user: {
        id: string;
        name: string;
        username: string;
        role: 'admin' | 'sales';
        commissionRate: number;
    };
}

/**
 * Auth Service
 * Handles authentication logic: login, password hashing
 */
export const authService = {
    /**
     * Authenticate user with username and password
     * Returns JWT token and user info on success
     */
    async login(username: string, password: string): Promise<LoginResult> {
        // Find user by username
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        if (user.status !== 'active') {
            throw new UnauthorizedError('Account is inactive');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid credentials');
        }

        // Generate JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
        const token = jwt.sign(
            { userId: user.id },
            secret,
            { expiresIn } as jwt.SignOptions
        );

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                role: user.role,
                commissionRate: user.commissionRate,
            },
        };
    },

    /**
     * Hash a password using bcrypt
     */
    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    },

    /**
     * Verify a password against a hash
     */
    async verifyPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    },
};
