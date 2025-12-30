# Commission Pause Feature - Initial Description

## Raw User Requirements

Allow administrators to temporarily suspend commission calculations for a specific sales person without impacting order creation, visibility, reporting, or user access.

### Typical Scenarios

- Sales person is on leave (e.g., for 1 week)
- Sales person is under performance review or investigation

### Key Requirements

#### During the Pause Period
- Orders can still be created for the sales person (by the sales person or by administrators).
- All orders must remain fully visible in reports and dashboards.
- Commission amount must be RM0.00 for any order where the relevant date (order date or the date used for commission eligibility as per current rules) falls within the paused period.
- Orders must appear in all standard reports with normal sales data, but commission shown as RM0.00 for the paused period.
- The sales person can log in, view their own orders, sales data, and dashboard without any restrictions.
- Administrators can create, edit, or manage orders for the paused sales person without restrictions.

#### Pause Management
- Only administrators can initiate a pause or resume (unpause) a sales person.
- When initiating a pause, the admin must set a start date and may optionally set an end date. If no end date is provided, the pause remains active until manually resumed.
- Only administrators can resume (unpause) a sales person, ending the pause immediately.
- Both administrators and the sales person must be able to view the current pause status, including start date and end date (if set).
- Editing pause dates is allowed only for future dates and must not trigger any backdating or recalculation of past commissions.

#### Commission Calculation Rules
- Based on current implementation. Suggest a way better than my way below or if my way is good enough then use it.
- Please calculate the commission first and store it in database, but check the order date is created during the paused period or not. If yes dont display and calculate the commission when displaying. It should be 0 but the order can still be viewed and edited.

#### User Interface & Visibility
- The sales person's dashboard or profile page must clearly display the pause status (e.g., a banner, status indicator, or section showing "Commission Paused" with the relevant dates).
- The sales person must see commission as RM0.00 for orders during the paused period when viewing their own data.
- Administrators must see the same pause status indicator when viewing or managing the sales person.

#### Constraints & Non-Requirements
- Pause/resume actions must be manual (admin-initiated only); no automatic triggers.
- Only one active pause period per sales person at a time (no overlapping pauses).
- Pause start date cannot be set in the past if it would alter already-calculated commissions.
- No impact on other incentives, bonuses, or non-commission metrics.
- No requirement for audit trail or history of past pauses unless already supported by existing audit features.
- No backdating or automatic recalculation of commissions is required or allowed.

## Date Initiated

2025-12-30
