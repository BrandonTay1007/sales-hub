# Tasks - Delete Confirmation Modal & Undo Toast

**Spec:** [spec.md](./spec.md)  
**Date:** 2025-12-21  
**Status:** Ready for Implementation

---

## Task Group 1: Create Shared Component

**Priority:** High (dependency for all other tasks)

- [x] 1.1 Create ConfirmDeleteDialog component ✅
  - Create `src/components/ConfirmDeleteDialog.tsx`
  - Use shadcn AlertDialog component
  - Props: open, onOpenChange, title, description, onConfirm, isLoading
  - Style: Destructive red confirm button

**Acceptance Criteria:**
- Component renders correctly
- Cancel closes modal
- Confirm triggers callback

---

## Task Group 2: Order Deletion Updates

**Priority:** High

- [x] 2.1 Update OrdersPage with confirmation modal ✅
  - Replace `confirm()` with ConfirmDeleteDialog
  - Add `deleteOrderId` state to control modal
  - Open modal when trash icon clicked

- [x] 2.2 Add undo toast to OrdersPage ✅
  - Implement soft delete pattern with 5-second delay
  - Show toast with Undo action button
  - Cancel deletion if undo clicked

- [x] 2.3 Update CampaignDetailPage order deletion ✅
  - Same confirmation modal pattern
  - Same undo toast pattern

**Acceptance Criteria:**
- Custom modal appears on delete click
- Undo button works within 5 seconds
- Order only deleted after 5 seconds if no undo

---

## Task Group 3: Campaign Deletion Updates

**Priority:** High

- [x] 3.1 Update CampaignsPage with confirmation modal ✅
  - Replace any confirm() with ConfirmDeleteDialog
  - Warn that "all orders will also be deleted"

- [x] 3.2 Add undo toast to CampaignsPage ✅
  - Same soft delete pattern
  - 5-second undo window

- [x] 3.3 Update CampaignDetailPage campaign deletion ✅
  - Add confirmation modal
  - Add undo toast

**Acceptance Criteria:**
- Campaign deletion shows warning about cascade
- Undo works correctly
- Campaign and orders only deleted after timeout

---

## Task Group 4: Verification

- [x] 4.1 Test order deletion flow ✅
  - Confirm modal → Cancel → No action
  - Confirm modal → Delete → Undo → Order restored
  - Confirm modal → Delete → Wait 5s → Order deleted

- [x] 4.2 Test campaign deletion flow ✅
  - Same tests as order deletion
  - Verify cascade warning message

**Acceptance Criteria:**
- All delete actions use custom modal
- Undo works within 5 seconds
- No browser confirm dialogs used

---

## Dependencies

```
Task Group 1 → Independent (must be done first)
Task Group 2 → Depends on Task Group 1
Task Group 3 → Depends on Task Group 1
Task Group 4 → Depends on all above
```
