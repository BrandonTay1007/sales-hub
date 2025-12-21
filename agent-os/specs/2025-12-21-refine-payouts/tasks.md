# Task Breakdown: Refine Payouts Page Interaction

## Overview
Total Tasks: 8

## Task List

### Frontend Components

#### Task Group 1: UI Refactoring
**Dependencies:** None

- [x] 1.0 Complete UI Refactoring
  - [x] 1.1 Write 2-8 focused tests for Campaign Card expansion
    - Limit to 2 tests: check expand on card click, check stop propagation on link click
  - [x] 1.2 Update Campaign Card Structure
    - Move `onClick` to outer `dashboard-card` div
    - Implements `stopPropagation` for internal interactive elements (links, buttons)
  - [x] 1.3 Implement Summary Stats Section
    - Create grid layout for Total Sales, Commission, Avg Rate
    - Place above the order table in the expanded view
  - [x] 1.4 Refine Expanded View Styling
    - Add muted background to summary stats
    - Ensure smooth transition animation
  - [x] 1.5 Ensure UI component tests pass
    - Run ONLY the tests from 1.1

**Acceptance Criteria:**
- Clicking anywhere on the card toggles expansion
- Clicking specific links inside the card does NOT toggle expansion
- Summary stats appear above the table when expanded
- Visual hierarchy is clear with correct styling

### Testing

#### Task Group 2: Verification
**Dependencies:** Task Group 1

- [ ] 2.0 Review and Gap Analysis
  - [ ] 2.1 Review tests from Task Group 1 (approx 2 tests)
  - [ ] 2.2 Manual verification of interactions
    - Verify click zones
    - Verify data presentation in summary
    - Verify responsive behavior

**Acceptance Criteria:**
- All interactions work as expected
- No regression in existing functionality
- Data displayed matches the previous implementation values
