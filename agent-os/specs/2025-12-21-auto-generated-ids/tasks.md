# Tasks: Auto-Generated Reference IDs for Orders and Campaigns

## Overview
Implementation of human-readable, auto-generated reference IDs for campaigns and orders.

**Spec:** [spec.md](./spec.md)
**Requirements:** [planning/requirements.md](./planning/requirements.md)

---

## Task Groups

### Group 1: Backend - Database Schema & Counter Service
**Skills:** Backend, Prisma, MongoDB
**Dependencies:** None

#### Task 1.1: Update Prisma Schema
- [ ] Add `Counter` model to `schema.prisma`
- [ ] Add `referenceId` field (String, unique) to `Campaign` model
- [ ] Add `referenceId` field (String, unique) to `Order` model
- [ ] Run `npx prisma db push` to apply changes
- [ ] Run `npx prisma generate` to update client

**Files:**
- `backend/prisma/schema.prisma`

#### Task 1.2: Create Counter Service
- [x] Create new file `backend/src/services/counterService.ts`
- [ ] Implement `getNextCampaignSequence(platform)` function
  - Counter ID: `campaign_facebook` or `campaign_instagram`
  - Returns next sequence number
- [ ] Implement `getNextOrderSequence(campaignReferenceId)` function
  - Counter ID: `order_{campaignReferenceId}`
  - Returns next sequence number
- [ ] Use atomic `findOneAndUpdate` with `$inc` and `upsert: true`

**Files:**
- `backend/src/services/counterService.ts` (NEW)

---

### Group 2: Backend - Campaign & Order Service Updates
**Skills:** Backend, TypeScript
**Dependencies:** Group 1

#### Task 2.1: Update Campaign Service
- [ ] Import counterService
- [ ] Modify `create()` to generate referenceId:
  - Get platform prefix: `FB` or `IG`
  - Call `getNextCampaignSequence(platform)`
  - Format: `{PREFIX}-{SEQUENCE}` (3-digit zero-padded)
  - Add to Prisma create data
- [ ] Update `getAll()` to include `referenceId` in select
- [ ] Update `getById()` to include `referenceId` in response

**Files:**
- `backend/src/services/campaignService.ts`

#### Task 2.2: Update Order Service
- [ ] Import counterService
- [ ] Modify `create()` to generate referenceId:
  - Get campaign's `referenceId` 
  - Call `getNextOrderSequence(campaignReferenceId)`
  - Format: `{CAMPAIGN_REF}-{SEQUENCE}` (2-digit zero-padded)
  - Add to Prisma create data
- [ ] Update `getAll()` to include `referenceId` in select
- [ ] Update `getById()` to include `referenceId` in response

**Files:**
- `backend/src/services/orderService.ts`

---

### Group 3: Backend - Seed Data Update
**Skills:** Backend, TypeScript
**Dependencies:** Group 2

#### Task 3.1: Update Seed Script
- [ ] Clear counters collection at start of seed
- [ ] Track running counters for each platform during campaign creation
- [ ] Generate sequential referenceIds for campaigns
- [ ] Track running counters for each campaign during order creation
- [ ] Generate sequential referenceIds for orders
- [ ] Test with `npm run seed`

**Files:**
- `backend/prisma/seed.ts`

---

### Group 4: Frontend - API Types & Shared Components
**Skills:** Frontend, TypeScript
**Dependencies:** Group 2 (Backend must be complete for testing)

#### Task 4.1: Update Frontend API Types
- [ ] Add `referenceId: string` to `Campaign` interface
- [ ] Add `referenceId: string` to `Order` interface

**Files:**
- `src/lib/api.ts`

---

### Group 5: Frontend - Campaign Pages
**Skills:** Frontend, React
**Dependencies:** Group 4

#### Task 5.1: Update CampaignsPage
- [x] Add "Ref" column header as first column (before Title)
- [x] Add `campaign.referenceId` cell in first column
- [x] Update skeleton loading to include Ref column

**Files:**
- `src/pages/CampaignsPage.tsx`

#### Task 5.2: Update CampaignDetailPage
- [x] Display campaign referenceId near the title
- [x] Add "Ref" column to orders table as first column
- [x] Display `order.referenceId` in orders table

**Files:**
- `src/pages/CampaignDetailPage.tsx`

---

### Group 6: Frontend - Order Pages & Components
**Skills:** Frontend, React
**Dependencies:** Group 4

#### Task 6.1: Update OrdersPage
- [x] Add "Ref" column header as first column (before Date)
- [x] Add `order.referenceId` cell in first column
- [x] Update skeleton loading to include Ref column

**Files:**
- `src/pages/OrdersPage.tsx`

#### Task 6.2: Update OrderDetailsDialog
- [x] Add Order Ref display prominently at top of dialog
- [x] Format as read-only field: "Order Ref: {referenceId}"

**Files:**
- `src/components/OrderDetailsDialog.tsx`

#### Task 6.3: Update OrderForm
- [ ] Example: "Order Ref: Auto-generated (e.g., FB-001-01)"

**Files:**
- `src/components/OrderForm.tsx`

#### Task 6.4: Update OrderEditModal
- [ ] Display Order Ref (referenceId) at top of modal (read-only)

**Files:**
- `src/components/OrderEditModal.tsx`

---

### Group 7: Frontend - Payouts & Dashboard
**Skills:** Frontend, React
**Dependencies:** Group 4

#### Task 7.1: Update PayoutsPage
- [ ] Add "Ref" column to expanded order details table
- [ ] Display `order.referenceId`

**Files:**
- `src/pages/PayoutsPage.tsx`

#### Task 7.2: Update TeamPayoutsPage
- [ ] Display campaign `referenceId` next to campaign title where applicable

**Files:**
- `src/pages/TeamPayoutsPage.tsx`

#### Task 7.3: Update Dashboard (if applicable)
- [ ] Check if orders are displayed in recent activity
- [ ] If yes, include `referenceId` display

**Files:**
- `src/pages/Dashboard.tsx`

---

### Group 8: Frontend - Breadcrumb Bug Fix
**Skills:** Frontend, React
**Dependencies:** None (independent fix)

#### Task 8.1: Fix Breadcrumbs Component
- [ ] Update isId regex to detect MongoDB ObjectIds: `/^[a-f0-9]{24}$/i`
- [ ] Display "Campaign" for campaign detail pages instead of ObjectId

**Files:**
- `src/components/Breadcrumbs.tsx`

---

### Group 9: Verification & Testing
**Skills:** Testing
**Dependencies:** All previous groups

#### Task 9.1: Backend Verification
- [ ] Run seed script: `npm run seed`
- [ ] Verify campaigns have correct referenceId format
- [ ] Verify orders have correct referenceId format
- [ ] Test API endpoints return referenceId

#### Task 9.2: Frontend Verification
- [ ] Verify "Ref" column appears first in all tables
- [ ] Verify referenceId format is correct
- [ ] Verify OrderDetailsDialog shows referenceId
- [ ] Verify breadcrumb no longer shows ObjectId
- [ ] Test creating new campaign and order

---

## Execution Order

1. **Group 1** → Schema changes first
2. **Group 2** → Service logic with referenceId generation
3. **Group 3** → Seed data for testing
4. **Group 8** → Breadcrumb fix (independent)
5. **Group 4** → Frontend types
6. **Group 5** → Campaign pages
7. **Group 6** → Order pages and components
8. **Group 7** → Payouts and Dashboard
9. **Group 9** → Final verification

---

## Testing Constraints

- Backend unit tests are not required for MVP
- Visual verification through browser is sufficient
- All changes must be tested with seed data before deployment
