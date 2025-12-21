# Spec Requirements: Campaign Management Improvements

## Initial Description
1. Remove orderstatus in both CampaignDetailPage.tsx and OrdersPage.tsx
2. Create validation for the period when creating/editing campaign in CampaignsPage.tsx and CampaignDetailPage.tsx
3. For the campaign period, remove the scheduled end date. The period will be XXX - on going for active campaign. and after the admin triggers the end campaign with the end campaign button, the period will be XXX to current date. Ensure this update reflects on all campaign related pages.
4. Add a reactivate campaign button to reactivate campaign. Ensure this update reflects on all campaign related pages.
5. Bug fix: Add product validation for adding/editing orders in CampaignDetailPage.tsx (similar to OrdersPage.tsx)

## Requirements Discussion

### First Round Questions

**Q1:** Remove Order Status - I found that orders have `status: 'active' | 'cancelled'` in the data model. Should I completely remove this field from the UI only, or also update mockData.ts?
**Answer:** Also update mockData too - delete the status entirely.

**Q2:** Campaign Period Validation - What validation do you want for the campaign period?
**Answer:** Start date is required and can be in the past. It is not required - default will be current date. Add date to orders too.

**Q3:** Campaign Period Display - For the "XXX - ongoing" format, is "Dec 1, 2025 - Ongoing" / "Dec 1, 2025 - Dec 20, 2025" the format you want?
**Answer:** Correct.

**Q4:** Reactivate Campaign Button - Should this appear only for completed campaigns? When reactivated, should it go back to active with original start date and cleared end date? Should there be a confirmation dialog?
**Answer:** 
- Yes, only for completed ones
- Yes go back to active status with its original start date, and the end date cleared  
- Yes there will be a confirmation dialog
- Update in both CampaignDetailPage.tsx and CampaignsPage.tsx

**Q5:** What about `paused` campaigns?
**Answer:** No paused - only end.

**Q6:** Anything to explicitly exclude?
**Answer:** Touch everything that is related, don't update only one place. Update every place that is related.

### Existing Code to Reference
- `OrdersPage.tsx` - handleSubmit function (line 111-139) has existing product validation pattern
- `CampaignEditModal.tsx` - existing campaign edit modal component with onEndCampaign prop

### Follow-up Questions
None needed - requirements are clear.

## Visual Assets
No visual assets provided.

## Requirements Summary

### Functional Requirements
1. **Remove Order Status Field**:
   - Remove `status` property from Order interface in mockData.ts
   - Remove status column from order tables in OrdersPage.tsx and CampaignDetailPage.tsx
   - Remove status filter in OrdersPage.tsx
   - Update all status-related conditional logic throughout codebase

2. **Campaign Period Changes**:
   - Remove end date field from campaign create/edit forms
   - Campaign status simplified to: `'active' | 'completed'` (remove 'paused')
   - Active campaigns display: "Dec 1, 2025 - Ongoing"
   - Completed campaigns display: "Dec 1, 2025 - Dec 20, 2025" (end date = when ended)
   - Start date: optional, defaults to current date
   - Update period display on all campaign-related pages

3. **End Campaign Functionality**:
   - End Campaign button sets status to 'completed'
   - End Campaign automatically sets endDate to current date
   - Keep existing button in CampaignDetailPage.tsx and CampaignsPage.tsx

4. **Reactivate Campaign**:
   - Add Reactivate button (only visible for 'completed' campaigns)
   - Reactivation sets status back to 'active'
   - Reactivation clears endDate (back to null/undefined)
   - Keeps original startDate
   - Requires confirmation dialog
   - Add to both CampaignDetailPage.tsx and CampaignsPage.tsx (modal)

5. **Bug Fix - Product Validation**:
   - Add validation in CampaignDetailPage.tsx handleAddOrder to require at least 1 product
   - Match behavior of OrdersPage.tsx handleSubmit

### Scope Boundaries

**In Scope:**
- mockData.ts - Remove Order status, update Campaign status type
- OrdersPage.tsx - Remove status column, status filter, status-related logic
- CampaignDetailPage.tsx - Remove status column, add reactivate, add product validation
- CampaignsPage.tsx - Add reactivate, update period display
- CampaignEditModal.tsx - Remove end date field, add reactivate button if applicable
- PayoutsPage.tsx / TeamPayoutsPage.tsx - Update any status-related filtering logic
- Any other files referencing order.status or campaign.paused

**Out of Scope:**
- Backend API changes (frontend mock data only)
- New pages or major UI redesign

### Technical Considerations
- Campaign type changes: `status: 'active' | 'paused' | 'completed'` → `status: 'active' | 'completed'`
- Order type changes: Remove `status: 'active' | 'cancelled'` property entirely
- Payout calculations filter by order existence (no longer by status)
- Confirmation dialog should use existing toast or create alert dialog pattern
