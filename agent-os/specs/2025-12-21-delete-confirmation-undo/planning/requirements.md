# Spec Requirements: Delete Confirmation Modal & Undo Toast

## Initial Description

1. Add a popup confirmation modal for deleting campaigns and orders instead of using the Chrome browser confirm dialog. Update all relevant pages.

2. Add undo toast after deleting campaigns and orders.

## Requirements Discussion

### First Round Questions

**Q1:** Should the undo toast use a 5-second window per user standards?
**Answer:** Yes (per user_global rules: "Provide 5-second undo window with toast action button")

**Q2:** Should this apply to all delete actions (campaigns, orders, users)?
**Answer:** Focus on campaigns and orders. Users already have a different flow.

**Q3:** Should we use the existing shadcn AlertDialog component?
**Answer:** Yes - alert-dialog.tsx already exists in ui components.

### Existing Code to Reference

**Similar Features Identified:**
- `src/components/ui/alert-dialog.tsx` - shadcn AlertDialog component already available
- `OrderEditModal.tsx` - Pattern for modal implementation
- Sonner toast library already in use for notifications

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements
- Replace browser `confirm()` dialogs with custom AlertDialog modal
- Add undo action button to delete toast notifications
- 5-second undo window before permanent deletion
- Support for both order and campaign deletion

### UI Components Needed
- `ConfirmDeleteDialog` - Reusable confirmation modal
- Undo toast pattern with action button

### Scope Boundaries

**In Scope:**
- Delete confirmation modal for orders
- Delete confirmation modal for campaigns
- Undo toast for order deletion
- Undo toast for campaign deletion
- Update OrdersPage, CampaignDetailPage, CampaignsPage

**Out of Scope:**
- User deletion (different flow)
- Other destructive actions

### Technical Considerations
- Use shadcn AlertDialog for modal
- Use Sonner toast with action button for undo
- Soft delete pattern: delay actual deletion by 5 seconds
- Cancel deletion if undo clicked within window
