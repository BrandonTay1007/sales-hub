// Mock Data for Pebble Sales Tracker - Premium Edition

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'sales';
  commissionRate: number;
  status: 'active' | 'inactive';
  avatar?: string;
  rateHistory?: { date: string; rate: number }[];
  monthlyTarget?: number;
}

export interface Campaign {
  id: string;
  title: string;
  platform: 'facebook' | 'instagram';
  type: 'post' | 'live' | 'event';
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
  createdHour?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// 5 Sales Persons + 1 Admin
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
    commissionRate: 12, 
    status: 'active',
    avatar: 'SJ',
    monthlyTarget: 5000,
    rateHistory: [
      { date: '2024-06-01', rate: 8 },
      { date: '2024-09-01', rate: 10 },
      { date: '2025-01-01', rate: 12 },
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
    monthlyTarget: 6000,
    rateHistory: [
      { date: '2024-06-01', rate: 10 },
      { date: '2024-12-01', rate: 12 },
      { date: '2025-06-01', rate: 15 },
    ]
  },
  { 
    id: '4', 
    name: 'Emily Davis', 
    username: 'emily.d', 
    role: 'sales', 
    commissionRate: 10, 
    status: 'active',
    avatar: 'ED',
    monthlyTarget: 4000,
    rateHistory: [
      { date: '2024-06-01', rate: 8 },
      { date: '2025-03-01', rate: 10 },
    ]
  },
  { 
    id: '5', 
    name: 'Alex Rivera', 
    username: 'alex.r', 
    role: 'sales', 
    commissionRate: 11, 
    status: 'active',
    avatar: 'AR',
    monthlyTarget: 4500,
    rateHistory: [
      { date: '2024-09-01', rate: 9 },
      { date: '2025-02-01', rate: 11 },
    ]
  },
  { 
    id: '6', 
    name: 'Jessica Wong', 
    username: 'jessica.w', 
    role: 'sales', 
    commissionRate: 13, 
    status: 'inactive',
    avatar: 'JW',
    monthlyTarget: 5500,
    rateHistory: [
      { date: '2024-03-01', rate: 10 },
      { date: '2024-08-01', rate: 13 },
    ]
  },
];

// 12 Campaigns
export const campaigns: Campaign[] = [
  { id: '1', title: 'Summer Sale 2025', platform: 'facebook', type: 'live', url: 'https://fb.com/live/summer', assignedSalesPersonId: '2', status: 'active', createdAt: '2025-11-01' },
  { id: '2', title: 'New Product Launch', platform: 'instagram', type: 'post', url: 'https://instagram.com/p/launch', assignedSalesPersonId: '3', status: 'active', createdAt: '2025-11-15' },
  { id: '3', title: 'Flash Friday Deals', platform: 'facebook', type: 'post', url: 'https://fb.com/flash', assignedSalesPersonId: '2', status: 'active', createdAt: '2025-11-20' },
  { id: '4', title: 'Holiday Special Live', platform: 'instagram', type: 'live', url: 'https://instagram.com/live/holiday', assignedSalesPersonId: '3', status: 'active', createdAt: '2025-12-01' },
  { id: '5', title: 'Clearance Event', platform: 'facebook', type: 'event', url: 'https://fb.com/clearance', assignedSalesPersonId: '4', status: 'active', createdAt: '2025-10-15' },
  { id: '6', title: 'Weekend Mega Sale', platform: 'instagram', type: 'live', url: 'https://instagram.com/live/mega', assignedSalesPersonId: '5', status: 'completed', createdAt: '2025-09-01' },
  { id: '7', title: 'Back to School', platform: 'facebook', type: 'post', url: 'https://fb.com/school', assignedSalesPersonId: '4', status: 'completed', createdAt: '2025-08-15' },
  { id: '8', title: 'Valentine Collection', platform: 'instagram', type: 'live', url: 'https://instagram.com/live/valentine', assignedSalesPersonId: '5', status: 'completed', createdAt: '2025-02-01' },
  { id: '9', title: 'Spring Fashion Week', platform: 'facebook', type: 'event', url: 'https://fb.com/spring', assignedSalesPersonId: '2', status: 'active', createdAt: '2025-03-15' },
  { id: '10', title: 'Tech Gadgets Showcase', platform: 'instagram', type: 'post', url: 'https://instagram.com/p/tech', assignedSalesPersonId: '3', status: 'active', createdAt: '2025-12-05' },
  { id: '11', title: 'Beauty Box Unboxing', platform: 'facebook', type: 'live', url: 'https://fb.com/live/beauty', assignedSalesPersonId: '4', status: 'active', createdAt: '2025-12-10' },
  { id: '12', title: 'Year End Blowout', platform: 'instagram', type: 'event', url: 'https://instagram.com/yearend', assignedSalesPersonId: '5', status: 'active', createdAt: '2025-12-12' },
];

// Product catalog for realistic order generation
const products = [
  { name: 'Summer Dress', basePrice: 49.99 },
  { name: 'Sandals', basePrice: 29.99 },
  { name: 'Smart Watch', basePrice: 299.99 },
  { name: 'Beach Towel', basePrice: 19.99 },
  { name: 'Running Shoes', basePrice: 89.99 },
  { name: 'Sports Socks', basePrice: 9.99 },
  { name: 'Gift Set Deluxe', basePrice: 79.99 },
  { name: 'Wireless Earbuds', basePrice: 149.99 },
  { name: 'Linen Shirt', basePrice: 65.00 },
  { name: 'Scented Candles Set', basePrice: 25.00 },
  { name: 'Yoga Mat', basePrice: 45.00 },
  { name: 'Water Bottle', basePrice: 15.00 },
  { name: 'Fitness Tracker', basePrice: 199.99 },
  { name: 'Sunglasses', basePrice: 35.00 },
  { name: 'Holiday Sweater', basePrice: 55.00 },
  { name: 'Sneakers', basePrice: 120.00 },
  { name: 'Bluetooth Speaker', basePrice: 89.99 },
  { name: 'Beach Bag', basePrice: 40.00 },
  { name: 'Flip Flops', basePrice: 20.00 },
  { name: 'Cozy Blanket', basePrice: 45.00 },
  { name: 'Fall Jacket', basePrice: 150.00 },
  { name: 'Headphones', basePrice: 250.00 },
  { name: 'Makeup Kit', basePrice: 75.00 },
  { name: 'Perfume Set', basePrice: 120.00 },
  { name: 'Laptop Stand', basePrice: 55.00 },
  { name: 'Phone Case', basePrice: 25.00 },
  { name: 'Backpack', basePrice: 85.00 },
  { name: 'Wallet', basePrice: 45.00 },
  { name: 'Watch Band', basePrice: 30.00 },
  { name: 'LED Desk Lamp', basePrice: 65.00 },
];

// Generate 80+ orders spanning multiple months
const generateOrders = (): Order[] => {
  const generatedOrders: Order[] = [];
  let orderId = 1;
  
  const campaignRates: Record<string, number> = {
    '1': 12, '2': 15, '3': 12, '4': 15, '5': 10, '6': 11,
    '7': 10, '8': 11, '9': 12, '10': 15, '11': 10, '12': 11
  };

  // December 2025 - Current month with most data
  const dec2025Days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];
  dec2025Days.forEach(day => {
    const ordersPerDay = Math.floor(Math.random() * 4) + 2; // 2-5 orders per day
    for (let i = 0; i < ordersPerDay; i++) {
      const campaignId = String(Math.floor(Math.random() * 12) + 1);
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const orderProducts = [];
      let total = 0;
      
      for (let p = 0; p < numProducts; p++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        orderProducts.push({ name: product.name, qty, basePrice: product.basePrice });
        total += product.basePrice * qty;
      }
      
      const rate = campaignRates[campaignId] || 10;
      const commission = total * (rate / 100);
      
      generatedOrders.push({
        id: String(orderId++),
        campaignId,
        products: orderProducts,
        orderTotal: Math.round(total * 100) / 100,
        snapshotRate: rate,
        commissionAmount: Math.round(commission * 100) / 100,
        createdAt: `2025-12-${day.toString().padStart(2, '0')}`,
        status: Math.random() > 0.95 ? 'cancelled' : 'active',
        createdHour: Math.floor(Math.random() * 14) + 8, // 8am - 10pm
      });
    }
  });

  // November 2025
  [5, 8, 12, 15, 18, 20, 22, 25, 28].forEach(day => {
    const ordersPerDay = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < ordersPerDay; i++) {
      const campaignId = String(Math.floor(Math.random() * 6) + 1);
      const numProducts = Math.floor(Math.random() * 2) + 1;
      const orderProducts = [];
      let total = 0;
      
      for (let p = 0; p < numProducts; p++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        orderProducts.push({ name: product.name, qty, basePrice: product.basePrice });
        total += product.basePrice * qty;
      }
      
      const rate = campaignRates[campaignId] || 10;
      const commission = total * (rate / 100);
      
      generatedOrders.push({
        id: String(orderId++),
        campaignId,
        products: orderProducts,
        orderTotal: Math.round(total * 100) / 100,
        snapshotRate: rate,
        commissionAmount: Math.round(commission * 100) / 100,
        createdAt: `2025-11-${day.toString().padStart(2, '0')}`,
        status: Math.random() > 0.92 ? 'cancelled' : 'active',
        createdHour: Math.floor(Math.random() * 14) + 8,
      });
    }
  });

  // October 2025
  [3, 7, 10, 14, 18, 21, 25, 28].forEach(day => {
    const campaignId = String(Math.floor(Math.random() * 6) + 1);
    const product = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 2) + 1;
    const total = product.basePrice * qty;
    const rate = campaignRates[campaignId] || 10;
    
    generatedOrders.push({
      id: String(orderId++),
      campaignId,
      products: [{ name: product.name, qty, basePrice: product.basePrice }],
      orderTotal: Math.round(total * 100) / 100,
      snapshotRate: rate,
      commissionAmount: Math.round(total * (rate / 100) * 100) / 100,
      createdAt: `2025-10-${day.toString().padStart(2, '0')}`,
      status: 'active',
      createdHour: Math.floor(Math.random() * 14) + 8,
    });
  });

  // Earlier months (2025)
  ['09', '08', '07', '06', '05', '04', '03', '02', '01'].forEach(month => {
    const days = [5, 12, 18, 25];
    days.forEach(day => {
      const campaignId = String(Math.floor(Math.random() * 8) + 1);
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 2) + 1;
      const total = product.basePrice * qty;
      const rate = campaignRates[campaignId] || 10;
      
      generatedOrders.push({
        id: String(orderId++),
        campaignId,
        products: [{ name: product.name, qty, basePrice: product.basePrice }],
        orderTotal: Math.round(total * 100) / 100,
        snapshotRate: rate,
        commissionAmount: Math.round(total * (rate / 100) * 100) / 100,
        createdAt: `2025-${month}-${day.toString().padStart(2, '0')}`,
        status: 'active',
        createdHour: Math.floor(Math.random() * 14) + 8,
      });
    });
  });

  return generatedOrders.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const orders: Order[] = generateOrders();

export const notifications: Notification[] = [
  { id: '1', title: 'New Order', message: 'Sarah just closed a RM299 sale!', read: false, createdAt: '2025-12-17T10:30:00' },
  { id: '2', title: 'Commission Rate Updated', message: 'Mike\'s rate increased to 15%', read: false, createdAt: '2025-12-16T14:00:00' },
  { id: '3', title: 'Campaign Milestone', message: 'Holiday Special reached RM5000!', read: true, createdAt: '2025-12-15T09:00:00' },
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
  const result: { date: string; sales: number; orders: number; label: string }[] = [];
  const today = new Date('2025-12-17');
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayOrders = orders.filter(o => o.createdAt === dateStr && o.status === 'active');
    const daySales = dayOrders.reduce((sum, o) => sum + o.orderTotal, 0);
    
    result.push({
      date: dateStr,
      sales: Math.round(daySales * 100) / 100,
      orders: dayOrders.length,
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
    });
  }
  
  return result;
};

export const getMonthlyRevenue = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => {
    const monthStr = (index + 1).toString().padStart(2, '0');
    const monthOrders = orders.filter(o => 
      o.createdAt.startsWith(`2025-${monthStr}`) && o.status === 'active'
    );
    const revenue = monthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
    return { month, revenue: Math.round(revenue * 100) / 100 };
  });
};

export const getCumulativeRevenue = () => {
  const monthly = getMonthlyRevenue();
  let cumulative = 0;
  return monthly.map(m => {
    cumulative += m.revenue;
    return { month: m.month, revenue: m.revenue, cumulative: Math.round(cumulative * 100) / 100 };
  });
};

export const getPlatformRevenue = () => {
  const fbRevenue = campaigns
    .filter(c => c.platform === 'facebook')
    .reduce((sum, c) => sum + getCampaignRevenue(c.id), 0);
  
  const igRevenue = campaigns
    .filter(c => c.platform === 'instagram')
    .reduce((sum, c) => sum + getCampaignRevenue(c.id), 0);
  
  return [
    { name: 'Facebook', value: Math.round(fbRevenue * 100) / 100, fill: 'hsl(var(--chart-1))' },
    { name: 'Instagram', value: Math.round(igRevenue * 100) / 100, fill: 'hsl(var(--chart-2))' },
  ];
};

export const getRecentActivity = (limit: number = 10) => {
  return orders
    .filter(o => o.status === 'active')
    .slice(0, limit)
    .map(order => {
      const campaign = campaigns.find(c => c.id === order.campaignId);
      const salesPerson = users.find(u => u.id === campaign?.assignedSalesPersonId);
      const productName = order.products[0]?.name || 'Item';
      return {
        id: order.id,
        text: `${salesPerson?.name || 'Someone'} sold '${productName}'`,
        salesPerson: salesPerson?.name || 'Unknown',
        salesPersonAvatar: salesPerson?.avatar || '??',
        campaignId: campaign?.id,
        campaignTitle: campaign?.title || 'Campaign',
        amount: order.orderTotal,
        date: order.createdAt,
        timestamp: new Date(order.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
    });
};

export const getTopCampaigns = (limit: number = 5) => {
  return campaigns
    .map(c => ({
      id: c.id,
      title: c.title,
      revenue: getCampaignRevenue(c.id),
      platform: c.platform,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

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

export const getRevenueByType = () => {
  const types = ['post', 'live', 'event'] as const;
  return types.map(type => {
    const typeCampaigns = campaigns.filter(c => c.type === type);
    const revenue = typeCampaigns.reduce((sum, c) => sum + getCampaignRevenue(c.id), 0);
    return { type: type.charAt(0).toUpperCase() + type.slice(1), revenue: Math.round(revenue * 100) / 100 };
  });
};

export const getHourlyHeatmap = () => {
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8am to 9pm
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const heatmap: { day: string; hour: number; value: number }[] = [];
  
  days.forEach((day, dayIndex) => {
    hours.forEach(hour => {
      // Simulate activity based on typical patterns
      let baseValue = Math.random() * 5;
      // More activity during lunch (12-2pm) and evening (6-9pm)
      if (hour >= 12 && hour <= 14) baseValue *= 1.5;
      if (hour >= 18 && hour <= 21) baseValue *= 2;
      // Weekends have different patterns
      if (dayIndex >= 5) baseValue *= 1.3;
      
      heatmap.push({ day, hour, value: Math.round(baseValue) });
    });
  });
  
  return heatmap;
};

export const getTopProducts = () => {
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  
  orders.filter(o => o.status === 'active').forEach(order => {
    order.products.forEach(product => {
      if (!productSales[product.name]) {
        productSales[product.name] = { name: product.name, qty: 0, revenue: 0 };
      }
      productSales[product.name].qty += product.qty;
      productSales[product.name].revenue += product.basePrice * product.qty;
    });
  });
  
  return Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(p => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));
};

export const getAvgOrderValue = () => {
  const activeOrders = orders.filter(o => o.status === 'active');
  if (activeOrders.length === 0) return 0;
  const total = activeOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  return Math.round((total / activeOrders.length) * 100) / 100;
};

export const getMonthlyEarnings = (userId: string) => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const userCampaigns = campaigns.filter(c => c.assignedSalesPersonId === userId);
  
  return months.map((month, index) => {
    const monthNum = index + 7; // July = 7
    const monthStr = monthNum.toString().padStart(2, '0');
    const monthOrders = orders.filter(o => 
      o.createdAt.startsWith(`2025-${monthStr}`) && 
      o.status === 'active' &&
      userCampaigns.some(c => c.id === o.campaignId)
    );
    const earnings = monthOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
    return { month, earnings: Math.round(earnings * 100) / 100 };
  });
};
