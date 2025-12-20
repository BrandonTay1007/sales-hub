# Specification: UI Enhancements

## Goal
Enhance role-based UI experience by displaying sales person info, restricting admin-only features, improving navigation between pages, and adding inline order edit/delete functionality with undo capability.

## User Stories
- As a sales person, I want to see my assigned campaigns with my commission info so I understand my earnings
- As an admin, I want to edit/delete orders directly from the table so I can quickly manage records
- As a user, I want the back button to return me to where I came from so navigation feels natural

## Specific Requirements

**1. Sales Person Info Card in CampaignDetailPage**
- Add info card in campaign header section showing assigned sales person
- Display: name, commission rate (e.g., "10%"), status badge (active/inactive)
- Sales person data already available via `users.find()` at line 23
- Style consistent with existing dashboard cards

**2. Hide Settings Button for Non-Admins**
- Wrap Settings gear icon (line ~135) with `{isAdmin && ...}`
- Remove access to campaign edit modal for sales persons
- Already have `isAdmin` from `useAuth()` hook

**3. PayoutsPage Campaign Expansion + See Details**
- Add `expandedCampaign` state (string | null)
- Add ChevronDown/ChevronRight icons to campaign breakdown cards
- When expanded, show: total revenue, total commission, order count
- Display products list from each order in breakdown
- Add "See Details" button navigating to `/campaigns/:id`
- Follow TeamPayoutsPage expand pattern (lines 270-376)

**4. TeamPayoutsPage Campaign Navigation**
- Make campaign breakdown boxes clickable for admins
- Add `useNavigate` hook if not present
- On click, navigate to `/campaigns/${campaignId}`
- Add hover cursor and visual feedback

**5. Smart Back Navigation**
- Replace current back button logic with `navigate(-1)`
- Works from any source: Campaigns list, Payouts, TeamPayouts
- Uses browser history for natural navigation

**6. Order Edit/Delete Icons with Hard Delete + Undo**
- Add Actions column to orders table (admin only)
- Add Edit2 icon - opens order detail modal in edit mode
- Add Trash2 icon - performs hard delete with undo
- Hard delete: remove from state immediately, not soft delete
- Show 5-second Sonner toast with "Undo" action
- Undo restores order to state in original position
- Apply to both OrdersPage and CampaignDetailPage orders tables

## Visual Design
No mockups provided. Following existing UI patterns from the codebase.

## Existing Code to Leverage

**Order Detail Modal Edit Mode (OrdersPage.tsx)**
- Lines 425-440: Edit2 icon in modal header with `handleEditOrder`
- `isEditMode` state toggles between view/edit
- Reuse this pattern for inline row edit trigger

**Delete with Undo Toast (OrdersPage.tsx)**
- Lines 133-164: `deleteOrder` function with 5-second undo
- Uses Sonner toast with action callback
- Restores order on undo click

**Campaign Expand Pattern (TeamPayoutsPage.tsx)**
- Lines 270-376: `expandedUsers` state array with toggle function
- ChevronDown/ChevronRight icons for visual indicator
- Inline expansion with bg-secondary styled container

**Icon Imports**
- Edit2, Trash2, ChevronDown, ChevronRight from lucide-react
- Already imported in relevant files

**useAuth Hook**
- Provides `isAdmin` boolean for role-based rendering
- Already used in all target pages

## Out of Scope
- Backend API changes
- Database schema modifications
- New API endpoints
- Delete confirmation modal (using undo pattern instead)
- Campaign creation from PayoutsPage
- Order creation from PayoutsPage
- Bulk edit/delete operations
- Export functionality changes
