# Feature: User Deactivation Logic

## Raw Idea from User

1. After a sales person is deactivated, it should not be displayed when assigning sales person to a campaign.

2. When deactivating an admin, always check if its the last admin or not. If yes, don't deactivate that, show error saying that one admin left only, please add another admin before deactivating last admin (which in this case will be himself).
