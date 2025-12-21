# API Functions Reference - Database Interactions

This document lists all functions that need to interact with the backend database via API calls.

## Authentication

| Function | HTTP Method | Endpoint | Description |
|----------|-------------|----------|-------------|
| `login` | POST | `/api/auth/login` | Validate credentials, return JWT + user |
| `logout` | POST | `/api/auth/logout` | Invalidate token (client-side removal) |
| `getCurrentUser` | GET | `/api/auth/me` | Get authenticated user profile |

---

## User Management (Admin Only)

| Function | HTTP Method | Endpoint | Description |
|----------|-------------|----------|-------------|
| `getUsers` | GET | `/api/users` | List all users |
| `getUser` | GET | `/api/users/:id` | Get single user |
| `createUser` | POST | `/api/users` | Create user (role, commission rate) |
| `updateUser` | PUT | `/api/users/:id` | Update user (commission, status, password) |
| `deleteUser` | DELETE | `/api/users/:id` | Delete user |

---

## Campaign Management

| Function | HTTP Method | Endpoint | Description | Access |
|----------|-------------|----------|-------------|--------|
| `getCampaigns` | GET | `/api/campaigns` | List campaigns | Admin: all, Sales: assigned only |
| `getCampaign` | GET | `/api/campaigns/:id` | Get campaign with stats | All users |
| `createCampaign` | POST | `/api/campaigns` | Create campaign | Admin only |
| `updateCampaign` | PUT | `/api/campaigns/:id` | Update campaign | Admin only |
| `deleteCampaign` | DELETE | `/api/campaigns/:id` | Delete + cascade orders | Admin only |

**Business Rules:**
- `salesPersonId` is **IMMUTABLE** after creation

---

## Order Management

| Function | HTTP Method | Endpoint | Description |
|----------|-------------|----------|-------------|
| `getOrders` | GET | `/api/orders?campaignId=&startDate=&endDate=` | List orders with filters |
| `getOrder` | GET | `/api/orders/:id` | Get single order with products |
| `createOrder` | POST | `/api/orders` | Create order (captures snapshotRate) |
| `updateOrder` | PUT | `/api/orders/:id` | Update products (recalc with original rate) |
| `deleteOrder` | DELETE | `/api/orders/:id` | Delete order |

**Business Rules:**
- `campaignId` is **IMMUTABLE** after creation
- `snapshotRate` captured at creation = sales person's current commission rate
- Commission recalculation always uses original `snapshotRate`

---

## Payout/Commission

| Function | HTTP Method | Endpoint | Description | Access |
|----------|-------------|----------|-------------|--------|
| `getMyPayouts` | GET | `/api/payouts/me?year=&month=` | Sales person's payout | Sales only |
| `getTeamPayouts` | GET | `/api/payouts/team?year=&month=` | All team payouts | Admin only |

**Response includes:**
- Total commission for the period
- Breakdown by campaign
- Order count per campaign

---

## Summary by Page

### Login Page
- `login(username, password)`

### Dashboard
- `getCurrentUser()`
- `getCampaigns()` (for stats)
- `getOrders()` (for recent activity)

### Users Page (Admin)
- `getUsers()`
- `createUser(data)`
- `updateUser(id, data)`
- `deleteUser(id)`

### Campaigns Page
- `getCampaigns()`
- `createCampaign(data)`
- `updateCampaign(id, data)`
- `deleteCampaign(id)` → also deletes related orders

### Campaign Detail Page
- `getCampaign(id)` (with stats)
- `getOrders({ campaignId: id })`
- `createOrder(data)`
- `updateOrder(id, data)`
- `deleteOrder(id)`

### Orders Page
- `getOrders(filters)`
- `createOrder(data)`
- `updateOrder(id, data)`
- `deleteOrder(id)`

### Payouts Page
- Sales: `getMyPayouts(year, month)`
- Admin: `getTeamPayouts(year, month)`

---

## Critical Business Logic

### Commission Snapshot (Must be enforced in backend)
```
On ORDER CREATE:
  snapshotRate = salesPerson.commissionRate (at time of creation)
  commissionAmount = orderTotal × (snapshotRate / 100)

On ORDER UPDATE:
  recalculate using ORIGINAL snapshotRate (never changes)
```

### Cascade Delete
```
On CAMPAIGN DELETE:
  1. Delete all orders with matching campaignId
  2. Commission from those orders is removed
```

---

## Existing Documentation

Full API specs with request/response examples:
- [Backend API Foundation Spec](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/agent-os/specs/2025-12-20-backend-api-foundation/spec.md)
- [Frontend Integration Spec](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/agent-os/specs/2025-12-20-frontend-integration/spec.md)
- [Base Requirements](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/requirements/01-base-requirements.md)
