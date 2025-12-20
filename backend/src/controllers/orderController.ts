import { Response, NextFunction } from 'express';
import { orderService } from '../services/orderService';
import { AuthenticatedRequest } from '../middleware/auth';
import { ValidationError } from '../middleware/errorHandler';

/**
 * Order Controller
 * Handles HTTP requests for order management endpoints
 */
export const orderController = {
    /**
     * GET /api/orders
     * List orders with optional filters
     */
    async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const { campaignId, startDate, endDate } = req.query;

            const orders = await orderService.getAll(
                req.user.id,
                req.user.role === 'admin',
                {
                    campaignId: campaignId as string | undefined,
                    startDate: startDate as string | undefined,
                    endDate: endDate as string | undefined,
                }
            );

            res.json({
                success: true,
                data: orders,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/orders/:id
     * Get single order
     */
    async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const { id } = req.params;
            const order = await orderService.getById(
                id,
                req.user.id,
                req.user.role === 'admin'
            );

            res.json({
                success: true,
                data: order,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/orders
     * Create a new order with commission snapshot
     */
    async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const { campaignId, products } = req.body;

            // Validate required fields
            if (!campaignId || typeof campaignId !== 'string') {
                throw new ValidationError('Campaign ID is required');
            }
            if (!products) {
                throw new ValidationError('Products are required');
            }

            const order = await orderService.create(
                { campaignId, products },
                req.user.id,
                req.user.role === 'admin'
            );

            res.status(201).json({
                success: true,
                data: order,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/orders/:id
     * Update an order's products
     * NOTE: campaignId cannot be changed
     */
    async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const { id } = req.params;
            const { products, status, campaignId } = req.body;

            // IMMUTABLE: Reject attempts to change campaignId
            if (campaignId !== undefined) {
                throw new ValidationError('Campaign cannot be changed after order creation');
            }

            // Validate status if provided
            if (status !== undefined && !['active', 'cancelled'].includes(status)) {
                throw new ValidationError('Status must be active or cancelled');
            }

            const order = await orderService.update(
                id,
                { products, status },
                req.user.id,
                req.user.role === 'admin'
            );

            res.json({
                success: true,
                data: order,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/orders/:id
     * Delete an order
     */
    async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const { id } = req.params;
            const result = await orderService.delete(
                id,
                req.user.id,
                req.user.role === 'admin'
            );

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },
};
