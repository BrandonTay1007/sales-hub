# Spec: Auto-Generated Reference IDs for Orders and Campaigns

## Goal Description

Add human-readable, auto-generated reference IDs for orders and campaigns to replace the display of MongoDB ObjectIds throughout the application. These `referenceId` fields will be:
- Auto-generated on creation
- Immutable after creation (like `salesPersonId` on campaigns)
- Displayed in all relevant UI locations as the "Ref" column
- Campaign format: `{PLATFORM}-{SEQUENCE}` (e.g., `FB-001`, `IG-002`)
- Order format: `{CAMPAIGN_REF}-{SEQUENCE}` (e.g., `FB-001-01`, `IG-002-03`)

## User Review Required

> [!IMPORTANT]
> **Counter Collection**: We will create a new `Counter` model in Prisma/MongoDB to handle sequential ID generation atomically. This is the standard pattern for auto-incrementing IDs in MongoDB.

> [!WARNING]
> **Existing Data**: After deployment, you will need to run the seed script to regenerate all existing campaigns and orders with new referenceIds. Alternatively, a migration script can be provided to update existing records.

---

## Proposed Changes

### Backend - Database Schema

#### [MODIFY] [schema.prisma](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/backend/prisma/schema.prisma)

Add a `Counter` model for atomic sequence generation:
```prisma
model Counter {
  id    String @id @map("_id")
  seq   Int    @default(0)
  
  @@map("counters")
}
```

Add `referenceId` field to Campaign model:
```prisma
model Campaign {
  id            String         @id @default(auto()) @map("_id") @db.ObjectId
  referenceId   String         @unique  // e.g., "FB-001", "IG-002"
  // ... existing fields
}
```

Add `referenceId` field to Order model:
```prisma
model Order {
  id               String      @id @default(auto()) @map("_id") @db.ObjectId
  referenceId      String      @unique  // e.g., "FB-001-01", "IG-002-03"
  // ... existing fields
}
```

---

### Backend - Counter Service

#### [NEW] [counterService.ts](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/backend/src/services/counterService.ts)

Create a new service to atomically generate sequential IDs:

**Functions:**
- `getNextCampaignSequence(platform: 'facebook' | 'instagram'): Promise<number>` - Returns next available sequence for a platform
- `getNextOrderSequence(campaignReferenceId: string): Promise<number>` - Returns next available sequence for a campaign

**Implementation Pattern:**
```typescript
// Uses findAndModify with upsert to atomically increment
// Counter IDs: "campaign_facebook", "campaign_instagram", "order_{campaignReferenceId}"
```

---

### Backend - Campaign Service Changes

#### [MODIFY] [campaignService.ts](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/backend/src/services/campaignService.ts)

**Changes to `create()` function:**
1. Get platform prefix: `FB` for facebook, `IG` for instagram
2. Call `counterService.getNextCampaignSequence(platform)`
3. Generate referenceId: `{PREFIX}-{SEQUENCE}` with zero-padded 3-digit sequence
4. Include `referenceId` in Prisma create data
5. Include `referenceId` in API response

**Changes to `getAll()` and `getById()`:**
- Include `referenceId` in select/return

---

### Backend - Order Service Changes

#### [MODIFY] [orderService.ts](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/backend/src/services/orderService.ts)

**Changes to `create()` function:**
1. Get campaign's `referenceId` (already fetching campaign)
2. Call `counterService.getNextOrderSequence(campaign.referenceId)`
3. Generate referenceId: `{CAMPAIGN_REF}-{SEQUENCE}` with zero-padded 2-digit sequence
4. Include `referenceId` in Prisma create data
5. Include `referenceId` in API response

**Changes to `getAll()` and `getById()`:**
- Include `referenceId` in select/return

---

### Backend - Seed Data

#### [MODIFY] [seed.ts](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/backend/prisma/seed.ts)

Update seed script to:
1. Clear and initialize counters at start
2. Generate sequential referenceIds for campaigns during creation
3. Generate sequential referenceIds for orders during creation
4. Track counters per platform and per campaign

---

### Frontend - API Types

#### [MODIFY] [api.ts](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/lib/api.ts)

Add `referenceId` to interfaces:
```typescript
export interface Campaign {
    id: string;
    referenceId: string;  // NEW
    // ... existing fields
}

export interface Order {
    id: string;
    referenceId: string;  // NEW
    // ... existing fields
}
```

---

### Frontend - Campaigns Page

#### [MODIFY] [CampaignsPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/CampaignsPage.tsx)

**Table Header Changes:**
Add "Ref" as first column before "Title"

**Table Row Changes:**
Display `campaign.referenceId` in the Ref column

---

### Frontend - Campaign Detail Page

#### [MODIFY] [CampaignDetailPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/CampaignDetailPage.tsx)

**Orders Table Changes:**
- Add "Ref" column as first column
- Display `order.referenceId` in the Ref column

**Campaign Display Enhancements:**
- Show campaign `referenceId` near the title

---

### Frontend - Orders Page

#### [MODIFY] [OrdersPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/OrdersPage.tsx)

**Table Header Changes:**
Add "Ref" as first column before "Date"

**Table Row Changes:**
Display `order.referenceId` in the Ref column

---

### Frontend - Order Details Dialog

#### [MODIFY] [OrderDetailsDialog.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/components/OrderDetailsDialog.tsx)

**Display Changes:**
- Add Order Ref (referenceId) prominently at the top of the dialog
- Show as read-only field with label "Order Ref:"

---

### Frontend - Order Form

#### [MODIFY] [OrderForm.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/components/OrderForm.tsx)

**Display Changes:**
- Add info text indicating the Ref will be auto-generated upon creation
- Example: "Order Ref: Auto-generated (e.g., FB-001-01)"

---

### Frontend - Order Edit Modal

#### [MODIFY] [OrderEditModal.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/components/OrderEditModal.tsx)

**Display Changes:**
- Display Order Ref (referenceId) at the top of the modal (read-only)

---

### Frontend - Payouts Page

#### [MODIFY] [PayoutsPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/PayoutsPage.tsx)

**Order Details Table Changes:**
- Add "Ref" column to expanded order details table
- Display `order.referenceId`

---

### Frontend - Team Payouts Page

#### [MODIFY] [TeamPayoutsPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/TeamPayoutsPage.tsx)

**Campaign Breakdown Changes:**
- Display campaign `referenceId` next to campaign title where applicable

---

### Frontend - Dashboard

#### [MODIFY] [Dashboard.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/Dashboard.tsx)

**Recent Activity Changes:**
- If orders are displayed in recent activity, include `referenceId`

---

### Frontend - Breadcrumbs Bug Fix

#### [MODIFY] [Breadcrumbs.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/components/Breadcrumbs.tsx)

**Current Issue:**
- Line 34 checks for numeric IDs only: `/^\d+$/`
- MongoDB ObjectIds are 24-character hex strings, not numeric
- Result: Breadcrumb shows raw ObjectId like "694787e1e45a8df7bba6b2f6"

**Fix:**
- Update regex to detect MongoDB ObjectIds: `/^[a-f0-9]{24}$/i`
- Display "Campaign" instead of the ObjectId when on campaign detail page
- Note: Future enhancement could fetch the actual referenceId, but for now "Campaign" is sufficient

---

## Verification Plan

### Automated Tests

1. **Backend Unit Tests** (`backend/tests/`):
   - Counter service tests (atomic increment, concurrent access)
   - Campaign creation generates correct referenceId format
   - Order creation generates correct referenceId format
   - referenceId uniqueness validation

2. **API Integration Tests**:
   ```bash
   cd backend && npm test
   ```

3. **Frontend Visual Verification** (browser):
   - Verify "Ref" column appears first in all tables
   - Verify referenceId format is correct (FB-XXX, IG-XXX, FB-XXX-XX)
   - Verify breadcrumb no longer shows ObjectId

### Manual Verification

1. **Seed and Start**:
   ```bash
   cd backend && npm run seed && npm run dev
   cd frontend && npm run dev
   ```

2. **Campaign Flow**:
   - Create a new Facebook campaign → Verify referenceId is `FB-XXX`
   - Create a new Instagram campaign → Verify referenceId is `IG-XXX`
   - View campaign list → Verify "Ref" column is first

3. **Order Flow**:
   - Add order to campaign → Verify referenceId is `{CAMPAIGN_REF}-XX`
   - View order details → Verify referenceId is displayed
   - View orders list → Verify "Ref" column is first

4. **Breadcrumb Fix**:
   - Navigate to campaign detail page
   - Verify breadcrumb shows "Campaigns > Campaign" not the ObjectId

---

## Out of Scope

- Searchable/filterable by referenceId (future enhancement)
- Export reports with referenceId (future enhancement)
- Copy-to-clipboard functionality for referenceId
- Changing existing MongoDB ObjectId usage for relationships
- Analytics or leaderboard pages (summary views only)
- Custom ID format configuration

---

## Technical Considerations

1. **Atomicity**: Use MongoDB's `findOneAndUpdate` with `$inc` for atomic counter increments
2. **Concurrency**: Counter service must handle concurrent requests safely
3. **Format Consistency**: 
   - Campaign: 3-digit sequence (supports 999 per platform)
   - Order: 2-digit sequence (supports 99 per campaign)
4. **Migration**: Seed script handles new data; existing deployments need migration script or reseed
5. **Immutability**: referenceId should never be included in update operations
