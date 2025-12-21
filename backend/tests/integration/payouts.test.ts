import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import bcrypt from 'bcryptjs';

describe('Payouts API', () => {
    let adminToken: string;
    let salesToken: string;
    let salesUserId: string;
    let campaignId: string;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    beforeAll(async () => {
        // Clean up
        await prisma.order.deleteMany();
        await prisma.campaign.deleteMany();
        await prisma.user.deleteMany({
            where: { username: { in: ['payoutadmin', 'payoutsales'] } },
        });

        // Create admin user
        const adminHash = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                name: 'Payout Admin',
                username: 'payoutadmin',
                passwordHash: adminHash,
                role: 'admin',
                commissionRate: 0,
                status: 'active',
            },
        });

        // Create sales user
        const salesHash = await bcrypt.hash('sales123', 10);
        const salesUser = await prisma.user.create({
            data: {
                name: 'Payout Sales',
                username: 'payoutsales',
                passwordHash: salesHash,
                role: 'sales',
                commissionRate: 15,
                status: 'active',
            },
        });
        salesUserId = salesUser.id;

        // Create campaign
        const campaign = await prisma.campaign.create({
            data: {
                referenceId: 'FB-PAYOUT-001',
                title: 'Payout Test Campaign',
                platform: 'facebook',
                type: 'post',
                url: 'https://facebook.com/post/payout',
                salesPersonId: salesUserId,
                status: 'active',
            },
        });
        campaignId = campaign.id;

        // Create orders for current month with proper date
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        await prisma.order.create({
            data: {
                referenceId: 'FB-PAYOUT-001-01',
                campaignId,
                products: [
                    { name: 'Product A', qty: 2, basePrice: 100 },
                ],
                orderTotal: 200,
                snapshotRate: 15,
                commissionAmount: 30,
                status: 'active',
                createdAt: firstDayOfMonth,
            },
        });

        await prisma.order.create({
            data: {
                referenceId: 'FB-PAYOUT-001-02',
                campaignId,
                products: [
                    { name: 'Product B', qty: 1, basePrice: 500 },
                ],
                orderTotal: 500,
                snapshotRate: 15,
                commissionAmount: 75,
                status: 'active',
                createdAt: firstDayOfMonth,
            },
        });

        // Get tokens
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'payoutadmin', password: 'admin123' });
        adminToken = adminRes.body.data.token;

        const salesRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'payoutsales', password: 'sales123' });
        salesToken = salesRes.body.data.token;
    });

    afterAll(async () => {
        await prisma.order.deleteMany();
        await prisma.campaign.deleteMany();
        await prisma.user.deleteMany({
            where: { username: { in: ['payoutadmin', 'payoutsales'] } },
        });
        await prisma.counter.deleteMany();
        await prisma.$disconnect();
    });

    describe('GET /api/payouts/me', () => {
        it('should get sales person payout for current month', async () => {
            const res = await request(app)
                .get(`/api/payouts/me?year=${currentYear}&month=${currentMonth}`)
                .set('Authorization', `Bearer ${salesToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.year).toBe(currentYear);
            expect(res.body.data.month).toBe(currentMonth);
            expect(res.body.data.totalCommission).toBe(105); // 30 + 75
            expect(res.body.data.campaigns).toBeDefined();
            expect(res.body.data.campaigns.length).toBeGreaterThan(0);
        });

        it('should return zero commission for month with no orders', async () => {
            const res = await request(app)
                .get('/api/payouts/me?year=2020&month=1')
                .set('Authorization', `Bearer ${salesToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.totalCommission).toBe(0);
            expect(res.body.data.campaigns.length).toBe(0);
        });

        it('should require year and month parameters', async () => {
            const res = await request(app)
                .get('/api/payouts/me')
                .set('Authorization', `Bearer ${salesToken}`);

            expect(res.status).toBe(400);
            expect(res.body.error.message).toContain('Year and month are required');
        });

        it('should validate year range', async () => {
            const res = await request(app)
                .get('/api/payouts/me?year=1999&month=1')
                .set('Authorization', `Bearer ${salesToken}`);

            expect(res.status).toBe(400);
            expect(res.body.error.message).toContain('Year must be a valid number');
        });

        it('should validate month range', async () => {
            const res = await request(app)
                .get('/api/payouts/me?year=2024&month=13')
                .set('Authorization', `Bearer ${salesToken}`);

            expect(res.status).toBe(400);
            expect(res.body.error.message).toContain('Month must be a number between 1 and 12');
        });

        it('should reject admin access to /me endpoint', async () => {
            const res = await request(app)
                .get(`/api/payouts/me?year=${currentYear}&month=${currentMonth}`)
                .set('Authorization', `Bearer ${adminToken}`);

            // Admin should get 403 or empty data since they're not a sales person
            expect([403, 200]).toContain(res.status);
            if (res.status === 200) {
                expect(res.body.data.totalCommission).toBe(0);
            }
        });
    });

    describe('GET /api/payouts/team', () => {
        it('should get team payouts for current month (admin only)', async () => {
            const res = await request(app)
                .get(`/api/payouts/team?year=${currentYear}&month=${currentMonth}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.year).toBe(currentYear);
            expect(res.body.data.month).toBe(currentMonth);
            expect(res.body.data.grandTotalCommission).toBe(105);
            expect(res.body.data.salesPersons).toBeDefined();
            expect(Array.isArray(res.body.data.salesPersons)).toBe(true);
        });

        it('should reject sales user access to team payouts', async () => {
            const res = await request(app)
                .get(`/api/payouts/team?year=${currentYear}&month=${currentMonth}`)
                .set('Authorization', `Bearer ${salesToken}`);

            expect(res.status).toBe(403);
        });

        it('should require year and month parameters', async () => {
            const res = await request(app)
                .get('/api/payouts/team')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(400);
        });

        it('should show breakdown by sales person', async () => {
            const res = await request(app)
                .get(`/api/payouts/team?year=${currentYear}&month=${currentMonth}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);

            const salesPerson = res.body.data.salesPersons.find(
                (sp: any) => sp.userId === salesUserId
            );

            expect(salesPerson).toBeDefined();
            expect(salesPerson.name).toBe('Payout Sales');
            expect(salesPerson.totalCommission).toBe(105);
            expect(salesPerson.campaigns.length).toBeGreaterThan(0);
        });
    });

    describe('Payout Calculations', () => {
        it('should aggregate commissions by campaign', async () => {
            const res = await request(app)
                .get(`/api/payouts/me?year=${currentYear}&month=${currentMonth}`)
                .set('Authorization', `Bearer ${salesToken}`);

            const campaign = res.body.data.campaigns.find(
                (c: any) => c.campaignId === campaignId
            );

            expect(campaign).toBeDefined();
            expect(campaign.orderCount).toBe(2);
            expect(campaign.totalSales).toBe(700); // 200 + 500
            expect(campaign.totalCommission).toBe(105); // 30 + 75
        });

        it('should only include active orders in payout', async () => {
            // Create a cancelled order
            const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);

            await prisma.order.create({
                data: {
                    referenceId: 'FB-PAYOUT-001-CANCELLED',
                    campaignId,
                    products: [{ name: 'Cancelled Product', qty: 1, basePrice: 1000 }],
                    orderTotal: 1000,
                    snapshotRate: 15,
                    commissionAmount: 150,
                    status: 'cancelled',
                    createdAt: firstDayOfMonth,
                },
            });

            const res = await request(app)
                .get(`/api/payouts/me?year=${currentYear}&month=${currentMonth}`)
                .set('Authorization', `Bearer ${salesToken}`);

            // Should still be 105, not 255 (cancelled order not included)
            expect(res.body.data.totalCommission).toBe(105);

            // Clean up
            await prisma.order.deleteMany({
                where: { referenceId: 'FB-PAYOUT-001-CANCELLED' },
            });
        });
    });
});
