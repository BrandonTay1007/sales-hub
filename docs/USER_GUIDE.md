# How to use?

[Admins](#admins)
  [Dashboard](#dashboard)
  [Campaign](#campaign)
  [Users](#users)
  [Orders](#orders)
  [Payouts](#payouts)
  [Analytics](#analytics-leaderboard)

[Sales Person](#sales-person)
  [Dashboard](#dashboard-1)
  [Campaign](#campaign-1)
  [Orders](#orders-1)
  [Payouts](#payouts-1)
  [Analytics](#analytics-1)

---

## Admins

### Dashboard

![Dashboard Screenshot](c:/Users/taywe/.gemini/antigravity/brain/3c9b0379-e688-4f84-b539-bdcc5f230333/uploaded_image_1766295145219.png)

- **Global Metrics Cards**: Real-time snapshot of the current month's performance.
    - **Total Revenue**: Sum of all order totals for the current month.
    - **Commissions Owed**: Total outstanding liability to sales staff for the current month.
    - **Active Campaigns**: Count of campaigns currently running (Status: 'Active').
    - **Top Performer**: Highlights the #1 sales person by revenue, showing their name and total sales.
- **Quick Actions**:
    - **Quick Payout Overview**: A clickable card showing total commissions owed, linking directly to the Team Payouts page for processing.
- **Visual Analytics**:
    - **Daily Sales (Last 7 Days)**: Bar chart visualizing sales trends to identify peak days.
    - **Revenue by Platform**: Donut chart comparing performance between Facebook vs. Instagram.
- **Recent Activity Feed**: A chronological list of the latest orders placed by the team, useful for spotting activity in real-time.

### Campaign

![Placeholder: Campaign Management Page]

- **Campaign Hub**: Centralized management for all marketing initiatives.
- **Create Campaign**:
    - **Fields**: Title, Platform (Select: Facebook/Instagram), Type (Select: Post/Live/Event), Campaign URL.
    - **Assignment**: Assign a specific Sales Person to own the campaign (they will receive commissions for orders linked to it).
    - **Scheduling**: Optional Start and End dates.
- **Campaign Detail View** (Click any campaign to view):
    - **Order Management Tab**: View, Add, Edit, or Delete orders specific to this campaign.
    - **Performance Tab**: View aggregated stats like Total Revenue, Items Sold, and Average Order Value.
    - **Status Control**:
        - **End Campaign**: Mark an active campaign as 'Completed' (automatically sets End Date to now).
        - **Reactivate**: Re-open a completed campaign to allow new orders.
    - **Quick Links**: "View Campaign" link opens the actual social media URL in a new tab.

### Users

![Placeholder: User Management Page]

- **Team Directory**: List of all staff members with sorting and filtering options.
- **User Management**:
    - **Create User**:
        - **Roles**: distinct access levels for **Admin** (Full Access) vs **Sales** (Restricted View).
        - **Commission Rate**: Slider/Input to set the default commission % for Sales users (0-100%).
    - **Edit User (Drawer)**:
        - **Update Details**: Change Name or Username.
        - **Reset Password**: Admin can manually set a new password.
        - **Update Commission**: Change the rate for future orders (does not affect past orders).
    - **Deactivation**:
        - Toggle user status to **Inactive**.
        - Prevents login access immediately.
        - Preserves all historical data (orders, payouts) for reporting.

### Orders

![Placeholder: Order Management Page]

- **Order Ledger**: Comprehensive table of all sales transactions.
- **Add Order (Manual Entry)**:
    - **Context**: Select the Campaign (automatically pulls the assigned Sales Person and their current Commission Rate).
    - **Products**: Dynamic form to add multiple line items (Product Name, Quantity, Price).
    - **Calculations**: Auto-calculates Order Total and Estimated Commission.
- **Safety Features**:
    - **Snapshot Commission**: Stores the commission rate *at the time of order creation*, ensuring rate changes don't affect past payouts.
    - **Undo Delete**: 5-second "Undo" toast notification after deleting an order to prevent accidental data loss.
- **Filters**: Filter ledger by Campaign, Sales Person, or Date Range.

### Payouts

![Placeholder: Team Payouts Page]

- **Team Commission View**: Aggregated view for payroll processing.
- **Period Selector**: Dropdowns for Year and Month to view historical payout data.
- **Summary Cards**:
    - **Total Team Sales**: Gross revenue for the selected period.
    - **Total Commission Payout**: Net liability to be paid out.
- **Agent Breakdown Table**:
    - **Rows**: Each active sales person with their Total Earned for the month and YTD (Year-to-Date).
    - **Expandable Details**: Click an agent's row to reveal a nested table showing exactly which campaigns contributed to their total, broken down by Campaign Title and Commission Amount.

### Analytics Leaderboard

![Placeholder: Admin Analytics Page]

- **Performance Insights**:
    - **Leaderboard Toggle**: Switch view between **Top Sales Persons** (Ranked by Revenue) and **Top Campaigns**.
    - **See More**: Expands the top 5 preview into a full ranked list of all agents/campaigns.
- **Forecasting**:
    - **Next Month Projection**: AI-driven estimate based on current month's growth rate (+15% logic).
- **Product Intelligence**:
    - **Top Selling Products**: Ranked list of best-selling items by revenue and quantity sold.
- **Strategies**:
    - **Revenue by Type**: Comparative analysis of different campaign types (e.g., Are 'Live' sessions generating more revenue than static 'Posts'?).

---

## Sales Person

### Dashboard

![Placeholder: Sales Person Dashboard]

- **Personal Metrics**:
    - **My Revenue**: Total sales generated by you this month.
    - **My Earnings**: Total commission earned by you this month.
    - **Commission Rate**: visual display of your current active percentage.
- **My Campaigns**: Quick count of your currently active campaigns.
- **Personal Feed**: List of your most recent orders only.

### Campaign

![Placeholder: My Campaigns List]

- **Assignment View**:
    - Filters the global campaign list to show **only** campaigns assigned to you.
    - **Status Indicators**: Clear badges for 'Active' vs 'Completed'.
- **Performance Tracking**:
    - View Total Revenue generated per campaign to track your own success.
    - Access 'View Campaign' links to quickly check your social posts.
- *Note: Sales Persons have read-only access and cannot Modify or Delete campaigns.*

### Orders

![Placeholder: My Orders List]

- **My Sales Ledger**:
    - Filtered view showing only orders linked to your assigned campaigns.
- **Order Details**:
    - Click any order to view the full receipt: Date, Products, Quantity, and specific Commission earned.
- **Transparency**:
    - View the "Snapshot Rate" to verify you were paid the correct percentage for each specific order.

### Payouts

![Placeholder: My Payouts Page]

- **Personal Commission Tracker**:
    - **Monthly Earnings**: Big, bold display of confirmed earnings for the selected month.
    - **Target Progress**: Visual ring chart showing progress towards monthly sales targets (if set).
- **Source Breakdown**:
    - List of your campaigns and how much commission each one contributed to your paycheck.
- **Dispute Resolution**:
    - **Dispute Button**: Built-in tool to flag a discrepancy. Opens a form to submit a reason/message to the Admin for review.

### Analytics

![Placeholder: Sales Analytics View]

- **Self-Assessment**:
    - **Global Rank**: See where you stand in the team leaderboard.
    - **Growth Chart**: Line chart showing your personal cumulative revenue (YTD) to track consistency.
    - **Top Products**: Insights into which products are selling best in *your* campaigns, helping you decide what to promote next.
