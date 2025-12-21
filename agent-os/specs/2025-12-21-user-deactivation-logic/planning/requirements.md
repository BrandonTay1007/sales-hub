# Spec Requirements: User Deactivation Logic & User Management Enhancements

## Initial Description

1. After a sales person is deactivated, it should not be displayed when assigning sales person to a campaign.
2. When deactivating an admin, always check if its the last admin or not. If yes, don't deactivate that, show error saying that one admin left only, please add another admin before deactivating last admin.
3. Add search and filter functionality for the Users page.

## Requirements Discussion

### First Round Questions

**Q1:** Should inactive sales persons ALSO be hidden from the campaign filter dropdown (for filtering campaigns by sales person)?
**Answer:** Remain visible (to allow filtering historical campaigns by inactive sales persons)

**Q2:** If an admin is trying to deactivate themselves AND there's another admin available, should this be allowed?
**Answer:** User asked for suggestion. Recommendation: Yes, allow self-deactivation if another admin exists.

**Q3:** When a sales person is deactivated, their existing campaigns and orders remain untouched?
**Answer:** Yes (historical data is preserved, just hide from future assignment)

**Q4:** For the "last admin" error, should this be a Sonner toast error?
**Answer:** Yes (per our Sonner toast standards)

**Q5:** Is there anything explicitly out of scope?
**Answer:** Not really for now

### Existing Code to Reference

**Similar Features Identified:**
- **Filter Pattern**: `CampaignsPage.tsx` and `OrdersPage.tsx` have filter implementations with state, dropdowns, date pickers, and clearFilters functions
- **Search Pattern**: Can use standard `form-input` class for search input
- **Backend Validation**: `userService.update()` in `backend/src/services/userService.ts` handles status updates
- **Error Handling**: `AppError` class in `backend/src/utils/errors.ts` for custom errors

**Components to potentially reuse:**
- Filter UI pattern from CampaignsPage (lines 261-362)
- `form-input`, `form-select` CSS classes from `index.css`
- Sonner toast pattern already used throughout

### Follow-up Questions
None needed.

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements

**1. Hide Inactive Sales Persons from Campaign Assignment**
- When creating a campaign, only show active sales persons in the dropdown
- Location: `CampaignsPage.tsx` line 574 - change `salesUsers` filter to include `status === 'active'`

**2. Last Admin Protection**
- Backend: Before deactivating a user, check if they are an admin AND if they're the last active admin
- If attempting to deactivate the last admin, return a 400 error with message
- Frontend: Display the error via Sonner toast
- Self-deactivation is allowed if another admin exists

**3. Users Page Search & Filter**
- Add search input for filtering by name or username
- Add role filter dropdown (All/Admin/Sales)
- Add status filter dropdown (All/Active/Inactive)
- Add "Clear all" button when filters are applied
- Filter logic runs on the fetched data (client-side)

### Reusability Opportunities
- Copy filter UI structure from `CampaignsPage.tsx` (dashboard-card with filters, Filter icon, clear button)
- Reuse `form-input`, `form-select` CSS classes
- Follow existing error handling pattern in userService

### Scope Boundaries

**In Scope:**
- Filter inactive sales persons from campaign assignment dropdown
- Backend validation for last admin protection
- Frontend error display for last admin protection
- Search input for Users page
- Role filter for Users page
- Status filter for Users page

**Out of Scope:**
- Reactivation workflow changes
- Soft-delete verification
- Bulk user operations
- User export/import

### Technical Considerations
- Backend change requires modifying `userService.update()` function
- Frontend changes are client-side filtering (no new API endpoints needed for search/filter)
- All notifications via Sonner toast
