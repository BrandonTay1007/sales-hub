import { Response, NextFunction } from 'express';
import { payoutService } from '../services/payoutService';
import { AuthenticatedRequest } from '../middleware/auth';
import { ValidationError } from '../middleware/errorHandler';

/**
 * Payout Controller
 * Handles HTTP requests for payout endpoints
 */
export const payoutController = {
    /**
     * GET /api/payouts/me
     * Get sales person's own payout for a month
     */
    async getMyPayout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const { year, month } = req.query;

            // Validate required params
            if (!year || !month) {
                throw new ValidationError('Year and month are required query parameters');
            }

            const yearNum = parseInt(year as string, 10);
            const monthNum = parseInt(month as string, 10);

            if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
                throw new ValidationError('Year must be a valid number between 2000 and 2100');
            }

            if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
                throw new ValidationError('Month must be a number between 1 and 12');
            }

            const payout = await payoutService.getMyPayout(req.user.id, yearNum, monthNum);

            res.json({
                success: true,
                data: payout,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/payouts/team
     * Get all sales persons' payouts for a month (Admin only)
     */
    async getTeamPayout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { year, month } = req.query;

            // Validate required params
            if (!year || !month) {
                throw new ValidationError('Year and month are required query parameters');
            }

            const yearNum = parseInt(year as string, 10);
            const monthNum = parseInt(month as string, 10);

            if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
                throw new ValidationError('Year must be a valid number between 2000 and 2100');
            }

            if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
                throw new ValidationError('Month must be a number between 1 and 12');
            }

            const payout = await payoutService.getTeamPayout(yearNum, monthNum);

            res.json({
                success: true,
                data: payout,
            });
        } catch (error) {
            next(error);
        }
    },
};
