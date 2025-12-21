import prisma from '../lib/prisma';
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler';

// Type definitions matching Prisma schema
type Platform = 'facebook' | 'instagram';
type CampaignType = 'post' | 'live' | 'event';
type CampaignStatus = 'active' | 'paused' | 'completed';

interface CreateCampaignData {
    title: string;
    platform: Platform;
    type: CampaignType;
    url: string;
    salesPersonId: string;
    startDate?: Date | null;
}

interface UpdateCampaignData {
    title?: string;
    platform?: Platform;
    type?: CampaignType;
    url?: string;
    status?: CampaignStatus;
    startDate?: Date | null;
    endDate?: Date | null;
    // NOTE: salesPersonId is IMMUTABLE - cannot be changed after creation
}

/**
 * Campaign Service
 * Handles campaign CRUD business logic
 */
export const campaignService = {
    /**
     * Get all campaigns
     * Admin sees all, Sales sees only assigned campaigns
     */
    async getAll(userId: string, isAdmin: boolean) {
        const where = isAdmin ? {} : { salesPersonId: userId };

        const campaigns = await prisma.campaign.findMany({
            where,
            include: {
                salesPerson: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
                _count: {
                    select: { orders: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return campaigns.map((c) => ({
            id: c.id,
            title: c.title,
            platform: c.platform,
            type: c.type,
            url: c.url,
            status: c.status,
            startDate: c.startDate,
            endDate: c.endDate,
            salesPersonId: c.salesPersonId,
            salesPerson: c.salesPerson,
            orderCount: c._count.orders,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        }));
    },

    /**
     * Get single campaign by ID with stats
     */
    async getById(id: string, userId: string, isAdmin: boolean) {
        const campaign = await prisma.campaign.findUnique({
            where: { id },
            include: {
                salesPerson: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                        commissionRate: true,
                    },
                },
                orders: {
                    select: {
                        id: true,
                        orderTotal: true,
                        commissionAmount: true,
                        status: true,
                    },
                },
            },
        });

        if (!campaign) {
            throw new NotFoundError('Campaign not found');
        }

        // Check access: admin can see all, sales can only see assigned
        if (!isAdmin && campaign.salesPersonId !== userId) {
            throw new ForbiddenError('Access denied to this campaign');
        }

        // Calculate stats
        const activeOrders = campaign.orders.filter((o) => o.status === 'active');
        const totalRevenue = activeOrders.reduce((sum, o) => sum + o.orderTotal, 0);
        const totalCommission = activeOrders.reduce((sum, o) => sum + o.commissionAmount, 0);

        return {
            id: campaign.id,
            title: campaign.title,
            platform: campaign.platform,
            type: campaign.type,
            url: campaign.url,
            status: campaign.status,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            salesPersonId: campaign.salesPersonId,
            salesPerson: campaign.salesPerson,
            orderCount: activeOrders.length,
            totalRevenue,
            totalCommission,
            createdAt: campaign.createdAt,
            updatedAt: campaign.updatedAt,
        };
    },

    /**
     * Create a new campaign (Admin only)
     */
    async create(data: CreateCampaignData) {
        // Validate salesPersonId exists and is a sales role
        const salesPerson = await prisma.user.findUnique({
            where: { id: data.salesPersonId },
        });

        if (!salesPerson) {
            throw new ValidationError('Sales person not found');
        }

        if (salesPerson.role !== 'sales') {
            throw new ValidationError('Campaign must be assigned to a user with sales role');
        }

        const campaign = await prisma.campaign.create({
            data: {
                title: data.title,
                platform: data.platform,
                type: data.type,
                url: data.url,
                salesPersonId: data.salesPersonId,
                status: 'active',
                startDate: data.startDate || null,
            },
            include: {
                salesPerson: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });

        return campaign;
    },

    /**
     * Update a campaign (Admin only)
     * NOTE: salesPersonId is IMMUTABLE
     */
    async update(id: string, data: UpdateCampaignData) {
        // Check if campaign exists
        const existing = await prisma.campaign.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundError('Campaign not found');
        }

        // Auto-set endDate when status changes to completed (if not already set)
        let endDateValue = data.endDate;
        if (data.status === 'completed' && !existing.endDate && endDateValue === undefined) {
            endDateValue = new Date();
        }
        // Clear endDate when reactivating
        if (data.status === 'active' && existing.status === 'completed') {
            endDateValue = null;
        }

        const campaign = await prisma.campaign.update({
            where: { id },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.platform && { platform: data.platform }),
                ...(data.type && { type: data.type }),
                ...(data.url && { url: data.url }),
                ...(data.status && { status: data.status }),
                ...(data.startDate !== undefined && { startDate: data.startDate }),
                ...(endDateValue !== undefined && { endDate: endDateValue }),
            },
            include: {
                salesPerson: {
                    select: {
                        id: true,
                        name: true,
                        username: true,
                    },
                },
            },
        });

        return campaign;
    },

    /**
     * Delete a campaign (Admin only)
     * Cascade deletes all associated orders
     */
    async delete(id: string) {
        // Check if campaign exists
        const existing = await prisma.campaign.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundError('Campaign not found');
        }

        // Delete campaign (orders cascade via Prisma schema)
        await prisma.campaign.delete({
            where: { id },
        });

        return { message: 'Campaign and associated orders deleted successfully' };
    },
};
