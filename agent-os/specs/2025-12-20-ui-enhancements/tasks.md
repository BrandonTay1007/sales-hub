# Task Breakdown: UI Enhancements

## Overview
Total Tasks: 14 sub-tasks across 4 task groups

## Task List

### CampaignDetailPage Enhancements

#### Task Group 1: Campaign Detail Page Updates
**Dependencies:** None

- [x] 1.0 Complete CampaignDetailPage enhancements
  - [x] 1.1 Add Sales Person Info Card
    - Create info card in campaign header section
    - Display: name, commission rate (%), status badge
    - Use existing `salesPerson` data (line 23)
    - Style consistent with dashboard cards
  - [x] 1.2 Hide Settings Button for Non-Admins
    - Wrap Settings gear icon with `{isAdmin && ...}`
    - `isAdmin` already available from `useAuth()`
  - [x] 1.3 Implement Smart Back Navigation
    - Replace current back button with `navigate(-1)`
    - Verify works from Campaigns, Payouts, TeamPayouts sources
  - [x] 1.4 Add Order Edit/Delete Icons (Admin Only)
    - Add Actions column to orders table header
    - Add Edit2 icon - opens order modal in edit mode
    - Add Trash2 icon - triggers hard delete with undo
    - Wrap icons with `{isAdmin && ...}`
  - [x] 1.5 Implement Hard Delete with Undo
    - Create `deleteOrder` function (hard delete pattern)
    - Show 5-second Sonner toast with Undo action
    - Undo restores order to state

**Acceptance Criteria:**
- Sales person info card displays name, rate, status
- Settings button hidden for non-admins
- Back button returns to previous page via browser history
- Edit/Delete icons visible only to admins
- Delete removes order with undo capability

---

### PayoutsPage Enhancements

#### Task Group 2: Payouts Page Expansion Feature
**Dependencies:** None

- [x] 2.0 Complete PayoutsPage enhancements
  - [x] 2.1 Add Campaign Expansion State
    - Add `expandedCampaign` state (string | null)
    - Create toggle function for expand/collapse
  - [x] 2.2 Implement Expand/Collapse UI
    - Add ChevronDown/ChevronRight icons to campaign cards
    - Follow TeamPayoutsPage pattern (lines 270-376)
    - Add click handler to toggle expansion
  - [x] 2.3 Display Expanded Campaign Summary
    - Show: total revenue, total commission, order count
    - Display products list from orders
    - Style with bg-secondary container
  - [x] 2.4 Add "See Details" Navigation Button
    - Add button navigating to `/campaigns/:id`
    - Position at bottom of expanded section
    - Use existing button styling

**Acceptance Criteria:**
- Campaign cards expand/collapse on click
- Expanded view shows revenue, commission, orders, products
- "See Details" button navigates to campaign page

---

### TeamPayoutsPage Enhancements

#### Task Group 3: Team Payouts Campaign Navigation
**Dependencies:** None

- [x] 3.0 Complete TeamPayoutsPage navigation
  - [x] 3.1 Add Campaign Click Navigation
    - Add `useNavigate` hook
    - Make campaign breakdown boxes clickable
    - Navigate to `/campaigns/${campaignId}` on click
  - [x] 3.2 Add Visual Feedback
    - Add cursor-pointer on hover
    - Add hover background effect
    - Style consistent with other clickable elements

**Acceptance Criteria:**
- Campaign boxes navigate to campaign detail on click
- Visual hover feedback indicates clickability

---

### OrdersPage Enhancements

#### Task Group 4: Orders Page Edit/Delete Icons
**Dependencies:** None

- [x] 4.0 Complete OrdersPage inline edit/delete
  - [x] 4.1 Add Actions Column (Admin Only)
    - Add "Actions" column to table header
    - Only render for admins via `isAdmin` check
  - [x] 4.2 Add Edit/Delete Icons to Rows
    - Add Edit2 icon - uses existing `handleEditOrder` pattern
    - Add Trash2 icon - triggers `deleteOrder`
    - Only visible for active orders
  - [x] 4.3 Ensure Existing Delete Logic Works
    - Verify `deleteOrder` function handles hard delete
    - Confirm undo toast restores order correctly

**Acceptance Criteria:**
- Actions column visible only to admins
- Edit icon opens order modal in edit mode
- Delete icon removes order with undo toast

---

## Execution Order

Recommended implementation sequence (can be done in parallel):
1. Task Group 1: CampaignDetailPage Enhancements ✅
2. Task Group 2: PayoutsPage Expansion Feature ✅
3. Task Group 3: TeamPayoutsPage Navigation ✅
4. Task Group 4: OrdersPage Edit/Delete Icons ✅

**Note:** All task groups are independent and can be implemented in parallel since they modify different files.
