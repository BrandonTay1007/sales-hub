# Pebble Sales Hub - Product Roadmap

## Current Status

- **Frontend**: Complete (React + TypeScript + Vite + Tailwind + shadcn/ui)
- **Backend**: Not started
- **Database**: Not set up

---

## Phase 1: Backend API Foundation

**Goal**: Build core API endpoints with authentication

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| Project setup | Initialize Node.js + Express + Prisma | Not started |
| Database setup | Configure MongoDB (local) | Not started |
| Auth endpoints | POST /auth/login, GET /auth/me | Not started |
| User endpoints | CRUD for /users (admin only) | Not started |
| Campaign endpoints | CRUD for /campaigns | Not started |
| Order endpoints | CRUD for /orders with commission logic | Not started |
| Payout endpoints | GET /payouts/me, GET /payouts/team | Not started |
| Seed data | Create seed script with test users/data | Not started |

### Deliverables
- Working API at `localhost:3000`
- All endpoints tested with Postman/Thunder Client
- Seed data matching frontend mock data

---

## Phase 2: Frontend Integration

**Goal**: Connect frontend to real backend API

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| API client setup | Configure axios/fetch with base URL | Not started |
| Auth integration | Replace mock auth with real login | Not started |
| User management | Connect UsersPage to /users API | Not started |
| Campaign management | Connect CampaignsPage to /campaigns API | Not started |
| Order management | Connect OrdersPage to /orders API | Not started |
| Payout views | Connect PayoutsPage to /payouts API | Not started |
| Error handling | Show API errors in UI (toast notifications) | Not started |
| Loading states | Add loading spinners during API calls | Not started |

### Deliverables
- Frontend fully functional with real data
- No more mock data imports
- Proper error handling throughout

---

## Phase 3: Testing & Polish

**Goal**: Ensure reliability and fix edge cases

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| API testing | Test core user flows (login, create order, view payout) | Not started |
| Commission accuracy | Verify snapshot rate logic works correctly | Not started |
| Role permissions | Test admin vs sales access restrictions | Not started |
| UI polish | Fix any layout issues, improve UX | Not started |
| Performance | Check for N+1 queries, optimize if needed | Not started |

### Deliverables
- All core flows working reliably
- No critical bugs
- Commission calculations verified accurate

---

## Phase 4: Launch & Documentations

**Goal**: To finalize everything and document

### Tasks

| Task | Description | Status |
|------|-------------|--------|
| Environment config | Set production env variables | Not started |
| User onboarding | Create admin account, add sales team | Not started |
| Documentation | Quick start guide for admin | Not started |
| Working on MAC | Check if this will work on mac/linux env | Not started |

### Deliverables
- Admin credentials delivered to client
- Basic usage documentation

---