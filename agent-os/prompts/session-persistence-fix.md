# Agent Prompt: Session Persistence and Frontend Integration Fix

## Context

You are working on the `sales-hub` project - a commission tracking dashboard with React frontend and Express/Prisma backend.

**Current Issue:** After page refresh, the user is effectively logged out (data disappears) even though they should remain authenticated. The frontend integration with the backend API is not working correctly.

---

## Technical Stack

- **Frontend:** React 18, Vite, TypeScript, React Query, React Router
- **Backend:** Express, Prisma, MongoDB
- **Auth:** JWT tokens stored in `localStorage`

---

## Problem Description

### Issue 1: Session Persistence Not Working

**Symptoms:**
- User logs in successfully
- Navigates to any page (e.g., Orders, Campaigns)
- Presses F5 to refresh the browser
- All data disappears - user appears logged out
- May still be on dashboard page but with no data

**Expected Behavior:**
- Token should persist in localStorage
- On refresh, `/auth/me` should verify the token
- User should remain authenticated and see their data

### Issue 2: Frontend-Backend Integration Problems

**Symptoms:**
- API calls may not be connecting properly
- Data not loading on pages
- Possible CORS or endpoint issues

---

## Relevant Files to Check

### Frontend Auth Flow
- `src/lib/api.ts` - API client with token handling
  - Check `getToken()`, `setToken()`, `clearToken()` functions
  - Check `apiFetch` wrapper for proper Authorization header
  - Check 401 handling - should NOT clear token on network errors

- `src/contexts/AuthContext.tsx` - Auth state management
  - Check `verifyToken` function on app mount
  - Should retry once on failure
  - Should only clear token on explicit UNAUTHORIZED error code
  - Check if `setUser` is being called correctly

### Backend Auth
- `backend/src/middleware/auth.ts` - JWT verification middleware
- `backend/src/routes/auth.ts` - Auth endpoints (/login, /me, /logout)
- `backend/.env` - Check JWT_SECRET is set

### Environment
- `sales-hub/.env` - Must have `VITE_API_URL=http://localhost:3000/api`
- `sales-hub/.env.example` - Reference for environment variables

---

## Recent Changes Made (That May Have Caused Issues)

The following changes were attempted but may need review:

1. **api.ts changes:**
   - Added `skipAuthRedirect: true` to `authApi.me()`
   - This prevents token clearing on 401 for the /auth/me endpoint

2. **AuthContext.tsx changes:**
   - Added retry logic with 1s delay
   - Changed to only clear token on `error.code === 'UNAUTHORIZED'`
   - Added console logging for debugging

---

## Debugging Steps

1. **Check Browser Console:**
   - Look for `[Auth]` prefixed logs
   - Check network tab for `/auth/me` request/response
   - Verify token is in localStorage after login

2. **Check Backend Logs:**
   - Is the `/auth/me` endpoint being hit?
   - Is JWT verification passing?
   - Any errors in the backend console?

3. **Test API Directly:**
   ```bash
   # Login and get token
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   
   # Use token to verify /auth/me
   curl http://localhost:3000/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

4. **Check Environment:**
   - Is `.env` file in `sales-hub/` root? (NOT in src/)
   - Does it have `VITE_API_URL=http://localhost:3000/api`?
   - Is the frontend dev server using the correct API URL?

---

## Expected Fix Areas

1. **api.ts:**
   - Ensure `API_BASE_URL` is correctly reading from environment
   - Verify token attachment in fetch headers
   - Check error handling doesn't inadvertently clear tokens

2. **AuthContext.tsx:**
   - Verify `verifyToken` async flow
   - Ensure `setUser` is called with proper data
   - Check loading state management

3. **Backend:**
   - Verify JWT_SECRET matches between sign and verify
   - Check `/auth/me` endpoint returns proper user data
   - Verify CORS is allowing requests from frontend origin

---

## Test Criteria

After fix, the following should work:

1. ✅ Login as admin → Navigate to Orders page → See orders
2. ✅ Press F5 to refresh → Still see orders (not blank)
3. ✅ Check localStorage → Token still present
4. ✅ Console shows `[Auth] Token verified successfully` or similar
5. ✅ All pages (Dashboard, Campaigns, Orders, Users, Payouts) load data correctly

---

## Login Credentials

- **Admin:** username=`admin`, password=`admin123`
- **Sales:** username=`sarah.j`, password=`password123`
