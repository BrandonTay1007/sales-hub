# Tasks: Frontend Integration

> Spec: `agent-os/specs/2025-12-20-frontend-integration/spec.md`

---

## Phase 1: Foundation Setup

### Task 1: Environment Configuration
**Priority:** P0 (Blocker)

- [ ] Create `src/.env` with `VITE_API_URL=http://localhost:3000/api`
- [ ] Create `src/.env.example` as reference template
- [ ] Verify Vite picks up the environment variable
- [ ] Update `agent-os/product/tech-stack.md` to reflect native fetch (not axios)

---

### Task 2: API Client Service
**Priority:** P0 (Core)

- [ ] Create `src/lib/api.ts` with native fetch wrapper
- [ ] Implement `getAuthToken()` to read from localStorage
- [ ] Implement `setAuthToken(token)` and `clearAuthToken()`
- [ ] Create base `request()` function with:
  - Base URL from `import.meta.env.VITE_API_URL`
  - Authorization header injection
  - JSON parsing for request/response
  - 401 handling (clear token, redirect to login)
- [ ] Create typed endpoint functions:
  - `authApi.login()`, `authApi.logout()`, `authApi.me()`
  - `usersApi.list()`, `usersApi.get()`, `usersApi.create()`, `usersApi.update()`, `usersApi.delete()`
  - `campaignsApi.list()`, `campaignsApi.get()`, `campaignsApi.create()`, `campaignsApi.update()`, `campaignsApi.delete()`
  - `ordersApi.list()`, `ordersApi.get()`, `ordersApi.create()`, `ordersApi.update()`, `ordersApi.delete()`
  - `payoutsApi.getMyPayout()`, `payoutsApi.getTeamPayouts()`

---

### Task 3: TypeScript Types for API
**Priority:** P0 (Core)

- [ ] Create `src/types/api.ts` with response types matching backend
- [ ] Define `ApiResponse<T>` wrapper type
- [ ] Define `ApiError` type for error responses
- [ ] Ensure types align with existing mockData.ts interfaces
- [ ] Add proper typing for payout response structures

---

## Phase 2: Authentication Integration

### Task 4: AuthContext Refactor
**Priority:** P0 (Core)

- [ ] Refactor `src/contexts/AuthContext.tsx`:
  - Change `login()` from sync to async (returns Promise)
  - Call `authApi.login()` instead of mock user lookup
  - Store token in localStorage on success
  - Add `loading` state for initial auth check
  - Add `checkAuth()` function that calls `/api/auth/me`
- [ ] Update `AuthContextType` interface for async login
- [ ] Add token restoration on app load (useEffect)
- [ ] Handle token expiry gracefully

---

### Task 5: Login Page Updates
**Priority:** P0 (Core)

- [ ] Update `src/pages/Login.tsx`:
  - Convert `handleSubmit` to async
  - Add loading state during login request
  - Show API error messages instead of hardcoded text
  - Remove demo user hint or update for real credentials
- [ ] Add loading spinner on submit button

---

### Task 6: Full-Page Loading State
**Priority:** P1 (Polish)

- [ ] Create `src/components/FullPageLoader.tsx`
- [ ] Show loading spinner while checking auth on app load
- [ ] Add to App.tsx to wrap routes during initial auth check

---

### Task 7: Error Boundary
**Priority:** P1 (Polish)

- [ ] Create `src/components/ErrorBoundary.tsx`
- [ ] Wrap App routes with ErrorBoundary
- [ ] Show user-friendly error screen on crashes
- [ ] Add "Try Again" button to reload

---

## Phase 3: Page Integrations

### Task 8: Dashboard Integration
**Priority:** P1 (Core)

- [ ] Update `src/pages/Dashboard.tsx`:
  - Fetch real data for stats cards
  - Use React Query for data fetching
  - Calculate totals from real API data
- [ ] Add loading skeletons

---

### Task 9: Users Page Integration
**Priority:** P0 (Core)

- [ ] Update `src/pages/UsersPage.tsx`:
  - Replace mockData import with `usersApi` calls
  - Use `useQuery` for fetching user list
  - Use `useMutation` for create/update/delete
  - Show Sonner toast on success/error
  - Add loading skeletons while fetching
- [ ] Handle admin-only access check

---

### Task 10: Campaigns Page Integration
**Priority:** P0 (Core)

- [ ] Update `src/pages/CampaignsPage.tsx`:
  - Replace mockData with `campaignsApi` calls
  - Use React Query with proper cache invalidation
  - Fetch user data for sales person names
- [ ] Update `src/pages/CampaignDetailPage.tsx`:
  - Fetch campaign details from API
  - Fetch orders for this campaign
  - Show real stats

---

### Task 11: Orders Page Integration
**Priority:** P0 (Core)

- [ ] Update `src/pages/OrdersPage.tsx`:
  - Replace mockData with `ordersApi` calls
  - Pass filter params (campaignId, startDate, endDate) to API
  - Use React Query for fetching
  - Commission calculation from API response (not frontend)
- [ ] Add date range picker component for filtering
- [ ] Preserve existing sort/filter UI patterns

---

### Task 12: Payouts Page Integration
**Priority:** P0 (Core)

- [ ] Update `src/pages/PayoutsPage.tsx`:
  - Fetch from `/api/payouts/me` with year/month params
  - Use React Query for data fetching
  - Display campaign breakdown from API response
- [ ] Update `src/pages/TeamPayoutsPage.tsx`:
  - Fetch from `/api/payouts/team`
  - Show all sales persons' payouts
  - Use existing year/month selectors

---

## Phase 4: Polish & Testing

### Task 13: React Query Hooks Layer
**Priority:** P1 (Refactor)

- [ ] Create `src/hooks/useUsers.ts` with useQuery/useMutation
- [ ] Create `src/hooks/useCampaigns.ts`
- [ ] Create `src/hooks/useOrders.ts`
- [ ] Create `src/hooks/usePayouts.ts`
- [ ] Standardize cache keys and invalidation patterns

---

### Task 14: Error Handling Polish
**Priority:** P1 (Polish)

- [ ] Ensure all API errors show Sonner toast
- [ ] Format error messages from API response
- [ ] Handle network errors (offline, timeout)
- [ ] Add retry logic for failed requests

---

### Task 15: Integration Testing
**Priority:** P1 (Quality)

- [ ] Test login flow end-to-end
- [ ] Test CRUD operations for each entity
- [ ] Test role-based access (admin vs sales)
- [ ] Test error handling scenarios
- [ ] Verify commission snapshot logic shows correctly

---

## Execution Order

```
Phase 1 (Foundation):  Task 1 → Task 2 → Task 3
Phase 2 (Auth):        Task 4 → Task 5 → Task 6 → Task 7
Phase 3 (Pages):       Task 8 → Task 9 → Task 10 → Task 11 → Task 12
Phase 4 (Polish):      Task 13 → Task 14 → Task 15
```

**Critical Path:** Tasks 1-5 must complete before page integrations.

---

## Acceptance Criteria

- [ ] All pages fetch real data from backend API
- [ ] Login works with real credentials (admin/admin123)
- [ ] Token persists across page reloads
- [ ] Errors show as toast notifications
- [ ] Loading states display during fetches
- [ ] No more imports from mockData.ts (except types)
