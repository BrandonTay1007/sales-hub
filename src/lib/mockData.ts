// Mock Data for Pebble Sales Tracker

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'sales';
  commissionRate: number;
  status: 'active' | 'inactive';
  avatar?: string;
  rateHistory?: { date: string; rate: number }[];
}

export interface Campaign {
  id: string;
  title: string;
  platform: 'facebook' | 'instagram';
  type: 'post' | 'live';
  url: string;
  assignedSalesPersonId: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
}

export interface Order {
  id: string;
  campaignId: string;
  products: { name: string; qty: number; basePrice: number }[];
  orderTotal: number;
  snapshotRate: number;
  commissionAmount: number;
  createdAt: string;
  status: 'active' | 'cancelled';
}

export const users: User[] = [
  { 
    id: '1', 
    name: 'Admin User', 
    username: 'admin', 
    role: 'admin', 
    commissionRate: 0, 
    status: 'active',
    avatar: 'AU',
    rateHistory: []
  },
  { 
    id: '2', 
    name: 'Sarah Johnson', 
    username: 'sarah.j', 
    role: 'sales', 
    commissionRate: 10, 
    status: 'active',
    avatar: 'SJ',
    rateHistory: [
      { date: '2025-01-01', rate: 8 },
      { date: '2025-06-01', rate: 10 },
    ]
  },
  { 
    id: '3', 
    name: 'Mike Chen', 
    username: 'mike.c', 
    role: 'sales', 
    commissionRate: 15, 
    status: 'active',
    avatar: 'MC',
    rateHistory: [
      { date: '2025-01-01', rate: 12 },
      { date: '2025-09-01', rate: 15 },
    ]
  },
  { 
    id: '4', 
    name: 'Emily Davis', 
    username: 'emily.d', 
    role: 'sales', 
    commissionRate: 12, 
    status: 'inactive',
    avatar: 'ED',
    rateHistory: [
      { date: '2024-06-01', rate: 10 },
      { date: '2024-12-01', rate: 12 },
    ]
  },
];

export const campaigns: Campaign[] = [
  { id: '1', title: 'Summer Sale 2025', platform: 'facebook', type: 'live', url: 'https://fb.com/live/summer', assignedSalesPersonId: '2', status: 'active', createdAt: '2025-11-01' },
  { id: '2', title: 'New Product Launch', platform: 'instagram', type: 'post', url: 'https://instagram.com/p/launch', assignedSalesPersonId: '3', status: 'active', createdAt: '2025-11-15' },
  { id: '3', title: 'Flash Friday Deals', platform: 'facebook', type: 'post', url: 'https://fb.com/flash', assignedSalesPersonId: '2', status: 'active', createdAt: '2025-11-20' },
  { id: '4', title: 'Holiday Special Live', platform: 'instagram', type: 'live', url: 'https://instagram.com/live/holiday', assignedSalesPersonId: '3', status: 'active', createdAt: '2025-12-01' },
  { id: '5', title: 'Clearance Event', platform: 'facebook', type: 'live', url: 'https://fb.com/clearance', assignedSalesPersonId: '2', status: 'paused', createdAt: '2025-10-15' },
  { id: '6', title: 'Weekend Mega Sale', platform: 'instagram', type: 'live', url: 'https://instagram.com/live/mega', assignedSalesPersonId: '3', status: 'completed', createdAt: '2025-09-01' },
];

export const orders: Order[] = [
  // December 2025 orders - spread across the month for charts
  { id: '1', campaignId: '1', products: [{ name: 'Summer Dress', qty: 2, basePrice: 49.99 }, { name: 'Sandals', qty: 1, basePrice: 29.99 }], orderTotal: 129.97, snapshotRate: 10, commissionAmount: 12.99, createdAt: '2025-12-11', status: 'active' },
  { id: '2', campaignId: '2', products: [{ name: 'Smart Watch', qty: 1, basePrice: 299.99 }], orderTotal: 299.99, snapshotRate: 15, commissionAmount: 45.00, createdAt: '2025-12-11', status: 'active' },
  { id: '3', campaignId: '1', products: [{ name: 'Beach Towel', qty: 3, basePrice: 19.99 }], orderTotal: 59.97, snapshotRate: 10, commissionAmount: 6.00, createdAt: '2025-12-12', status: 'active' },
  { id: '4', campaignId: '3', products: [{ name: 'Running Shoes', qty: 1, basePrice: 89.99 }, { name: 'Sports Socks', qty: 2, basePrice: 9.99 }], orderTotal: 109.97, snapshotRate: 10, commissionAmount: 11.00, createdAt: '2025-12-12', status: 'active' },
  { id: '5', campaignId: '4', products: [{ name: 'Gift Set Deluxe', qty: 2, basePrice: 79.99 }], orderTotal: 159.98, snapshotRate: 15, commissionAmount: 24.00, createdAt: '2025-12-13', status: 'active' },
  { id: '6', campaignId: '2', products: [{ name: 'Wireless Earbuds', qty: 1, basePrice: 149.99 }], orderTotal: 149.99, snapshotRate: 15, commissionAmount: 22.50, createdAt: '2025-12-13', status: 'active' },
  { id: '7', campaignId: '1', products: [{ name: 'Linen Shirt', qty: 1, basePrice: 65.00 }], orderTotal: 65.00, snapshotRate: 10, commissionAmount: 6.50, createdAt: '2025-12-14', status: 'active' },
  { id: '8', campaignId: '4', products: [{ name: 'Scented Candles Set', qty: 3, basePrice: 25.00 }], orderTotal: 75.00, snapshotRate: 15, commissionAmount: 11.25, createdAt: '2025-12-14', status: 'active' },
  { id: '9', campaignId: '3', products: [{ name: 'Yoga Mat', qty: 1, basePrice: 45.00 }, { name: 'Water Bottle', qty: 2, basePrice: 15.00 }], orderTotal: 75.00, snapshotRate: 10, commissionAmount: 7.50, createdAt: '2025-12-15', status: 'active' },
  { id: '10', campaignId: '2', products: [{ name: 'Fitness Tracker', qty: 1, basePrice: 199.99 }], orderTotal: 199.99, snapshotRate: 15, commissionAmount: 30.00, createdAt: '2025-12-15', status: 'active' },
  { id: '11', campaignId: '1', products: [{ name: 'Sunglasses', qty: 2, basePrice: 35.00 }], orderTotal: 70.00, snapshotRate: 10, commissionAmount: 7.00, createdAt: '2025-12-16', status: 'active' },
  { id: '12', campaignId: '4', products: [{ name: 'Holiday Sweater', qty: 1, basePrice: 55.00 }], orderTotal: 55.00, snapshotRate: 15, commissionAmount: 8.25, createdAt: '2025-12-16', status: 'cancelled' },
  { id: '13', campaignId: '3', products: [{ name: 'Sneakers', qty: 1, basePrice: 120.00 }], orderTotal: 120.00, snapshotRate: 10, commissionAmount: 12.00, createdAt: '2025-12-17', status: 'active' },
  { id: '14', campaignId: '2', products: [{ name: 'Bluetooth Speaker', qty: 1, basePrice: 89.99 }], orderTotal: 89.99, snapshotRate: 15, commissionAmount: 13.50, createdAt: '2025-12-17', status: 'active' },
  { id: '15', campaignId: '1', products: [{ name: 'Beach Bag', qty: 1, basePrice: 40.00 }, { name: 'Flip Flops', qty: 1, basePrice: 20.00 }], orderTotal: 60.00, snapshotRate: 10, commissionAmount: 6.00, createdAt: '2025-12-17', status: 'active' },
  { id: '16', campaignId: '4', products: [{ name: 'Cozy Blanket', qty: 2, basePrice: 45.00 }], orderTotal: 90.00, snapshotRate: 15, commissionAmount: 13.50, createdAt: '2025-12-17', status: 'active' },
  // November orders for trend comparison
  { id: '17', campaignId: '1', products: [{ name: 'Fall Jacket', qty: 1, basePrice: 150.00 }], orderTotal: 150.00, snapshotRate: 10, commissionAmount: 15.00, createdAt: '2025-11-15', status: 'active' },
  { id: '18', campaignId: '2', products: [{ name: 'Headphones', qty: 1, basePrice: 250.00 }], orderTotal: 250.00, snapshotRate: 15, commissionAmount: 37.50, createdAt: '2025-11-20', status: 'active' },
];

export const currentUser = users[0];

// Helper functions for analytics
export const getOrdersByCampaign = (campaignId: string) => 
  orders.filter(o => o.campaignId === campaignId && o.status === 'active');

export const getCampaignRevenue = (campaignId: string) => 
  getOrdersByCampaign(campaignId).reduce((sum, o) => sum + o.orderTotal, 0);

export const getCampaignCommission = (campaignId: string) => 
  getOrdersByCampaign(campaignId).reduce((sum, o) => sum + o.commissionAmount, 0);

export const getTopPerformer = () => {
  const salesUsers = users.filter(u => u.role === 'sales' && u.status === 'active');
  let topUser = salesUsers[0];
  let maxSales = 0;

  salesUsers.forEach(user => {
    const userCampaigns = campaigns.filter(c => c.assignedSalesPersonId === user.id);
    const userSales = userCampaigns.reduce((sum, c) => sum + getCampaignRevenue(c.id), 0);
    if (userSales > maxSales) {
      maxSales = userSales;
      topUser = user;
    }
  });

  return { user: topUser, totalSales: maxSales };
};

export const getDailySales = (days: number = 7) => {
  const result: { date: string; sales: number; label: string }[] = [];
  const today = new Date('2025-12-17'); // Fixed date for demo
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOrders = orders.filter(o => o.createdAt === dateStr && o.status === 'active');
    const daySales = dayOrders.reduce((sum, o) => sum + o.orderTotal, 0);
    
    result.push({
      date: dateStr,
      sales: daySales,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
    });
  }
  
  return result;
};

export const getPlatformRevenue = () => {
  const fbRevenue = campaigns
    .filter(c => c.platform === 'facebook')
    .reduce((sum, c) => sum + getCampaignRevenue(c.id), 0);
  
  const igRevenue = campaigns
    .filter(c => c.platform === 'instagram')
    .reduce((sum, c) => sum + getCampaignRevenue(c.id), 0);
  
  return [
    { name: 'Facebook', value: fbRevenue, fill: 'hsl(var(--chart-1))' },
    { name: 'Instagram', value: igRevenue, fill: 'hsl(var(--chart-2))' },
  ];
};

export const getRecentActivity = (limit: number = 5) => {
  return orders
    .filter(o => o.status === 'active')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(order => {
      const campaign = campaigns.find(c => c.id === order.campaignId);
      const salesPerson = users.find(u => u.id === campaign?.assignedSalesPersonId);
      const productName = order.products[0]?.name || 'Item';
      return {
        id: order.id,
        text: `${salesPerson?.name || 'Someone'} sold '${productName}'`,
        amount: order.orderTotal,
        date: order.createdAt,
      };
    });
};
