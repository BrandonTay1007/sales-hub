# Specification: Frontend Integration

## Goal

Connect the React frontend to the real backend API at localhost:3000, replacing all mock data with real API calls while maintaining existing UI/UX patterns.

> [!IMPORTANT]
> **DO NOT CHANGE ANYTHING FROM FRONTEND UI/UX RELATED** unless explicitly mentioned in this spec. You can only change the backend API calls and the related logic.

## User Stories
- As an admin, I want to log in with my credentials so that I can access the real system data
- As a sales person, I want to see my actual campaigns and orders so that I can track my real performance
- As a user, I want clear feedback when something goes wrong so that I understand what happened

---

## Implementation Phases

This is a large implementation. Split into 4 sub-phases for manageability.

### Phase 2.1: Core Infrastructure
- API client setup
- Authentication refactor
- Error handling
- Loading states

### Phase 2.2: Data Management Pages
- Users Page integration
- Campaigns Page integration
- Campaign Detail Page integration

### Phase 2.3: Orders & Payouts
- Orders Page integration
- Payouts Page integration
- Team Payouts Page integration

### Phase 2.4: Dashboard & Analytics
- Dashboard integration
- Analytics Page integration
- New Leaderboard Page (UI change - mentioned below)

---

## Phase 2.1: Core Infrastructure

### API Client Service
- Create `src/lib/api.ts` with native fetch wrapper
- Configure base URL from `VITE_API_URL` environment variable
- Automatically attach Authorization header from localStorage token
- Handle JSON request/response parsing
- On 401 response, clear token and redirect to login
- Export typed functions for each endpoint group

### Authentication Refactor
- Refactor `AuthContext.tsx` to use async login via API
- Store JWT token in localStorage on successful login
- Add loading state for initial auth check on app load
- Change login return type from boolean to Promise
- Add full-page loading spinner during token verification

### Error Handling
- Add global ErrorBoundary component in App.tsx
- Use Sonner toast for API error notifications
- Display meaningful error messages from API response
- Handle network errors gracefully

### Environment Configuration
- Create `.env` with `VITE_API_URL=http://localhost:3000/api`
- Create `.env.example` for reference

---

## Phase 2.2: Data Management Pages

### Users Page Integration
- Replace mockData import with API calls
- Use React Query `useQuery` for fetching user list
- Use `useMutation` for create/update/delete operations
- Show Sonner toast on success/error
- Add loading skeletons while fetching

**Endpoints:**
| Action | Method | Endpoint |
|--------|--------|----------|
| List users | GET | `/api/users` |
| Create user | POST | `/api/users` |
| Update user | PUT | `/api/users/:id` |
| Delete user | DELETE | `/api/users/:id` |

### Campaigns Page Integration
- Fetch campaigns via `/api/campaigns`
- Admin sees all campaigns, sales sees only assigned
- Use React Query with proper cache invalidation
- **Restore campaign status column** (active/completed badge) that was accidentally removed
- **Restore status filter** dropdown for filtering by active/completed

**Endpoints:**
| Action | Method | Endpoint |
|--------|--------|----------|
| List campaigns | GET | `/api/campaigns` |
| Create campaign | POST | `/api/campaigns` |
| Update campaign | PUT | `/api/campaigns/:id` |
| Delete campaign | DELETE | `/api/campaigns/:id` |

### Campaign Detail Page Integration
- Fetch single campaign with stats from API
- List orders for this campaign
- **Display campaign type** (post/live/event) badge in header alongside platform icon

**Endpoints:**
| Action | Method | Endpoint |
|--------|--------|----------|
| Get campaign | GET | `/api/campaigns/:id` |
| List campaign orders | GET | `/api/orders?campaignId=:id` |
| Create order | POST | `/api/orders` |
| Update order | PUT | `/api/orders/:id` |
| Delete order | DELETE | `/api/orders/:id` |

---

## Phase 2.3: Orders & Payouts

### Orders Page Integration
- Fetch orders via `/api/orders` with filter params
- Commission calculation comes from backend response
- Preserve existing sort and filter UI patterns
- Respect role-based access (Admin: full CRUD, Sales: view-only)

**New UI Features:**
- Editable Order Dates: Date picker when creating/editing orders (default: current date)
- Better Products Column: Show summary (e.g., "Widget ×2, Gadget ×1" or first item + "+ N more")
- Enhanced Order Dialog: Add platform, type, sales person name, campaign link

**Endpoints:**
| Action | Method | Endpoint |
|--------|--------|----------|
| List orders | GET | `/api/orders?campaignId=&startDate=&endDate=` |
| Get order | GET | `/api/orders/:id` |
| Create order | POST | `/api/orders` (Admin only) |
| Update order | PUT | `/api/orders/:id` (Admin only) |
| Delete order | DELETE | `/api/orders/:id` (Admin only) |

### Payouts Page Integration
- Sales person: fetch from `/api/payouts/me`
- Use year/month query parameters already in UI

**Endpoints:**
| Action | Method | Endpoint |
|--------|--------|----------|
| My payouts | GET | `/api/payouts/me?year=&month=` |

### Team Payouts Page Integration
- Admin: fetch from `/api/payouts/team`
- Use year/month query parameters already in UI

**Endpoints:**
| Action | Method | Endpoint |
|--------|--------|----------|
| Team payouts | GET | `/api/payouts/team?year=&month=` |

---

## Phase 2.4: Dashboard & Analytics

### Dashboard Integration
Use existing endpoints and calculate stats in frontend:

| Data | Source Endpoint | Frontend Calculation |
|------|-----------------|---------------------|
| Total Revenue | GET `/api/orders` | Sum `orderTotal` for current month |
| Commissions | GET `/api/orders` | Sum `commissionAmount` for current month |
| Active Campaigns | GET `/api/campaigns` | Filter by status === 'active' |
| Daily Sales | GET `/api/orders` | Group by `createdAt` date |
| Platform Revenue | GET `/api/campaigns` + `/api/orders` | Sum by campaign platform |
| Top Performer | GET `/api/users` + `/api/orders` | Calculate per-user totals |
| Recent Activity | GET `/api/orders?limit=5&sort=createdAt:desc` | Direct from API |

### Analytics Page Integration
Use existing endpoints and calculate stats in frontend:

| Data | Source Endpoint | Frontend Calculation |
|------|-----------------|---------------------|
| Leaderboard (Sales) | GET `/api/users` + `/api/orders` | Sum revenue per sales person |
| Leaderboard (Campaign) | GET `/api/campaigns` + `/api/orders` | Sum revenue per campaign |
| Revenue by Type | GET `/api/campaigns` + `/api/orders` | Group by campaign type |
| Top Products | GET `/api/orders` | Aggregate product sales from products array |
| Top Campaigns | GET `/api/campaigns` + `/api/orders` | Sum revenue per campaign |
| Cumulative Revenue | GET `/api/orders` | Group by month, running total |

### New Leaderboard Page [UI CHANGE]
> [!NOTE]
> This is a UI addition explicitly requested by user.

**Route:** `/analytics/leaderboard`

**Features:**
1. Toggle switch to change view between:
   - **Sales Person Leaderboard** (default) - Ranked by revenue per person
   - **Campaign Leaderboard** - Ranked by revenue per campaign

2. **Sales Person View** (existing design):
   - Rank, Avatar, Name, Order count, Total Revenue, Commission

3. **Campaign View** (new):
   - Rank, Title, Revenue, Sales Person name, Platform icon
   - Click on row → Navigate to `/campaigns/:id` (CampaignDetailPage)

4. Update existing "See More" button in AnalyticsPage to navigate to `/analytics/leaderboard` instead of opening modal

---

## Existing Code to Leverage

### `src/contexts/AuthContext.tsx`
- Contains AuthProvider, useAuth hook, login/logout pattern
- Refactor to async API calls instead of mock users array
- Keep the same context interface (user, login, logout, isAdmin)
- Add token storage and loading state

### `src/lib/mockData.ts`
- Contains type definitions (User, Campaign, Order, etc.)
- Keep file for reference but stop importing data from it
- Reuse TypeScript interfaces for API response typing

### `src/App.tsx`
- Already has QueryClientProvider configured
- Already has Sonner component for toasts
- Add ErrorBoundary wrapper here
- Add new route for `/analytics/leaderboard`

### Page Components
- All currently import from mockData and use useState
- Convert to useQuery/useMutation pattern
- Keep existing UI structure and styling

### Toast Pattern
- Already using `toast.success()` and `toast.error()` from Sonner
- Continue using this pattern for API feedback

---

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

---

## Verification Plan

### Per-Phase Testing
After each phase, verify:
1. Build passes (`npm run build`)
2. No console errors
3. Features work as expected in browser
4. Role-based access respected

### End-to-End Flows
1. Admin login → CRUD users → CRUD campaigns → CRUD orders → View payouts
2. Sales login → View campaigns → View orders → View own payouts
3. Logout → Token cleared → Redirect to login

### Integration Checklist
- [ ] Login/Logout working with real JWT
- [ ] Users CRUD (Admin only)
- [ ] Campaigns CRUD (Admin write, Sales read)
- [ ] Orders CRUD (Admin write, Sales read)
- [ ] Payouts display correct data
- [ ] Dashboard shows real stats
- [ ] Analytics shows real data
- [ ] Leaderboard toggle works
- [ ] All toasts showing on success/error
- [ ] Loading states displayed during API calls
