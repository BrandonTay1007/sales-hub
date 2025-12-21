# Specification: Refine Payouts Page Interaction

## Goal
Improve the user experience on the Payouts Page by making the entire campaign card clickable for expansion and restructuring the expanded view to show a clear summary before detailed orders.

## User Stories
- As a Sales Person, I want to click anywhere on a campaign card to expand it so that I don't have to hunt for a specific "click here" text.
- As a Sales Person, I want to see a high-level summary of my campaign performance immediately upon expanding so that I can get a quick overview before diving into specific orders.

## Specific Requirements

**Interactive Card Container**
- The entire `dashboard-card` container must be clickable to toggle expansion.
- Remove the specific text-only click triggers.
- Navigation links and other buttons inside the card must use `stopPropagation` to prevent toggling expansion when clicked.

**Expanded View Structure**
- The expanded view must display a Summary Section at the top.
- The Summary Section must include: Total Sales, Total Commission, and Average Commission Rate.
- The Order Details table must be displayed *below* the Summary Section.

**Visual Hierarchy**
- Use a grid layout for the Summary Section (e.g., 3 columns).
- Use distinct styling (e.g., muted background) for the summary block to separate it from the order table.
- Ensure smooth transitions/animations when expanding.

## Visual Design
No visual assets provided.

## Existing Code to Leverage

**`src/pages/PayoutsPage.tsx`**
- Reuse the existing `campaignBreakdown` mapping logic.
- Reuse the existing `dashboard-card` styling classes.
- Reuse the existing calculation logic for `totalSales`, `totalCommission`, and `avgRate`.

## Out of Scope
- Backend API changes.
- Changes to the Payouts Page for Admin users (Team Payouts).
- Modifications to the calculation logic itself (only display changes).
