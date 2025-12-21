# Specification: Campaign Status Implementation

## Goal
Restore the Campaign Status feature that was removed during a frontend refactor by adding status display, filtering, and admin-only status management functionality to the campaigns UI.

## User Stories
- As an admin, I want to see campaign status in the campaigns list so that I can quickly identify which campaigns are active or completed.
- As an admin, I want to filter campaigns by status so that I can focus on active or completed campaigns as needed.
- As an admin, I want to end or reactivate campaigns so that I can manage campaign lifecycle without deleting data.

## Specific Requirements

**Frontend API Type Updates**
- Add `status: 'active' | 'paused' | 'completed'` to `Campaign` interface in `src/lib/api.ts`
- Add `status?: 'active' | 'paused' | 'completed'` to `UpdateCampaignData` interface to enable status updates via PUT

**CampaignsPage Status Filter**
- Add `filterStatus` state (empty string for "All", or 'active', 'completed')
- Add status filter dropdown in existing filters section alongside platform/date filters
- Filter logic: `if (filterStatus && campaign.status !== filterStatus) return false`
- Include status in `hasFilters` check for "Clear all" functionality
- Reset status filter in `clearFilters()` function

**CampaignsPage Status Column**
- Add new `<th>Status</th>` header after the "Type" column
- Add status badge cell using pattern: `<span className={campaign.status === 'active' ? 'badge-active' : 'badge-inactive'}>`
- Display capitalized status text inside badge
- Update skeleton loading to include status column
- Update empty state colSpan from 6 to 7

**CampaignDetailPage Status Display**
- Display status badge in header section next to campaign title
- Use same badge styling pattern as CampaignsPage (`badge-active` / `badge-inactive`)

**CampaignDetailPage End Campaign Button**
- Show only when `isAdmin` is true AND `campaign.status === 'active'`
- Use `StopCircle` icon (already imported) with red/destructive styling
- On click: call `campaignsApi.update(id, { status: 'completed' })`
- Invalidate `['campaigns']` and `['campaign', id]` queries on success
- Show toast: `toast.success('Campaign ended successfully')`

**CampaignDetailPage Reactivate Campaign Button**
- Show only when `isAdmin` is true AND `campaign.status === 'completed'`
- Use `RefreshCcw` icon (already imported) with primary styling
- On click: call `campaignsApi.update(id, { status: 'active' })`
- Invalidate `['campaigns']` and `['campaign', id]` queries on success  
- Show toast: `toast.success('Campaign reactivated')`

**Documentation Updates**
- Update `requirements/01-base-requirements.md` to add status field to Campaign data model
- Update `agent-os/product/roadmap.md` to note campaign status feature restored

## Visual Design
No mockups provided. Follow existing patterns:
- Status badges use `badge-active` (green) for active campaigns
- Status badges use `badge-inactive` (gray) for completed campaigns
- End Campaign button: destructive/red outline style
- Reactivate button: primary blue style

## Existing Code to Leverage

**Badge Styling in `src/index.css`**
- `.badge-active` applies green success styling (line 169-170)
- `.badge-inactive` applies gray muted styling (line 173-174)
- Follow exact pattern used in `UsersPage.tsx` for user status badges

**User Status Badge Pattern in `src/pages/UsersPage.tsx`**
- Line 209: `<span className={user.status === 'active' ? 'badge-active' : 'badge-inactive'}>`
- Replicate this ternary pattern for campaign status

**Filter Patterns in `src/pages/CampaignsPage.tsx`**
- Existing filter state and logic for platform/date filters
- `hasFilters` check pattern for showing clear button
- `clearFilters()` function to reset all filters

**Mutation Pattern in `src/pages/CampaignsPage.tsx`**
- `updateMutation` using `campaignsApi.update()` with query invalidation
- Error handling with `toast.error()` and `getErrorMessage()`
- Success handling with `toast.success()` and query invalidation

**Role-based UI Pattern**
- `isAdmin` from `useAuth()` hook for conditional rendering
- Used throughout for admin-only buttons (Create, Edit, Delete)

## Out of Scope
- "Paused" status functionality (future enhancement)
- Bulk status changes for multiple campaigns at once
- Status change confirmation dialogs
- Status history or audit log
- Changing status during campaign create/edit modal
- Backend API changes (status field already exists in Prisma schema)
- New CSS styles (existing badge classes sufficient)
