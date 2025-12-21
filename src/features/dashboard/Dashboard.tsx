import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ordersApi, campaignsApi, usersApi, type Order, type Campaign, type User, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, Megaphone, Trophy, ArrowUpRight, ArrowDownRight, ShoppingCart, Wallet, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { isAdmin, user } = useAuth();

  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await ordersApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await campaignsApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  // Fetch users (for top performer)
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
    enabled: isAdmin, // Only fetch users if admin
  });

  const isLoading = ordersLoading || campaignsLoading;

  // Calculate current month totals
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    const lastMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    });

    const totalSales = currentMonthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
    const lastMonthSales = lastMonthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
    const salesTrend = lastMonthSales > 0 ? ((totalSales - lastMonthSales) / lastMonthSales) * 100 : (totalSales > 0 ? 100 : 0);

    const totalCommissions = currentMonthOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

    // For sales users, calculate their personal stats
    const userCampaigns = campaigns.filter(c => c.salesPersonId === user?.id);
    const userCampaignIds = userCampaigns.map(c => c.id);
    const userOrders = orders.filter(o => userCampaignIds.includes(o.campaignId));
    const userCurrentMonthOrders = userOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    const userLastMonthOrders = userOrders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
    });

    const userTotalSales = userCurrentMonthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
    const userLastMonthSales = userLastMonthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
    const userSalesTrend = userLastMonthSales > 0 ? ((userTotalSales - userLastMonthSales) / userLastMonthSales) * 100 : (userTotalSales > 0 ? 100 : 0);
    const userTotalCommission = userCurrentMonthOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
    const userOrderCount = userCurrentMonthOrders.length;
    const userActiveCampaigns = userCampaigns.filter(c => c.status === 'active').length;

    // Top performer (admin only)
    let topPerformer = { user: null as User | null, totalSales: 0 };
    if (isAdmin && allUsers.length > 0) {
      const salesUsers = allUsers.filter(u => u.role === 'sales');
      salesUsers.forEach(salesUser => {
        const salesUserCampaigns = campaigns.filter(c => c.salesPersonId === salesUser.id);
        const salesUserCampaignIds = salesUserCampaigns.map(c => c.id);
        const salesUserOrders = currentMonthOrders.filter(o => salesUserCampaignIds.includes(o.campaignId));
        const salesUserTotal = salesUserOrders.reduce((sum, o) => sum + o.orderTotal, 0);
        if (salesUserTotal > topPerformer.totalSales) {
          topPerformer = { user: salesUser, totalSales: salesUserTotal };
        }
      });
    }

    return {
      totalSales,
      salesTrend,
      totalCommissions,
      activeCampaigns,
      userTotalSales,
      userSalesTrend,
      userTotalCommission,
      userOrderCount,
      userActiveCampaigns,
      topPerformer,
      userCampaigns,
      userOrders,
    };
  }, [orders, campaigns, allUsers, user?.id, isAdmin]);

  // Daily sales for last 7 days
  const dailySales = useMemo(() => {
    const result: { date: string; sales: number; orders: number; label: string }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const relevantOrders = isAdmin
        ? orders
        : orders.filter(o => stats.userCampaigns.some(c => c.id === o.campaignId));

      const dayOrders = relevantOrders.filter(o => o.createdAt.split('T')[0] === dateStr);
      const daySales = dayOrders.reduce((sum, o) => sum + o.orderTotal, 0);

      result.push({
        date: dateStr,
        sales: Math.round(daySales * 100) / 100,
        orders: dayOrders.length,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }

    return result;
  }, [orders, isAdmin, stats.userCampaigns]);

  // Platform revenue
  const platformRevenue = useMemo(() => {
    const relevantCampaigns = isAdmin ? campaigns : stats.userCampaigns;
    const relevantOrders = isAdmin ? orders : stats.userOrders;

    const fbCampaignIds = relevantCampaigns.filter(c => c.platform === 'facebook').map(c => c.id);
    const igCampaignIds = relevantCampaigns.filter(c => c.platform === 'instagram').map(c => c.id);

    const fbRevenue = relevantOrders
      .filter(o => fbCampaignIds.includes(o.campaignId))
      .reduce((sum, o) => sum + o.orderTotal, 0);

    const igRevenue = relevantOrders
      .filter(o => igCampaignIds.includes(o.campaignId))
      .reduce((sum, o) => sum + o.orderTotal, 0);

    return [
      { name: 'Facebook', value: Math.round(fbRevenue * 100) / 100, fill: 'hsl(var(--chart-1))' },
      { name: 'Instagram', value: Math.round(igRevenue * 100) / 100, fill: 'hsl(var(--chart-2))' },
    ];
  }, [campaigns, orders, isAdmin, stats.userCampaigns, stats.userOrders]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const relevantOrders = isAdmin ? orders : stats.userOrders;
    const sortedOrders = [...relevantOrders].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return sortedOrders.slice(0, 5).map(order => {
      const campaign = campaigns.find(c => c.id === order.campaignId);
      const salesPerson = allUsers.find(u => u.id === campaign?.salesPersonId);
      const productName = order.products[0]?.name || 'Item';
      return {
        id: order.id,
        referenceId: order.referenceId,
        text: `Sold '${productName}'`,
        campaignTitle: campaign?.title || 'Campaign',
        amount: order.orderTotal,
        date: order.createdAt,
        salesPerson: salesPerson?.name,
      };
    });
  }, [orders, campaigns, allUsers, isAdmin, stats.userOrders]);

  const getAvatar = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get month name for display
  const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'short' });

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
                    {isAdmin ? `Total Revenue (${currentMonthName})` : `Your Revenue (${currentMonthName})`}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total sales amount for {currentMonthName}</p>
                </TooltipContent>
              </UITooltip>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <>
                <p className="text-2xl font-bold text-foreground">RM {(isAdmin ? stats.totalSales : stats.userTotalSales).toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {(isAdmin ? stats.salesTrend : stats.userSalesTrend) >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  )}
                  <span className={`text-xs font-medium ${(isAdmin ? stats.salesTrend : stats.userSalesTrend) >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {(isAdmin ? stats.salesTrend : stats.userSalesTrend) >= 0 ? '+' : ''}{(isAdmin ? stats.salesTrend : stats.userSalesTrend).toFixed(1)}% vs last month
                  </span>
                </div>
              </>
            )}
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
            {isLoading ? (
              <Skeleton className="h-8 w-32 mt-1" />
            ) : (
              <>
                <p className="text-2xl font-bold text-success">RM {(isAdmin ? stats.totalCommissions : stats.userTotalCommission).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isAdmin ? 'Total liability' : 'Commission earned'}
                </p>
              </>
            )}
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
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <>
                <p className="text-2xl font-bold text-foreground">
                  {isAdmin ? stats.activeCampaigns : stats.userActiveCampaigns}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Currently running</p>
              </>
            )}
          </div>

          {isAdmin ? (
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Top Performer</span>
                <Trophy className="w-5 h-5 text-warning" />
              </div>
              {isLoading ? (
                <div className="flex items-center gap-2 mt-1">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16 mt-1" />
                  </div>
                </div>
              ) : stats.topPerformer.user ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {getAvatar(stats.topPerformer.user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{stats.topPerformer.user.name}</p>
                    <p className="text-xs text-muted-foreground">RM {stats.topPerformer.totalSales.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">No sales this month</p>
              )}
            </div>
          ) : (
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Orders This Month</span>
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-foreground">{stats.userOrderCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total orders placed</p>
                </>
              )}
            </div>
          )}
        </div>


        {/* Admin Quick Payout Overview */}
        {isAdmin && (
          <Link to="/team-payouts" className="block">
            <div className="dashboard-card bg-gradient-to-r from-primary/10 to-success/10 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quick Payout Overview</p>
                  {isLoading ? (
                    <Skeleton className="h-7 w-32 mt-1" />
                  ) : (
                    <p className="text-xl font-bold text-foreground mt-1">RM {stats.totalCommissions.toFixed(2)}</p>
                  )}
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
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
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
              )}
            </div>
          </div>

          {/* Platform Pie Chart */}
          <div className="dashboard-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {isAdmin ? 'Revenue by Platform' : 'Your Revenue by Platform'}
            </h2>
            <div className="h-[200px] flex items-center justify-center">
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              ) : (
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
              )}
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
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20 mt-1" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        {activity.referenceId && (
                          <span className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {activity.referenceId}
                          </span>
                        )}
                        <span className="text-sm text-foreground">{activity.text}</span>
                      </div>
                      {isAdmin && activity.salesPerson && (
                        <p className="text-xs text-muted-foreground">{activity.salesPerson}</p>
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
