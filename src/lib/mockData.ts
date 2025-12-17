// Mock Data for Sales Commission Dashboard

export interface User {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'sales';
  commissionRate: number;
  status: 'active' | 'inactive';
}

export interface Campaign {
  id: string;
  title: string;
  platform: 'facebook' | 'instagram';
  type: 'post' | 'live';
  url: string;
  assignedSalesPersonId: string;
  status: 'active' | 'paused' | 'completed';
}

export interface Order {
  id: string;
  campaignId: string;
  products: { name: string; qty: number; basePrice: number }[];
  orderTotal: number;
  snapshotRate: number;
  commissionAmount: number;
  createdAt: string;
}

export const users: User[] = [
  { id: '1', name: 'Admin User', username: 'admin', role: 'admin', commissionRate: 0, status: 'active' },
  { id: '2', name: 'Sarah Johnson', username: 'sarah.j', role: 'sales', commissionRate: 10, status: 'active' },
  { id: '3', name: 'Mike Chen', username: 'mike.c', role: 'sales', commissionRate: 15, status: 'active' },
  { id: '4', name: 'Emily Davis', username: 'emily.d', role: 'sales', commissionRate: 12, status: 'inactive' },
];

export const campaigns: Campaign[] = [
  { id: '1', title: 'Summer Sale 2025', platform: 'facebook', type: 'live', url: 'https://fb.com/live/summer', assignedSalesPersonId: '2', status: 'active' },
  { id: '2', title: 'New Product Launch', platform: 'instagram', type: 'post', url: 'https://instagram.com/p/launch', assignedSalesPersonId: '3', status: 'active' },
  { id: '3', title: 'Flash Friday Deals', platform: 'facebook', type: 'post', url: 'https://fb.com/flash', assignedSalesPersonId: '2', status: 'active' },
  { id: '4', title: 'Holiday Special Live', platform: 'instagram', type: 'live', url: 'https://instagram.com/live/holiday', assignedSalesPersonId: '3', status: 'active' },
  { id: '5', title: 'Clearance Event', platform: 'facebook', type: 'live', url: 'https://fb.com/clearance', assignedSalesPersonId: '2', status: 'paused' },
];

export const orders: Order[] = [
  { id: '1', campaignId: '1', products: [{ name: 'Summer Dress', qty: 2, basePrice: 49.99 }, { name: 'Sandals', qty: 1, basePrice: 29.99 }], orderTotal: 129.97, snapshotRate: 10, commissionAmount: 12.99, createdAt: '2025-12-01' },
  { id: '2', campaignId: '2', products: [{ name: 'Smart Watch', qty: 1, basePrice: 299.99 }], orderTotal: 299.99, snapshotRate: 15, commissionAmount: 45.00, createdAt: '2025-12-03' },
  { id: '3', campaignId: '1', products: [{ name: 'Beach Towel', qty: 3, basePrice: 19.99 }], orderTotal: 59.97, snapshotRate: 10, commissionAmount: 6.00, createdAt: '2025-12-05' },
  { id: '4', campaignId: '3', products: [{ name: 'Running Shoes', qty: 1, basePrice: 89.99 }, { name: 'Sports Socks', qty: 2, basePrice: 9.99 }], orderTotal: 109.97, snapshotRate: 10, commissionAmount: 11.00, createdAt: '2025-12-10' },
  { id: '5', campaignId: '4', products: [{ name: 'Gift Set Deluxe', qty: 2, basePrice: 79.99 }], orderTotal: 159.98, snapshotRate: 15, commissionAmount: 24.00, createdAt: '2025-12-12' },
  { id: '6', campaignId: '2', products: [{ name: 'Wireless Earbuds', qty: 1, basePrice: 149.99 }], orderTotal: 149.99, snapshotRate: 15, commissionAmount: 22.50, createdAt: '2025-12-15' },
];

export const currentUser = users[0]; // Default to admin for demo
