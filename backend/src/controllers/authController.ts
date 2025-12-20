import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/auth';
import { ValidationError } from '../middleware/errorHandler';

/**
 * Auth Controller
 * Handles HTTP requests for authentication endpoints
 */
export const authController = {
    /**
     * POST /api/auth/login
     * Authenticate user and return JWT token
     */
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body;

            // Validate input
            if (!username || typeof username !== 'string') {
                throw new ValidationError('Username is required');
            }
            if (!password || typeof password !== 'string') {
                throw new ValidationError('Password is required');
            }

            const result = await authService.login(username, password);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/auth/logout
     * Client-side logout (token invalidation is handled client-side)
     */
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            // Since we're using stateless JWT, logout is handled client-side
            // by removing the token. This endpoint is for API consistency.
            res.json({
                success: true,
                data: { message: 'Logged out successfully' },
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/auth/me
     * Get current authenticated user's profile
     */
    async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            res.json({
                success: true,
                data: {
                    user: req.user,
                },
            });
        } catch (error) {
            next(error);
        }
    },
};
