import prisma from '../lib/prisma';
import { NotFoundError, ForbiddenError } from '../middleware/errorHandler';

interface CampaignBreakdown {
    campaignId: string;
    title: string;
    orderCount: number;
    totalSales: number;
    totalCommission: number;
}

interface PayoutData {
    year: number;
    month: number;
    totalCommission: number;
    campaigns: CampaignBreakdown[];
}

interface TeamPayoutData {
    year: number;
    month: number;
    grandTotalCommission: number;
    salesPersons: {
        userId: string;
        name: string;
        currentRate: number;
        totalCommission: number;
        campaigns: CampaignBreakdown[];
    }[];
}

/**
 * Payout Service
 * Handles commission payout calculations and aggregations
 */
export const payoutService = {
    /**
     * Get sales person's own payout for a specific month
     * GET /api/payouts/me?year=2025&month=12
     */
    async getMyPayout(userId: string, year: number, month: number): Promise<PayoutData> {
        // Get start and end of month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // Get all active orders for this user's campaigns in the month
        const orders = await prisma.order.findMany({
            where: {
                campaign: {
                    salesPersonId: userId,
                },
                status: 'active',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        // Group by campaign
        const campaignMap = new Map<string, CampaignBreakdown>();

        for (const order of orders) {
            const campaignId = order.campaignId;
            const existing = campaignMap.get(campaignId);

            if (existing) {
                existing.orderCount++;
                existing.totalSales += order.orderTotal;
                existing.totalCommission += order.commissionAmount;
            } else {
                campaignMap.set(campaignId, {
                    campaignId,
                    title: order.campaign.title,
                    orderCount: 1,
                    totalSales: order.orderTotal,
                    totalCommission: order.commissionAmount,
                });
            }
        }

        const campaigns = Array.from(campaignMap.values());
        const totalCommission = campaigns.reduce((sum, c) => sum + c.totalCommission, 0);

        return {
            year,
            month,
            totalCommission,
            campaigns,
        };
    },

    /**
     * Get all sales persons' payouts for a specific month (Admin only)
     * GET /api/payouts/team?year=2025&month=12
     */
    async getTeamPayout(year: number, month: number): Promise<TeamPayoutData> {
        // Get start and end of month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // Get all sales users
        const salesPersons = await prisma.user.findMany({
            where: {
                role: 'sales',
            },
            select: {
                id: true,
                name: true,
                commissionRate: true,
            },
        });

        // Get all orders for the month
        const orders = await prisma.order.findMany({
            where: {
                status: 'active',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        salesPersonId: true,
                    },
                },
            },
        });

        // Build result per sales person
        const result: TeamPayoutData['salesPersons'] = [];

        for (const salesPerson of salesPersons) {
            // Filter orders for this sales person
            const userOrders = orders.filter(
                (o) => o.campaign.salesPersonId === salesPerson.id
            );

            // Group by campaign
            const campaignMap = new Map<string, CampaignBreakdown>();

            for (const order of userOrders) {
                const campaignId = order.campaignId;
                const existing = campaignMap.get(campaignId);

                if (existing) {
                    existing.orderCount++;
                    existing.totalSales += order.orderTotal;
                    existing.totalCommission += order.commissionAmount;
                } else {
                    campaignMap.set(campaignId, {
                        campaignId,
                        title: order.campaign.title,
                        orderCount: 1,
                        totalSales: order.orderTotal,
                        totalCommission: order.commissionAmount,
                    });
                }
            }

            const campaigns = Array.from(campaignMap.values());
            const totalCommission = campaigns.reduce((sum, c) => sum + c.totalCommission, 0);

            result.push({
                userId: salesPerson.id,
                name: salesPerson.name,
                currentRate: salesPerson.commissionRate,
                totalCommission,
                campaigns,
            });
        }

        // Calculate grand total
        const grandTotalCommission = result.reduce((sum, sp) => sum + sp.totalCommission, 0);

        return {
            year,
            month,
            grandTotalCommission,
            salesPersons: result,
        };
    },
};
