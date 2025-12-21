# Requirements: Campaign Commission Display

## 1. UI Changes

### Campaigns Table
Add a new column "Total Comm." (or "Commission") to the right of the "Revenue" column.

**Display Format**:
- Currency format: `RM 123.45`
- Alignment: Right-aligned (numeric)
- Font weight: Semibold (similar to Revenue)

## 2. Business Logic

### Calculation
- Use the existing `orders` array which is fetched in `CampaignsPage`.
- Filter orders by `campaignId`.
- Sum up `order.commissionAmount`.

**Formula**:
```typescript
const getCampaignCommission = (campaignId: string) => {
  return orders
    .filter(o => o.campaignId === campaignId)
    .reduce((sum, o) => sum + o.commissionAmount, 0);
};
```

## 3. Access Control
- **Admin**: Sees commission for all campaigns.
- **Sales Person**: Sees commission for their assigned campaigns (logic handles this automatically as they only see their own campaigns/orders).
