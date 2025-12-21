# Analytics Page Enhancement - Parallel Agent Prompt

## OBJECTIVE
Add a new Leaderboard page at `/analytics/leaderboard` with a toggle to switch between Sales Person and Campaign views. Update the "See More" button in AnalyticsPage to navigate to this new page instead of opening a modal.

---

## CRITICAL RULES
1. **DO NOT CHANGE ANY EXISTING UI/UX** except as specified below
2. Use existing design patterns and component styles from the codebase
3. Use Sonner toasts for notifications
4. Follow existing routing patterns in App.tsx

---

## REQUIREMENTS

### 1. New LeaderboardPage Component

**Location:** `src/pages/LeaderboardPage.tsx`

**Features:**
- Toggle switch at the top to switch between "Sales Persons" and "Campaigns" view
- Default view: Sales Persons

**Sales Person View (existing design - copy from modal):**
- Rank badge (gold #1, silver #2, bronze #3, gray others)
- Avatar (initials from user.avatar)
- Name
- Order count + commission rate
- Total Revenue (RM)
- Commission earned (RM)
- Avg Order Value

**Campaign View (NEW):**
Each row shows:
- Rank badge (same styling as Sales Person view)
- Campaign title
- Total Revenue (RM)
- Sales Person name (from campaign.assignedSalesPersonId → users lookup)
- Platform icon (Facebook = blue icon, Instagram = gradient icon)

**Campaign Row Click Behavior:**
- Click on a campaign row → `navigate('/campaigns/' + campaign.id)` to CampaignDetailPage

### 2. Update AnalyticsPage.tsx

**Change:**
- Remove the modal dialog for full leaderboard
- Update "See More" button to navigate to `/analytics/leaderboard`

```tsx
// BEFORE
onClick={() => setShowFullLeaderboard(true)}

// AFTER
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
onClick={() => navigate('/analytics/leaderboard')}
```

- Remove `showFullLeaderboard` state
- Remove `<Dialog>` component at the bottom

### 3. Update App.tsx

Add new route:
```tsx
<Route path="/analytics/leaderboard" element={<LeaderboardPage />} />
```

---

## DATA SOURCES (Currently using mockData)

### For Sales Person Leaderboard
Use existing `getLeaderboard()` function from mockData.ts:
```typescript
export const getLeaderboard = () => {
  const salesUsers = users.filter(u => u.role === 'sales');
  return salesUsers
    .map(user => {
      const userCampaigns = campaigns.filter(c => c.assignedSalesPersonId === user.id);
      const totalRevenue = userCampaigns.reduce((sum, c) => sum + getCampaignRevenue(c.id), 0);
      const totalCommission = userCampaigns.reduce((sum, c) => sum + getCampaignCommission(c.id), 0);
      const orderCount = userCampaigns.reduce((sum, c) => sum + getOrdersByCampaign(c.id).length, 0);
      return {
        ...user,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCommission: Math.round(totalCommission * 100) / 100,
        orderCount,
        avgOrderValue: orderCount > 0 ? Math.round((totalRevenue / orderCount) * 100) / 100 : 0,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);
};
```

### For Campaign Leaderboard
Create new function or use existing data:
```typescript
// New helper function needed in mockData.ts
export const getCampaignLeaderboard = () => {
  return campaigns
    .map(c => {
      const salesPerson = users.find(u => u.id === c.assignedSalesPersonId);
      return {
        id: c.id,
        title: c.title,
        revenue: getCampaignRevenue(c.id),
        platform: c.platform,
        salesPersonName: salesPerson?.name || 'Unknown',
        salesPersonAvatar: salesPerson?.avatar || '?',
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
};
```

---

## EXISTING CODE TO REFERENCE

### Current AnalyticsPage.tsx (full file)
```tsx
import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getLeaderboard, getRevenueByType, getTopProducts, getTopCampaigns, getCumulativeRevenue } from '@/lib/mockData';
import { Trophy, TrendingUp, Package, Target, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AnalyticsPage = () => {
  const leaderboard = getLeaderboard();
  const revenueByType = getRevenueByType();
  const topProducts = getTopProducts();
  const topCampaigns = getTopCampaigns(5);
  const cumulativeRevenue = getCumulativeRevenue();
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  const currentMonthRevenue = cumulativeRevenue[11]?.revenue || 0;
  const projectedNextMonth = Math.round(currentMonthRevenue * 1.15 * 100) / 100;

  // Show only top 5 in main view
  const displayLeaderboard = leaderboard.slice(0, 5);

  // ... rest of component (see full file at src/pages/AnalyticsPage.tsx)
};
```

### Leaderboard Row Design (copy from modal)
```tsx
<div key={person.id} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30">
  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
    index === 0 ? 'bg-warning text-warning-foreground' :
    index === 1 ? 'bg-muted text-muted-foreground' :
    index === 2 ? 'bg-orange-600 text-white' : 'bg-secondary text-secondary-foreground'
  }`}>
    {index + 1}
  </div>
  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
    {person.avatar}
  </div>
  <div className="flex-1">
    <p className="font-medium text-foreground">{person.name}</p>
    <p className="text-sm text-muted-foreground">
      {person.orderCount} orders • {person.commissionRate}% rate
    </p>
  </div>
  <div className="text-right">
    <p className="font-semibold text-foreground">RM {person.totalRevenue.toLocaleString()}</p>
    <p className="text-sm text-success">+RM {person.totalCommission.toFixed(2)} commission</p>
  </div>
  <div className="text-right hidden sm:block">
    <p className="text-sm text-muted-foreground">Avg Order</p>
    <p className="font-medium text-foreground">RM {person.avgOrderValue.toFixed(2)}</p>
  </div>
</div>
```

### Platform Icons (from CampaignsPage.tsx)
```tsx
import { Facebook, Instagram } from 'lucide-react';

const getPlatformIcon = (platform: string) => {
  return platform === 'facebook' ? (
    <Facebook className="w-4 h-4 text-[#1877F2]" />
  ) : (
    <Instagram className="w-4 h-4 text-[#E4405F]" />
  );
};
```

---

## FILES TO MODIFY

1. **CREATE** `src/pages/LeaderboardPage.tsx`
2. **MODIFY** `src/pages/AnalyticsPage.tsx` - Remove modal, update "See More" to navigate
3. **MODIFY** `src/lib/mockData.ts` - Add `getCampaignLeaderboard()` function
4. **MODIFY** `src/App.tsx` - Add route for `/analytics/leaderboard`

---

## TOGGLE COMPONENT SUGGESTION

Use a simple toggle with these styles:
```tsx
<div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
  <button
    onClick={() => setView('salesPerson')}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      view === 'salesPerson' 
        ? 'bg-primary text-primary-foreground' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    Sales Persons
  </button>
  <button
    onClick={() => setView('campaign')}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
      view === 'campaign' 
        ? 'bg-primary text-primary-foreground' 
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    Campaigns
  </button>
</div>
```

---

## VERIFICATION

After implementation:
1. Run `npm run build` - should pass
2. Navigate to `/analytics` - "See More" should navigate to `/analytics/leaderboard`
3. On leaderboard page - toggle should switch views
4. Campaign rows should navigate to campaign detail page when clicked
5. Styling should match existing design system

---

## PROJECT STRUCTURE CONTEXT

```
sales-hub/
├── src/
│   ├── pages/
│   │   ├── AnalyticsPage.tsx      # Modify: remove modal, navigate instead
│   │   ├── LeaderboardPage.tsx    # CREATE NEW
│   │   ├── CampaignDetailPage.tsx # Target for campaign click navigation
│   │   └── ...
│   ├── lib/
│   │   └── mockData.ts            # Add getCampaignLeaderboard()
│   ├── components/
│   │   └── DashboardLayout.tsx    # Use this for page layout
│   └── App.tsx                    # Add route
```
