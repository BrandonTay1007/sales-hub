import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { ForbiddenError } from './errorHandler';

/**
 * Admin Role Middleware
 * Ensures the authenticated user has admin role
 * Must be used AFTER authenticate middleware
 */
export const requireAdmin = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        return next(new ForbiddenError('Authentication required'));
    }

    if (req.user.role !== 'admin') {
        return next(new ForbiddenError('Admin access required'));
    }

    next();
};
