# Session Persistence Fix

## Raw Idea
After page refresh, data disappears on all backend-integrated pages, even though the user remains on the same page. This affects BOTH admin and sales person roles.

## Steps to Reproduce
1. User logs in (as either admin OR sales person)
2. Navigate to any backend-integrated page (e.g., My Campaigns, My Orders)
3. Data loads correctly initially
4. Press F5 to refresh the browser
5. User stays on the same page, but sees **blank tables** - no data loads

## Expected Behavior
- Token should persist in localStorage
- On refresh, `/auth/me` should verify the token
- Data should reload and display correctly

## Affected Pages
- My Campaigns - blank after refresh
- My Orders - blank after refresh
(Other pages that still use mock data may not show this issue)

## Login Credentials
- **Admin:** username=`admin`, password=`admin123`
- **Sales:** username=`sarah.j`, password=`password123`
