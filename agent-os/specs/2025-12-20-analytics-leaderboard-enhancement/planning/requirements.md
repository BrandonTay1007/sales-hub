# Spec Requirements: Analytics Leaderboard Enhancement

## Initial Description

Add a new Leaderboard page at `/analytics/leaderboard` with a toggle to switch between Sales Person and Campaign views. Update the "See More" button in AnalyticsPage to navigate to this new page instead of opening a modal.

## Requirements Discussion

### First Round Questions

**Q1:** Should the LeaderboardPage be accessible to both admin and sales users, or admin only?
**Answer:** Following the existing analytics pattern, this will be admin-only (analytics menu only shows for admin users per AppSidebar.tsx).

**Q2:** For the toggle, should we use the existing shadcn/ui Tabs component or a custom toggle design?
**Answer:** Use a custom toggle design as specified in requirements (simple button-based toggle with bg-secondary container).

**Q3:** Should the campaign leaderboard include all campaigns or only active campaigns?
**Answer:** All campaigns (sorted by revenue), to show complete performance picture.

**Q4:** Should clicking a sales person row navigate anywhere?
**Answer:** No navigation for sales person rows (only campaign rows navigate to CampaignDetailPage).

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Sales Person Leaderboard - Path: `src/pages/AnalyticsPage.tsx` (lines 163-189, modal content)
- Feature: Platform Icons - Path: `src/pages/CampaignsPage.tsx` (`getPlatformIcon` function)
- Feature: Page Layout - Path: `src/components/DashboardLayout.tsx`
- Feature: Leaderboard Data - Path: `src/lib/mockData.ts` (`getLeaderboard()` function)
- Components to potentially reuse: Rank badge styling, Avatar circle, Revenue display pattern
- Backend logic to reference: `getLeaderboard()` pattern for `getCampaignLeaderboard()`

### Follow-up Questions

**Follow-up 1:** Should we add a back button to return to the Analytics page?
**Answer:** Not required - the sidebar navigation provides this. The pattern matches other pages like CampaignDetailPage.

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements
- Create new LeaderboardPage component with toggle between Sales Person and Campaign views
- Sales Person view shows: rank badge, avatar, name, order count + commission rate, total revenue, commission earned, avg order value
- Campaign view shows: rank badge, title, total revenue, sales person name, platform icon
- Campaign row click navigates to `/campaigns/:id`
- Remove modal from AnalyticsPage, replace with navigation to `/analytics/leaderboard`
- Add new route in App.tsx

### Reusability Opportunities
- Reuse rank badge styling from existing leaderboard (gold #1, silver #2, bronze #3, gray others)
- Reuse `getPlatformIcon()` pattern from CampaignsPage.tsx
- Reuse `getLeaderboard()` pattern for new `getCampaignLeaderboard()` function
- Reuse DashboardLayout for page structure

### Scope Boundaries
**In Scope:**
- New LeaderboardPage.tsx with toggle functionality
- getCampaignLeaderboard() function in mockData.ts
- Update AnalyticsPage.tsx (remove modal, change "See More" to navigate)
- Update App.tsx with new route

**Out of Scope:**
- Date range filtering for leaderboards
- Export/download functionality
- Sorting options (fixed by revenue descending)
- Mobile-specific optimizations beyond existing responsive patterns
- Any changes to existing leaderboard data calculation logic

### Technical Considerations
- Use existing routing pattern from App.tsx
- Use Sonner toasts if any notifications needed (per project standards)
- Follow existing component styling patterns
