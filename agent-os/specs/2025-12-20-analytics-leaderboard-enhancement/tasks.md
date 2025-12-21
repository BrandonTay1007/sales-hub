# Tasks: Analytics Leaderboard Enhancement

## Implementation Tasks

### 1. Add getCampaignLeaderboard Function
- [x] Add `getCampaignLeaderboard()` to `src/lib/mockData.ts`
- [x] Function returns campaigns sorted by revenue with sales person info

### 2. Create LeaderboardPage Component
- [x] Create `src/pages/LeaderboardPage.tsx`
- [x] Implement toggle state between 'salesPerson' and 'campaign'
- [x] Implement Sales Person view using existing leaderboard row design
- [x] Implement Campaign view with platform icons and clickable rows
- [x] Add navigation to campaign detail page on row click

### 3. Update AnalyticsPage
- [x] Remove `showFullLeaderboard` state
- [x] Remove Dialog component and import
- [x] Update "See More" button to navigate to `/analytics/leaderboard`
- [x] Add `useNavigate` hook import

### 4. Update App.tsx
- [x] Import LeaderboardPage component
- [x] Add route for `/analytics/leaderboard`

## Verification Tasks

### Build Verification
- [x] Run `npm run build` - passed (exit code 0)

### Manual Testing
- [ ] Navigate to `/analytics` page
- [ ] Click "See More" button - should navigate to `/analytics/leaderboard`
- [ ] Verify toggle switches between Sales Person and Campaign views
- [ ] Verify Sales Person view displays all expected data
- [ ] Verify Campaign view displays all expected data with platform icons
- [ ] Click on a campaign row - should navigate to campaign detail page
- [ ] Verify styling matches existing design system

## Dependencies

- No external dependencies required
- Uses existing lucide-react icons (Facebook, Instagram)
- Uses existing DashboardLayout component
