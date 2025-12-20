# Requirements: UI Polish Features + Campaign Filtering

## Source
User requested frontend polish tasks on 2025-12-20.

## Original Requirements

### Feature 1: Orders Page Edit Icon & Delete with Undo
- Add edit icon column after Status column for each row
- Clicking edit icon opens order modal in edit mode
- Only Admin users can see/use the edit icon
- Edit icon only visible for active orders (not cancelled)
- Replace "Cancel order" with "Delete order"
- Show undo toast after deleting (5 second window)

### Feature 2: Campaign Edit Modal Consistency
- CampaignsPage and CampaignDetailPage must use the same edit modal
- Sales Person field must NOT be editable (immutable after creation)
- Extract shared CampaignEditModal component
- Grey out Sales Person field with "Cannot be changed" text

### Feature 3: Smart Back Navigation
- CampaignDetailPage back button should return to previous page
- Use browser history (`navigate(-1)`) with fallback to `/campaigns`
- Supports navigation from either CampaignsPage or TeamPayoutsPage

### Feature 4: Campaign Filtering (NEW)
- Add filter panel to CampaignsPage similar to OrdersPage
- Filter by: Sales Person, Platform, Status, Date range
- Include quick filter toggles (All, This Week, This Month)
- Include "Clear all" button when filters are active
- Show count of filtered results

## Constraints
- Sales persons can only view their own campaigns
- Admins can view all campaigns
- Match existing filter UI pattern from OrdersPage

## Out of Scope
- Backend API integration (using mock data)
- Advanced search/text filtering
- Saved filter presets
