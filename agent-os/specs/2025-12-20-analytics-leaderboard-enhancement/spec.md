# Specification: Analytics Leaderboard Enhancement

## Goal

Create a dedicated Leaderboard page at `/analytics/leaderboard` with toggle views for Sales Persons and Campaigns, replacing the current modal-based full leaderboard display.

## User Stories

- As an admin, I want to view a full leaderboard on a dedicated page so I can analyze performance without modal constraints
- As an admin, I want to toggle between Sales Person and Campaign views so I can compare different performance metrics

## Specific Requirements

**LeaderboardPage Component**
- Located at `src/pages/LeaderboardPage.tsx`
- Uses `DashboardLayout` wrapper for consistent page structure
- Toggle switch at top with "Sales Persons" and "Campaigns" buttons
- Default view: Sales Persons
- Responsive layout matching existing page patterns

**Toggle Implementation**
- Container: `bg-secondary rounded-lg p-1` with inline buttons
- Active state: `bg-primary text-primary-foreground`
- Inactive state: `text-muted-foreground hover:text-foreground`
- State managed via React useState hook

**Sales Person View**
- Rank badge: gold (#1), silver (#2), bronze (#3), gray (others) matching existing styling
- Avatar circle with initials from `user.avatar`
- Name, order count, commission rate display
- Total Revenue (RM) and Commission earned (RM)
- Avg Order Value column (hidden on small screens via `hidden sm:block`)

**Campaign View**
- Rank badge with same styling as Sales Person view
- Campaign title as primary text
- Total Revenue (RM) display
- Sales Person name lookup via `campaign.assignedSalesPersonId → users`
- Platform icon: Facebook (blue #1877F2), Instagram (pink #E4405F)
- Entire row is clickable, navigates to `/campaigns/:id`

**getCampaignLeaderboard Function**
- Add to `src/lib/mockData.ts`
- Returns campaigns sorted by revenue descending
- Each item includes: id, title, revenue, platform, salesPersonName, salesPersonAvatar

**AnalyticsPage Updates**
- Remove `showFullLeaderboard` state and Dialog components
- Update "See More" button to use `navigate('/analytics/leaderboard')`
- Remove Dialog import if no longer needed

**App.tsx Route Addition**
- Add route: `<Route path="/analytics/leaderboard" element={<LeaderboardPage />} />`
- Import LeaderboardPage component

## Existing Code to Leverage

**getLeaderboard() from mockData.ts**
- Pattern for aggregating user statistics across campaigns
- Use as reference for getCampaignLeaderboard() implementation

**getPlatformIcon() from CampaignsPage.tsx**
- Reusable pattern for Facebook/Instagram icons
- Copy function into LeaderboardPage or extract to shared utility

**AnalyticsPage.tsx Modal Leaderboard (lines 163-189)**
- Exact styling to replicate for Sales Person view
- Rank badge, avatar, stats layout patterns

**DashboardLayout component**
- Wrap LeaderboardPage for consistent nav and structure

**useNavigate from react-router-dom**
- Pattern for programmatic navigation

## Out of Scope

- Date range filtering for leaderboard data
- Export/download leaderboard functionality
- Custom sorting options (always by revenue descending)
- Backend API integration (using mock data)
- Additional analytics on leaderboard page
- Mobile-specific layout variations beyond existing responsive patterns
- Unit tests for new components
- Search/filter functionality on leaderboard
- Pagination for leaderboard items
- Animation/transitions for toggle switch
