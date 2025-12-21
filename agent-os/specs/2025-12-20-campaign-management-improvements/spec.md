# Campaign Management Improvements

This spec covers frontend changes to simplify campaign and order management by removing order status, updating campaign period logic, and adding campaign reactivation.

## User Review Required

> [!IMPORTANT]
> **Order Status Removal**: All orders will be treated as "active" after this change. The filtering by order status will be removed. Existing data in mockData.ts will lose the `status` property entirely.

> [!IMPORTANT]
> **Campaign Status Simplification**: The `paused` status will be removed. Campaigns will only be `active` or `completed`.

---

## Proposed Changes

### Data Layer

#### [MODIFY] [mockData.ts](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/lib/mockData.ts)

1. **Order Interface** - Remove `status` property entirely
2. **Campaign Interface** - Change status type from `'active' | 'paused' | 'completed'` to `'active' | 'completed'`
3. **Generated Orders** - Remove status assignment from order generation
4. **Helper Functions** - Update `getOrdersByCampaign` and similar to remove status filtering

---

### Orders Page

#### [MODIFY] [OrdersPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/OrdersPage.tsx)

1. **Remove Status Filter** (line ~30-32):
   - Remove `filterStatus` state
   - Remove status from `hasFilters` check

2. **Remove Status Filter UI** (line ~317-328):
   - Remove the Status dropdown from filters section

3. **Remove Status Column in Table** (line ~379):
   - Remove `<th>Status</th>` header
   - Remove status cell and badge display (line ~422-426)

4. **Remove Status Logic**:
   - Remove status filter from `filteredOrders` useMemo (line ~66)
   - Remove cancelled styling/opacity logic (line ~397)
   - Remove line-through for cancelled products (line ~403)

5. **Remove Status from Order Modal** (line ~476-481):
   - Remove status display in order detail modal
   - Remove conditional logic based on order status

6. **Update ColSpan** for empty state (line ~386)

---

### Campaign Detail Page

#### [MODIFY] [CampaignDetailPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/CampaignDetailPage.tsx)

1. **Add Product Validation** (line ~78-97):
   - Add validation before creating new order in `handleAddOrder`
   - Check for at least 1 valid product (name && qty > 0)
   - Show toast error if validation fails

2. **Remove Status Column in Orders Table** (line ~301):
   - Remove `<th>Status</th>` header
   - Remove status cell and badge display (line ~327-331)

3. **Remove Status Logic in Table**:
   - Remove cancelled styling (line ~316)
   - Remove line-through for cancelled products (line ~321)
   - Update colSpan for empty state (line ~308)

4. **Remove Status from Order Modal** (line ~602-607):
   - Remove status display in order detail modal

5. **Campaign Settings Modal Updates** (line ~453-472):
   - Remove End Date field from edit form
   - Update `editForm` state to remove endDate handling

6. **Add Reactivate Campaign Button** (show when status === 'completed'):
   - Add `handleReactivateCampaign` function
   - Add confirmation dialog before reactivation
   - Set status to 'active' and clear endDate

7. **Update Period Display**:
   - Show "Start Date - Ongoing" for active campaigns
   - Show "Start Date - End Date" for completed campaigns

---

### Campaigns Page

#### [MODIFY] [CampaignsPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/CampaignsPage.tsx)

1. **Add Reactivate Handler**:
   - Add `handleReactivateCampaign` function with confirmation dialog
   - Passed to CampaignEditModal

2. **Update Status Filter** (if exists):
   - Remove 'paused' option from status filter

3. **Update Period Display in Table**:
   - Format: "Dec 1, 2025 - Ongoing" for active
   - Format: "Dec 1, 2025 - Dec 20, 2025" for completed

---

### Campaign Edit Modal

#### [MODIFY] [CampaignEditModal.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/components/CampaignEditModal.tsx)

1. **Remove End Date Field**:
   - Remove `endDate` from form state
   - Remove End Date input field

2. **Add Reactivate Button**:
   - Show for completed campaigns
   - Add `onReactivateCampaign` prop
   - Trigger confirmation dialog

3. **Update Props Interface**:
   - Add `onReactivateCampaign?: () => void`

---

### Payout Pages

#### [MODIFY] [PayoutsPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/PayoutsPage.tsx)

1. **Remove Status Filtering**:
   - Remove `order.status === 'active'` checks
   - All orders now count towards payouts

#### [MODIFY] [TeamPayoutsPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/TeamPayoutsPage.tsx)

1. **Remove Status Filtering**:
   - Remove `order.status === 'active'` checks
   - All orders now count towards payouts

---

## Verification Plan

### Manual Testing

Since this project uses mock data and is a frontend-only application, manual verification will be performed:

1. **Order Status Removal Verification**:
   - Navigate to Orders page → Verify no Status column in table
   - Verify no Status filter dropdown in filters section
   - Click on any order → Verify no status shown in detail modal
   - Navigate to Campaign Detail page → Verify no Status column in orders table

2. **Campaign Period Verification**:
   - Create new campaign → Verify no End Date field
   - View active campaign → Verify period shows "Dec 1, 2025 - Ongoing"
   - View completed campaign → Verify period shows actual date range

3. **Reactivate Campaign Verification**:
   - Navigate to a completed campaign's detail page
   - Click Settings → Verify Reactivate button appears
   - Click Reactivate → Verify confirmation dialog appears
   - Confirm → Verify campaign status changes to active and period shows "Ongoing"
   - Verify same flow works from CampaignsPage edit modal

4. **End Campaign Verification**:
   - Navigate to an active campaign
   - Click End Campaign → Verify campaign status changes to completed
   - Verify period updates to show the end date

5. **Product Validation Bug Fix**:
   - In Campaign Detail page, click Add Order
   - Try to submit without any products → Verify error toast appears
   - Add a product with empty name → Verify validation fails
   - Add valid product → Verify order is created

6. **Payout Calculations**:
   - Navigate to Payouts page → Verify all orders are counted (no filtering)
   - Navigate to Team Payouts page → Verify same

### Build Verification

```bash
cd c:\Users\taywe\Desktop\Projects\pebble-tech\sales-hub
npm run build
```

This will verify TypeScript compilation succeeds after interface changes.

### Visual Verification

Run the development server and visually inspect all affected pages:

```bash
cd c:\Users\taywe\Desktop\Projects\pebble-tech\sales-hub
npm run dev
```

Open browser to http://localhost:8080 and verify each change listed above.
