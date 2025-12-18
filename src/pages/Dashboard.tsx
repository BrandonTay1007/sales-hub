import { DashboardLayout } from '@/components/DashboardLayout';
import { users, campaigns, orders, getDailySales, getPlatformRevenue, getRecentActivity, getTopPerformer } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, Megaphone, Trophy, ArrowUpRight, ArrowDownRight, Flame, Target, ShoppingCart, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  
  // For sales users, calculate their personal stats
  const userCampaigns = campaigns.filter(c => c.assignedSalesPersonId === user?.id);
  const userOrders = orders.filter(o => userCampaigns.some(c => c.id === o.campaignId) && o.status === 'active');
  const userCurrentMonthOrders = userOrders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.getMonth() === 11 && orderDate.getFullYear() === 2025;
  });
  const userLastMonthOrders = userOrders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.getMonth() === 10 && orderDate.getFullYear() === 2025;
  });
  
  const userTotalSales = userCurrentMonthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const userLastMonthSales = userLastMonthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const userSalesTrend = userLastMonthSales > 0 ? ((userTotalSales - userLastMonthSales) / userLastMonthSales) * 100 : 100;
  const userTotalCommission = userCurrentMonthOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const userOrderCount = userCurrentMonthOrders.length;
  const userAvgOrderValue = userOrderCount > 0 ? userTotalSales / userOrderCount : 0;

  // Calculate performance streak (consecutive days with sales)
  const calculateStreak = () => {
    const dates = [...new Set(userOrders.map(o => o.createdAt))].sort().reverse();
    let streak = 0;
    const today = new Date('2025-12-17');
    for (let i = 0; i < dates.length; i++) {
      const orderDate = new Date(dates[i]);
      const diffDays = Math.floor((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === streak || diffDays === streak + 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  // User-specific chart data
  const getUserDailySales = () => {
    const result: { date: string; sales: number; orders: number; label: string }[] = [];
    const today = new Date('2025-12-17');
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = userOrders.filter(o => o.createdAt === dateStr);
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

  const getUserPlatformRevenue = () => {
    const fbRevenue = userCampaigns
      .filter(c => c.platform === 'facebook')
      .reduce((sum, c) => {
        const campaignOrders = userOrders.filter(o => o.campaignId === c.id);
        return sum + campaignOrders.reduce((s, o) => s + o.orderTotal, 0);
      }, 0);
    
    const igRevenue = userCampaigns
      .filter(c => c.platform === 'instagram')
      .reduce((sum, c) => {
        const campaignOrders = userOrders.filter(o => o.campaignId === c.id);
        return sum + campaignOrders.reduce((s, o) => s + o.orderTotal, 0);
      }, 0);
    
    return [
      { name: 'Facebook', value: Math.round(fbRevenue * 100) / 100, fill: 'hsl(var(--chart-1))' },
      { name: 'Instagram', value: Math.round(igRevenue * 100) / 100, fill: 'hsl(var(--chart-2))' },
    ];
  };

  const getUserRecentActivity = () => {
    return userOrders
      .slice(0, 5)
      .map(order => {
        const campaign = campaigns.find(c => c.id === order.campaignId);
        const productName = order.products[0]?.name || 'Item';
        return {
          id: order.id,
          text: `Sold '${productName}'`,
          campaignTitle: campaign?.title || 'Campaign',
          amount: order.orderTotal,
          date: order.createdAt,
        };
      });
  };

  const performanceStreak = calculateStreak();
  const dailySales = isAdmin ? getDailySales(7) : getUserDailySales();
  const platformRevenue = isAdmin ? getPlatformRevenue() : getUserPlatformRevenue();
  const recentActivity = isAdmin ? getRecentActivity(5) : getUserRecentActivity();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isAdmin ? 'Command Center' : 'Your Dashboard'}
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name}
            {!isAdmin && user?.commissionRate && (
              <span className="ml-2 text-primary font-medium">• {user.commissionRate}% rate</span>
            )}
          </p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <UITooltip>
                <TooltipTrigger>
                  <span className="text-sm text-muted-foreground">
                    {isAdmin ? 'Total Revenue (Dec)' : 'Your Revenue (Dec)'}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total sales amount for December 2025</p>
                </TooltipContent>
              </UITooltip>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">RM {(isAdmin ? totalSales : userTotalSales).toFixed(2)}</p>
            <div className="flex items-center gap-1 mt-1">
              {(isAdmin ? salesTrend : userSalesTrend) >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-success" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-destructive" />
              )}
              <span className={`text-xs font-medium ${(isAdmin ? salesTrend : userSalesTrend) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {(isAdmin ? salesTrend : userSalesTrend) >= 0 ? '+' : ''}{(isAdmin ? salesTrend : userSalesTrend).toFixed(1)}% vs last month
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <UITooltip>
                <TooltipTrigger>
                  <span className="text-sm text-muted-foreground">
                    {isAdmin ? 'Commissions Owed' : 'Your Earnings'}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isAdmin ? 'Total commission liability for this month' : 'Your commission earnings this month'}</p>
                </TooltipContent>
              </UITooltip>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">RM {(isAdmin ? totalCommissions : userTotalCommission).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isAdmin ? 'Total liability' : 'Commission earned'}
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <UITooltip>
                <TooltipTrigger>
                  <span className="text-sm text-muted-foreground">
                    {isAdmin ? 'Active Campaigns' : 'Your Active Campaigns'}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of currently running campaigns</p>
                </TooltipContent>
              </UITooltip>
              <Megaphone className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {isAdmin ? activeCampaigns : userCampaigns.filter(c => c.status === 'active').length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </div>

          {isAdmin ? (
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
          ) : (
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <UITooltip>
                  <TooltipTrigger>
                    <span className="text-sm text-muted-foreground">Performance Streak</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Consecutive days with sales</p>
                  </TooltipContent>
                </UITooltip>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{performanceStreak} days</p>
              <p className="text-xs text-muted-foreground mt-1">Keep it going! 🔥</p>
            </div>
          )}
        </div>

        {/* Second row of stats for sales person */}
        {!isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Orders This Month</span>
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{userOrderCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Total orders placed</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Order Value</span>
                <Target className="w-5 h-5 text-accent" />
              </div>
              <p className="text-2xl font-bold text-foreground">RM {userAvgOrderValue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Per order average</p>
            </div>
          </div>
        )}

        {/* Admin Quick Payout Overview */}
        {isAdmin && (
          <Link to="/team-payouts" className="block">
            <div className="dashboard-card bg-gradient-to-r from-primary/10 to-success/10 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quick Payout Overview</p>
                  <p className="text-xl font-bold text-foreground mt-1">RM {totalCommissions.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total commissions owed this month</p>
                </div>
                <Wallet className="w-8 h-8 text-primary" />
              </div>
            </div>
          </Link>
        )}

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Sales Bar Chart */}
          <div className="dashboard-card lg:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {isAdmin ? 'Daily Sales (Last 7 Days)' : 'Your Daily Sales (Last 7 Days)'}
            </h2>
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
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {isAdmin ? 'Revenue by Platform' : 'Your Revenue by Platform'}
            </h2>
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
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {isAdmin ? 'Recent Activity' : 'Your Recent Orders'}
          </h2>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <div>
                      <span className="text-sm text-foreground">{activity.text}</span>
                      {isAdmin && 'salesPerson' in activity && (
                        <p className="text-xs text-muted-foreground">{(activity as { salesPerson: string }).salesPerson}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">RM {activity.amount.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
