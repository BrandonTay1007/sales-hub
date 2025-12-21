import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import bcrypt from 'bcryptjs';

describe('Campaigns API', () => {
    let adminToken: string;
    let salesToken: string;
    let adminId: string;
    let salesUserId: string;

    beforeAll(async () => {
        // Clean up
        await prisma.order.deleteMany();
        await prisma.campaign.deleteMany();
        await prisma.user.deleteMany({
            where: { username: { in: ['campaignadmin', 'campaignsales'] } },
        });

        // Create admin user
        const adminHash = await bcrypt.hash('admin123', 10);
        const admin = await prisma.user.create({
            data: {
                name: 'Campaign Admin',
                username: 'campaignadmin',
                passwordHash: adminHash,
                role: 'admin',
                commissionRate: 0,
                status: 'active',
            },
        });
        adminId = admin.id;

        // Create sales user
        const salesHash = await bcrypt.hash('sales123', 10);
        const salesUser = await prisma.user.create({
            data: {
                name: 'Campaign Sales',
                username: 'campaignsales',
                passwordHash: salesHash,
                role: 'sales',
                commissionRate: 12,
                status: 'active',
            },
        });
        salesUserId = salesUser.id;

        // Get tokens
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'campaignadmin', password: 'admin123' });
        adminToken = adminRes.body.data.token;

        const salesRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'campaignsales', password: 'sales123' });
        salesToken = salesRes.body.data.token;
    });

    afterAll(async () => {
        await prisma.order.deleteMany();
        await prisma.campaign.deleteMany();
        await prisma.user.deleteMany({
            where: { username: { in: ['campaignadmin', 'campaignsales'] } },
        });
        await prisma.counter.deleteMany();
        await prisma.$disconnect();
    });

    describe('POST /api/campaigns', () => {
        it('should create campaign with auto-generated referenceId', async () => {
            const res = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Facebook Campaign 1',
                    platform: 'facebook',
                    type: 'post',
                    url: 'https://facebook.com/post/123',
                    salesPersonId: salesUserId,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.referenceId).toMatch(/^FB-\d+$/);
            expect(res.body.data.title).toBe('Facebook Campaign 1');
            expect(res.body.data.status).toBe('active');
        });

        it('should create Instagram campaign with IG prefix', async () => {
            const res = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Instagram Campaign 1',
                    platform: 'instagram',
                    type: 'live',
                    url: 'https://instagram.com/live/456',
                    salesPersonId: salesUserId,
                });

            expect(res.status).toBe(201);
            expect(res.body.data.referenceId).toMatch(/^IG-\d+$/);
        });

        it('should reject campaign creation by sales user', async () => {
            const res = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${salesToken}`)
                .send({
                    title: 'Unauthorized Campaign',
                    platform: 'facebook',
                    type: 'post',
                    url: 'https://facebook.com/post/789',
                    salesPersonId: salesUserId,
                });

            expect(res.status).toBe(403);
        });

        it('should validate required fields', async () => {
            const res = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    platform: 'facebook',
                    // Missing title, type, url, salesPersonId
                });

            expect(res.status).toBe(400);
        });

        it('should validate platform enum', async () => {
            const res = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Invalid Platform',
                    platform: 'twitter', // Invalid
                    type: 'post',
                    url: 'https://twitter.com/post/123',
                    salesPersonId: salesUserId,
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/campaigns', () => {
        it('should list all campaigns for admin', async () => {
            // Create a campaign first to ensure there's data
            await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Test Campaign for List',
                    platform: 'facebook',
                    type: 'post',
                    url: 'https://facebook.com/test',
                    salesPersonId: salesUserId,
                });

            const res = await request(app)
                .get('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        it('should list only assigned campaigns for sales user', async () => {
            const res = await request(app)
                .get('/api/campaigns')
                .set('Authorization', `Bearer ${salesToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);

            // All campaigns should belong to this sales person
            res.body.data.forEach((campaign: any) => {
                expect(campaign.salesPersonId).toBe(salesUserId);
            });
        });
    });

    describe('GET /api/campaigns/:id', () => {
        it('should get campaign by id', async () => {
            // Create a campaign first
            const createRes = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Campaign for Get By ID',
                    platform: 'facebook',
                    type: 'post',
                    url: 'https://facebook.com/getbyid',
                    salesPersonId: salesUserId,
                });

            const campaignId = createRes.body.data.id;

            const res = await request(app)
                .get(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(campaignId);
            expect(res.body.data.salesPerson).toBeDefined();
        });

        it('should return 404 for non-existent campaign', async () => {
            const res = await request(app)
                .get('/api/campaigns/507f1f77bcf86cd799439011') // Valid ObjectId format
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(404);
        });
    });

    describe('PUT /api/campaigns/:id', () => {
        it('should update campaign title and status', async () => {
            // Create a campaign first
            const createRes = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Campaign to Update',
                    platform: 'facebook',
                    type: 'post',
                    url: 'https://facebook.com/update',
                    salesPersonId: salesUserId,
                });

            const campaignId = createRes.body.data.id;

            const res = await request(app)
                .put(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Updated Campaign Title',
                    status: 'paused',
                });

            expect(res.status).toBe(200);
            expect(res.body.data.title).toBe('Updated Campaign Title');
            expect(res.body.data.status).toBe('paused');
        });

        it('should reject changing salesPersonId (IMMUTABLE)', async () => {
            // Create a campaign first
            const createRes = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Campaign for Immutable Test',
                    platform: 'facebook',
                    type: 'post',
                    url: 'https://facebook.com/immutable',
                    salesPersonId: salesUserId,
                });

            const campaignId = createRes.body.data.id;

            const res = await request(app)
                .put(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    salesPersonId: adminId, // Trying to change
                });

            expect(res.status).toBe(400);
            expect(res.body.error.message).toContain('Sales person cannot be changed');
        });

        it('should set endDate when status changes to completed', async () => {
            // Create a campaign first
            const createRes = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Campaign to Complete',
                    platform: 'facebook',
                    type: 'post',
                    url: 'https://facebook.com/complete',
                    salesPersonId: salesUserId,
                });

            const campaignId = createRes.body.data.id;

            const res = await request(app)
                .put(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    status: 'completed',
                });

            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('completed');
            expect(res.body.data.endDate).toBeDefined();
        });

        it('should reject update by sales user', async () => {
            // Create a campaign first
            const createRes = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Campaign for Sales Update Test',
                    platform: 'facebook',
                    type: 'post',
                    url: 'https://facebook.com/salesupdate',
                    salesPersonId: salesUserId,
                });

            const campaignId = createRes.body.data.id;

            const res = await request(app)
                .put(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${salesToken}`)
                .send({
                    title: 'Unauthorized Update',
                });

            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/campaigns/:id', () => {
        it('should delete campaign (admin only)', async () => {
            // Create a campaign to delete
            const createRes = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Campaign to Delete',
                    platform: 'facebook',
                    type: 'event',
                    url: 'https://facebook.com/event/999',
                    salesPersonId: salesUserId,
                });

            const deleteId = createRes.body.data.id;

            const res = await request(app)
                .delete(`/api/campaigns/${deleteId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);

            // Verify it's deleted
            const getRes = await request(app)
                .get(`/api/campaigns/${deleteId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(getRes.status).toBe(404);
        });

        it('should reject delete by sales user', async () => {
            // Create a campaign first
            const createRes = await request(app)
                .post('/api/campaigns')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    title: 'Campaign for Delete Test',
                    platform: 'facebook',
                    type: 'post',
                    url: 'https://facebook.com/deletetest',
                    salesPersonId: salesUserId,
                });

            const campaignId = createRes.body.data.id;

            const res = await request(app)
                .delete(`/api/campaigns/${campaignId}`)
                .set('Authorization', `Bearer ${salesToken}`);

            expect(res.status).toBe(403);
        });
    });
});
