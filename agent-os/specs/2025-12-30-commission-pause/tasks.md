# Task Breakdown: Commission Pause Feature

## Overview
Total Tasks: 19

## Task List

### Database Layer

#### Task Group 1: Schema Updates
**Dependencies:** None

- [x] 1.0 Complete database schema changes
  - [x] 1.1 Write 3 focused tests for commission pause data model
    - Test User model accepts `commissionPausedDate` field
    - Test Order model accepts `commissionPaused` boolean field
    - Test order creation with pause flag set correctly
  - [x] 1.2 Update User model in `prisma/schema.prisma`
    - Add `commissionPausedDate DateTime?` field
    - Add comment: `// null = active, date = paused since that date`
  - [x] 1.3 Update Order model in `prisma/schema.prisma`
    - Add `commissionPaused Boolean @default(false)` field
    - Add comment: `// Set at creation based on sales person pause status`
  - [ ] 1.4 Run `npx prisma generate` and `npx prisma db push`
    - Verify schema changes applied to MongoDB
    - Check Prisma client types are generated
  - [ ] 1.5 Ensure database layer tests pass
    - Run only the 3 tests from 1.1

**Acceptance Criteria:**
- User model has `commissionPausedDate` field
- Order model has `commissionPaused` field
- Prisma client regenerated successfully
- Tests pass

---

### API Layer

#### Task Group 2: Backend User Pause API
**Dependencies:** Task Group 1

- [x] 2.0 Complete user pause API functionality
  - [x] 2.1 Write 3 focused tests for user pause API
    - Test pause user sets `commissionPausedDate`
    - Test unpause user clears `commissionPausedDate` to null
    - Test validation rejects past date for pause
  - [x] 2.2 Update `UpdateUserData` interface in `userService.ts`
    - Add `commissionPausedDate?: string | null` field
  - [x] 2.3 Extend `userService.update()` logic
    - Handle `commissionPausedDate` in update data
    - Add validation: pause date cannot be in the past
    - Clear to null for unpause action
  - [x] 2.4 Update User type in `api.ts` frontend
    - Add `commissionPausedDate?: string | null`
  - [ ] 2.5 Ensure user pause API tests pass
    - Run only the 3 tests from 2.1

**Acceptance Criteria:**
- User can be paused with a date
- User can be unpaused (date set to null)
- Past dates are rejected with validation error
- API returns updated user with pause date

---

#### Task Group 3: Backend Order Creation Logic
**Dependencies:** Task Group 2

- [x] 3.0 Complete order creation pause logic
  - [x] 3.1 Write 3 focused tests for order pause flag
    - Test order created for paused user has `commissionPaused = true`
    - Test order created for non-paused user has `commissionPaused = false`
    - Test `commissionAmount` is still calculated normally even when paused
  - [x] 3.2 Update `orderService.create()` in `orderService.ts`
    - After fetching campaign.salesPerson, check `commissionPausedDate`
    - Add logic: if paused date is set and <= today, set `commissionPaused = true`
    - Include `commissionPaused` in order.create() data
  - [x] 3.3 Update Order type in `api.ts` frontend
    - Add `commissionPaused: boolean` field
  - [ ] 3.4 Ensure order creation tests pass
    - Run only the 3 tests from 3.1

**Acceptance Criteria:**
- Orders for paused users have `commissionPaused = true`
- Orders for active users have `commissionPaused = false`
- Commission is calculated normally regardless of pause status
- Order API responses include `commissionPaused` field

---

### Frontend Components

#### Task Group 4: User Edit Drawer Pause UI
**Dependencies:** Task Groups 2-3

- [x] 4.0 Complete pause toggle in User edit drawer
  - [x] 4.1 Add pause toggle section in `UsersPage.tsx` edit drawer
    - Add section below "Active Status" toggle (lines 489-501 pattern)
    - Only visible for `sales` role users
    - Use Switch component with label "Commission Pause"
  - [x] 4.2 Add date input for pause start date
    - Show only when pause toggle is enabled
    - Default to today's date
    - Use same date input style as OrderForm.tsx
  - [x] 4.3 Handle pause state in `editingUser` state
    - Add `commissionPausedDate` to edit state
    - Update mutation to include pause date
  - [x] 4.4 Show current pause status if already paused
    - Display "Paused since [date]" text when editing paused user

**Acceptance Criteria:**
- Pause toggle visible for sales users only
- Date picker shows when toggling on
- Pause state saves correctly via API
- Current pause status displays when editing

---

#### Task Group 5: Pause Status Banners
**Dependencies:** Task Group 4

- [x] 5.0 Complete pause status banners
  - [x] 5.1 Add pause banner in Dashboard.tsx
    - Show Alert component at top of dashboard for sales users
    - Only visible if `user.commissionPausedDate` is set
    - Text: "Commission Paused since [formatted date]"
    - Use AlertTitle and AlertDescription
  - [ ] 5.2 Add pause indicator in UsersPage.tsx table
    - Add visual indicator in status column or as tooltip
    - Show pause icon or text when user is paused
  - [ ] 5.3 Show pause status in User edit drawer header
    - Add banner/badge at top of drawer when editing paused user

**Acceptance Criteria:**
- Sales person sees pause banner on their dashboard
- Admins see pause indicator in Users table
- Pause status visible when editing user

---

#### Task Group 6: Display RM0.00 for Paused Orders
**Dependencies:** Task Group 3

- [x] 6.0 Complete commission display logic
  - [x] 6.1 Update commission display in OrdersPage.tsx
    - Check `order.commissionPaused` flag
    - If true, display "RM0.00" instead of actual commission
    - Add tooltip: "Commission paused for this order"
  - [ ] 6.2 Update commission display in PayoutsPage.tsx
    - Apply same logic for commission column
    - Ensure totals calculation excludes paused order commissions
  - [ ] 6.3 Update commission display in CampaignDetailPage.tsx
    - Apply same logic in orders table
  - [ ] 6.4 Update commission display in TeamPayoutsPage.tsx
    - Apply same logic for team payout view

**Acceptance Criteria:**
- Paused orders show RM0.00 commission
- Tooltip explains why commission is zero
- Payout totals exclude paused order commissions

---

### Testing

#### Task Group 7: Test Review & Integration
**Dependencies:** Task Groups 1-6

- [ ] 7.0 Review and verify all tests pass
  - [ ] 7.1 Review tests from Task Groups 1-3
    - Verify 9 backend tests pass (3 per group)
  - [ ] 7.2 Manual integration test
    - Create a sales user, pause them
    - Create an order → verify `commissionPaused = true`
    - Check Dashboard shows pause banner
    - Check payouts show RM0.00 for paused orders
    - Unpause user → new orders should have `commissionPaused = false`
  - [ ] 7.3 Update seed data (optional)
    - Add one paused user scenario for testing

**Acceptance Criteria:**
- All 9 backend tests pass
- Manual integration test confirms end-to-end flow
- Feature works as specified

---

## Execution Order

Recommended implementation sequence:
1. **Database Layer** (Task Group 1) - Schema changes first
2. **API Layer: User Pause** (Task Group 2) - Enable pause/unpause
3. **API Layer: Order Creation** (Task Group 3) - Set pause flag on orders
4. **Frontend: Edit Drawer** (Task Group 4) - Admin can pause users
5. **Frontend: Banners** (Task Group 5) - Status visibility
6. **Frontend: Display Logic** (Task Group 6) - Show RM0.00
7. **Testing** (Task Group 7) - Verify everything works

---

## Files to Modify

| File | Changes |
|------|---------|
| `backend/prisma/schema.prisma` | Add fields to User and Order models |
| `backend/src/services/userService.ts` | Handle commissionPausedDate in update |
| `backend/src/services/orderService.ts` | Check pause status, set flag on create |
| `src/lib/api.ts` | Update User and Order types |
| `src/features/users/UsersPage.tsx` | Add pause toggle in edit drawer |
| `src/features/dashboard/Dashboard.tsx` | Add pause banner for sales |
| `src/features/orders/OrdersPage.tsx` | Display RM0.00 for paused orders |
| `src/features/orders/PayoutsPage.tsx` | Display RM0.00, update totals |
| `src/features/orders/TeamPayoutsPage.tsx` | Display RM0.00 for team view |
| `src/features/campaigns/CampaignDetailPage.tsx` | Display RM0.00 in orders table |
