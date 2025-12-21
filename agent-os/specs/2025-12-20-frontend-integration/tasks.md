# Task Breakdown: Frontend Integration

## Overview
Total Tasks: 4 Task Groups with 20+ sub-tasks

## Task List

### Core Infrastructure

#### Task Group 1: API Client & Auth Setup
**Dependencies:** Backend API running at localhost:3000

- [x] 1.0 Complete core infrastructure ✅
  - [x] 1.1 Create environment configuration
    - Create `.env` with `VITE_API_URL=http://localhost:3000/api`
    - Create `.env.example` for reference
  - [x] 1.2 Create API client (`src/lib/api.ts`)
    - Native fetch wrapper with base URL from env
    - Auto-attach Authorization header from localStorage
    - Handle JSON request/response parsing
    - On 401: clear token + redirect to login
    - Export typed functions for each endpoint group
  - [x] 1.3 Refactor AuthContext.tsx for real API
    - Async login via `/api/auth/login`
    - Store JWT token in localStorage on success
    - Add `GET /api/auth/me` call to verify token on app load
    - Add loading state for initial auth check
    - Add full-page loading spinner during verification
  - [x] 1.4 Add ErrorBoundary component
    - Create ErrorBoundary wrapper in `App.tsx`
    - Configure global error toast via Sonner
  - [x] 1.5 Verify Task Group 1 works
    - Login/logout works with real backend
    - Token persists across page refresh
    - Error states display correctly

**Acceptance Criteria:**
- Login with real credentials works
- Token stored in localStorage
- 401 errors redirect to login
- App shows loading spinner during auth check

---

### Data Management Pages

#### Task Group 2: Users, Campaigns, Campaign Detail
**Dependencies:** Task Group 1

- [x] 2.0 Complete data management pages ✅
  - [x] 2.1 Integrate UsersPage.tsx
    - Replace mockData with `useQuery` for user list
    - Implement `useMutation` for create/update/delete
    - Add loading skeletons while fetching
    - Show Sonner toast on success/error
  - [x] 2.2 Integrate CampaignsPage.tsx
    - Replace mockData with `useQuery` for campaign list
    - Admin sees all, Sales sees only assigned
    - Implement `useMutation` for create/update/delete
    - Add loading skeletons
    - [ ] **Restore campaign status column** (active/completed badge) - *Separate agent*
    - [ ] **Restore status filter** dropdown - *Separate agent*
  - [x] 2.3 Integrate CampaignDetailPage.tsx
    - Fetch single campaign via `/api/campaigns/:id`
    - Fetch orders via `/api/orders?campaignId=:id`
    - Implement create/update/delete order mutations
    - Add loading states
    - [x] **Add campaign type badge** in header (Post/Live/Event) ✅
  - [x] 2.4 Verify Task Group 2 works
    - CRUD operations work for users (admin only)
    - CRUD operations work for campaigns
    - Campaign detail page loads real data
    - [ ] Status filter and column display correctly - *Separate agent*

**Acceptance Criteria:**
- Users CRUD works (admin only)
- Campaigns CRUD works with role-based access
- Campaign detail shows real orders
- Loading skeletons display during fetch

---

### Orders & Payouts

#### Task Group 3: Orders, Payouts, Team Payouts
**Dependencies:** Task Group 2

- [x] 3.0 Complete orders & payouts pages ✅
  - [x] 3.1 Integrate OrdersPage.tsx
    - Replace mockData with `useQuery` for orders
    - Filter params: campaignId, startDate, endDate
    - Implement CRUD mutations (admin only)
    - Preserve existing filter/sort UI
    - Add loading skeletons
  - [x] 3.2 Add editable order date field
    - Add date picker to create order form (default: today)
    - Add date picker to edit order form
    - Apply to both OrdersPage and CampaignDetailPage (via shared OrderForm)
  - [x] 3.3 Improve products column display
    - Show product summary instead of "X items"
    - Format: "ProductA ×2 + 1 more"
    - Tooltip shows full product list
  - [x] 3.4 Enhance order details dialog
    - Add platform icon + name (Facebook/Instagram)
    - Add campaign type badge (Post/Live/Event)
    - Add sales person name + commission rate
    - Campaign title is display-only (receipt style)
    - Created shared OrderDetailsDialog component
  - [x] 3.5 Integrate PayoutsPage.tsx
    - Replace mockData with API calls
    - Uses ordersApi + campaignsApi (calculates locally)
    - Add loading skeletons
  - [x] 3.6 Integrate TeamPayoutsPage.tsx
    - Replace mockData with API calls
    - Uses ordersApi + campaignsApi + usersApi (calculates locally)
    - Add loading skeletons
  - [x] 3.7 Verify Task Group 3 works ✅
    - Orders page shows real data with filters working
    - Order date editing works
    - Products display improved
    - Order dialog shows campaign context
    - Sales person sees correct payout data
    - Admin sees team payout data

**Acceptance Criteria:**
- Orders display with working filters
- Order CRUD works (admin only)
- Sales person payouts show correct data
- Admin team payouts show all sales persons

---

### Dashboard & Analytics

#### Task Group 4: Dashboard, Analytics, New Leaderboard
**Dependencies:** Task Group 3

- [x] 4.0 Complete dashboard & analytics pages ✅
  - [x] 4.1 Integrate Dashboard.tsx ✅
    - Fetch orders + campaigns from API
    - Calculate stats in frontend:
      - Total revenue (sum orderTotal for current month)
      - Commissions (sum commissionAmount)
      - Active campaigns count
      - Daily sales (group by createdAt)
      - Platform revenue (sum by campaign platform)
      - Top performer (calculate per-user totals)
    - Add loading states
  - [x] 4.2 Integrate AnalyticsPage.tsx ✅
    - Fetch data from API
    - Calculate in frontend:
      - Leaderboard (sales person)
      - Revenue by type
      - Top products
      - Cumulative revenue
    - Add loading states
  - [x] 4.3 Create new LeaderboardPage.tsx [UI CHANGE] ✅ *Completed by parallel agent*
    - Create new page component
    - Add route `/analytics/leaderboard` in `App.tsx`
    - Add toggle switch (Sales Person / Campaign view)
    - Sales Person view: rank, avatar, name, orders, revenue, commission
    - Campaign view: rank, title, revenue, sales person, platform
    - Campaign rows click → navigate to CampaignDetailPage
  - [x] 4.4 Update AnalyticsPage "See More" button ✅ *Completed by parallel agent*
    - Change from modal to navigate to `/analytics/leaderboard`
  - [x] 4.5 Verify Task Group 4 works ✅
    - Dashboard shows real calculated stats
    - Analytics shows real calculated data
    - Leaderboard toggle works correctly
    - Campaign rows navigate to detail page
  - [x] 4.6 Integrate LeaderboardPage.tsx with real data & add filters [USER REQUEST] ✅
    - Fetch orders + campaigns + users from API
    - Add Month / YTD / All Time filter toggle
    - Calculate leaderboards based on selected time period
    - Remove mock data usage
    - Add loading states

**Acceptance Criteria:**
- Dashboard stats are calculated from real API data
- Analytics charts use real data
- New leaderboard page exists at /analytics/leaderboard
- Toggle between Sales Person and Campaign views works
- "See More" navigates to leaderboard page

---

## Final Verification

- [x] 5.0 Complete final verification
  - [x] 5.1 Run `npm run build` - verify no errors
  - [x] 5.2 Test admin flow: login → CRUD users → CRUD campaigns → CRUD orders → view payouts
  - [x] 5.3 Test sales flow: login → view campaigns → view orders → view payouts
  - [x] 5.4 Test logout → token cleared → redirect to login
  - [x] 5.5 Verify all loading states display correctly
  - [x] 5.6 Verify all error toasts display correctly

**Acceptance Criteria:**
- Build completes without errors
- All admin CRUD operations work
- Sales person has correct read-only access
- All pages show loading states
- All errors show toast notifications

---

## Execution Order

Recommended implementation sequence:
1. **Task Group 1**: Core Infrastructure (MUST be done first)
2. **Task Group 2**: Data Management Pages (Users, Campaigns, Campaign Detail)
3. **Task Group 3**: Orders & Payouts
4. **Task Group 4**: Dashboard & Analytics + New Leaderboard Page
5. **Final Verification**
