# Specification: UI Polish Features + Campaign Filtering

## Goal
Polish frontend components for better UX, code reusability, and business rule enforcement, plus add comprehensive filtering to the CampaignsPage.

## User Stories
- As an Admin, I want to edit orders directly from the table so that I can quickly make corrections
- As an Admin, I want to filter campaigns by sales person, platform, and status so that I can find specific campaigns faster
- As a user, I want the back button to return me to my previous page so that navigation feels natural

## Specific Requirements

**Orders Page Edit & Delete**
- Add Actions column after Status with Edit2 icon
- Icon visible only for Admins on active orders
- Clicking icon opens modal in edit mode (`setIsEditMode(true)`)
- Replace Cancel with Delete (removes from state, not status change)
- Show undo toast with 5-second duration

**Campaign Edit Modal Consistency**
- Extract `CampaignEditModal` as shared component in `/components`
- Props: `campaign`, `open`, `onOpenChange`, `onSave`, `onEndCampaign`
- Sales Person field rendered as read-only div
- Text "Cannot be changed" displayed
- Use in both CampaignsPage and CampaignDetailPage

**Smart Back Navigation**
- Replace `navigate('/campaigns')` with `handleGoBack` function
- Use `navigate(-1)` if `window.history.length > 1`
- Fallback to `/campaigns` if opened directly

**Campaign Filtering**
- Add filter state: `filterSalesPerson`, `filterPlatform`, `filterStatus`, `filterDateFrom`, `filterDateTo`
- Add `quickFilter` state: 'all' | 'week' | 'month'
- Add `useMemo` for `filteredCampaigns` matching OrdersPage pattern
- Add filter UI panel with dropdowns and date inputs
- Add quick filter toggle buttons
- Add "Clear all" button when `hasFilters` is true
- Show count: "{n} campaigns" in table header

## Existing Code to Leverage

**OrdersPage.tsx Filtering Pattern**
- `useMemo` for filtered/sorted results
- Filter state with `useState` for each filter field
- Quick filter toggles with conditional styling
- 4-column grid layout for filter dropdowns
- `hasFilters` check and `clearFilters` function

**CampaignEditModal (NEW)**
- Uses Dialog from shadcn/ui
- Form with controlled inputs
- Read-only sales person display pattern already in CampaignDetailPage

**Toast with Undo**
- Sonner toast with `action` prop for undo callback
- Duration of 5000ms for delete, 8000ms was used for cancel

## Out of Scope
- Backend API integration
- Text search filtering
- Saved filter presets
- Export filtered results
- Pagination
