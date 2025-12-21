import { Response, NextFunction } from 'express';
import { campaignService } from '../services/campaignService';
import { AuthenticatedRequest } from '../middleware/auth';
import { ValidationError } from '../middleware/errorHandler';

/**
 * Campaign Controller
 * Handles HTTP requests for campaign management endpoints
 */
export const campaignController = {
    /**
     * GET /api/campaigns
     * List campaigns (Admin: all, Sales: assigned only)
     */
    async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const campaigns = await campaignService.getAll(
                req.user.id,
                req.user.role === 'admin'
            );

            res.json({
                success: true,
                data: campaigns,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/campaigns/:id
     * Get single campaign with stats
     */
    async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                throw new Error('User not found in request');
            }

            const { id } = req.params;
            const campaign = await campaignService.getById(
                id,
                req.user.id,
                req.user.role === 'admin'
            );

            res.json({
                success: true,
                data: campaign,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/campaigns
     * Create a new campaign (Admin only)
     */
    async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { title, platform, type, url, salesPersonId, startDate } = req.body;

            // Validate required fields
            if (!title || typeof title !== 'string' || title.length < 3) {
                throw new ValidationError('Title must be at least 3 characters');
            }
            if (!platform || !['facebook', 'instagram'].includes(platform)) {
                throw new ValidationError('Platform must be facebook or instagram');
            }
            if (!type || !['post', 'live', 'event'].includes(type)) {
                throw new ValidationError('Type must be post, live, or event');
            }
            if (!url || typeof url !== 'string') {
                throw new ValidationError('URL is required');
            }
            if (!salesPersonId || typeof salesPersonId !== 'string') {
                throw new ValidationError('Sales person ID is required');
            }

            const campaign = await campaignService.create({
                title,
                platform,
                type,
                url,
                salesPersonId,
                startDate: startDate ? new Date(startDate) : null,
            });

            res.status(201).json({
                success: true,
                data: campaign,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/campaigns/:id
     * Update a campaign (Admin only)
     * NOTE: salesPersonId cannot be changed
     */
    async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { title, platform, type, url, status, salesPersonId, startDate, endDate } = req.body;

            // IMMUTABLE: Reject attempts to change salesPersonId
            if (salesPersonId !== undefined) {
                throw new ValidationError('Sales person cannot be changed after campaign creation');
            }

            // Validate optional fields if provided
            if (title !== undefined && (typeof title !== 'string' || title.length < 3)) {
                throw new ValidationError('Title must be at least 3 characters');
            }
            if (platform !== undefined && !['facebook', 'instagram'].includes(platform)) {
                throw new ValidationError('Platform must be facebook or instagram');
            }
            if (type !== undefined && !['post', 'live', 'event'].includes(type)) {
                throw new ValidationError('Type must be post, live, or event');
            }
            if (status !== undefined && !['active', 'paused', 'completed'].includes(status)) {
                throw new ValidationError('Status must be active, paused, or completed');
            }

            const campaign = await campaignService.update(id, {
                title,
                platform,
                type,
                url,
                status,
                startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
                endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined,
            });

            res.json({
                success: true,
                data: campaign,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/campaigns/:id
     * Delete a campaign (Admin only)
     */
    async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await campaignService.delete(id);

            res.json({
                success: true,
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },
};
