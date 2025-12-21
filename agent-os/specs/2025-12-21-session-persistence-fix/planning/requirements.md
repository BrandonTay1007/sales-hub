# Spec Requirements: Session Persistence Fix

## Initial Description
After page refresh, data disappears on all backend-integrated pages, even though the user remains on the same page. This affects BOTH admin and sales person roles.

## Requirements Discussion

### First Round Questions

**Q1:** When you refresh and see blank data, is the backend server running and responding correctly?
**Answer:** Yes, `/auth/me` returns successfully with user data (Emily Wong, sales role). However, `/api/users` returns `{"success":false,"error":{"code":"FORBIDDEN","message":"Admin access required"}}`

**Q2:** Do you see any console logs after refreshing?
**Answer:** Error at `api.ts:53` - `http://localhost:3000/api/users 403 (Forbidden)`

**Q3:** Is the token still present in localStorage after refresh?
**Answer:** Yes

**Q4:** What does the `/auth/me` request return on refresh?
**Answer:** HTTP 304 Not Modified (successful, cached response)

**Q5:** Any other observed symptoms?
**Answer:** No loading spinner issues

### Existing Code to Reference

**Similar Features Identified:**
- Pattern: Pages using React Query with role-based API access
- Components: `CampaignsPage.tsx`, `OrdersPage.tsx` - both fetch `/api/users` which is admin-only
- Backend logic: `backend/src/middleware/auth.ts` - role checking for admin-only endpoints

### Follow-up Questions
None needed - root cause clearly identified.

## Visual Assets
No visual assets provided.

## Requirements Summary

### Root Cause Analysis
The issue is that **sales persons trigger a 403 error** when pages try to fetch the users list:

1. `CampaignsPage.tsx` (line 50-57) fetches all users via `usersApi.list()`
2. `/api/users` endpoint is **admin-only** - sales persons get 403 Forbidden
3. React Query throws an error when `response.success` is false (line throws `new Error(getErrorMessage(response))`)
4. This error state affects the page rendering - either showing error or blank data

### Functional Requirements
- Sales persons should be able to view their campaigns without needing access to the full users list
- Pages should gracefully handle cases where certain API calls are forbidden based on role
- Admin users should continue to see full user information
- Session persistence should work correctly for both roles after page refresh

### Reusability Opportunities
- Create a role-aware query pattern or conditional fetching based on user role
- Consider a dedicated endpoint for getting sales person info for display purposes
- Or handle 403 errors gracefully without throwing

### Scope Boundaries
**In Scope:**
- Fix `CampaignsPage.tsx` to not fail when sales person can't access users list
- Fix `OrdersPage.tsx` with the same pattern
- Ensure data loads correctly after refresh for both admin and sales roles

**Out of Scope:**
- Creating new backend endpoints
- Changing backend role permissions
- UI/UX changes (as per global rules)
- Other pages not yet integrated with backend

### Technical Considerations
- The fix should be frontend-only (don't call admin-only endpoints for sales users)
- Use `isAdmin` from `useAuth()` to conditionally enable/disable queries
- React Query's `enabled` option can prevent queries from running for unauthorized users
- Gracefully handle 403 errors without crashing the page
