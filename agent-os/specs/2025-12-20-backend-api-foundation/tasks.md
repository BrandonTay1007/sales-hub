# Tasks: Backend API Foundation

## Overview
Break down of Phase 1: Backend API Foundation into implementable tasks.

---

## Task 1: Project Setup & Configuration
**Priority:** P0 (Foundation)

- [x] Create `/backend` folder structure
- [x] Initialize Node.js project (`npm init`)
- [x] Install dependencies: express, cors, bcryptjs, jsonwebtoken, prisma, @prisma/client
- [x] Install dev dependencies: typescript, ts-node, jest, nodemon, @types/*
- [x] Create `tsconfig.json` for TypeScript
- [x] Create `.env` file with template variables (JWT_SECRET, DATABASE_URL, PORT)
- [x] Create `.env.example` for reference
- [x] Create `docker-compose.yml` for MongoDB
- [x] Add `.gitignore` for node_modules, .env, dist

---

## Task 2: Prisma & Database Setup
**Priority:** P0 (Foundation)

- [x] Initialize Prisma: `npx prisma init`
- [x] Configure `prisma/schema.prisma` for MongoDB
- [x] Define User model (id, name, username, passwordHash, role, commissionRate, status, createdAt, updatedAt)
- [x] Define Campaign model (id, title, platform, type, url, salesPersonId, status, createdAt, updatedAt)
- [x] Define Order model (id, campaignId, products JSON, orderTotal, snapshotRate, commissionAmount, status, createdAt, updatedAt)
- [x] Generate Prisma client: `npx prisma generate`
- [x] Create lib/prisma.ts for database client singleton
    
---

## Task 3: Express App Structure
**Priority:** P0 (Foundation)

- [x] Create `src/index.ts` - main entry point
- [x] Create `src/app.ts` - Express app configuration
- [x] Configure middleware: cors, json parser, error handler
- [x] Create folder structure: routes/, controllers/, services/, middleware/, utils/
- [x] Create health check route (optional but useful for dev)
- [x] Add npm scripts: dev, build, start

---

## Task 4: Authentication System
**Priority:** P0 (Core)

- [x] Create `src/middleware/auth.ts` - JWT verification middleware
- [x] Create `src/middleware/requireAdmin.ts` - Admin role check
- [x] Create `src/services/authService.ts` - Login logic with bcrypt
- [x] Create `src/controllers/authController.ts` - Handle auth routes
- [x] Create `src/routes/auth.ts` - POST /login, POST /logout, GET /me
- [x] Implement password hashing with bcryptjs
- [x] Implement JWT token generation and verification
- [x] Add token to response on successful login

---

## Task 5: User Management API
**Priority:** P0 (Core)

- [x] Create `src/services/userService.ts` - User CRUD business logic
- [x] Create `src/controllers/userController.ts` - Handle user routes
- [x] Create `src/routes/users.ts` - CRUD endpoints
- [x] GET /api/users - List all users (admin only)
- [x] GET /api/users/:id - Get single user (admin only)
- [x] POST /api/users - Create user with validation (admin only)
- [x] PUT /api/users/:id - Update user (admin only)
- [x] DELETE /api/users/:id - Delete user (admin only)
- [x] Add validation: commission rate 0-100%, unique username

---

## Task 6: Campaign Management API
**Priority:** P0 (Core)

- [x] Create `src/services/campaignService.ts` - Campaign CRUD + stats
- [x] Create `src/controllers/campaignController.ts` - Handle campaign routes
- [x] Create `src/routes/campaigns.ts` - CRUD endpoints
- [x] GET /api/campaigns - List (Admin: all, Sales: assigned only)
- [x] GET /api/campaigns/:id - Get campaign with order count/revenue
- [x] POST /api/campaigns - Create campaign (admin only)
- [x] PUT /api/campaigns/:id - Update (admin only, salesPersonId IMMUTABLE)
- [x] DELETE /api/campaigns/:id - Delete + cascade orders (admin only)
- [x] Add validation: salesPersonId must exist and be a sales role

---

## Task 7: Order Management API
**Priority:** P0 (Core)

- [x] Create `src/services/orderService.ts` - Order CRUD + commission logic
- [x] Create `src/controllers/orderController.ts` - Handle order routes
- [x] Create `src/routes/orders.ts` - CRUD endpoints with filters
- [x] GET /api/orders - List with filters (campaignId, startDate, endDate)
- [x] GET /api/orders/:id - Get single order
- [x] POST /api/orders - Create order with commission snapshot
- [x] PUT /api/orders/:id - Update products, recalculate commission
- [x] DELETE /api/orders/:id - Delete order
- [x] Enforce campaignId IMMUTABLE after creation
- [x] Validate products array has at least 1 item

---

## Task 8: Commission Snapshot Logic (CRITICAL)
**Priority:** P0 (Core Business Logic)

- [x] Create `src/utils/commission.ts` - Commission calculation utilities
- [x] Implement `calculateOrderTotal(products)` - Sum of qty × basePrice
- [x] Implement `calculateCommission(orderTotal, snapshotRate)` - orderTotal × (rate/100)
- [x] On ORDER CREATE: Lookup sales person → capture current commissionRate as snapshotRate
- [x] On ORDER UPDATE: Recalculate using ORIGINAL snapshotRate (never change it)
- [ ] Add unit tests for commission calculations
- [x] Document the snapshot logic in code comments

---

## Task 9: Payout Endpoints
**Priority:** P0 (Core)

- [x] Create `src/services/payoutService.ts` - Payout aggregation logic
- [x] Create `src/controllers/payoutController.ts` - Handle payout routes
- [x] Create `src/routes/payouts.ts` - Payout endpoints
- [x] GET /api/payouts/me?year=2025&month=12 - Sales person's payout
- [x] GET /api/payouts/team?year=2025&month=12 - Admin team view
- [x] Aggregate: total commission, breakdown by campaign, order count
- [x] Filter orders by year/month based on createdAt

---

## Task 10: Error Handling & Validation
**Priority:** P1 (Polish)

- [x] Create `src/middleware/errorHandler.ts` - Global error handler
- [x] Create `src/utils/errors.ts` - Custom error classes (ValidationError, NotFoundError, etc.)
- [x] Implement consistent error response format from 01-base-requirements.md
- [x] Add input validation for all POST/PUT endpoints
- [x] Return 400 for validation errors, 401 for unauthorized, 403 for forbidden, 404 for not found

---

## Task 11: Seed Data Script
**Priority:** P1 (Testing)

- [x] Create `prisma/seed.ts` - Seed script
- [x] Create 1 admin user (username: admin, password: admin123)
- [x] Create 3-5 sales persons with varying rates (8-15%)
- [x] Create 5-10 campaigns distributed across sales persons
- [x] Create 20-50 orders across campaigns and months
- [x] Add seed script to package.json: `prisma db seed`
- [x] Document seed data in README

---

## Task 12: Unit Tests
**Priority:** P1 (Quality)

- [x] Configure Jest for TypeScript
- [x] Create `tests/unit/` folder
- [x] Test `calculateOrderTotal()` function
- [x] Test `calculateCommission()` function
- [x] Test commission snapshot logic (rate captured at creation, unchanged on update)
- [ ] Test password hashing and verification
- [x] Add npm script: `npm run test`

---

## Task 13: Integration Tests
**Priority:** P1 (Quality)

- [x] Create `tests/integration/` folder
- [ ] Configure test database (separate from dev)
- [ ] Test auth endpoints (login, logout, me)
- [ ] Test user CRUD endpoints (admin access)
- [ ] Test campaign CRUD endpoints (access control)
- [ ] Test order CRUD endpoints (commission calculation)
- [ ] Test payout endpoints (aggregation)
- [ ] Add npm script: `npm run test:integration`

---

## Task 14: API Test Collection
**Priority:** P2 (Documentation)

- [ ] Create Postman/Thunder Client collection
- [ ] Add auth endpoints with example requests
- [ ] Add user endpoints with example requests
- [ ] Add campaign endpoints with example requests
- [ ] Add order endpoints with example requests
- [ ] Add payout endpoints with example requests
- [ ] Include environment variables (base URL, token)
- [ ] Save to `backend/postman/` or `backend/api-tests/`

---

## Task 15: Documentation
**Priority:** P2 (Documentation)

- [x] Create `backend/README.md` with setup instructions
- [x] Document Docker setup for MongoDB
- [x] Document environment variables
- [x] Document npm scripts (dev, build, test, seed)
- [x] Document API overview (link to 01-base-requirements.md for details)

---

## Execution Order

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1, 2, 3 | Foundation: Project setup, database, Express |
| 2 | 4, 5 | Core: Authentication, User management |
| 3 | 6, 7, 8 | Core: Campaign, Order, Commission logic |
| 4 | 9, 10 | Core: Payouts, Error handling |
| 5 | 11, 12, 13 | Testing: Seed data, Unit tests, Integration tests |
| 6 | 14, 15 | Documentation: API collection, README |

---

## Definition of Done

- [ ] All endpoints return correct response format
- [ ] Commission snapshot logic verified with tests
- [ ] Seed data creates realistic test data
- [ ] All tests pass
- [ ] API test collection works end-to-end
- [ ] Documentation complete for setup
