# Task Breakdown: Session Persistence Fix

## Overview
Total Tasks: 1 Task Group with 5 sub-tasks

## Task List

### Frontend Fixes

#### Task Group 1: Conditional Data Fetching
**Dependencies:** None

- [x] 1.0 Complete conditional data fetching fix
  - [x] 1.1 Fix CampaignsPage.tsx ✅
    - Add `enabled: isAdmin` to users useQuery (line 50-57)
    - Use `campaign.salesPerson?.name` as fallback when usersMap is empty
  - [x] 1.2 Fix OrdersPage.tsx ✅
    - Add `enabled: isAdmin` to users useQuery (line 54-61)
    - Update `isLoading` logic (line 198)
  - [ ] 1.3 Verify fix works (manual testing required)
    - Login as sales person (sarah.j / password123)
    - Navigate to My Campaigns → Verify data displays
    - Press F5 to refresh → Verify data still displays
    - Navigate to My Orders → Verify data displays
    - Press F5 to refresh → Verify data still displays
  - [ ] 1.4 Verify admin still works (manual testing required)
    - Login as admin (admin / admin123)
    - Navigate to Campaign Hub → Verify full user data displays
    - Press F5 to refresh → Verify data still displays
    - Navigate to Order Management → Verify full user data displays
    - Press F5 to refresh → Verify data still displays
  - [x] 1.5 Run build verification ✅
    - `npm run build` passed with exit code 0

**Acceptance Criteria:**
- Sales person can view My Campaigns after refresh (no blank data)
- Sales person can view My Orders after refresh (no blank data)
- Admin can still view all data with user names
- No 403 errors in console for sales person logins
- Build passes without errors

## Execution Order

Recommended implementation sequence:
1. Fix CampaignsPage.tsx (Task 1.1)
2. Fix OrdersPage.tsx (Task 1.2)
3. Verify sales person flow (Task 1.3)
4. Verify admin flow (Task 1.4)
5. Run build verification (Task 1.5)
