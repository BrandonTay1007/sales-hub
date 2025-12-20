# Tasks: UI Polish Features + Campaign Filtering

## Implementation

### Group 1: Orders Page Edit & Delete
- [x] Add `handleEditClick` function to open modal in edit mode (Done)
- [x] Add Actions column header (Admin only) (Done)
- [x] Add Edit2 icon in Actions column for active orders (Done)
- [x] Replace `cancelOrder` with `deleteOrder` function
- [x] Implement undo toast with 5s duration

### Group 2: Campaign Edit Modal Consistency
- [x] Create `CampaignEditModal.tsx` in `/components`
- [x] Define `CampaignFormData` interface
- [x] Add read-only Sales Person field with "Cannot be changed"
- [x] Update CampaignsPage to use shared component
- [x] Update CampaignDetailPage to use shared component
- [x] Remove inline edit modal code from both pages

### Group 3: Delete with Undo (CampaignDetailPage)
- [x] Replace `cancelOrder` with `deleteOrder` in CampaignDetailPage
- [x] Add undo toast matching OrdersPage pattern

### Group 4: Smart Back Navigation
- [x] Add `handleGoBack` function with history check
- [x] Update back button to use `handleGoBack`

### Group 5: Code Standards
- [x] Add Code Reusability Rules to `components.md`

### Group 6: Campaign Filtering
- [x] Add filter state variables to CampaignsPage
  - `filterSalesPerson`, `filterPlatform`, `filterStatus`
  - `filterDateFrom`, `filterDateTo`
  - `quickFilter: 'all' | 'week' | 'month'`
- [x] Create `filteredCampaigns` with `useMemo`
- [x] Add quick filter toggle buttons (All Time, This Week, This Month)
- [x] Add filter panel with grid layout
  - Sales Person dropdown (Admin only)
  - Platform dropdown (Facebook/Instagram)
  - Status dropdown (Active/Paused/Completed)
  - Date range inputs
- [x] Add `hasFilters` check and `clearFilters` function
- [x] Show filter count in table header ("{n} campaigns")

---

## Verification
- [ ] Build passes with no TypeScript errors
- [ ] All filters implemented
- [ ] Quick filters work
- [ ] Clear all resets all filter state
- [ ] Role-based visibility works (Admin sees Sales Person filter)
