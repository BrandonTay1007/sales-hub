# Specification: Frontend Integration

## Goal

Connect the React frontend to the real backend API at localhost:3000, replacing all mock data with real API calls while maintaining existing UI/UX patterns. **DO NOT CHANGE ANYTHING FROM FRONTEND UI/UX RELATED**. You can only change the backend API calls and the related logic. 

## User Stories
- As an admin, I want to log in with my credentials so that I can access the real system data
- As a sales person, I want to see my actual campaigns and orders so that I can track my real performance
- As a user, I want clear feedback when something goes wrong so that I understand what happened

## Specific Requirements

**API Client Service**
- Create `src/lib/api.ts` with native fetch wrapper
- Configure base URL from `VITE_API_URL` environment variable
- Automatically attach Authorization header from localStorage token
- Handle JSON request/response parsing
- On 401 response, clear token and redirect to login
- Export typed functions for each endpoint group

**Authentication Refactor**
- Refactor `AuthContext.tsx` to use async login via API
- Store JWT token in localStorage on successful login
- Add loading state for initial auth check on app load
- Change login return type from boolean to Promise
- Add full-page loading spinner during token verification

**Users Page Integration**
- Replace mockData import with API calls
- Use React Query `useQuery` for fetching user list
- Use `useMutation` for create/update/delete operations
- Show Sonner toast on success/error
- Add loading skeletons while fetching

**Campaigns Page Integration**
- Fetch campaigns via `/api/campaigns`
- Admin sees all campaigns, sales sees only assigned
- Use React Query with proper cache invalidation
- Campaign detail page fetches stats from API

**Orders Page Integration**
- Fetch orders via `/api/orders` with filter params
- Implement date range picker for startDate/endDate filtering
- Commission calculation comes from backend response
- Preserve existing sort and filter UI patterns

**Payouts Integration**
- Sales person: fetch from `/api/payouts/me`
- Admin: fetch from `/api/payouts/team`
- Use year/month query parameters already in UI

**Error Handling**
- Add global ErrorBoundary component in App.tsx
- Use Sonner toast for API error notifications
- Display meaningful error messages from API response
- Handle network errors gracefully

**Environment Configuration**
- Create `.env` with `VITE_API_URL=http://localhost:3000/api`
- Create `.env.example` for reference
- Update tech-stack.md to reflect native fetch choice

## Existing Code to Leverage

**`src/contexts/AuthContext.tsx`**
- Contains AuthProvider, useAuth hook, login/logout pattern
- Refactor to async API calls instead of mock users array
- Keep the same context interface (user, login, logout, isAdmin)
- Add token storage and loading state

**`src/lib/mockData.ts`**
- Contains type definitions (User, Campaign, Order, etc.)
- Keep file for reference but stop importing data from it
- Reuse TypeScript interfaces for API response typing

**`src/App.tsx`**
- Already has QueryClientProvider configured
- Already has Sonner component for toasts
- Add ErrorBoundary wrapper here

**Page Components (UsersPage, CampaignsPage, OrdersPage, PayoutsPage)**
- All import from mockData and use useState
- Convert to useQuery/useMutation pattern
- Keep existing UI structure and styling

**Toast Pattern**
- Already using `toast.success()` and `toast.error()` from Sonner
- Continue using this pattern for API feedback

## Out of Scope

- Real-time updates via WebSocket
- Offline support or client-side caching persistence
- File uploads (receipts, images)
- Email notifications
- Pagination (backend doesn't support yet)
- Multi-select filter dropdowns
- Search autocomplete functionality
- Saved filter presets
- Dark mode persistence
- Mobile-native specific optimizations
