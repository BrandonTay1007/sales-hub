# Order UI & Commission Storage - Specification

## Overview

This specification covers bug fixes and feature enhancements for order management and commission tracking.

### Issues to Fix
1. **Session Persistence** - Data disappears after page refresh (token verification failing)
2. **Inconsistent Order Dialog** - Different dialogs on OrdersPage vs CampaignDetailPage
3. **Missing Table Actions** - Edit/delete should be in action column, not in dialog

### Features to Add
4. **Sales Person Column** - Show sales person in OrdersPage table only
5. **Sales Person Filter** - Filter orders by sales person in OrdersPage
6. **Username Edit** - Allow editing username in UsersPage

> [!NOTE]
> **Commission Calculation**: Keeping dynamic calculation (sum of order commissions at runtime). No stored `totalEarnedCommission` field needed.

---

## User Review Required

> [!IMPORTANT]
> Session fix requires testing with browser refresh to verify token persistence works correctly.

---

## Proposed Changes

### Frontend - Session Fix

#### [MODIFY] [api.ts](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/lib/api.ts)
- Add better error logging for `/auth/me` failures
- Ensure token is not cleared on network errors (only on 401)

#### [MODIFY] [AuthContext.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/contexts/AuthContext.tsx)
- Add retry logic for token verification on mount
- Log errors for debugging

---

### Frontend - Order Table UI

#### [MODIFY] [OrderDetailsDialog.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/components/OrderDetailsDialog.tsx)
- Remove edit icon from dialog header
- Make dialog view-only (receipt style)
- Remove inline edit mode

#### [MODIFY] [OrdersPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/OrdersPage.tsx)
Table columns: Date | Campaign (icon+name) | Products | Sales Person | Total | Commission | Actions (edit/delete icons)
- Add sales person column
- Add sales person filter dropdown
- Add action column with edit (pencil) and delete (trash) icons
- Use shared OrderDetailsDialog for view-only

#### [MODIFY] [CampaignDetailPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/CampaignDetailPage.tsx)
Table columns: Date | Campaign (icon+name) | Products | Total | Commission | Actions (edit/delete icons)
- NO sales person column (campaign already has one)
- Add action column with edit (pencil) and delete (trash) icons
- Use shared OrderDetailsDialog for view-only

---

### Frontend - Username Edit

#### [MODIFY] [UsersPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/UsersPage.tsx)
- Add username field to the edit user modal form
- Pre-populate with current username
- Show error toast if username already taken

---

### Frontend - Commission Dynamic Calculation

Ensure all pages correctly calculate commission totals dynamically from orders.

#### [VERIFY] [Dashboard.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/Dashboard.tsx)
- "Your Earnings" should sum commissions from orders
- Verify updates on order CRUD

#### [VERIFY] [PayoutsPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/PayoutsPage.tsx)
- Monthly commission should sum from filtered orders
- Verify updates on order changes

#### [VERIFY] [TeamPayoutsPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/TeamPayoutsPage.tsx)
- Each sales person's total should sum their orders
- Verify grand total updates correctly

#### [VERIFY] [CampaignDetailPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/CampaignDetailPage.tsx)
- Campaign commission total should sum campaign orders
- Verify updates when orders change

### Manual Browser Testing

**Session Persistence Test:**
1. Login as admin
2. Navigate to Orders page - verify data loads
3. Press F5 to refresh
4. Verify data still loads (should not be empty)
5. Check browser console for any errors

**Order Table Test:**
1. Login as admin
2. Navigate to Orders page
3. Verify columns: Date, Campaign, Products, Sales Person, Total, Commission, Actions
4. Click a row → verify view-only dialog opens (no edit icon in header)
5. Click pencil icon in Actions column → verify edit form opens
6. Click trash icon → verify delete confirmation

**Username Edit Test:**
1. Login as admin
2. Navigate to Users page
3. Click edit on a user
4. Change username and save
5. Verify username updated in table

### Backend API Testing
- Run: `cd backend && npm test` (if tests exist)
- Or manual API testing via curl/Postman

---

## Out of Scope
- Campaign status feature (handled by separate agent)
- Dashboard page updates (handled after core fixes)
- Payout page commission display (already uses dynamic calculation)
