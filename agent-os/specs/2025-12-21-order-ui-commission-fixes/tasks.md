# Tasks - Order UI & Commission Storage

**Spec:** [spec.md](./spec.md)  
**Date:** 2025-12-21  
**Status:** Pending Review

---

## Task Group 1: Session Persistence Fix

**Priority:** Critical (blocking issue)

- [x] 1.1 Fix token verification on refresh ✅
  - Modify `api.ts` - only clear token on explicit 401, not network errors
  - Add error logging for debugging
  - Test: Login → Refresh → Data should persist

- [x] 1.2 Add retry logic in AuthContext ✅
  - Retry `/auth/me` once on failure before clearing token
  - Prevents transient network errors from logging user out

**Acceptance Criteria:**
- Page refresh does NOT clear session unless token expired
- Data loads correctly after refresh

---

## Task Group 2: Order Dialog Standardization

**Priority:** High

- [x] 2.1 Make OrderDetailsDialog view-only ✅
  - Remove edit icon from dialog header
  - Remove inline edit mode (isEditMode, editProducts state)
  - Dialog is receipt-style display only

- [x] 2.2 Create OrderEditModal component ✅
  - Shared modal for editing order products
  - Includes date picker (no future dates)
  - Used by both OrdersPage and CampaignDetailPage

- [x] 2.3 Ensure OrderEditModal is used in both pages ✅
  - Ensure both pages are reusing codes for code quality
  - Ensure both pages are using the same OrderEditModal component
  - Ensure both pages are using the same OrderDetailsDialog component

- [x] 2.4 Fix 2 cross to close in OrderEditModal ✅
  - Remove 1 cross to close the orderEditModal

- [x] 2.5 Add edit orders data function ✅
  - Similar logic to when creating (OrderEditModal + updateOrderMutation)
  - Update order data in the database
  - Cannot be future date

**Acceptance Criteria:****
- Clicking row opens view-only dialog
- Clicking edit icon in table opens edit modal
- Same experience on both pages

---

## Task Group 3: Order Table Improvements

**Priority:** High

- [x] 3.1 Update OrdersPage table ✅
  - [x]Columns: Date | Campaign (icon+name) | Products | Sales Person | Total | Commission | Actions
  - [x]Products format: "Widget ×2 +1 more" with hoverover tooltip ✅
  - [x]Actions column: Edit (pencil) + Delete (trash) icons
  - [x]Add sales person filter dropdown

- [x] 3.2 Update CampaignDetailPage orders table ✅
  - [x]Columns: Date | Campaign (icon+name) | Products | Total | Commission | Actions
  - [x]Products format: "Widget ×2 +1 more" with hoverover tooltip ✅
  - [x]NO sales person column (redundant - already shown)
  - [x]Actions column: Edit (pencil) + Delete (trash) icons

- [x] 3.3 Create shared OrdersTable component ✅
  - [x]Reusable table with configurable columns
  - [x]Reduces code duplication between pages

**Acceptance Criteria:**
- Both tables have consistent styling
- Edit/delete in action column works
- Sales person column only on OrdersPage
- Filter by sales person works

---

## Task Group 4: Commission Dynamic Calculation

**Priority:** Medium

Ensure all pages correctly calculate commission totals dynamically (sum of order commissions at runtime).

- [x] 4.1 Review and fix Dashboard commission display ✅
  - Ensure "Your Earnings" uses dynamic calculation from orders
  - Verify commission updates when orders change

- [x] 4.2 Review and fix PayoutsPage commission display ✅
  - Ensure monthly commission sums orders correctly (uses reduce on orders)
  - Verify commission updates when orders are created/updated/deleted

- [x] 4.3 Review and fix TeamPayoutsPage commission display ✅
  - Ensure each sales person's commission is calculated from their orders
  - Verify totals update correctly (uses reduce on orders)

- [x] 4.4 Review and fix CampaignDetailPage commission display ✅
  - Ensure campaign commission totals are calculated from orders
  - Verify delete order updates the total (via queryClient.invalidateQueries)

**Acceptance Criteria:**
- All commission displays use dynamic calculation (no stored field)
- Creating an order → commission increases on relevant pages
- Updating order products → commission recalculates
- Deleting an order → commission decreases
- Deleting a campaign → all order commissions removed from totals

---

## Task Group 5: Username Edit Feature

**Priority:** Low

- [x] 5.1 Add username field to edit user form in UsersPage ✅
  - Add username input field to the edit form
  - Pre-populate with current username
  - Validate username is unique (backend handles this)
  - Show error toast if username already taken

**Acceptance Criteria:**
- Username field visible in edit user modal
- Can change username and save successfully
- Error shown if username already exists

---

## Task Group 6: Verification

### Manual Testing - provide instructions for each test case to user
- [x] 6.1 Manual browser testing ✅
  - Session persistence after refresh
  - Order table columns and actions
  - View-only dialog vs edit modal
  - Username edit functionality
  - Commission updates on order CRUD

**Acceptance Criteria:**
- All features work as expected
- No console errors after refresh

---

## Dependencies

```
Task Group 1 → Independent (critical fix)
Task Group 2 → Independent
Task Group 3 → Depends on Task Group 2 (needs OrderEditModal)
Task Group 4 → Independent
Task Group 5 → Independent
Task Group 6 → Depends on all above
```

