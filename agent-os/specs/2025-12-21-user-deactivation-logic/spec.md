# Specification: User Deactivation Logic & User Management Enhancements

## Goal

Add business rule enforcement for user deactivation (hide inactive sales persons from campaign assignment, prevent last admin deactivation) and enhance the Users page with search and filter functionality.

## User Stories

- As an admin, I want inactive sales persons hidden from assignment dropdowns so that I don't accidentally assign campaigns to disabled team members
- As an admin, I want the system to prevent me from deactivating the last admin so that I don't lock everyone out of the system
- As an admin, I want to search and filter users so that I can quickly find team members in a large list

## Specific Requirements

**Hide Inactive Sales Persons from Campaign Assignment**
- Filter the sales person dropdown in campaign create modal to show only `status === 'active'`
- Location: `CampaignsPage.tsx` line 574
- Keep inactive users visible in the filter dropdown (for filtering historical campaigns)
- No backend changes needed - frontend-only filter enhancement

**Last Admin Protection (Backend)**
- Add check in `userService.update()` before changing status to 'inactive'
- Count remaining active admins: query users where `role === 'admin' AND status === 'active' AND id !== targetUserId`
- If count === 0, throw `ValidationError` with message: "Cannot deactivate the last admin. Please add another admin before deactivating."
- Allow self-deactivation if another admin exists

**Last Admin Protection (Frontend)**
- Display backend error message via Sonner toast (already handled by existing error pattern)
- No additional UI changes needed - error will display automatically

**Users Page Search Input**
- Add search input above the table
- Search filters by name OR username (case-insensitive, partial match)
- Real-time filtering as user types

**Users Page Filter Dropdowns**
- Add role filter: All / Admin / Sales
- Add status filter: All / Active / Inactive
- Filters work in combination with search
- Add "Clear all" button when any filter is active

**Users Page Filter UI Layout**
- Match CampaignsPage filter pattern: dashboard-card containing filter controls
- Show Filter icon with "Filters" label
- Show user count like "X users" after filtering

## Existing Code to Leverage

**`CampaignsPage.tsx` filter pattern (lines 261-362)**
- Reuse the dashboard-card filter layout structure
- Copy the filter state management pattern with useState hooks
- Adapt the clearFilters function pattern

**`backend/src/services/userService.ts` update function**
- Add last-admin validation check before the existing update logic
- Use existing prisma client and ValidationError class

**`src/index.css` form classes**
- Use `form-input` for search input
- Use `form-select` for filter dropdowns
- Use `form-label` for labels

**Sonner toast pattern**
- Already in use throughout the app
- Backend errors automatically displayed via existing mutation `onError` handlers

## Out of Scope

- Reactivation workflow changes
- Bulk user operations
- User soft-delete verification
- User export/import functionality
- Pagination for user list
- Server-side filtering (keep client-side for simplicity)
