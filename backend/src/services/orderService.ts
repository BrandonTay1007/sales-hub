import prisma from '../lib/prisma';
import { ValidationError, NotFoundError, ForbiddenError } from '../middleware/errorHandler';
import { calculateOrderTotal, calculateCommission, validateProducts, Product } from '../utils/commission';
import { counterService } from './counterService';

// Type definitions
type OrderStatus = 'active' | 'cancelled';

interface CreateOrderData {
    campaignId: string;
    products: Product[];
}

interface UpdateOrderData {
    products?: Product[];
    status?: OrderStatus;
    // NOTE: campaignId is IMMUTABLE - cannot be changed after creation
}

/**
 * Order Service
 * Handles order CRUD with commission snapshot logic
 * 
 * CRITICAL BUSINESS LOGIC:
 * - On CREATE: Capture sales person's current commission rate as snapshotRate
 * - On UPDATE: Recalculate commission using ORIGINAL snapshotRate (never changes)
 * - snapshotRate is IMMUTABLE once set
 */
export const orderService = {
    /**
     * Get all orders with optional filters
     * Admin sees all, Sales sees only orders from their campaigns
     */
    async getAll(
        userId: string,
        isAdmin: boolean,
        filters?: { campaignId?: string; startDate?: string; endDate?: string }
    ) {
        // Build where clause based on role
        let where: any = {};

        if (!isAdmin) {
            // Sales can only see orders from their campaigns
            where.campaign = { salesPersonId: userId };
        }

        // Apply filters
        if (filters?.campaignId) {
            where.campaignId = filters.campaignId;
        }

        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.createdAt.lte = new Date(filters.endDate + 'T23:59:59.999Z');
            }
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                campaign: {
                    select: {
                        id: true,
                        referenceId: true,
                        title: true,
                        salesPersonId: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return orders;
    },

    /**
     * Get single order by ID
     */
    async getById(id: string, userId: string, isAdmin: boolean) {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                campaign: {
                    select: {
                        id: true,
                        referenceId: true,
                        title: true,
                        salesPersonId: true,
                        salesPerson: {
                            select: {
                                id: true,
                                name: true,
                                username: true,
                            },
                        },
                    },
                },
            },
        });

        if (!order) {
            throw new NotFoundError('Order not found');
        }

        // Check access: admin can see all, sales can only see their campaign's orders
        if (!isAdmin && order.campaign.salesPersonId !== userId) {
            throw new ForbiddenError('Access denied to this order');
        }

        return order;
    },

    /**
     * Create a new order with commission snapshot
     * CRITICAL: Captures sales person's current commission rate at creation time
     */
    async create(data: CreateOrderData, userId: string, isAdmin: boolean) {
        // Validate products
        const validation = validateProducts(data.products);
        if (!validation.valid) {
            throw new ValidationError(validation.error!);
        }

        // Get campaign with sales person info and referenceId
        const campaign = await prisma.campaign.findUnique({
            where: { id: data.campaignId },
            include: {
                salesPerson: {
                    select: {
                        id: true,
                        commissionRate: true,
                    },
                },
            },
        });

        if (!campaign) {
            throw new NotFoundError('Campaign not found');
        }

        // Check access: sales can only create orders for their own campaigns
        if (!isAdmin && campaign.salesPersonId !== userId) {
            throw new ForbiddenError('Cannot create orders for campaigns assigned to other sales persons');
        }

        // Calculate order total
        const orderTotal = calculateOrderTotal(validation.products!);

        // CRITICAL: Snapshot the commission rate at creation time
        const snapshotRate = campaign.salesPerson.commissionRate;
        const commissionAmount = calculateCommission(orderTotal, snapshotRate);

        // Generate referenceId using campaign's referenceId
        const referenceId = await counterService.generateOrderReferenceId(campaign.referenceId);

        // Create order
        const order = await prisma.order.create({
            data: {
                referenceId,
                campaignId: data.campaignId,
                products: validation.products!,
                orderTotal,
                snapshotRate,
                commissionAmount,
                status: 'active',
            },
            include: {
                campaign: {
                    select: {
                        id: true,
                        referenceId: true,
                        title: true,
                    },
                },
            },
        });

        return order;
    },

    /**
     * Update an order's products
     * CRITICAL: Recalculates commission using ORIGINAL snapshotRate
     * NOTE: campaignId is IMMUTABLE
     */
    async update(id: string, data: UpdateOrderData, userId: string, isAdmin: boolean) {
        // Get existing order
        const existing = await prisma.order.findUnique({
            where: { id },
            include: {
                campaign: {
                    select: {
                        salesPersonId: true,
                    },
                },
            },
        });

        if (!existing) {
            throw new NotFoundError('Order not found');
        }

        // Check access
        if (!isAdmin && existing.campaign.salesPersonId !== userId) {
            throw new ForbiddenError('Access denied to this order');
        }

        // Prepare update data
        const updateData: any = {};

        // Update products if provided
        if (data.products) {
            const validation = validateProducts(data.products);
            if (!validation.valid) {
                throw new ValidationError(validation.error!);
            }

            updateData.products = validation.products;

            // Recalculate totals using ORIGINAL snapshotRate
            const newOrderTotal = calculateOrderTotal(validation.products!);
            updateData.orderTotal = newOrderTotal;
            updateData.commissionAmount = calculateCommission(newOrderTotal, existing.snapshotRate);
        }

        // Update status if provided
        if (data.status) {
            updateData.status = data.status;
        }

        // Update order
        const order = await prisma.order.update({
            where: { id },
            data: updateData,
            include: {
                campaign: {
                    select: {
                        id: true,
                        referenceId: true,
                        title: true,
                    },
                },
            },
        });

        return order;
    },

    /**
     * Delete an order
     */
    async delete(id: string, userId: string, isAdmin: boolean) {
        // Get existing order
        const existing = await prisma.order.findUnique({
            where: { id },
            include: {
                campaign: {
                    select: {
                        salesPersonId: true,
                    },
                },
            },
        });

        if (!existing) {
            throw new NotFoundError('Order not found');
        }

        // Check access
        if (!isAdmin && existing.campaign.salesPersonId !== userId) {
            throw new ForbiddenError('Access denied to this order');
        }

        // Delete order
        await prisma.order.delete({
            where: { id },
        });

        return { message: 'Order deleted successfully' };
    },
};
