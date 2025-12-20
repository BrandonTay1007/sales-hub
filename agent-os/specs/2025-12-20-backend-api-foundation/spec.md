# Specification: Backend API Foundation

## Goal
Build a complete REST API backend for Pebble Sales Hub - a sales commission tracking system that enables admins to manage sales teams and campaigns, while sales persons can record orders and view their commission payouts.

## User Stories
- As an **Admin**, I want to manage users, campaigns, and orders so that I can track team performance and ensure accurate commission payouts.
- As a **Sales Person**, I want to view my assigned campaigns and record orders so that I can track my earnings by month and campaign.

## Specific Requirements

**Project Setup**
- Initialize Node.js + Express backend in `/backend` folder
- Configure Prisma ORM with MongoDB
- Create `docker-compose.yml` for local MongoDB instance
- Set up environment variables via `.env` file
- Configure CORS for frontend at `localhost:8080`

**Authentication (JWT)**
- POST `/api/auth/login` - Validate credentials, return JWT token + user profile
- POST `/api/auth/logout` - Invalidate token (client-side token removal)
- GET `/api/auth/me` - Return current authenticated user
- Use bcrypt for password hashing
- JWT secret from environment variable

**User Management (Admin Only)**
- GET `/api/users` - List all users
- GET `/api/users/:id` - Get single user
- POST `/api/users` - Create user with role (admin/sales) and commission rate
- PUT `/api/users/:id` - Update user (commission rate, status, password)
- DELETE `/api/users/:id` - Delete user
- Validate: commission rate 0-100%, username unique

**Campaign Management**
- GET `/api/campaigns` - List campaigns (Admin: all, Sales: assigned only)
- GET `/api/campaigns/:id` - Get campaign with order count and revenue
- POST `/api/campaigns` - Create campaign (Admin only)
- PUT `/api/campaigns/:id` - Update campaign (Admin only, salesPersonId IMMUTABLE)
- DELETE `/api/campaigns/:id` - Delete campaign + cascade delete orders (Admin only)
- Fields: title, platform (facebook/instagram), type (post/live/event), url, salesPersonId

**Order Management**
- GET `/api/orders` - List orders with filters (campaignId, startDate, endDate)
- GET `/api/orders/:id` - Get single order with products
- POST `/api/orders` - Create order (captures snapshotRate from sales person's current rate)
- PUT `/api/orders/:id` - Update order products (recalculate commission using ORIGINAL snapshotRate)
- DELETE `/api/orders/:id` - Delete order
- campaignId is IMMUTABLE after creation
- Products stored as JSON array: [{name, qty, basePrice}]

**Commission Snapshot Logic (CRITICAL)**
- On order CREATE: capture sales person's current `commissionRate` as `snapshotRate`
- Calculate: `commissionAmount = orderTotal × (snapshotRate / 100)`
- On order UPDATE: recalculate using the ORIGINAL snapshotRate (never changes)
- `snapshotRate` is permanently locked at order creation time

**Payout Endpoints**
- GET `/api/payouts/me?year=2025&month=12` - Sales person's payout for month
- GET `/api/payouts/team?year=2025&month=12` - Admin view of all sales persons' payouts
- Response includes: total commission, breakdown by campaign, order count per campaign

**Seed Data Script**
- Create seed script with test data similar to frontend mockData.ts
- 1 admin user (username: admin, password: admin123)
- 3-5 sales persons with varying commission rates (8-15%)
- 5-10 campaigns distributed across sales persons
- 20-50 orders distributed across campaigns and months

**Testing**
- Unit tests (Jest) for commission calculation logic
- Unit tests for order total calculation
- Integration tests for all API endpoints
- Postman/Thunder Client collection with example requests

## Visual Design
No visual assets provided (backend API work).

## Existing Code to Leverage

**Frontend Mock Data - `src/lib/mockData.ts`**
- Contains TypeScript interfaces for User, Campaign, Order
- Use as reference for data model structure
- Seed data should follow similar structure and naming

**Base Requirements - `requirements/01-base-requirements.md`**
- Contains complete API endpoint specifications
- Includes request/response JSON examples
- Defines validation rules for all fields
- Reference for error response formats

## Out of Scope
- Rate limiting
- Request logging (Morgan)
- Audit trail
- Pagination (simple list returns for v1)
- Soft delete
- Email notifications
- File uploads
- Caching (Redis)
- API versioning (/api/v1/)
- Health check endpoint
- Deployment configuration
- CI/CD pipeline
