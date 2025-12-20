# Spec Requirements: Backend API Foundation

## Initial Description
Build the core REST API backend for Pebble Sales Hub - a sales commission tracking system. This phase includes project setup, authentication, CRUD endpoints for users/campaigns/orders, commission calculation logic, payout endpoints, and seed data.

Source: Phase 1 from `agent-os/product/roadmap.md`

---

## Requirements Discussion

### First Round Questions

**Q1:** The `01-base-requirements.md` is very detailed. Should we treat it as the authoritative source?
**Answer:** Yes, but propose improvements if you have better ideas.

**Q2:** For MongoDB setup, local or cloud?
**Answer:** User is new to MongoDB. After discussion, decided on **Docker** for local MongoDB (works on both Windows and Mac with same commands).

**Q3:** JWT tokens in HTTP-only cookies or Authorization header?
**Answer:** Either works. Not deploying this time, so standard Bearer token is fine.

**Q4:** Include Postman/Thunder Client collection as deliverable?
**Answer:** Yes, include test collection.

**Q5:** Seed data - exact match to mockData.ts or similar in nature?
**Answer:** Similar in nature (not exact match).

**Q6:** What's out of scope?
**Answer:** See detailed list below.

### Follow-up Questions

**Follow-up 1:** Listed optional features for scope confirmation.
**Answer:** All out of scope EXCEPT:
- ✅ Unit tests (Jest)
- ✅ Integration tests (API endpoint tests)

---

## Existing Code to Reference

**Frontend Mock Data:**
- Path: `src/lib/mockData.ts`
- Contains: User, Campaign, Order interfaces and sample data
- Seed data should follow similar structure

**Base Requirements Document:**
- Path: `requirements/01-base-requirements.md`
- Contains: Complete API spec, data models, business rules

---

## Visual Assets

No visual assets provided (not typical for backend API work).

---

## Requirements Summary

### Functional Requirements

**Authentication:**
- POST /api/auth/login - JWT token generation
- POST /api/auth/logout - Token invalidation
- GET /api/auth/me - Current user profile

**User Management (Admin only):**
- CRUD endpoints for /api/users
- Role-based: admin or sales
- Commission rate for sales persons (0-100%)

**Campaign Management:**
- CRUD endpoints for /api/campaigns
- Sales person assignment immutable after creation
- Admin: full access, Sales: read-only on assigned campaigns

**Order Management:**
- CRUD endpoints for /api/orders
- Campaign assignment immutable after creation
- Products stored as JSON array
- Commission snapshot at order creation

**Commission Payout:**
- GET /api/payouts/me - Sales person's own payout
- GET /api/payouts/team - Admin view of all payouts
- Filter by year/month

### Technical Requirements

**Stack:**
- Node.js + Express
- MongoDB (via Docker)
- Prisma ORM
- JWT authentication
- Jest for testing

**Database Setup:**
- Docker Compose for MongoDB
- Works on Windows and Mac

**Testing:**
- Unit tests for services/business logic
- Integration tests for API endpoints
- Postman/Thunder Client collection

### Scope Boundaries

**In Scope:**
- Project setup (Node.js + Express + Prisma)
- MongoDB via Docker
- Authentication (JWT)
- User CRUD (admin only)
- Campaign CRUD
- Order CRUD with commission logic
- Payout endpoints
- Seed data script
- Unit tests (Jest)
- Integration tests
- API test collection (Postman)

**Out of Scope:**
- Rate limiting
- Request logging (Morgan)
- Audit trail
- Pagination
- Soft delete
- Email notifications
- File uploads
- Caching (Redis)
- API versioning
- Health check endpoint
- Deployment
- CI/CD pipeline

### Technical Considerations

- Frontend runs on localhost:8080 - configure CORS
- Currency: Malaysian Ringgit (RM)
- Date format: ISO 8601 (YYYY-MM-DD)
- Commission snapshot logic is CRITICAL business rule
- Follow response formats from 01-base-requirements.md
