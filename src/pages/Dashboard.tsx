import { DashboardLayout } from '@/components/DashboardLayout';
import { users, campaigns, orders, getDailySales, getPlatformRevenue, getRecentActivity, getTopPerformer } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, Megaphone, Trophy, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const Dashboard = () => {
  const { isAdmin, user } = useAuth();

  // Calculate current month totals
  const currentMonthOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.getMonth() === 11 && orderDate.getFullYear() === 2025 && o.status === 'active';
  });
  
  const lastMonthOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.getMonth() === 10 && orderDate.getFullYear() === 2025 && o.status === 'active';
  });

  const totalSales = currentMonthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const lastMonthSales = lastMonthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const salesTrend = lastMonthSales > 0 ? ((totalSales - lastMonthSales) / lastMonthSales) * 100 : 100;

  const totalCommissions = currentMonthOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const topPerformer = getTopPerformer();
  const dailySales = getDailySales(7);
  const platformRevenue = getPlatformRevenue();
  const recentActivity = getRecentActivity(5);

  // For sales users, calculate their personal stats
  const userCampaigns = campaigns.filter(c => c.assignedSalesPersonId === user?.id);
  const userOrders = orders.filter(o => userCampaigns.some(c => c.id === o.campaignId) && o.status === 'active');
  const userTotalSales = userOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const userTotalCommission = userOrders.reduce((sum, o) => sum + o.commissionAmount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Command Center</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Sales (Dec)</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">RM {(isAdmin ? totalSales : userTotalSales).toFixed(2)}</p>
            <div className="flex items-center gap-1 mt-1">
              {salesTrend >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-success" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-destructive" />
              )}
              <span className={`text-xs font-medium ${salesTrend >= 0 ? 'text-success' : 'text-destructive'}`}>
                {salesTrend >= 0 ? '+' : ''}{salesTrend.toFixed(1)}% vs last month
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Commission Payout</span>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">RM {(isAdmin ? totalCommissions : userTotalCommission).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAdmin ? 'Total liability' : 'Your earnings'}
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Campaigns</span>
              <Megaphone className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground">{isAdmin ? activeCampaigns : userCampaigns.filter(c => c.status === 'active').length}</p>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Top Performer</span>
              <Trophy className="w-5 h-5 text-warning" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                {topPerformer.user?.avatar}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{topPerformer.user?.name}</p>
                <p className="text-xs text-muted-foreground">RM {topPerformer.totalSales.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Sales Bar Chart */}
          <div className="dashboard-card lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Daily Sales (Last 7 Days)</h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySales}>
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `RM${value}`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`RM ${value.toFixed(2)}`, 'Sales']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Pie Chart */}
          <div className="dashboard-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">Revenue by Platform</h2>
            <div className="h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformRevenue}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformRevenue.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`RM ${value.toFixed(2)}`, 'Revenue']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                <span className="text-xs text-muted-foreground">Facebook</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                <span className="text-xs text-muted-foreground">Instagram</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-foreground">{activity.text}</span>
                </div>
                <span className="text-sm font-semibold text-primary">RM {activity.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
