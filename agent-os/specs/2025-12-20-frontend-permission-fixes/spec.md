# Specification: Frontend Permission Fixes

## Goal
Implement role-based UI restrictions so salespeople can only view orders (not manage them), add campaign navigation to the Payouts page, and remove the notification button from the header.

## User Stories
- As an admin, I want to be the only role that can create, edit, and delete orders so that order data integrity is maintained
- As a salesperson, I want to click on a campaign in my Payouts page to see its details so that I can review my performance

## Specific Requirements

**1. Order Management - Admin Only**
- Hide "Add Order" button on `OrdersPage.tsx` for salespersons (line 243-246)
- Hide edit button column in orders table for salespersons (line 369, 416-427)
- Hide "Edit Order" button in order detail modal for salespersons (skip - currently admin-only via line 561)
- Hide "Delete Order" button in order detail modal for salespersons (line 561-568)
- Hide "Add Order" button on `CampaignDetailPage.tsx` for salespersons (line 248-251)
- Hide delete action in campaign orders table for salespersons (line 293-301)
- Hide "Delete Order" button in order detail modal for salespersons (line 416-422)
- Use existing `isAdmin` boolean from `useAuth()` hook for conditional rendering

**2. Campaign Navigation in Payouts**
- Add `useNavigate` hook to `PayoutsPage.tsx` (from react-router-dom)
- Make campaign breakdown cards navigable by clicking the campaign title
- Navigate to `/campaigns/${campaignId}` on click
- Add visual cursor pointer and hover state to indicate clickability

**3. Remove Notification Button**
- Remove `NotificationsPopover` import from `TopBar.tsx` (line 3)
- Remove `<NotificationsPopover />` usage from `TopBar.tsx` (line 12)
- Remove `NotificationsPopover` import from `MobileNav.tsx` (line 7)
- Remove `<NotificationsPopover />` usage from `MobileNav.tsx` (line 46)

**4. Documentation Update**
- Update `requirements/01-base-requirements.md` lines 27-30 to state: Sales persons can only VIEW orders (read-only), not create/edit/delete

## Visual Design
No visual mockups provided. Using existing UI patterns and conditional rendering.

## Existing Code to Leverage

**`useAuth` hook with `isAdmin` check**
- Located in `@/contexts/AuthContext`
- Already used in OrdersPage (line 19), CampaignsPage (line 14), CampaignDetailPage
- Pattern: `const { user, isAdmin } = useAuth();` then `{isAdmin && <AdminContent />}`

**Campaign navigation pattern in CampaignsPage**
- Path: `src/pages/CampaignsPage.tsx` lines 173-175
- Pattern: `const navigate = useNavigate();` then `navigate(\`/campaigns/${id}\`)`
- Apply same pattern to PayoutsPage for campaign breakdown cards

**Conditional rendering for admin content**
- Pattern already established: `{isAdmin && (<button>Admin Action</button>)}`
- Used in CampaignsPage line 191-196 for "Create Campaign" button

## Out of Scope
- Backend API permission changes (already handled by backend routes)
- Deleting the NotificationsPopover component file
- Modifying notification-related mock data
- Adding new UI components or styles
- Unit tests (frontend uses browser-based testing)
