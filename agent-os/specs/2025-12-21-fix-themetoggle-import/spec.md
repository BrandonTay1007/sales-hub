# Spec: UI Fixes and Cleanup

## Background
The user requested fixing a blocking import error in `TopBar.tsx` and removing "Export" and "Dispute" buttons across the application to simplify the UI.

## Proposed Changes

### [Component: Layout]

#### [MODIFY] [TopBar.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/components/layout/TopBar.tsx)
- Update line 2:
```diff
-import { ThemeToggle } from './ThemeToggle';
+import { ThemeToggle } from '@/components/shared/ThemeToggle';
```

### [Component: Shared]

#### [MODIFY] [QuickActions.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/components/shared/QuickActions.tsx)
- Remove line 15:
```diff
-    { icon: FileDown, label: 'Export Report', action: () => navigate('/payouts') },
```

### [Component: Payouts]

#### [MODIFY] [PayoutsPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/features/orders/PayoutsPage.tsx)
- Remove `disputeNotes` state (line 24).
- Remove `handleDispute` function (lines 142-147).
- Remove "Dispute" and "Export" buttons from the JSX (lines 160-192).

#### [MODIFY] [TeamPayoutsPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/features/orders/TeamPayoutsPage.tsx)
- Remove `handleExport` function (lines 180-183).
- Remove "Export Report" button from the JSX (lines 199-202).

### [Component: Orders]

#### [MODIFY] [OrdersPage.tsx](file:///c:/Users/taywe/Desktop/Projects/pebble-tech/sales-hub/src/features/orders/OrdersPage.tsx)
- Remove unused `Download` import (line 6).

## Verification Plan

### Automated Tests
- `npm run build`

### Manual Verification
- Check `TopBar` for ThemeToggle.
- Check `Orders`, `Payouts`, `Team Payouts`, and `QuickActions` for removed buttons.
