# Tasks: Frontend Permission Fixes

## Phase 1: Implementation
- [x] Feature 1: Restrict order management to admin only
  - [x] Update `OrdersPage.tsx` - hide "Add Order" button for salespersons
  - [x] Update `OrdersPage.tsx` - hide edit/delete actions for salespersons
  - [x] Update `CampaignDetailPage.tsx` - hide order management for salespersons
  - [x] Update `requirements/01-base-requirements.md` - fix documentation (already correct)
- [x] Feature 2: Add campaign navigation in PayoutsPage
  - [x] Update `PayoutsPage.tsx` - make campaign cards clickable to navigate to campaign detail
  - [x] Implement back navigation support
- [x] Feature 3: Remove notification button
  - [x] Update `TopBar.tsx` - remove NotificationsPopover
  - [x] Update `MobileNav.tsx` - remove NotificationsPopover

## Phase 2: Verification
- [x] Verify all changes in browser
- [x] Create verification report
