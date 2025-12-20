# Task Breakdown: UI Bug Fixes & Polish

## Overview
Total Tasks: 19 sub-tasks across 4 task groups

## Task List

### CampaignDetailPage Fixes

#### Task Group 1: CampaignDetailPage Bug Fixes
**Dependencies:** None

- [x] 1.0 Complete CampaignDetailPage fixes
  - [x] 1.1 Hide Actions Header for Salesperson
    - Wrap Actions `<th>` with `{isAdmin && ...}`
    - Update colSpan for empty state row
  - [x] 1.2 Fix Pen Icon - Add Order Detail Modal
    - Add `viewingOrder` and `isEditMode` state
    - Copy order detail dialog from OrdersPage (same implementation)
    - Wire Edit2 icon to open modal in edit mode
    - Ensure edit capability matches OrdersPage behavior
  - [x] 1.3 Align Products Column with OrdersPage
    - Change from full product list to `{products.length} items`
    - Add row click handler for viewing order details
    - Add `handleRowClick` for viewing order
    - Copy order detail dialog from OrdersPage (same implementation)
    - Ensure the dialog is scrollable when there is large orders with big amount of products
  - [x] 1.4 Verify Delete Removes Row
    - Confirm `deleteOrder` removes from state (not soft delete)
    - Row disappears immediately on delete

**Acceptance Criteria:**
- Actions header hidden for salespersons ✅
- Pen icon opens order modal in edit mode (same as OrdersPage) ✅
- Products column shows item count ✅
- Delete removes row entirely ✅

---

### OrdersPage Fixes

#### Task Group 2: OrdersPage Bug Fixes
**Dependencies:** None

- [x] 2.0 Complete OrdersPage fixes
  - [x] 2.1 Default Sort After Create
    - Reset sortBy state after order creation
    - Sort by createdAt descending (latest first)
    - New order appears at top of table

  - [x] 2.3 Minimum 1 Product Validation
    - Check products array before save
    - Show toast.error if 0 valid products
    - Apply to both create and edit flows
  - [x] 2.4 Scrollable Product List in Modal
    - Add `max-h-48 overflow-y-auto` to product container
    - Keep Add Product button outside scroll
  - [x] 2.5 Remove Pen Icon from Modal Header
    - Remove Edit2 button from DialogTitle
    - Use inline table icons only

**Acceptance Criteria:**
- New orders appear at top of table ✅
- Cannot save order with 0 products ✅
- Product list scrolls in modal ✅
- No edit icon in modal header ✅

---

### CampaignsPage Fixes

#### Task Group 3: CampaignsPage Bug Fixes
**Dependencies:** None

- [x] 3.0 Complete CampaignsPage fixes
  - [x] 3.1 Change URL to Text Field
    - Change `type="url"` to `type="text"` in form
  - [x] 3.2 Fit All 5 Filters in One Row
    - Adjust flex layout to prevent wrapping
    - Use `flex-1` or smaller widths
  - [x] 3.3 Default Sort After Create
    - Sort campaigns by createdAt descending (latest first)
    - New campaign appears at top
  - [x] 3.4 Add Campaign Delete with Cascade
    - Add Trash2 icon to campaign cards
    - Create `deleteCampaign` function
    - Delete related orders and commission from sales person
    - Add 5-second undo toast

**Acceptance Criteria:**
- URL field accepts any text ✅
- All 5 filters fit in one row ✅
- New campaigns appear at top after creation ✅
- Campaign delete removes related orders ✅
- Undo restores campaign and orders ✅

---

### Cross-Page Verification

#### Task Group 4: Verification
**Dependencies:** Task Groups 1-3

- [/] 4.0 Verify all fixes
  - [ ] 4.1 Test CampaignDetailPage as admin
  - [ ] 4.2 Test CampaignDetailPage as salesperson
  - [ ] 4.3 Test OrdersPage create/edit/delete
  - [ ] 4.4 Test CampaignsPage filters and delete
  - [/] 4.5 Run build verification

**Acceptance Criteria:**
- All 11 requirements verified working
- Build passes

---

## Execution Order

Completed:
1. ✅ Task Group 2: OrdersPage Fixes
2. ✅ Task Group 1: CampaignDetailPage Fixes
3. ✅ Task Group 3: CampaignsPage Fixes
4. 🔄 Task Group 4: Verification (in progress)
