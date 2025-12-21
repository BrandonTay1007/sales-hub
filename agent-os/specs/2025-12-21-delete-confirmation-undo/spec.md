# Delete Confirmation Modal & Undo Toast - Specification

## Overview

Replace browser `confirm()` dialogs with styled AlertDialog modals and add undo functionality after deletion.

### Requirements
1. **Delete Confirmation Modal** - Custom styled modal instead of browser confirm
2. **Undo Toast** - 5-second undo window with toast action button

---

## Proposed Changes

### Shared Component

#### [NEW] [ConfirmDeleteDialog.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/components/ConfirmDeleteDialog.tsx)

Create reusable confirmation dialog component:

```tsx
interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;          // e.g., "Delete Order"
  description: string;    // e.g., "Are you sure? This action can be undone."
  onConfirm: () => void;
  isLoading?: boolean;
}
```

Uses `AlertDialog` from `@/components/ui/alert-dialog`

---

### Frontend - Orders

#### [MODIFY] [OrdersPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/OrdersPage.tsx)

- Replace `confirm('Delete this order?')` with `ConfirmDeleteDialog`
- Add state: `const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)`
- Update delete mutation `onSuccess` to show undo toast:

```tsx
toast.success('Order deleted', {
  action: {
    label: 'Undo',
    onClick: () => undoDelete(orderId),
  },
  duration: 5000,
});
```

- Implement soft delete with timeout pattern

#### [MODIFY] [CampaignDetailPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/CampaignDetailPage.tsx)

- Same pattern as OrdersPage for order deletion

---

### Frontend - Campaigns

#### [MODIFY] [CampaignsPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/CampaignsPage.tsx)

- Replace browser confirm with `ConfirmDeleteDialog`
- Add undo toast with 5-second window

#### [MODIFY] [CampaignDetailPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/pages/CampaignDetailPage.tsx)

- Campaign delete confirmation modal
- Undo toast for campaign deletion

---

## Implementation Pattern

### Soft Delete with Undo

```tsx
// State
const [pendingDelete, setPendingDelete] = useState<{id: string, timer: NodeJS.Timeout} | null>(null);

// When delete confirmed
const handleConfirmDelete = (id: string) => {
  // Show undo toast
  const toastId = toast.success('Order deleted', {
    action: {
      label: 'Undo',
      onClick: () => {
        if (pendingDelete?.timer) clearTimeout(pendingDelete.timer);
        setPendingDelete(null);
        toast.dismiss(toastId);
        toast.info('Deletion cancelled');
      },
    },
    duration: 5000,
  });
  
  // Set timeout for actual deletion
  const timer = setTimeout(() => {
    deleteOrderMutation.mutate(id);
    setPendingDelete(null);
  }, 5000);
  
  setPendingDelete({ id, timer });
};
```

---

## Verification Plan

### Manual Browser Testing

1. **Order Delete Confirmation:**
   - Go to Orders page → Click trash icon
   - ✅ Custom modal opens (not browser confirm)
   - ✅ Click Cancel → Modal closes, no action
   - ✅ Click Delete → Toast appears with Undo button

2. **Undo Order Deletion:**
   - Delete an order → Click Undo within 5 seconds
   - ✅ "Deletion cancelled" toast appears
   - ✅ Order remains in list

3. **Campaign Delete Confirmation:**
   - Same tests for campaign deletion

4. **Auto-delete after 5 seconds:**
   - Delete an order → Wait 5 seconds (don't click Undo)
   - ✅ Order is removed from database

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/ConfirmDeleteDialog.tsx` | NEW - Reusable delete confirmation modal |
| `src/pages/OrdersPage.tsx` | MODIFY - Add modal, undo toast |
| `src/pages/CampaignDetailPage.tsx` | MODIFY - Add modal for both orders and campaigns |
| `src/pages/CampaignsPage.tsx` | MODIFY - Add modal, undo toast for campaigns |
