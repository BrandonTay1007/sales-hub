import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errorHandler';
import prisma from '../lib/prisma';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        username: string;
        name: string;
        role: 'admin' | 'sales';
        commissionRate: number;
    };
}

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token and attaches user to request
 */
export const authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('No token provided');
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }

        // Verify token
        const decoded = jwt.verify(token, secret) as { userId: string };

        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                name: true,
                role: true,
                commissionRate: true,
                status: true,
            },
        });

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        if (user.status !== 'active') {
            throw new UnauthorizedError('Account is inactive');
        }

        // Attach user to request
        req.user = {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            commissionRate: user.commissionRate,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new UnauthorizedError('Invalid token'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new UnauthorizedError('Token expired'));
        } else {
            next(error);
        }
    }
};
