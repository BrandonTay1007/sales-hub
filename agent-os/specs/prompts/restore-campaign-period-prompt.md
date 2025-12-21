# Restore Campaign Period - Parallel Agent Prompt

## OBJECTIVE
Restore campaign period functionality (startDate, endDate, status) to both backend and frontend. This was previously removed and needs to be re-added.

---

## CRITICAL RULES
1. **GLOBAL**: Ask for clarification if anything is unclear - do not make assumptions
2. **Server Check**: Before starting implementation, verify both servers are running:
   - Frontend: localhost:8080 (`npm run dev` in sales-hub/)
   - Backend: localhost:3000 (`npm run dev` in sales-hub/backend/)
3. Use Sonner toasts for all notifications
4. Always include 5-second undo for destructive actions

---

## REQUIREMENTS

### 1. Backend: Update Prisma Schema

**File:** `backend/prisma/schema.prisma`

Add these fields to the Campaign model:
```prisma
model Campaign {
  // ... existing fields
  startDate   DateTime?
  endDate     DateTime?
  status      String    @default("active") // 'active' | 'completed'
}
```

Then run:
```bash
cd backend
npx prisma db push
npx prisma generate
```

### 2. Backend: Update Campaign Controller

**File:** `backend/src/controllers/campaignController.ts`

- Accept `startDate`, `endDate`, `status` in create/update
- Include these fields in responses
- `status` defaults to 'active' on create
- When `status` changes to 'completed', auto-set `endDate` to current date if not provided

### 3. Backend: Update Campaign Service

**File:** `backend/src/services/campaignService.ts`

- Handle startDate/endDate parsing (ISO strings)
- Validate status is 'active' or 'completed'

### 4. Frontend: Update API Types

**File:** `src/lib/api.ts`

Update Campaign type:
```typescript
export interface Campaign {
  id: string;
  title: string;
  socialMedia: 'facebook' | 'instagram';
  type: 'post' | 'live' | 'event';
  url: string;
  salesPersonId: string;
  createdAt: string;
  startDate?: string;  // ADD
  endDate?: string;    // ADD
  status: 'active' | 'completed';  // ADD
  salesPerson?: User;
}
```

### 5. Frontend: Update CampaignsPage.tsx

**File:** `src/pages/CampaignsPage.tsx`

Add back:
1. **Status filter** in filters section:
```tsx
<div className="w-full sm:w-auto flex-1 min-w-0">
  <label className="form-label">Status</label>
  <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
    className="form-select"
  >
    <option value="">All Status</option>
    <option value="active">Active</option>
    <option value="completed">Completed</option>
  </select>
</div>
```

2. **Status column** in table:
```tsx
<th className="table-header">Status</th>
// ...
<td className="table-cell">
  <span className={campaign.status === 'active' ? 'badge-active' : 'badge-inactive'}>
    {campaign.status}
  </span>
</td>
```

3. **Period column** in table:
```tsx
<th className="table-header">Period</th>
// ...
<td className="table-cell text-sm text-muted-foreground">
  {campaign.startDate ? (
    <span>
      {campaign.startDate.split('T')[0]}
      {campaign.endDate ? ` - ${campaign.endDate.split('T')[0]}` : ' - ongoing'}
    </span>
  ) : '-'}
</td>
```

4. **Start Date field** in create/edit modal:
```tsx
<div>
  <label className="form-label">Start Date</label>
  <input
    type="date"
    name="startDate"
    defaultValue={editingCampaign?.startDate?.split('T')[0] || ''}
    className="form-input"
  />
</div>
```

### 6. Frontend: Update CampaignDetailPage.tsx

**File:** `src/pages/CampaignDetailPage.tsx`

Add back:
1. **End Campaign button** (for active campaigns):
```tsx
{campaign.status === 'active' && (
  <button
    onClick={handleEndCampaign}
    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
  >
    <StopCircle className="w-4 h-4" />
    End Campaign Now
  </button>
)}
```

2. **Reactivate button** (for completed campaigns):
```tsx
{campaign.status === 'completed' && (
  <button
    onClick={handleReactivateCampaign}
    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
  >
    <RefreshCcw className="w-4 h-4" />
    Reactivate Campaign
  </button>
)}
```

3. **handleEndCampaign function**:
```tsx
const handleEndCampaign = async () => {
  if (!confirm('Are you sure you want to end this campaign?')) return;
  try {
    await campaignsApi.update(campaign.id, { 
      status: 'completed',
      endDate: new Date().toISOString()
    });
    queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    toast.success('Campaign ended!');
  } catch (error) {
    toast.error('Failed to end campaign');
  }
};
```

4. **handleReactivateCampaign function**:
```tsx
const handleReactivateCampaign = async () => {
  if (!confirm('Are you sure you want to reactivate this campaign?')) return;
  try {
    await campaignsApi.update(campaign.id, { 
      status: 'active',
      endDate: null
    });
    queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    toast.success('Campaign reactivated!');
  } catch (error) {
    toast.error('Failed to reactivate campaign');
  }
};
```

5. **Start Date field** in settings modal

6. **Status display** somewhere in the UI

### 7. Frontend: Update CampaignFormData

Update the form data interface to include new fields:
```typescript
interface CampaignFormData {
  title: string;
  socialMedia: 'facebook' | 'instagram';
  type: 'post' | 'live' | 'event';
  url: string;
  salesPersonId: string;
  startDate?: string;  // ADD
}
```

---

## IMPORTS TO ADD

**CampaignDetailPage.tsx:**
```tsx
import { StopCircle, RefreshCcw } from 'lucide-react';
```

---

## FILES TO MODIFY

### Backend:
1. `backend/prisma/schema.prisma` - Add startDate, endDate, status fields
2. `backend/src/controllers/campaignController.ts` - Accept/return new fields
3. `backend/src/services/campaignService.ts` - Handle new fields

### Frontend:
1. `src/lib/api.ts` - Update Campaign type
2. `src/pages/CampaignsPage.tsx` - Add status filter, status column, period column, start date in modal
3. `src/pages/CampaignDetailPage.tsx` - Add end/reactivate buttons, status display, start date in settings

---

## VERIFICATION

After implementation:
1. Run `npm run build` in frontend - should pass
2. Create a new campaign with start date
3. View campaign - should show start date
4. End campaign - status should change to 'completed', endDate should be set
5. Reactivate campaign - status should change to 'active', endDate should be cleared
6. Filter by status in CampaignsPage - should work

---

## TECH STACK REFERENCE

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, React Query, Sonner toasts
- Backend: Node.js, Express, Prisma, MongoDB
- Servers: Frontend at localhost:8080, Backend at localhost:3000
