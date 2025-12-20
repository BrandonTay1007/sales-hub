# Specification: UI Bug Fixes & Polish

## Goal
Fix 11 UI bugs and polish issues across CampaignDetailPage, OrdersPage, and CampaignsPage to improve consistency and user experience.

## User Stories
- As an admin, I want consistent edit/delete functionality across all pages so the experience is intuitive
- As a user, I want newly created items to appear at the top of the table so I can verify they were added
- As a user, I want scrollable modals so I can add many products without UI breaks

## Specific Requirements

**1. Hide Actions Header for Salesperson**
- In CampaignDetailPage, wrap Actions `<th>` with `{isAdmin && ...}`
- Currently only icons are hidden, header should also hide
- Update colSpan for empty state accordingly

**2. Default Sort After Create in CampaignsPage and OrdersPage**
- Reset sortBy state to default after creating order and campagin
- Sort campaigns array by createdAt descending
- Sort orders array by createdAt descending
- Ensure new items appear at top

**3. Minimum 1 Product Validation**
- Before form submit, check `products.filter(p => p.name).length >= 1`
- Show toast.error if validation fails
- Apply to both add and edit order flows
- Prevent modal close on validation failure

**4. Fix Pen Icon in CampaignDetailPage**
- Add `viewingOrder` and `isEditMode` state
- Add onClick to Edit2 icon: `setViewingOrder(order); setIsEditMode(true)`
- Add order detail dialog with edit capability
- Same with the dialog with edit capability in OrdersPage

**5. Scrollable Product List in Modal**
- Add `max-h-60 overflow-y-auto` to product list container
- Keep Add Product button visible outside scroll area

**6. Change URL to Text Field**
- Change `type="url"` to `type="text"` in campaign form
- Removes native browser URL validation

**7. Fit Filters in One Row**
- Change filter container from `flex-wrap` to `flex-nowrap`
- Reduce filter widths or use `flex-1` for equal distribution
- Add `min-w-0` to prevent overflow
- Consider `gap-2` instead of `gap-4`

**8. Remove Pen Icon from Modal Header**
- Remove Edit2 icon button from DialogTitle in OrdersPage
- Keep edit functionality via inline table icons only

**9. Align CampaignDetailPage with OrdersPage**
- Change products display from full list to `{products.length} items`
- Copy order detail modal from OrdersPage
- Wire up Edit2 icon to open modal in edit mode
- Add `handleRowClick` for viewing order

**10. Delete Removes Row (Already Implemented)**
- Verify `deleteOrder` removes from state (not soft delete)
- Row should disappear immediately on delete
- Test in both OrdersPage and CampaignDetailPage

**11. Campaign Delete with Cascade**
- Add Trash2 icon to campaign cards
- Create `deleteCampaign` function
- Filter out orders with matching campaignId
- Recalculate commissions
- Add 5-second undo toast with restore

## Visual Design
No mockups provided. Following existing UI patterns from the codebase.

## Existing Code to Leverage

**Order Detail Modal (OrdersPage.tsx)**
- Complete modal with view/edit modes
- Product display and editing
- Save/cancel functionality

**Delete with Undo (OrdersPage.tsx)**
- `deleteOrder` function pattern
- Sonner toast with action callback
- State restoration on undo

**Filter Panel (CampaignsPage.tsx)**
- Flex container with filter dropdowns
- Clear filters functionality

## Out of Scope
- Backend API changes
- Database schema modifications
- New API endpoints
- Soft delete functionality (using hard delete)
- Authentication changes
