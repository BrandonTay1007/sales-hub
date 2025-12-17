import { DashboardLayout } from '@/components/DashboardLayout';
import { users, campaigns, orders } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Users, Megaphone, ShoppingCart, DollarSign, TrendingUp, Activity } from 'lucide-react';

const Dashboard = () => {
  const { isAdmin, user } = useAuth();

  const totalSales = orders.reduce((sum, o) => sum + o.orderTotal, 0);
  const totalCommissions = orders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const activeUsers = users.filter(u => u.status === 'active' && u.role === 'sales').length;

  // For sales users, calculate their personal stats
  const userCampaigns = campaigns.filter(c => c.assignedSalesPersonId === user?.id);
  const userOrders = orders.filter(o => userCampaigns.some(c => c.id === o.campaignId));
  const userTotalSales = userOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const userTotalCommission = userOrders.reduce((sum, o) => sum + o.commissionAmount, 0);

  const adminStats = [
    { label: 'Total Sales', value: `$${totalSales.toFixed(2)}`, icon: DollarSign, color: 'text-success' },
    { label: 'Total Commissions', value: `$${totalCommissions.toFixed(2)}`, icon: TrendingUp, color: 'text-primary' },
    { label: 'Active Campaigns', value: activeCampaigns, icon: Megaphone, color: 'text-accent' },
    { label: 'Sales Team', value: activeUsers, icon: Users, color: 'text-warning' },
  ];

  const salesStats = [
    { label: 'My Total Sales', value: `$${userTotalSales.toFixed(2)}`, icon: DollarSign, color: 'text-success' },
    { label: 'My Commission Earned', value: `$${userTotalCommission.toFixed(2)}`, icon: TrendingUp, color: 'text-primary' },
    { label: 'My Campaigns', value: userCampaigns.length, icon: Megaphone, color: 'text-accent' },
    { label: 'My Orders', value: userOrders.length, icon: ShoppingCart, color: 'text-warning' },
  ];

  const stats = isAdmin ? adminStats : salesStats;

  const recentOrders = orders.slice(-5).reverse();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="dashboard-card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="table-header">Date</th>
                    <th className="table-header">Campaign</th>
                    <th className="table-header text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const campaign = campaigns.find(c => c.id === order.campaignId);
                    return (
                      <tr key={order.id} className="table-row">
                        <td className="table-cell">{order.createdAt}</td>
                        <td className="table-cell">{campaign?.title}</td>
                        <td className="table-cell text-right font-medium">${order.orderTotal.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">Active Campaigns</h2>
            </div>
            <div className="space-y-3">
              {campaigns.filter(c => c.status === 'active').slice(0, 5).map((campaign) => {
                const salesPerson = users.find(u => u.id === campaign.assignedSalesPersonId);
                return (
                  <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium text-foreground">{campaign.title}</p>
                      <p className="text-sm text-muted-foreground">{salesPerson?.name}</p>
                    </div>
                    <span className="badge-active">Active</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
