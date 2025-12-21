# Features and Logic

This document provides a detailed look at the core business logic and features that power the Pebble Sales Hub.

---

## Commission Snapshot Logic

The most critical business rule in the system is the **Commission Snapshot**. This ensures that sales persons are paid accurately based on their agreed-upon rate at the time of the sale, regardless of any future changes to their profile.

### How it works:
1.  **Creation**: When a new order is registered, the system looks up the sales person's current `commissionRate`.
2.  **Snapshot**: This rate is saved directly onto the order record as `snapshotRate`.
3.  **Calculation**: The `commissionAmount` is calculated as `orderTotal * (snapshotRate / 100)`.
4.  **Immutability**: Once an order is created, the `snapshotRate` can never be changed.
5.  **Updates**: If products are added or removed from an order later, the `commissionAmount` is recalculated using the **original** `snapshotRate`.

### Why we do this:
This protects both the business and the sales person. If a sales person's rate is lowered next month, their earnings from this month remain protected. Conversely, if it's raised, it doesn't retroactively increase the business's payout obligations for past sales.

---

## Leaderboard Calculation

The leaderboard provides real-time performance rankings to motivate the team and provide administrators with a quick view of top performers.

### Ranking Criteria:
*   **Total Revenue**: Rankings are primarily based on the sum of `orderTotal` for all active orders within the selected time range.
*   **Time Ranges**:
    *   **This Month**: Orders created from the 1st of the current month to today.
    *   **YTD (Year to Date)**: All orders created since January 1st of the current year.
    *   **All Time**: Every active order ever recorded in the system.

### View Modes:
*   **Sales Persons**: Aggregates data by individual users.
*   **Campaigns**: Aggregates data by specific campaigns, showing which marketing efforts are generating the most value.

---

## Human-Readable IDs

To keep operations professional and organized, the system automatically generates unique, human-readable reference IDs for every campaign and order.

### Format:
*   **Campaigns**: `[Platform Prefix]-[3-Digit sequence]`
    *   Example: `FB-001` (First Facebook campaign), `IG-005` (Fifth Instagram campaign).
*   **Orders**: `[Campaign Reference ID]-[2-Digit sequence]`
    *   Example: `FB-001-01` (First order for campaign FB-001), `FB-001-12` (12th order for campaign FB-001).

---

## Role-Based Access Control (RBAC)

The system enforces strict boundaries between Administrators and Sales Personnel to protect sensitive data and maintain operational integrity.

### Administrator
*   **Full Visibility**: Can view all users, campaigns, and orders across the entire team.
*   **Management**: Can create/edit/deactivate users and manage global settings.
*   **Team Oversight**: Access to consolidated team payout reports and all analytics.

### Sales Person
*   **Privacy**: Can only see campaigns and orders that are specifically assigned to them.
*   **Self-Management**: Access to personal payout reports and their own performance stats on the leaderboard.
*   **Restricted Actions**: Cannot manage other users or campaigns assigned to colleagues.

---

## Data Integrity

*   **5-Second Undo**: Destructive actions like deleting an order or campaign trigger a toast notification with an "Undo" button, available for 5 seconds to prevent accidental data loss.
*   **Last Admin Protection**: The system prevents the deactivation or deletion of the last remaining Admin user to ensure the platform always has at least one person with full access.
