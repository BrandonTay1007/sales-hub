# Agent Context: Pebble Sales Hub

**Last Updated**: 2025-12-21

This document provides comprehensive context for AI agents working on the Pebble Sales Hub project. Read this before making any changes.

---

## Project Overview

**Pebble Sales Hub** is a sales commission tracking system for a startup that sells products through social media campaigns (Facebook, Instagram). It replaces their manual Excel/paper tracking with a web application.

## Imporant file reference
**ALWAYS READ AND ANALYZE ALL THIS FILE BEFORE STARTING ANY THINKING**
agent-os/product/
requirements/
agent-os/specs/

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State | React Query (TanStack) |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB (local Docker container) |
| ORM | Prisma |
| Auth | JWT (localStorage) |

### Project Structure

```
sales-hub/
├── src/                    # Frontend source
│   ├── components/         # Reusable UI components
│   ├── contexts/           # AuthContext
│   ├── lib/                # api.ts, utils.ts
│   └── pages/              # Route pages
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # Express routes
│   │   ├── middleware/     # Auth, error handling
│   │   └── lib/            # Prisma client
│   └── prisma/
│       ├── schema.prisma   # Data models
│       └── seed.ts         # Test data
├── requirements/           # Business requirements
└── agent-os/
    ├── product/            # Mission, roadmap, tech stack
    └── specs/              # Feature specifications
```

---

## User Roles & Permissions

### Admin
- **Full access** to all system features
- Manage users (CRUD)
- Manage campaigns (CRUD)
- Manage orders (CRUD)
- View all commission/payout data

### Sales Person
- View only their assigned campaigns (read-only)
- View orders under their campaigns (read-only)
- View their own commission payout by month
- **Cannot**: manage users, create/edit/delete campaigns, create/edit/delete orders

---

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | ObjectId | Primary key |
| name | string | Display name |
| username | string | Unique, for login |
| passwordHash | string | bcrypt hashed |
| role | enum | `admin` or `sales` |
| commissionRate | number | 0-100, for sales only |
| status | enum | `active` or `inactive` |

### Campaign
| Field | Type | Notes |
|-------|------|-------|
| id | ObjectId | Primary key |
| referenceId | string | Unique, Auto-gen (e.g. `FB-001`) |
| title | string | Campaign name |
| platform | enum | `facebook` or `instagram` |
| type | enum | `post`, `live`, or `event` |
| url | string | Link to social media post |
| salesPersonId | ObjectId | **IMMUTABLE** after creation |
| status | enum | `active`, `paused`, or `completed` |
| startDate | DateTime | **Required**, defaults to today |
| endDate | DateTime | Nullable, auto-set on completion |

### Order
| Field | Type | Notes |
|-------|------|-------|
| id | ObjectId | Primary key |
| referenceId | string | Unique, Auto-gen (e.g. `FB-001-01`) |
| campaignId | ObjectId | **IMMUTABLE** after creation |
| products | JSON | Array of {name, qty, basePrice} |
| orderTotal | number | SUM(qty × basePrice) |
| snapshotRate | number | Commission % at creation time |
| commissionAmount | number | orderTotal × (snapshotRate/100) |
| status | enum | `active` or `cancelled` |
| createdAt | DateTime | Editable via date picker |

---

## Critical Business Rules

### 1. Commission Snapshot Logic
When an order is **CREATED**:
1. Look up sales person via: Order → Campaign → User
2. Capture current `commissionRate` as `snapshotRate`
3. Calculate: `commissionAmount = orderTotal × (snapshotRate / 100)`
4. The `snapshotRate` **NEVER changes**, even if the sales person's rate changes later

### 2. Immutability Rules
- `Campaign.salesPersonId` - Cannot be changed after creation
- `Order.campaignId` - Cannot be changed after creation
- Return 400 error if client attempts to change these

### 3. Cascade Deletion
- Delete Campaign → All orders under it are deleted
- Delete Order → Commission removed from totals

### 4. Last Admin Protection
- Cannot deactivate the last remaining admin
- Must have at least one active admin at all times

### 5. Campaign Period
- `startDate` is required (defaults to today on create)
- `endDate` is auto-set to current date when status changes to `completed`
- `endDate` is cleared when status changes back to `active`

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Returns JWT + user |
| GET | `/api/auth/me` | Get current user from token |

### Users (Admin Only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user (including username) |
| DELETE | `/api/users/:id` | Delete user |

### Campaigns
| Method | Endpoint | Admin | Sales |
|--------|----------|-------|-------|
| GET | `/api/campaigns` | All | Only assigned |
| POST | `/api/campaigns` | ✅ | ❌ |
| PUT | `/api/campaigns/:id` | ✅ | ❌ |
| DELETE | `/api/campaigns/:id` | ✅ | ❌ |

### Orders (Admin Only for mutations)
| Method | Endpoint | Admin | Sales |
|--------|----------|-------|-------|
| GET | `/api/orders` | All | Only from their campaigns |
| POST | `/api/orders` | ✅ | ❌ |
| PUT | `/api/orders/:id` | ✅ | ❌ |
| DELETE | `/api/orders/:id` | ✅ | ❌ |

---

## Frontend Pages

| Page | Route | Description | Related Entity |
|------|-------|-------------|----------------|
| Login | `/login` | JWT authentication | Auth |
| Dashboard | `/` or `/dashboard` | Stats, charts, top performer | Summary |
| Users | `/users` | User management (admin) | **User** |
| Campaigns | `/campaigns` | Campaign list with filters | **Campaign** |
| Campaign Detail | `/campaigns/:id` | Orders list, stats, settings | **Campaign**, **Order** |
| Orders | `/orders` | Order list with filters | **Order** |
| My Payouts | `/payouts` | Sales person's commission breakdown | **Payout**, **Campaign** |
| Team Payouts | `/payouts/team` | All sales persons (admin) | **Payout**, **User** |
| Analytics | `/analytics` | Revenue trends, top products | Summary |
| Leaderboard | `/analytics/leaderboard` | Toggle: Sales/Campaign view | Summary |

---

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ConfirmDeleteDialog` | `src/components/` | Reusable delete confirmation modal |
| `OrderDetailsDialog` | `src/components/` | View-only order receipt dialog |
| `OrderEditModal` | `src/components/` | Edit order products + date |
| `DashboardLayout` | `src/components/` | Sidebar + TopBar wrapper |
| `OrderFilters` | `src/components/` | Reusable filter bar (search, date, sort) |
| `AuthContext` | `src/contexts/` | JWT storage, user state, login/logout |

---

## Recent Changes (Dec 2025)

1. **Campaign Period** - Added startDate/endDate with period display column
2. **Delete Confirmation** - Custom modal with robust 5-second undo toast (Campaigns & Orders)
3. **Session Persistence** - Token retained across page refresh
4. **Order UI Standardization** - Separate view dialog and edit modal
5. **User Deactivation** - Last admin protection, inactive filtering
6. **Role-Based UI** - Order management hidden from sales persons
7. **CORS Fix** - Fixed localhost and 127.0.0.1 origin handling
8. **Payouts UI Refinement** - Interactive campaign cards with summary view
9. **Auto-Generated IDs** - Human-readable IDs (Ref) for campaigns and orders with atomic counters
10. **Leaderboard Real Data** - Integrated real API data with Month/YTD/All-Time filters
11. **Order Advanced Filters** - Enhanced order list with text search, date ranges, and sorting hooks

---

## Development Commands

```bash
# Frontend (port 8080)
cd sales-hub
npm run dev

# Backend (port 3000)
cd sales-hub/backend
npm run dev

# Database (Docker)
cd sales-hub/backend
docker compose up

# Prisma Studio (port 5555)
cd sales-hub/backend
npx prisma studio

# Seed database
cd sales-hub/backend
npx prisma db seed

# Build frontend
cd sales-hub
npm run build
```

---

## Login Credentials (Seed Data)

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Sales | sarah.j | password123 |
| Sales | mike.c | password123 |
| Sales | emily.w | password123 |

---

## Common Gotchas

1. **Prisma Client Regeneration** - After schema changes, run `npx prisma generate`. If server is running, stop it first to avoid file lock errors.

2. **CORS Errors** - Check `backend/src/app.ts` for allowed origins. Currently allows all `localhost:*` and `127.0.0.1:*`.

3. **Platform vs SocialMedia** - The field is called `platform` everywhere (not `socialMedia`).

4. **Commission Calculation** - Always dynamic at runtime. No stored totals - sum order commissions.

5. **Date Handling** - Dates are stored as ISO strings. Frontend splits on 'T' for display.

---

## File References

- **Requirements**: `requirements/01-base-requirements.md`
- **Tech Stack**: `agent-os/product/tech-stack.md`
- **Roadmap**: `agent-os/product/roadmap.md`
- **API Types**: `src/lib/api.ts`
- **Prisma Schema**: `backend/prisma/schema.prisma`
- **Auth Middleware**: `backend/src/middleware/auth.ts`

---

## Spec Workflows

Follow these guides for creating new features:
- **Phase 1 (Shape)**: `agent-os/commands/shape-spec/shape-spec.md`
- **Phase 2 (Write)**: `agent-os/commands/write-spec/write-spec.md`
- **Phase 3 (Tasks)**: `agent-os/commands/create-tasks/create-tasks.md`
