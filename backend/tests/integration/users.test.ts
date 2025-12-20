import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import bcrypt from 'bcryptjs';

describe('User API', () => {
    let adminToken: string;
    let salesToken: string;

    beforeAll(async () => {
        // Clean up any existing test users
        await prisma.user.deleteMany({
            where: {
                username: { in: ['admintest', 'salestest', 'newuser'] },
            },
        });

        // Create admin user
        const adminHash = await bcrypt.hash('admin123', 10);
        await prisma.user.create({
            data: {
                name: 'Admin Test',
                username: 'admintest',
                passwordHash: adminHash,
                role: 'admin',
                commissionRate: 0,
                status: 'active',
            },
        });

        // Create sales user
        const salesHash = await bcrypt.hash('sales123', 10);
        await prisma.user.create({
            data: {
                name: 'Sales Test',
                username: 'salestest',
                passwordHash: salesHash,
                role: 'sales',
                commissionRate: 10,
                status: 'active',
            },
        });

        // Get tokens
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admintest', password: 'admin123' });
        adminToken = adminRes.body.data.token;

        const salesRes = await request(app)
            .post('/api/auth/login')
            .send({ username: 'salestest', password: 'sales123' });
        salesToken = salesRes.body.data.token;
    });

    afterAll(async () => {
        await prisma.user.deleteMany({
            where: {
                username: { in: ['admintest', 'salestest', 'newuser'] },
            },
        });
        await prisma.$disconnect();
    });

    describe('GET /api/users', () => {
        it('should list users for admin', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should deny access for non-admin', async () => {
            const res = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${salesToken}`);

            expect(res.status).toBe(403);
        });

        it('should deny access without token', async () => {
            const res = await request(app).get('/api/users');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/users', () => {
        it('should create a new user (admin)', async () => {
            const res = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'New User',
                    username: 'newuser',
                    password: 'password123',
                    role: 'sales',
                    commissionRate: 12,
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.username).toBe('newuser');
            expect(res.body.data.commissionRate).toBe(12);
        });

        it('should reject duplicate username', async () => {
            const res = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Duplicate User',
                    username: 'newuser',
                    password: 'password123',
                    role: 'sales',
                    commissionRate: 10,
                });

            expect(res.status).toBe(409);
        });

        it('should validate commission rate (0-100)', async () => {
            const res = await request(app)
                .post('/api/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Invalid Rate',
                    username: 'invalidrate',
                    password: 'password123',
                    role: 'sales',
                    commissionRate: 150,
                });

            expect(res.status).toBe(400);
        });
    });
});
