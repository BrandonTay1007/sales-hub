# Pebble Sales Hub - Product Roadmap

## Current Status

- **Frontend**: ✅ Complete (React + TypeScript + Vite + Tailwind + shadcn/ui)
- **Backend**: ✅ Complete (Node.js + Express + Prisma + MongoDB)
- **Integration**: ✅ Complete (All pages connected to real API)
- **Last Updated**: 2025-12-21

---

## Phase 1: Backend API Foundation ✅ COMPLETE

**Goal**: Build core API endpoints with authentication

| Task | Description | Status |
|------|-------------|--------|
| Project setup | Initialize Node.js + Express + Prisma | ✅ Complete |
| Database setup | Configure MongoDB (local Docker) | ✅ Complete |
| Auth endpoints | POST /auth/login, GET /auth/me | ✅ Complete |
| User endpoints | CRUD for /users (admin only) | ✅ Complete |
| Campaign endpoints | CRUD for /campaigns with period (startDate/endDate) | ✅ Complete |
| Order endpoints | CRUD for /orders with commission logic | ✅ Complete |
| Payout endpoints | GET /payouts/me, GET /payouts/team | ✅ Complete |
| Seed data | Create seed script with realistic test data | ✅ Complete |

---

## Phase 2: Frontend Integration ✅ COMPLETE

**Goal**: Connect frontend to real backend API

| Task | Description | Status |
|------|-------------|--------|
| API client setup | Configure fetch with base URL, auth headers | ✅ Complete |
| Auth integration | Real login with JWT storage | ✅ Complete |
| Session persistence | Token retained across page refresh | ✅ Complete |
| User management | UsersPage with search, filters, username edit | ✅ Complete |
| Campaign management | CampaignsPage with period column, status filter | ✅ Complete |
| Campaign detail | CampaignDetailPage with full CRUD | ✅ Complete |
| Order management | OrdersPage with view/edit dialogs, filters | ✅ Complete |
| Payout views | PayoutsPage and TeamPayoutsPage connected | ✅ Complete |
| Dashboard | Real data with dynamic calculations | ✅ Complete |
| Analytics | LeaderboardPage with toggle (Sales/Campaign) | ✅ Complete |
| Error handling | Sonner toasts for all API errors | ✅ Complete |
| Loading states | Skeleton loaders on all pages | ✅ Complete |

---

## Phase 3: UI Polish & Features ✅ COMPLETE

**Goal**: Improve UX and add user-requested features

| Task | Description | Status |
|------|-------------|--------|
| Role-based UI | Hide admin-only buttons from sales | ✅ Complete |
| Delete confirmation | Custom modal for all deletions | ✅ Complete |
| Undo toast | 5-second undo window for deletions | ✅ Complete |
| Campaign period | startDate/endDate with auto-set on completion | ✅ Complete |
| User deactivation | Last admin protection, hide inactive from dropdowns | ✅ Complete |
| Order dialogs | Separate view-only and edit modal | ✅ Complete |
| Products column | "Widget ×2 +1 more" format with tooltip | ✅ Complete |
| Navigation | Campaign cards clickable in Payouts | ✅ Complete |
| Notifications | Removed (not implemented) | ✅ Complete |

---

## Phase 4: Testing & Documentation 🟡 IN PROGRESS

**Goal**: Ensure reliability and document the system

| Task | Description | Status |
|------|-------------|--------|
| Manual testing | Test all user flows | ⏳ Pending |
| Build verification | npm run build passes | ✅ Complete |
| Documentation | Update requirements and product docs | ⏳ Pending |
| Agent context prompt | Create comprehensive prompt for new agents | ⏳ Pending |

---

## Phase 5: Launch Preparation

**Goal**: Prepare for production deployment

| Task | Description | Status |
|------|-------------|--------|
| Environment config | Production env variables | Not started |
| Docker compose | Full stack containerization | Not started |
| User onboarding | Admin account setup guide | Not started |
| Cross-platform | Verify works on Mac/Linux | Not started |

---

## Key Features Summary

### Admin Features
- Manage users (CRUD with username edit)
- Manage campaigns (CRUD with period tracking)
- Manage orders (CRUD with date editing)
- View team payouts with campaign breakdown
- Analytics dashboard with leaderboards

### Sales Person Features
- View assigned campaigns (read-only)
- View orders under their campaigns (read-only)
- View personal payouts by month
- Dashboard with personal stats

### System Features
- JWT authentication with session persistence
- Role-based access control
- Commission snapshot at order creation
- Delete confirmation with undo support
- Campaign period tracking (start/end dates)
- Dynamic commission calculation