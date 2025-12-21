# Campaign Status Implementation - Agent Prompt

## Task Overview

Implement the **Campaign Status** feature that was accidentally removed during a frontend refactor. This involves:
1. Verifying backend API support (should already exist)
2. Updating frontend to display and filter by campaign status
3. Adding End Campaign / Reactivate Campaign functionality
4. Updating documentation

---

## Global Context

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + Prisma + MongoDB
- **State Management**: React Query (@tanstack/react-query)
- **Notifications**: Sonner toasts (already configured)

### Project Structure
```
sales-hub/
├── src/                    # Frontend React app
│   ├── pages/
│   │   ├── CampaignsPage.tsx       # Campaigns list page (NEEDS UPDATE)
│   │   └── CampaignDetailPage.tsx  # Campaign detail (NEEDS UPDATE)
│   ├── lib/
│   │   └── api.ts                  # API client (check Campaign type)
│   └── components/
├── backend/                # Backend API
│   ├── src/
│   │   └── routes/campaigns.ts     # Campaign routes
│   └── prisma/
│       └── schema.prisma           # Database schema
├── requirements/
│   └── 01-base-requirements.md     # UPDATE THIS
└── agent-os/product/
    └── roadmap.md                  # UPDATE IF NEEDED
```

### Servers Running
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`

---

## What Already Exists

### Backend Prisma Schema (backend/prisma/schema.prisma)
The Campaign model already has a `status` field:
```prisma
model Campaign {
  id            String         @id @default(auto()) @map("_id") @db.ObjectId
  title         String
  platform      Platform
  type          CampaignType
  url           String
  salesPersonId String         @db.ObjectId
  status        CampaignStatus @default(active)  // <-- ALREADY EXISTS
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  ...
}

enum CampaignStatus {
  active
  paused
  completed
}
```

### Backend API (backend/src/routes/campaigns.ts)
The campaign endpoints likely already support status. Verify:
- GET `/api/campaigns` returns `status` field
- PUT `/api/campaigns/:id` accepts `status` updates

### Frontend API Types (src/lib/api.ts)
The Campaign interface should have `status` - verify and add if missing:
```typescript
export interface Campaign {
  id: string;
  title: string;
  socialMedia: 'facebook' | 'instagram';
  type: 'post' | 'live' | 'event';
  url: string;
  salesPersonId: string;
  salesPerson?: User;
  status: 'active' | 'paused' | 'completed';  // <-- ADD IF MISSING
  createdAt: string;
  updatedAt: string;
}
```

---

## Implementation Tasks

### Task 1: Verify Backend API Support
1. Check `backend/src/routes/campaigns.ts` returns status
2. Test with: `GET http://localhost:3000/api/campaigns`
3. Verify campaigns have `status` field in response

### Task 2: Update Frontend API Types
File: `src/lib/api.ts`
- Ensure `Campaign` interface includes `status: 'active' | 'paused' | 'completed'`
- Ensure `campaignsApi.update()` can send status changes

### Task 3: Update CampaignsPage.tsx
File: `src/pages/CampaignsPage.tsx`

**Add Status Filter:**
```tsx
// Add state
const [filterStatus, setFilterStatus] = useState('');

// Add to filter logic
if (filterStatus && campaign.status !== filterStatus) return false;

// Add UI dropdown in filters section
<select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
  <option value="">All Status</option>
  <option value="active">Active</option>
  <option value="completed">Completed</option>
</select>
```

**Add Status Column to Table:**
- Add `<th>Status</th>` header
- Add status badge cell:
```tsx
<td className="table-cell">
  <span className={campaign.status === 'active' ? 'badge-active' : 'badge-completed'}>
    {campaign.status}
  </span>
</td>
```

### Task 4: Update CampaignDetailPage.tsx
File: `src/pages/CampaignDetailPage.tsx`

**Add Status Badge in Header:**
Display current status next to campaign title

**Add End Campaign Button (for active campaigns):**
- Only show for admin
- Only show when status === 'active'
- On click: call `campaignsApi.update(id, { status: 'completed' })`
- Show confirmation toast

**Add Reactivate Campaign Button (for completed campaigns):**
- Only show for admin
- Only show when status === 'completed'
- On click: call `campaignsApi.update(id, { status: 'active' })`
- Show confirmation toast

### Task 5: Update Documentation

**Update `requirements/01-base-requirements.md`:**
Add status field to Campaign data model if missing:
```markdown
| status | enum | `active`, `paused`, or `completed`, default: `active` |
```

**Update `agent-os/product/roadmap.md`:**
Add note about campaign status feature if appropriate.

---

## UI/UX Guidelines

### Status Badges
Use existing badge styles (check `src/index.css`):
- Active: Green badge (`badge-active`)
- Completed: Gray badge (`badge-inactive` or similar)

### Button Styling
- **End Campaign**: Destructive style (red outline button)
- **Reactivate Campaign**: Primary style (blue button)

### Toast Messages
Use Sonner:
```tsx
toast.success('Campaign ended successfully');
toast.success('Campaign reactivated');
```

---

## Acceptance Criteria

- [ ] CampaignsPage shows status column with colored badges
- [ ] CampaignsPage has status filter dropdown
- [ ] CampaignDetailPage shows current status
- [ ] Admin can end an active campaign
- [ ] Admin can reactivate a completed campaign
- [ ] All actions show appropriate toast notifications
- [ ] `npm run build` passes without errors
- [ ] Documentation updated

---

## Testing

1. Login as admin (admin / admin123)
2. Go to Campaigns page - verify status column shows
3. Filter by status - verify filtering works
4. Click a campaign to view details
5. End an active campaign - verify status changes
6. Reactivate a completed campaign - verify status changes back
7. Login as sales person - verify they cannot see end/reactivate buttons

---

## Notes

- The backend Prisma schema already has `CampaignStatus` enum with: active, paused, completed
- Focus on `active` and `completed` for now (paused can be future enhancement)
- Do NOT change any unrelated frontend logic
- Use React Query `invalidateQueries` after mutations to refresh data
