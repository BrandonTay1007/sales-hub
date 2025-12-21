# Spec Initialization: Auto-Generated IDs for Orders and Campaigns

## Date Created
2025-12-21

## Raw Description
User's exact description:
1. Create a new automatic generated id for orders that are not editable. Update all orders related display to add this which includes OrdersPage.tsx, OrderDetailsDialog.tsx, OrderForm.tsx, CampaignDetailPage.tsx, Dashboard.tsx and the rest of the place you found
2. Create a new automatic generated id for campaign. Update at all the place.
3. Integrate 1 and 2 with backend. Ensure all the CRUD is updated

## Initial Context
This feature will add human-readable, auto-generated IDs for orders and campaigns. Currently, both Orders and Campaigns only have MongoDB ObjectIds which are long, hard to remember, and not user-friendly. The new IDs would be:
- Easy to reference in conversations and support
- Non-editable after creation (similar to salesPersonId immutability)
- Displayed in all relevant UI locations

## Planning Status

- [x] Phase 1: Initialize Spec
- [x] Phase 2: Shape Spec (requirements gathered)
- [x] Phase 3: Write Spec
- [x] Phase 4: Create Tasks
- [ ] Phase 5: Implementation (pending approval)

## Artifacts Created
- [requirements.md](./requirements.md) - Detailed requirements from user discussion
- [../spec.md](../spec.md) - Technical specification
- [../tasks.md](../tasks.md) - Implementation task breakdown

## Key Decisions

### ID Formats
- **Campaign**: `{PLATFORM}-{SEQUENCE}` → e.g., `FB-001`, `IG-002`
  - Platform: `FB` for Facebook, `IG` for Instagram
  - Sequence: 3-digit, globally sequential per platform
- **Order**: `{CAMPAIGN_REF}-{SEQUENCE}` → e.g., `FB-001-01`, `IG-002-03`
  - Campaign Ref: Parent campaign's referenceId
  - Sequence: 2-digit, sequential per campaign

### Display
- Column label: "Ref"
- Column position: First column in all tables
- No copy-to-clipboard functionality

### Backend
- Field name: `referenceId`
- New Counter model for atomic sequence generation

### Bug Fix Included
- Breadcrumb component fix (was showing MongoDB ObjectId)
