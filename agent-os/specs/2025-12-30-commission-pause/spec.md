# Specification: Commission Pause Feature

## Goal

Allow administrators to temporarily suspend commission calculations for a specific sales person by setting a pause date, without impacting order creation, visibility, or user access. When paused, orders still record the original commission but display RM0.00 to the user.

## User Stories

- As an **administrator**, I want to pause a sales person's commission so that orders created during the pause period don't count toward their payout (e.g., while they're on leave).
- As a **sales person**, I want to see a clear indicator when my commission is paused so that I understand why my earnings show RM0.00.

## Specific Requirements

**Data Model: User**
- Add `commissionPausedDate: DateTime?` field to the User model
- `null` means commission is active (not paused)
- A date value means commission is paused starting from that date
- Only applicable to `sales` role users

**Data Model: Order**
- Add `commissionPaused: Boolean @default(false)` field to the Order model
- Set at order creation time based on the sales person's pause status
- This flag is IMMUTABLE after creation (unpausing user doesn't change existing orders)

**Backend: Order Creation Logic**
- When creating an order, check if `salesPerson.commissionPausedDate` is set and <= current date
- If paused: calculate `commissionAmount` normally, but set `commissionPaused = true`
- If not paused: calculate normally with `commissionPaused = false`
- Include `commissionPaused` in all order API responses

**Backend: User Update API**
- Extend existing `userService.update()` to handle `commissionPausedDate`
- To pause: set `commissionPausedDate` to desired date
- To unpause: set `commissionPausedDate` to `null`
- Validate: cannot set pause date in the past (only today or future)

**Frontend: User Edit Drawer**
- Add "Commission Pause" section in the edit drawer (only for sales role)
- Use Switch component to toggle pause on/off
- When toggling on, show date input defaulting to today
- Display current pause status and date if already paused

**Frontend: Pause Status Banner**
- Show Alert banner on Dashboard (for sales person viewing their own)
- Show pause indicator in UsersPage table and edit drawer (for admin)
- Banner text: "Commission Paused since [date]"
- Use existing Alert component from shadcn/ui

**Frontend: Display Commission as RM0.00**
- In PayoutsPage, OrdersPage, and CampaignDetailPage order tables
- Check `order.commissionPaused` flag; if `true`, display RM0.00
- Show tooltip explaining commission is paused for this order

## Visual Design

No visual assets provided.

## Existing Code to Leverage

**User status toggle in UsersPage.tsx (lines 489-501)**
- Reuse the Switch + label pattern for pause toggle
- Follow the same styling with border-y border-border separator
- Mirror the "Active Status" toggle UI structure

**orderService.create() in orderService.ts (lines 121-182)**
- This is where commission snapshot logic lives
- Add pause check after getting campaign.salesPerson
- Set `commissionPaused` flag in the order.create() data object

**Alert component (src/components/ui/alert.tsx)**
- Use for pause status banner with `variant="default"` or add a new "warning" variant
- Compose with AlertTitle and AlertDescription

**userService.update() in userService.ts (lines 134-200)**
- Extend to handle `commissionPausedDate` in UpdateUserData interface
- Add validation for pause date (cannot be in past)

## Out of Scope

- Leaderboard commission display during pause (deferred)
- Pause history or audit trail
- Scheduled auto-resume with end date
- Multiple overlapping pause periods
- Backdating pause start date to before today
- Recalculating or modifying past orders when pausing/unpausing
- Analytics page commission adjustments during pause
- Mobile-specific UI optimizations
- Email or notification when pause is activated
- Bulk pause/unpause multiple users
