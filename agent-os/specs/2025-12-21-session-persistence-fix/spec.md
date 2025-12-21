# Specification: Session Persistence Fix

## Goal
Fix blank data display after page refresh for sales persons by conditionally fetching admin-only endpoints based on user role.

## User Stories
- As a sales person, I want to see my campaigns and orders after refreshing the page so that my work session persists correctly
- As an admin, I want to continue seeing all data including user information after refreshing the page

## Specific Requirements

**Conditional Users Query in CampaignsPage**
- Only fetch `/api/users` if user is admin (using `enabled: isAdmin` in useQuery)
- For sales persons, provide empty array as default for users
- The "Sales Person" column should still display correctly using the `salesPerson` data embedded in campaign responses
- Admin filter dropdown should only show when users data is available

**Conditional Users Query in OrdersPage**
- Only fetch `/api/users` if user is admin (using `enabled: isAdmin` in useQuery)
- Sales persons don't need the sales person filter dropdown (already hidden with `{isAdmin && ...}`)
- The sales person name in table rows uses `usersMap` - for sales persons, show "You" or use campaign's embedded data

**Update isLoading Logic**
- `isLoading` should not depend on `usersLoading` for sales persons
- Pattern: `const isLoading = ordersLoading || campaignsLoading || (isAdmin && usersLoading)`

**Handle Missing User Data Gracefully**
- When `usersMap` is empty, display fallback text (e.g., `-` or campaign-embedded `salesPerson.name`)
- Filter dropdowns should hide or be disabled when data unavailable

**Leverage Campaign Embedded salesPerson Data**
- Backend already includes `salesPerson` object in campaign responses
- Use `campaign.salesPerson?.name` as fallback when `usersMap` lookup fails

## Existing Code to Leverage

**`src/lib/api.ts`**
- Campaign type already has optional `salesPerson?: User` field
- This embedded data can be used when full users list is unavailable

**`src/contexts/AuthContext.tsx`**
- Provides `isAdmin` boolean from `useAuth()` hook
- Already used in both pages for role-based UI rendering

**React Query `enabled` Option**
- Standard pattern for conditional data fetching
- Set `enabled: false` to prevent query from running

## Out of Scope
- Creating new backend endpoints
- Modifying backend role permissions
- UI/UX layout changes
- Pagination or other data loading optimizations
- Other pages not yet integrated (Dashboard, Analytics, Payouts)
- Backend changes of any kind
