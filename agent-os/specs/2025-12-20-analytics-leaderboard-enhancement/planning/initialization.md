# Analytics Leaderboard Enhancement - Initial Description

## Raw Idea

Add a new Leaderboard page at `/analytics/leaderboard` with a toggle to switch between Sales Person and Campaign views. Update the "See More" button in AnalyticsPage to navigate to this new page instead of opening a modal.

### Key Features Requested

1. **New LeaderboardPage Component** (`src/pages/LeaderboardPage.tsx`)
   - Toggle switch at top: "Sales Persons" vs "Campaigns" view
   - Default view: Sales Persons
   - Sales Person view reuses existing leaderboard row design from modal
   - Campaign view shows rank, title, revenue, sales person, platform icon
   - Campaign row click navigates to CampaignDetailPage

2. **Update AnalyticsPage.tsx**
   - Remove the modal dialog for full leaderboard
   - Update "See More" button to navigate to `/analytics/leaderboard`

3. **Update App.tsx**
   - Add new route: `/analytics/leaderboard` → LeaderboardPage

4. **Update mockData.ts**
   - Add `getCampaignLeaderboard()` function

## Data Requirements

- Sales Person Leaderboard: Use existing `getLeaderboard()` function
- Campaign Leaderboard: Create `getCampaignLeaderboard()` function with:
  - Campaign id, title, revenue, platform
  - Sales person name and avatar lookup

## Source

User-provided requirements with detailed specifications and code references.
