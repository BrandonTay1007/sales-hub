import prisma from '../lib/prisma';
import { authService } from './authService';
import { ValidationError, NotFoundError, ConflictError } from '../middleware/errorHandler';

// Type definitions matching Prisma schema
type Role = 'admin' | 'sales';
type UserStatus = 'active' | 'inactive';

interface CreateUserData {
    name: string;
    username: string;
    password: string;
    role: Role;
    commissionRate?: number;
}

interface UpdateUserData {
    name?: string;
    password?: string;
    role?: Role;
    commissionRate?: number;
    status?: UserStatus;
}

/**
 * User Service
 * Handles user CRUD business logic
 */
export const userService = {
    /**
     * Get all users
     */
    async getAll() {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                commissionRate: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return users;
    },

    /**
     * Get single user by ID
     */
    async getById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                commissionRate: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new NotFoundError('User not found');
        }

        return user;
    },

    /**
     * Create a new user
     */
    async create(data: CreateUserData) {
        // Validate commission rate
        if (data.role === 'sales') {
            if (data.commissionRate === undefined) {
                throw new ValidationError('Commission rate is required for sales role');
            }
            if (data.commissionRate < 0 || data.commissionRate > 100) {
                throw new ValidationError('Commission rate must be between 0 and 100');
            }
        }

        // Check for duplicate username
        const existing = await prisma.user.findUnique({
            where: { username: data.username },
        });

        if (existing) {
            throw new ConflictError('Username already exists');
        }

        // Hash password
        const passwordHash = await authService.hashPassword(data.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: data.name,
                username: data.username,
                passwordHash,
                role: data.role,
                commissionRate: data.role === 'sales' ? data.commissionRate! : 0,
                status: 'active',
            },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                commissionRate: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    },

    /**
     * Update a user
     */
    async update(id: string, data: UpdateUserData) {
        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundError('User not found');
        }

        // Validate commission rate if provided
        if (data.commissionRate !== undefined) {
            if (data.commissionRate < 0 || data.commissionRate > 100) {
                throw new ValidationError('Commission rate must be between 0 and 100');
            }
        }

        // Prepare update data
        const updateData: any = {};

        if (data.name) updateData.name = data.name;
        if (data.role) updateData.role = data.role;
        if (data.commissionRate !== undefined) updateData.commissionRate = data.commissionRate;
        if (data.status) updateData.status = data.status;

        // Hash password if provided
        if (data.password) {
            updateData.passwordHash = await authService.hashPassword(data.password);
        }

        // Update user
        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                commissionRate: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return user;
    },

    /**
     * Delete a user
     */
    async delete(id: string) {
        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundError('User not found');
        }

        // Delete user (campaigns and orders will need cascade handling)
        await prisma.user.delete({
            where: { id },
        });

        return { message: 'User deleted successfully' };
    },
};
