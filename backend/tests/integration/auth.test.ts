import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/lib/prisma';
import bcrypt from 'bcryptjs';

describe('Auth API', () => {
    let testUser: { id: string; username: string };

    beforeAll(async () => {
        // Clean up any existing test users
        await prisma.user.deleteMany({
            where: { username: 'testuser' },
        });

        // Create a test user
        const passwordHash = await bcrypt.hash('password123', 10);
        testUser = await prisma.user.create({
            data: {
                name: 'Test User',
                username: 'testuser',
                passwordHash,
                role: 'sales',
                commissionRate: 10,
                status: 'active',
            },
            select: { id: true, username: true },
        });
    });

    afterAll(async () => {
        // Clean up test user
        await prisma.user.deleteMany({
            where: { username: 'testuser' },
        });
        await prisma.$disconnect();
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    password: 'password123',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
            expect(res.body.data.user.username).toBe('testuser');
        });

        it('should reject invalid password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    password: 'wrongpassword',
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should reject non-existent user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'nonexistent',
                    password: 'password123',
                });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should require username', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'password123',
                });

            expect(res.status).toBe(400);
        });

        it('should require password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                });

            expect(res.status).toBe(400);
        });
    });

    describe('GET /api/auth/me', () => {
        let token: string;

        beforeAll(async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    password: 'password123',
                });
            token = res.body.data.token;
        });

        it('should return current user with valid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.user.username).toBe('testuser');
        });

        it('should reject request without token', async () => {
            const res = await request(app).get('/api/auth/me');

            expect(res.status).toBe(401);
        });

        it('should reject request with invalid token', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/auth/logout', () => {
        let token: string;

        beforeAll(async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'testuser',
                    password: 'password123',
                });
            token = res.body.data.token;
        });

        it('should logout successfully', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});
