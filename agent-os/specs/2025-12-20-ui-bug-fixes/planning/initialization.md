# Raw Idea: UI Bug Fixes & Polish

## User's Original Description

1. Remove the actions header in CampaignDetailPage for sales person

2. When creating a new order/campaign in OrdersPage.tsx, make sure the table is sorted back into default which is latest first. So that the newly created one will be on top of the table. Also add a sort function for campaign.

3. There must be at least 1 Product for each order, show error when creating/editing an order to 0 products.

4. In CampaignDetailPage.tsx, the pen is not working. Please make it work like the one in OrdersPage.tsx.

5. The pop up modal for creating an order in OrdersPage.tsx. It can't scroll when the list is too long. Make it scrollable for the product.

6. When creating a campaign in CampaignsPage.tsx, change the url field to text field instead of url field.

7. In CampaignsPage.tsx, make the Filters box to fit all 5 at the same time. It's unaesthetic when there are 2 boxes.

8. Remove the pen icon in OrdersPage.tsx pop up modal. We will use the pen beside to modify is enough.

9. Change the products column in CampaignDetailPage.tsx to amount only, the one similar in OrdersPage.tsx. Also make the pen icon works like what it did in OrdersPage.tsx. Add the pop up modal to view more details like OrdersPage.tsx.

10. Delete the whole row after deleting an order in OrdersPage.tsx and CampaignDetailPage.tsx.

11. Add delete function for campaign in CampaignsPage.tsx, all the orders related to this campaign will be deleted too, add the commission from the sales person will be deducted too.
