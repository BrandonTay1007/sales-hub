# Spec Requirements: UI Enhancements

## Initial Description
Six UI enhancements covering CampaignDetailPage, PayoutsPage, TeamPayoutsPage, and OrdersPage for better role-based experience and order management.

## Requirements Discussion

### First Round Questions

**Q1:** Sales Person Display in CampaignDetailPage - display name only or full info card?
**Answer:** Full info card showing name, commission rate, and status.

**Q2:** Settings Button for Sales Persons - hide entirely or show read-only?
**Answer:** Hide the Settings button entirely.

**Q3:** Payouts Page "See More" Button - navigate or expand in-place?
**Answer:** When clicking on each campaign it will expand and display the summary of the campaign info (revenue, total commission, total orders, etc.). Then there will also be a "See Details" button to navigate to CampaignDetailPage. Also add products on order details.

**Q4:** Admin Payouts Page - where should campaign boxes be clickable?
**Answer:** User asked where `/team-payouts` is - confirmed it's `TeamPayoutsPage.tsx`. This is where admin campaign clicking should be implemented.

**Q5:** Smart Back Navigation - enhance or current is sufficient?
**Answer:** Use `navigate(-1)` for proper browser history back navigation.

**Q6:** Order Edit/Delete - hard delete or soft delete?
**Answer:** Hard delete with undo. Open the existing order detail modal in edit mode when clicking the pen icon.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Order Detail Modal Edit Mode - Path: `src/pages/OrdersPage.tsx` (lines 425-440)
  - Edit2 icon in modal header, `handleEditOrder` function, `isEditMode` state
- Feature: Delete with Undo Toast - Path: `src/pages/OrdersPage.tsx` (lines 133-164)
  - `deleteOrder` function with 5-second undo toast
- Feature: Campaign Breakdown Expand Pattern - Path: `src/pages/TeamPayoutsPage.tsx` (lines 270-376)
  - `expandedUsers` state, ChevronDown/Right icons, inline expansion
- Feature: Sales Person Info Display - Path: `src/pages/CampaignDetailPage.tsx` (line 23)
  - Already fetches `salesPerson` from users list

## Visual Assets

### Files Provided:
No visual assets provided.

## Requirements Summary

### Functional Requirements

**Requirement 1: Sales Person Info Card in CampaignDetailPage**
- Display full info card in campaign header showing:
  - Sales person name
  - Commission rate (e.g., "10%")
  - Status (active/inactive badge)

**Requirement 2: Hide Settings Button for Sales Persons**
- Wrap Settings gear icon with `isAdmin` check
- Only admins can see/access campaign settings

**Requirement 3: PayoutsPage Campaign Expansion + See Details Button**
- Add expand/collapse functionality to campaign breakdown cards (similar to TeamPayoutsPage pattern)
- When expanded, show campaign summary:
  - Total revenue
  - Total commission
  - Total orders count
  - Products list from orders
- Add "See Details" button that navigates to `/campaigns/:id`

**Requirement 4: TeamPayoutsPage Campaign Navigate**
- In admin's TeamPayoutsPage, make campaign breakdown boxes clickable
- Clicking a campaign navigates to `/campaigns/:id`

**Requirement 5: Smart Back Navigation**
- Use `navigate(-1)` for back button in CampaignDetailPage
- Works whether user came from Campaigns list, Payouts, or TeamPayouts

**Requirement 6: Order Edit/Delete Icons with Hard Delete + Undo**
- Add pen icon (Edit2) at each order row for admins only
- Add bin icon (Trash2) at each order row for admins only
- Clicking pen opens existing order detail modal in edit mode
- Clicking bin performs hard delete (removes from state/database)
- Show 5-second undo toast with restore capability
- Apply to both CampaignDetailPage and OrdersPage orders tables

### Reusability Opportunities
- `deleteOrder` function pattern from OrdersPage
- Edit2/Trash2 icons from lucide-react
- Expand/collapse pattern from TeamPayoutsPage
- Sonner toast with undo action

### Scope Boundaries

**In Scope:**
- Sales person info card in CampaignDetailPage
- Hide settings button for non-admins
- Expand campaign breakdown in PayoutsPage with summary
- "See Details" button navigating to CampaignDetailPage
- Campaign click navigation in TeamPayoutsPage
- Smart back navigation using navigate(-1)
- Edit/Delete icons on order rows (admin only)
- Hard delete with undo toast

**Out of Scope:**
- Backend changes (frontend-only changes)
- New API endpoints
- Database schema changes
- Delete confirmation modal (using undo instead)

### Technical Considerations
- Use existing `useAuth` hook for `isAdmin` checks
- Use existing Sonner toast for undo notifications
- Use `useNavigate` from react-router-dom for navigation
- 5-second duration for undo toast
- Products data already available in order objects
