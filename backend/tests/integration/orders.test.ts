import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import bcrypt from 'bcryptjs';

describe('Orders API - Commission Snapshot', () => {
    let adminToken: string;
    let salesUserId: string;
    let campaignId: string;

    beforeAll(async () => {
        // Clean up
        await prisma.order.deleteMany();
        await prisma.campaign.deleteMany();
        await prisma.user.deleteMany({
            where: { username: { in: ['orderadmin', 'ordersales'] } },
        });

        // Create admin
        const adminHash = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                name: 'Order Admin',
                username: 'orderadmin',
                passwordHash: adminHash,
                role: 'admin',
                commissionRate: 0,
                status: 'active',
            },
        });

        // Create sales user with 10% rate
        const salesHash = await bcrypt.hash('sales123', 10);
        const salesUser = await prisma.user.create({
            data: {
                name: 'Order Sales',
                username: 'ordersales',
                passwordHash: salesHash,
                role: 'sales',
                commissionRate: 10, // 10% commission rate
                status: 'active',
            },
        });
        salesUserId = salesUser.id;

        // Create campaign for sales user
        const campaign = await prisma.campaign.create({
            data: {
                title: 'Test Campaign',
                platform: 'facebook',
                type: 'post',
                url: 'https://example.com',
                salesPersonId: salesUserId,
                status: 'active',
            },
        });
        campaignId = campaign.id;

        // Get admin token
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'orderadmin', password: 'admin123' });
        adminToken = adminRes.body.data.token;
    });

    afterAll(async () => {
        await prisma.order.deleteMany();
        await prisma.campaign.deleteMany();
        await prisma.user.deleteMany({
            where: { username: { in: ['orderadmin', 'ordersales'] } },
        });
        await prisma.$disconnect();
    });

    describe('Commission Snapshot Logic', () => {
        let orderId: string;

        it('should capture snapshot rate at order creation', async () => {
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    campaignId,
                    products: [
                        { name: 'Widget', qty: 2, basePrice: 100 },
                    ],
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);

            // Order total: 2 * 100 = 200
            expect(res.body.data.orderTotal).toBe(200);

            // Snapshot rate should be 10% (sales person's rate)
            expect(res.body.data.snapshotRate).toBe(10);

            // Commission: 200 * 10% = 20
            expect(res.body.data.commissionAmount).toBe(20);

            orderId = res.body.data.id;
        });

        it('should use original snapshot rate on update', async () => {
            // First, change the sales person's commission rate to 15%
            await prisma.user.update({
                where: { id: salesUserId },
                data: { commissionRate: 15 },
            });

            // Now update the order with new products
            const res = await request(app)
                .put(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    products: [
                        { name: 'Widget', qty: 3, basePrice: 100 },
                    ],
                });

            expect(res.status).toBe(200);

            // New order total: 3 * 100 = 300
            expect(res.body.data.orderTotal).toBe(300);

            // Snapshot rate should STILL be 10% (original, not 15%)
            expect(res.body.data.snapshotRate).toBe(10);

            // Commission: 300 * 10% = 30 (using original rate)
            // NOT 300 * 15% = 45
            expect(res.body.data.commissionAmount).toBe(30);

            // Reset the rate for other tests
            await prisma.user.update({
                where: { id: salesUserId },
                data: { commissionRate: 10 },
            });
        });

        it('should reject changing campaignId (IMMUTABLE)', async () => {
            const res = await request(app)
                .put(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    campaignId: 'some-other-campaign-id',
                });

            expect(res.status).toBe(400);
            expect(res.body.error.message).toContain('Campaign cannot be changed');
        });
    });

    describe('Order CRUD', () => {
        it('should list orders', async () => {
            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should filter orders by campaignId', async () => {
            const res = await request(app)
                .get(`/api/orders?campaignId=${campaignId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            res.body.data.forEach((order: any) => {
                expect(order.campaignId).toBe(campaignId);
            });
        });
    });
});
