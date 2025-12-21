# Spec Requirements: Campaign Status Implementation

## Initial Description
Implement the **Campaign Status** feature that was accidentally removed during a frontend refactor. This involves:
1. Verifying backend API support (should already exist)
2. Updating frontend to display and filter by campaign status
3. Adding End Campaign / Reactivate Campaign functionality
4. Updating documentation

## Requirements Discussion

### First Round Questions

**Q1:** Does the backend API already return the status field for campaigns?
**Answer:** Yes. The Prisma schema at `backend/prisma/schema.prisma` already has:
- `status` field on Campaign model with `@default(active)`
- `CampaignStatus` enum with values: `active`, `paused`, `completed`
- The backend should already be returning this field

**Q2:** Is the frontend Campaign interface missing the status field?
**Answer:** Yes. The `Campaign` interface in `src/lib/api.ts` (lines 51-61) does NOT include a `status` field. Additionally, `UpdateCampaignData` (lines 261-267) doesn't include status, preventing status updates.

**Q3:** What role restrictions apply to campaign status changes?
**Answer:** Only admin users can:
- End an active campaign (change status to 'completed')
- Reactivate a completed campaign (change status back to 'active')
- Sales persons should NOT see these buttons

**Q4:** What UI patterns should be used for status badges?
**Answer:** Use existing badge styles from `src/index.css`:
- Active: Green badge
- Completed: Gray badge
- Focus on `active` and `completed` for now (paused is future enhancement)

**Q5:** What toast notifications are required?
**Answer:** Use Sonner toasts (already configured):
- `toast.success('Campaign ended successfully')` when ending campaign
- `toast.success('Campaign reactivated')` when reactivating

**Q6:** What other areas need updating besides the main pages?
**Answer:** Documentation must be updated:
- `requirements/01-base-requirements.md` - Add status field to Campaign data model
- `agent-os/product/roadmap.md` - Add note about campaign status feature

### Existing Code to Reference

**Similar Features Identified:**
- Feature: User status management - Path: `src/pages/UsersPage.tsx`
  - Shows active/inactive badges for users similar pattern needed
- Feature: Campaigns API - Path: `src/lib/api.ts`
  - `UpdateCampaignData` interface needs status field added
  - `Campaign` interface needs status field added
- Feature: Backend campaign controller - Path: `backend/src/controllers/campaignController.ts`
  - Already handles PUT /campaigns/:id endpoint

### Follow-up Questions

**Follow-up 1:** What status values should the filter dropdown include?
**Answer:** "All Status" (default/empty), "Active", and "Completed". Exclude "paused" for now.

## Visual Assets

### Files Provided:
No visual assets provided.

## Requirements Summary

### Functional Requirements
- Display campaign status as colored badge in CampaignsPage table
- Add status filter dropdown to CampaignsPage (All/Active/Completed)
- Display campaign status badge in CampaignDetailPage header
- Admin-only "End Campaign" button for active campaigns (sets status to 'completed')
- Admin-only "Reactivate Campaign" button for completed campaigns (sets status to 'active')
- Toast notifications for status change actions
- React Query cache invalidation after status mutations

### Reusability Opportunities
- User status badge pattern from UsersPage can be adapted
- Existing mutation patterns in CampaignsPage for update/delete
- Existing role-based button visibility patterns
- shadcn/ui Select component for filter dropdown

### Scope Boundaries
**In Scope:**
- Add `status` field to frontend Campaign interface
- Add `status` to UpdateCampaignData interface 
- Add status column with badge to CampaignsPage table
- Add status filter dropdown to CampaignsPage
- Add status badge to CampaignDetailPage header
- Add End Campaign button (admin only, active campaigns)
- Add Reactivate Campaign button (admin only, completed campaigns)
- Update `requirements/01-base-requirements.md`
- Update `agent-os/product/roadmap.md` if appropriate

**Out of Scope:**
- "Paused" status functionality (future enhancement)
- Changing campaign status during create/edit modal
- Bulk status changes for multiple campaigns
- Status history/audit log
- Backend changes (status already exists)

### Technical Considerations
- Backend already supports status field - verify GET returns it
- Backend already supports PUT /campaigns/:id for updates
- Use `campaignsApi.update(id, { status: 'completed' })` pattern
- Use `queryClient.invalidateQueries(['campaigns'])` after mutations
- Check user role via `user?.role === 'admin'` pattern from existing code
- Use `StopCircle` icon for End Campaign button (already imported)
- Use `RefreshCcw` icon for Reactivate button (already imported)
