# Spec Requirements: UI Bug Fixes & Polish

## Initial Description
11 bug fixes and polish enhancements across CampaignDetailPage, OrdersPage, and CampaignsPage.

## Requirements Discussion

### Questions
No clarifying questions needed - all requirements are explicitly defined by user.

### Existing Code to Reference

**Similar Features Identified:**
- Feature: Order detail modal - Path: `src/pages/OrdersPage.tsx`
  - Modal with view/edit mode, scrollable content
- Feature: Delete with undo - Path: `src/pages/OrdersPage.tsx`
  - `deleteOrder` function removes from state with undo toast
- Feature: Campaign filters - Path: `src/pages/CampaignsPage.tsx`
  - Filter panel with dropdowns

## Visual Assets

### Files Provided:
No visual assets provided.

## Requirements Summary

### Functional Requirements

**Requirement 1: Hide Actions Header for Salesperson in CampaignDetailPage**
- Remove the "Actions" header entirely when user is not admin
- Currently shows "Actions" but icons are hidden - header should also hide

**Requirement 2: Default Sort on Order/Campaign Creation**
- After creating new order, reset to default sort (latest first)
- New item appears at top of table
- Add campaign sort functionality to OrdersPage

**Requirement 3: Minimum 1 Product Validation**
- Validate at least 1 product exists before saving order
- Show error toast/message when 0 products
- Apply to both create and edit flows

**Requirement 4: Fix Pen Icon in CampaignDetailPage**
- Pen icon currently doesn't work
- Make it open order detail modal in edit mode like OrdersPage

**Requirement 5: Scrollable Product List in Add Order Modal**
- Add max-height and overflow-y: auto to product list
- Allow scrolling when many products added

**Requirement 6: Change URL Field to Text Field**
- In CampaignsPage create modal, change input type from "url" to "text"
- Removes browser URL validation

**Requirement 7: Fit All 5 Filters in One Row**
- Adjust CampaignsPage filter layout to fit all 5 filters horizontally
- Prevents wrapping to 2 rows - more aesthetic

**Requirement 8: Remove Pen Icon from OrdersPage Modal Header**
- Remove Edit2 icon from modal header in OrdersPage
- Users will use inline pen icon in table row instead

**Requirement 9: Align CampaignDetailPage Orders Table with OrdersPage**
- Change Products column to show item count like OrdersPage
- Make pen icon open modal in edit mode
- Add order detail modal (same as OrdersPage)

**Requirement 10: Remove Row on Delete (Not Just Strike-through)**
- Hard delete removes row entirely from table
- Already implemented via deleteOrder - verify it works

**Requirement 11: Campaign Delete with Cascade**
- Add delete button/icon to CampaignsPage
- Deleting campaign deletes all related orders
- Commission deducted accordingly
- Add undo functionality

### Scope Boundaries

**In Scope:**
- All 11 requirements above
- Frontend-only changes
- Existing patterns reuse

**Out of Scope:**
- Backend changes
- New API endpoints
- Database changes

### Technical Considerations
- Reuse existing modal patterns from OrdersPage
- Reuse deleteOrder pattern for delete with undo
- Use existing Sonner toast for errors
- Use CSS flex to fit filters in one row
