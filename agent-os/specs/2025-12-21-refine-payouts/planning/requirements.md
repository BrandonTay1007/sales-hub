# Spec Requirements: Refine Payouts Page Interaction

## Initial Description

1. Refine when clicking into campaign breakdown in @[sales-hub/src/pages/PayoutsPage.tsx] into summary of the campaign. Then see details for more orders
2. Please ensure clicking the whole box allow expand, currently my first instict is to click the word Click to see order details. But its not expanding, Only clikcing the blank area above there is working

## Requirements Discussion

### First Round Questions

**Q1:** What should the "Summary of the campaign" include?
**Answer:** It should likely include the high-level stats currently visible (Commission, Sales, Orders count, Avg Rate) but perhaps laid out more clearly or providing additional context if available. The user specified "summary ... then see details". This implies a visual hierarchy: Summary Section -> Order Details Section.

**Q2:** How should the expand interaction work?
**Answer:** The entire card container (`dashboard-card`) should be the interactive trigger for expansion/collapse. This fixes the reported issue where clicking the text didn't work.

**Q3:** What constitutes "details for more orders"?
**Answer:** The existing table of orders within the campaign. It should be presented below the summary.

### Existing Code to Reference

**Similar Features Identified:**
- `src/pages/PayoutsPage.tsx` - Current implementation of `campaignBreakdown` mapping.
- `dashboard-card` class usage.

## Visual Assets

No visual assets provided.

## Requirements Summary

### Functional Requirements
- Make the entire Campaign Breakdown card clickable to toggle expansion.
- When expanded, display a clear "Summary" section at the top.
- Below the Summary, display the "Order Details" table.
- Eliminate the specific strictly-clickable zones; the whole container triggers the action.

### UI Components Needed
- Refactored `CampaignBreakdownItem` (inline or separated) within `PayoutsPage`.
- Structure:
    - **Header/Collapsed State**: Info row (Title, Order count, Commission).
    - **Expanded State**:
        - **Summary Section**: Detailed view of totals (Sales, Commission, Avg Rate).
        - **Orders Section**: Table of orders (existing).

### Scope Boundaries

**In Scope:**
- `src/pages/PayoutsPage.tsx` UI changes.
- CSS/Layout adjustments for the campaign card.

**Out of Scope:**
- Backend API changes.
- Changes to other pages.

### Technical Considerations
- Move the `onClick` handler to the outer `div`.
- Ensure buttons inside the card (like "See Details") call `e.stopPropagation()` so they don't toggle the card while navigating.
