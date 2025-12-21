# Spec Requirements: Auto-Generated IDs for Orders and Campaigns

## Initial Description
Create human-readable, auto-generated IDs for orders and campaigns that are not editable after creation. Update all order and campaign related displays to show these IDs. Integrate with backend to ensure all CRUD operations are updated.

## Requirements Discussion

### First Round Questions

**Q1:** Order ID Format: I assume a sequential prefix format like `ORD-001`, `ORD-002` (auto-incrementing). Is that correct, or would you prefer something like `ORD-2025-001` (year-prefixed) or a random alphanumeric like `ORD-K7X9`?
**Answer:** Order format would be based on campaign. `{campaign id}-01` (e.g., `FB-001-01` for the first order under campaign `FB-001`)

**Q2:** Campaign ID Format: I'm thinking a similar format like `CAM-001`, `CAM-002`. Should we use the same pattern as orders, or a different format?
**Answer:** Campaign ID format would be based on platform: `{platform}-001`. Platform prefixes: `FB` for Facebook, `IG` for Instagram.

**Q3:** Global vs Scoped Sequencing: Should the numbering be globally unique across the system, or scoped per month/year?
**Answer:** Global sequencing.

**Q4:** Column Position: I assume the auto-generated ID should be displayed as the first column in tables (before Date). Is that correct?
**Answer:** Yes

**Q5:** ID Label: Should the column header be called "Order ID" / "Campaign ID", or simply "ID", or something like "Ref #"?
**Answer:** "Ref" would be better

**Q6:** Copy to Clipboard: Should clicking the ID copy it to clipboard?
**Answer:** No

**Q7:** Database Field Name: I'm thinking of using `displayId` or `referenceId` as the field name. Which do you prefer?
**Answer:** `referenceId`

**Q8:** Is there anything that should be explicitly excluded from this feature?
**Answer:** List out some (to be determined during spec writing)

### Existing Code to Reference
No similar existing features identified for reference. Will search for patterns in:
- Auto-increment logic patterns
- Table column display patterns
- Backend service patterns for generating sequential IDs

### Follow-up Questions
None required.

## Visual Assets

### Files Provided:
User uploaded an image showing a bug: The breadcrumb navigation on CampaignDetailPage shows the MongoDB ObjectId (e.g., "Campaigns > 694787e1e45a8df7bba6b2f6") instead of a readable campaign reference ID.

### Visual Insights:
- Breadcrumb navigation needs to display campaign referenceId instead of MongoDB ObjectId
- This bug fix should be included as part of this spec

## Requirements Summary

### Functional Requirements

#### Campaign Reference ID
- Field: `referenceId` (immutable after creation)
- Format: `{PLATFORM_PREFIX}-{SEQUENCE}` where:
  - Platform prefix: `FB` (Facebook) or `IG` (Instagram)
  - Sequence: 3-digit zero-padded global counter (e.g., `001`, `002`)
- Examples: `FB-001`, `IG-002`, `FB-003`

#### Order Reference ID
- Field: `referenceId` (immutable after creation)
- Format: `{CAMPAIGN_REF}-{ORDER_SEQUENCE}` where:
  - Campaign ref: The parent campaign's referenceId
  - Order sequence: 2-digit zero-padded counter per campaign (e.g., `01`, `02`)
- Examples: `FB-001-01`, `FB-001-02`, `IG-002-01`

#### Display Requirements
- Column label: "Ref" (not "ID" or "Order ID")
- Column position: First column in all tables (before Date)
- No copy-to-clipboard functionality

#### Pages to Update (Frontend)
- `OrdersPage.tsx` - Add Ref column
- `OrderDetailsDialog.tsx` - Display Order Ref
- `OrderForm.tsx` - Display generated Ref (or indicate it will be auto-generated)
- `OrderEditModal.tsx` - Display Ref (read-only)
- `CampaignDetailPage.tsx` - Add Ref column to orders table, fix breadcrumb bug
- `CampaignsPage.tsx` - Add Ref column
- `Dashboard.tsx` - Update recent activity to include Ref if showing orders
- `PayoutsPage.tsx` - Add Ref column if orders displayed in details
- `TeamPayoutsPage.tsx` - Add Ref column if applicable
- `LeaderboardPage.tsx` - No change (summary view only)
- `AnalyticsPage.tsx` - No change (summary view only)

#### Bug Fix
- CampaignDetailPage breadcrumb should show campaign referenceId instead of MongoDB ObjectId

### Reusability Opportunities
- Backend counter service for generating sequential IDs
- Frontend table column pattern can be replicated across all tables

### Scope Boundaries

**In Scope:**
- Add `referenceId` field to Campaign model
- Add `referenceId` field to Order model
- Auto-generate referenceId on creation (backend)
- Make referenceId immutable (cannot be updated)
- Display Ref in all relevant tables and dialogs
- Fix breadcrumb navigation bug on CampaignDetailPage
- Update seed data to include referenceIds
- Update API types in frontend

**Out of Scope:**
- Copy-to-clipboard functionality
- Searchable/filterable by referenceId (future enhancement)
- Export reports with referenceId (future enhancement)
- Changing existing MongoDB ObjectId usage for relationships
- Analytics or leaderboard pages (summary views only)
- Custom ID format configuration

### Technical Considerations
- MongoDB does not have auto-increment, so we need a counter collection or sequence logic
- Must handle concurrent ID generation (race conditions)
- Seed data must be updated to use sequential referenceIds
- API responses must include referenceId in all campaign/order endpoints
- Frontend types (api.ts) must be updated to include referenceId
