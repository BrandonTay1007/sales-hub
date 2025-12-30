import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { ValidationError } from '../middleware/errorHandler';

/**
 * User Controller
 * Handles HTTP requests for user management endpoints
 * All endpoints require admin authentication
 */
export const userController = {
    /**
     * GET /api/users
     * List all users
     */
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await userService.getAll();

            res.json({
                success: true,
                data: users,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/users/:id
     * Get single user by ID
     */
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const user = await userService.getById(id);

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/users
     * Create a new user
     */
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, username, password, role, commissionRate } = req.body;

            // Validate required fields
            if (!name || typeof name !== 'string' || name.length < 2) {
                throw new ValidationError('Name must be at least 2 characters');
            }
            if (!username || typeof username !== 'string' || username.length < 3) {
                throw new ValidationError('Username must be at least 3 characters');
            }
            if (!password || typeof password !== 'string' || password.length < 6) {
                throw new ValidationError('Password must be at least 6 characters');
            }
            if (!role || !['admin', 'sales'].includes(role)) {
                throw new ValidationError('Role must be admin or sales');
            }

            const user = await userService.create({
                name,
                username,
                password,
                role,
                commissionRate,
            });

            res.status(201).json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/users/:id
     * Update a user
     */
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { name, password, role, commissionRate, commissionPausedDate, status } = req.body;

            // Validate optional fields if provided
            if (name !== undefined && (typeof name !== 'string' || name.length < 2)) {
                throw new ValidationError('Name must be at least 2 characters');
            }
            if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
                throw new ValidationError('Password must be at least 6 characters');
            }
            if (role !== undefined && !['admin', 'sales'].includes(role)) {
                throw new ValidationError('Role must be admin or sales');
            }
            if (status !== undefined && !['active', 'inactive'].includes(status)) {
                throw new ValidationError('Status must be active or inactive');
            }

            const user = await userService.update(id, {
                name,
                password,
                role,
                commissionRate,
                commissionPausedDate,
                status,
            });

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/users/:id
     * Delete a user
     */
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await userService.delete(id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },
};
