# Spec Requirements: Frontend Integration

## Initial Description

**Phase 2: Frontend Integration** - Connect the React frontend to the real backend API.

From product roadmap (`agent-os/product/roadmap.md`):
- Goal: Connect frontend to real backend API
- Replace mock data with real API calls
- Configure API client with base URL
- Replace mock auth with real login
- Connect all pages (Users, Campaigns, Orders, Payouts) to their respective APIs
- Add proper error handling and loading states

Context: Backend API is complete at `localhost:3000` with 20 endpoints and 37 passing tests.

## Requirements Discussion

### First Round Questions

**Q1:** I assume we'll use axios for the API client. Is that correct?
**Answer:** No, use native **fetch** API. Update relevant documents about this configuration.

**Q2:** For error handling, should we use Sonner for toasts and add a global error boundary?
**Answer:** Yes, use both Sonner toasts and global error boundary.

**Q3:** Should we store JWT token in localStorage, sessionStorage, or cookies?
**Answer:** localStorage is enough.

**Q4:** Should we add a full-page loading spinner for initial auth check?
**Answer:** Yes.

**Q5:** Configure API base URL via VITE_API_URL environment variable?
**Answer:** Correct.

**Q6:** Should we remove mockData.ts after integration?
**Answer:** Keep it for reference.

**Q7:** Anything explicitly excluded from Phase 2?
**Answer:** User requested scope boundaries to be listed - confirmed the proposed in/out of scope items.

### Existing Code to Reference

**Similar Features Identified:**
- No existing API integration patterns provided
- User requested: "Follow best and scalable/flexible service layer pattern"
- Key requirement: "Easy to read, understand, make changes, extend, add new features"

### Follow-up Questions

**Follow-up 1:** Should we add date range picker for orders filtering?
**Answer:** Yes, add it - backend already supports `startDate` and `endDate` query params.

## Visual Assets

### Files Provided:
No visual assets provided.

## Requirements Summary

### Functional Requirements

**API Client Service (`src/lib/api.ts`):**
- Native fetch wrapper with base URL from `VITE_API_URL`
- Automatic Authorization header injection
- JSON request/response handling
- 401 response handling (redirect to login)
- Scalable, maintainable service layer pattern

**Authentication:**
- Real login via `POST /api/auth/login`
- Token storage in localStorage
- AuthContext refactor to use real API
- Auto-logout on token expiry (401)
- Full-page loader during initial auth check

**Page Integrations:**
- Dashboard - Summary stats from real data
- Users Page - CRUD via `/api/users`
- Campaigns Page - CRUD via `/api/campaigns`
- Campaign Detail Page - Orders and stats
- Orders Page - CRUD via `/api/orders` with date range filter
- Payouts Page - Via `/api/payouts/me`
- Team Payouts Page - Via `/api/payouts/team` (admin)

**Error Handling:**
- Sonner toast notifications for API errors
- Global error boundary for unexpected crashes
- Consistent error message display

**Loading States:**
- Skeleton components for data loading
- Full-page spinner for initial auth
- Button loading states on form submit

**Environment:**
- `VITE_API_URL` environment variable
- `.env.example` for reference

### Reusability Opportunities

- Follow scalable service layer pattern for easy extension
- Create reusable API hooks pattern
- Leverage existing shadcn/ui components
- Keep code readable and maintainable as top priority

### Scope Boundaries

**In Scope:**
- API client service with native fetch
- Auth integration (login/logout/token storage)
- All page integrations (Dashboard, Users, Campaigns, Orders, Payouts)
- Error handling (Sonner + error boundary)
- Loading states (skeletons + full-page loader)
- Environment config (VITE_API_URL)
- Date range picker for Orders page

**Out of Scope:**
- Real-time updates (WebSocket)
- Offline support/caching
- File uploads
- Email notifications
- Pagination (backend doesn't support yet)
- Multi-select dropdowns
- Search/autocomplete
- Saved filters
- Dark mode toggle persistence
- Mobile-specific optimizations

### Technical Considerations

- Use native fetch (not axios)
- Store JWT in localStorage
- Backend at localhost:3000, frontend at localhost:8080
- CORS already configured in backend
- Types must match backend response shapes
- React Query for data fetching (already in stack)
- Keep mockData.ts for reference

### Key Architecture Decisions

1. **Service Layer Pattern**: Create `src/services/` folder with separate service files per domain (auth, users, campaigns, orders, payouts)
2. **API Client**: Single `src/lib/api.ts` with fetch wrapper
3. **React Query Hooks**: Custom hooks in `src/hooks/` that use services
4. **Type Safety**: TypeScript interfaces matching backend responses
