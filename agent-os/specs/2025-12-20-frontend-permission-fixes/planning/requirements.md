# Spec Requirements: Frontend Permission Fixes

## Initial Description

Implement three frontend fixes for the Sales Hub application:

1. **Order Management Permissions**: Sales persons should NOT be able to create/edit/delete orders. Only admins can manage orders. Currently, salespeople can see and use the "Add Order" button on the Orders page.

2. **Campaign Navigation in Payouts**: In the Payouts page for salespeople, clicking on a campaign should navigate to the Campaign Detail page (`/campaigns/:id`), similar to how it works in the admin's Campaigns page. The back button should return to the previous page.

3. **Remove Notification Button**: Remove the notification bell button from the TopBar and MobileNav components.

## Requirements Discussion

### First Round Questions

**Q1:** Regarding order management - the existing requirements doc says salespeople CAN create/edit/delete orders. Is the new requirement that ONLY admins can manage orders?
**Answer:** Yes, Option B - only admins can create/edit/delete orders. The requirements documentation needs to be updated.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Campaign Navigation - Path: `src/pages/CampaignsPage.tsx`
  - Line 173-175: `handleRowClick` navigates to campaign detail page
  - This pattern should be replicated in PayoutsPage
- Components to potentially reuse: `useNavigate` hook from react-router-dom
- Backend logic to reference: None (frontend-only changes)

### Follow-up Questions
None required - requirements are clear.

## Visual Assets

### Files Provided:
No visual assets provided.

## Requirements Summary

### Functional Requirements

**Feature 1: Order Management Permissions**
- Hide "Add Order" button on OrdersPage for salespersons (only show for admins)
- Hide edit icon and delete button in order table and detail modal for salespersons
- Hide "Add Order" button on CampaignDetailPage for salespersons
- Hide delete button in order table on CampaignDetailPage for salespersons
- Update requirements documentation to reflect this change

**Feature 2: Campaign Navigation in Payouts**
- Make campaign breakdown cards in PayoutsPage clickable
- On click, navigate to `/campaigns/:campaignId` using react-router-dom
- Back button on CampaignDetailPage should return to previous page (already implemented via `navigate(-1)`)

**Feature 3: Remove Notification Button**
- Remove `NotificationsPopover` import and usage from `TopBar.tsx`
- Remove `NotificationsPopover` import and usage from `MobileNav.tsx`

### Reusability Opportunities
- Use existing `useNavigate` hook pattern from CampaignsPage
- Use existing `isAdmin` check from `useAuth` context (already in use)

### Scope Boundaries

**In Scope:**
- Frontend UI changes to OrdersPage, CampaignDetailPage, PayoutsPage, TopBar, MobileNav
- Requirements documentation update

**Out of Scope:**
- Backend API permission checks (already handled)
- NotificationsPopover component deletion (keep file, just remove usage)
- Any other notification-related features

### Technical Considerations
- All pages already use `useAuth` hook with `isAdmin` boolean
- Navigation pattern already established in CampaignsPage
- No new dependencies required
