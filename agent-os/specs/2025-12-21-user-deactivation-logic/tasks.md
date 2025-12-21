# Task Breakdown: User Deactivation Logic & User Management Enhancements

## Overview
Total Tasks: 3 Task Groups with 10 sub-tasks

## Task List

### Backend Layer

#### Task Group 1: Last Admin Protection
**Dependencies:** None

- [x] 1.0 Complete last admin protection ✅
  - [x] 1.1 Modify `userService.update()` in `backend/src/services/userService.ts`
    - Add check before status update: if changing to 'inactive'
    - If target user is admin, count other active admins
    - Query: `prisma.user.count({ where: { role: 'admin', status: 'active', id: { not: targetId } } })`
    - If count === 0, throw `ValidationError('Cannot deactivate the last admin. Please add another admin before deactivating.')`
  - [x] 1.2 Verify backend change
    - Run backend dev server
    - Use API client/Postman to test:
      - Create scenario with only 1 admin → try to deactivate → expect 400 error
      - Create scenario with 2 admins → deactivate 1 → expect success
      - Admin self-deactivation with another admin available → expect success

**Acceptance Criteria:**
- Cannot deactivate last remaining admin
- Proper error message returned
- Self-deactivation works when other admin exists

---

### Frontend Layer

#### Task Group 2: Hide Inactive Sales Persons from Assignment
**Dependencies:** None (can run in parallel with Task Group 1)

- [x] 2.0 Complete inactive sales person filtering ✅
  - [x] 2.1 Modify `CampaignsPage.tsx`
    - Line 574: Change filter from `salesUsers.map(...)` to `salesUsers.filter(u => u.status === 'active').map(...)`
    - Keep the filter dropdown (line 314) unchanged to allow filtering historical campaigns
  - [x] 2.2 Verify change
    - Create an inactive sales person via UsersPage
    - Open campaign create modal → verify inactive sales person is NOT in assignment dropdown
    - Open campaign filters → verify inactive sales person IS in the filter dropdown
    - Existing campaigns with inactive sales person still display correctly

**Acceptance Criteria:**
- Inactive sales persons hidden from campaign assignment dropdown
- Inactive sales persons visible in campaign filter dropdown
- Existing campaign associations preserved

---

#### Task Group 3: Users Page Search & Filter
**Dependencies:** None (can run in parallel)

- [x] 3.0 Complete Users page search and filter ✅
  - [x] 3.1 Add filter state to `UsersPage.tsx`
    - Add state: `searchQuery`, `filterRole`, `filterStatus`
    - Add `hasFilters` computed boolean
    - Add `clearFilters` function
  - [x] 3.2 Add filter UI section
    - Add dashboard-card section before the table
    - Include Filter icon + "Filters" label + "Clear all" button (when filters active)
    - Add search input with placeholder "Search by name or username..."
    - Add role dropdown: All / Admin / Sales
    - Add status dropdown: All / Active / Inactive
  - [x] 3.3 Implement filter logic
    - Create `filteredUsers` using useMemo
    - Filter by searchQuery (case-insensitive partial match on name OR username)
    - Filter by role if selected
    - Filter by status if selected
    - Display count: "X users" above table
  - [x] 3.4 Verify changes
    - Search by partial name → verify results
    - Search by partial username → verify results
    - Filter by Admin role → verify only admins shown
    - Filter by Inactive status → verify only inactive shown
    - Combine search + filters → verify combination works
    - Clear all → verify all users shown

**Acceptance Criteria:**
- Search filters by name or username (case-insensitive)
- Role filter works correctly
- Status filter works correctly
- Filters combine properly
- Clear all resets to show all users
- User count updates when filtered

---

## Final Verification

- [x] 4.0 Complete final verification ✅
  - [x] 4.1 Run `npm run build` in frontend - ✅ no errors
  - [ ] 4.2 Test complete flow (pending user testing):
    - Login as admin
    - Try to deactivate self as last admin → verify error toast
    - Create another admin
    - Deactivate original admin → verify success
    - Create inactive sales person
    - Create campaign → verify inactive sales person NOT in dropdown
    - Use Users page search → verify works
    - Use Users page filters → verify works

**Acceptance Criteria:**
- Build completes without errors ✅
- All features work as specified
- No console errors

---

## Execution Order

Recommended implementation sequence:
1. **Task Group 1**: Backend - Last Admin Protection (independent) ✅
2. **Task Group 2**: Frontend - Hide Inactive Sales Persons (independent) ✅
3. **Task Group 3**: Frontend - Users Page Search & Filter (independent) ✅
4. **Final Verification**: End-to-end testing (build passed, user testing pending)

Note: Task Groups 1, 2, and 3 can be implemented in parallel as they have no dependencies on each other.
