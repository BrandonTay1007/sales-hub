# Task Breakdown: Campaign Commission Display

## Overview
Total Tasks: 8

## Task List

### Frontend Components

#### Task Group 1: UI Implementation
**Dependencies:** None

- [ ] 1.0 Complete UI Implementation
  - [ ] 1.1 Write 2-4 focused tests for Commission Display
    - Test `getCampaignCommission` calculation logic
    - Test that Commission column renders in the table
    - Test that values are formatted correctly (RM prefix, decimals)
  - [ ] 1.2 Implement `getCampaignCommission` helper
    - Filter orders by campaignId
    - Sum commissionAmount
  - [ ] 1.3 Update Campaigns Table Headers
    - Add "Commission" header after Revenue
  - [ ] 1.4 Update Campaigns Table Body
    - Call helper for each row
    - Render new cell with formatting
  - [ ] 1.5 Update Loading & Empty States
    - Add Skeleton cell
    - Increase colSpan for empty row
  - [ ] 1.6 Ensure UI tests pass
    - Run ONLY the tests written in 1.1 checks
    - Verify column appears and values are correct

**Acceptance Criteria:**
- Tests pass
- Commission column is visible
- Values match the sum of orders
- Layout is consistent with Revenue column

### Testing

#### Task Group 2: Verification
**Dependencies:** Task Group 1

- [ ] 2.0 Feature Verification
  - [ ] 2.1 Verify with Admin User
    - Login as Admin
    - Check various campaigns
    - Cross-reference with Orders list
  - [ ] 2.2 Verify with Sales User
    - Login as Sales Person
    - Verify they see commission for their campaigns
  - [ ] 2.3 Verify Mobile Responsiveness
    - Check table layout on smaller screens (ensure no breaking)

**Acceptance Criteria:**
- Verified correct values for both roles
- No visual regressions
