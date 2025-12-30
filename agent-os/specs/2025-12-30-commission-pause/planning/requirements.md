# Spec Requirements: Commission Pause Feature

## Initial Description

Allow administrators to temporarily suspend commission calculations for a specific sales person without impacting order creation, visibility, reporting, or user access.

**Typical scenarios:**
- Sales person is on leave (e.g., for 1 week)
- Sales person is under performance review or investigation

## Requirements Discussion

### First Round Questions

**Q1:** Commission Calculation Storage - Your suggestion is to calculate and store commission in the database, then show RM0.00 at display time if the order falls within a pause period. Alternative: Store both `commissionAmount` (calculated as normal) and add a `commissionPaused` boolean flag on the order.
**Answer:** Option B - Store original commission + add a flag.

**Q2:** Pause Data Model - Add pause fields directly to the User model (e.g., `commissionPausedFrom`, `commissionPausedUntil`) or separate collection?
**Answer:** One `commissionPausedDate` field is good enough. It won't be scheduled - it will be triggered manually.

**Q3:** Order Date vs Created Date - When checking if an order falls within a pause period, which date to use?
**Answer:** Option B - The `createdAt` timestamp (when the order was recorded in the system).

**Q4:** Pause UI Location - Where should the "Pause Commission" action be accessible from?
**Answer:** Option A - Only from the User edit modal/page.

**Q5:** Pause Banner Visibility - Should the "Commission Paused" banner be visible on all pages or just specific pages?
**Answer:** Option B - Only on their dashboard/profile and the Users management page.

**Q6:** Leaderboard Handling - During a pause, how should the sales person's commission in leaderboards show?
**Answer:** Don't implement this first (out of scope).

**Q7:** Is there anything explicitly OUT of scope beyond what was listed?
**Answer:** List out (see Out of Scope section below).

### Existing Code to Reference

**Similar Features Identified:**

| Feature | Path | Reuse For |
|---------|------|-----------|
| User status toggle (active/inactive) | `src/features/users/UsersPage.tsx` (lines 489-501) | Switch component pattern for pause toggle |
| Sheet/Drawer component | `src/components/ui/sheet.tsx` | User edit drawer pattern |
| Alert component | `src/components/ui/alert.tsx` | Pause status banner |
| Switch component | `src/components/ui/switch.tsx` | Toggle UI |
| User update service | `backend/src/services/userService.ts` | Backend update pattern with validation |
| Last admin protection | `backend/src/services/userService.ts` (lines 144-159) | Validation pattern |

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements

#### Data Model Changes
- Add `commissionPausedDate: DateTime?` field to User model (null = not paused)
- Add `commissionPaused: Boolean` flag to Order model (set at order creation time)

#### Commission Calculation Logic
1. When creating an order, check if the sales person's `commissionPausedDate` is set and in the past/present
2. If paused: calculate `commissionAmount` normally using snapshot rate, but set `commissionPaused = true`
3. Store both values - this preserves the original calculation
4. At display time: if `commissionPaused = true`, show RM0.00

#### Pause Management
- Admin can initiate pause from User edit drawer
- Pause sets `commissionPausedDate` to a date (start date only - no end date needed per user's simplification)
- Resume (unpause) clears `commissionPausedDate` to null
- Only manual trigger - no auto-expiry

#### UI Requirements
- Add pause toggle/button in User edit drawer (only visible for sales role users)
- Add date picker for pause start date
- Show "Commission Paused" banner on:
  - Sales person's own dashboard (top of page)
  - Users management page (in the user's row or edit drawer)
- Banner should show pause start date

### Reusability Opportunities

| Component | Reuse |
|-----------|-------|
| `Switch` from shadcn/ui | For pause toggle (like active status toggle) |
| `Alert` from shadcn/ui | For pause status banner |
| `userService.update()` pattern | For pause/unpause API logic |
| Date input pattern | From OrderForm.tsx date picker |

### Scope Boundaries

**In Scope:**
- Add `commissionPausedDate` to User model
- Add `commissionPaused` to Order model
- Backend: Pause/unpause endpoints on user update
- Backend: Order creation sets `commissionPaused` flag based on user's pause status
- Frontend: Pause toggle in User edit drawer
- Frontend: Pause banner on dashboard and Users page
- Frontend: Display RM0.00 for paused orders in payouts/order lists

**Out of Scope:**
- Leaderboard handling during pause (explicitly deferred)
- Pause history/audit trail
- Scheduled auto-resume (end date is not implemented)
- Multiple overlapping pause periods
- Backdating pause start date
- Recalculating past commissions
- Mobile-specific UI

### Technical Considerations

- **Order date check:** Use `createdAt` timestamp, not `orderDate`
- **Immutability:** Once an order's `commissionPaused` flag is set at creation, it should not change (even if user is later unpaused)
- **Display logic:** Frontend checks `commissionPaused` flag; if true, show RM0.00
- **API response:** Include `commissionPaused` in order responses
- **Existing tests:** Backend has integration tests in `backend/tests/integration/` - will need new tests for pause logic
