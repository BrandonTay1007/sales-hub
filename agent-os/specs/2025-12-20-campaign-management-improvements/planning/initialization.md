# Campaign Management Improvements - Raw Idea

## User Description

1. Remove orderstatus in both CampaignDetailPage.tsx and OrdersPage.tsx
2. Create validation for the period when creating/editing campaign in CampaignsPage.tsx and CampaignDetailPage.tsx
3. For the campaign period, remove the scheduled end date. The period will be XXX - on going for active campaign. and after the admin triggers the end campaign with the end campaign button, the period will be XXX to current date. Ensure this update reflects on all campaign related pages.
4. Add a reactivate campaign button to reactivate campaign. Ensure this update reflects on all campaign related pages.

## Date Initialized

2025-12-20

## Files Referenced

- `src/pages/CampaignDetailPage.tsx`
- `src/pages/OrdersPage.tsx`
- `src/pages/CampaignsPage.tsx`

## Context

These changes are frontend-only improvements to the campaign management workflow. The goal is to simplify order display (no status column), change how campaign periods work (start date only, with "ongoing" or "ended" states), and add reactivation capability for ended campaigns.
