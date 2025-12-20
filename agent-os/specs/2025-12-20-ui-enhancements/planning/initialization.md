# Raw Idea: UI Enhancements

## User's Original Description

1. In CampaignDetailPage.tsx, add who is the sales person

2. Sales person is not able to edit the campaign also, there is a setting button in sales person CampaignDetailPage.tsx

3. In the PayoutsPage for sales person, instead of clicking the name of the campaign to move to campaign/id (CampaignDetailPage), add a "see more" button to replace it. Also add the products on the order details.

4. In the PayoutsPage for admin, for each campaign breakdown for sales person, when clicking each campaign box will redirect them to campaign/id (CampaignDetailPage.tsx).

5. CampaignDetailPage.tsx, we have 2 ways to get into this page:
   1. campaigns → select campaign
   2. payouts → select campaign
   When back button is clicked, make it go back to where it came from.

6. When admin is logged in, in CampaignDetailPage.tsx and OrdersPage.tsx, add a pen icon at each row for them to edit the orders and also a bin icon for them to delete the order. Implement an undo function to prevent wrong deletion. Hard delete the order instead of soft delete. Only admin is able to see that icon.
