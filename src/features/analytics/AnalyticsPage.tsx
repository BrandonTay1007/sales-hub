import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ordersApi, campaignsApi, usersApi, type Order, type Campaign, type User, getErrorMessage } from '@/lib/api';
import { Trophy, TrendingUp, Package, Target, ChevronRight, Facebook, Instagram, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

type ViewMode = 'salesPerson' | 'campaign';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const [leaderboardView, setLeaderboardView] = useState<ViewMode>('salesPerson');

  // Fetch data from API
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await ordersApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await campaignsApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  const { data: allUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  const isLoading = ordersLoading || campaignsLoading || usersLoading;

  // Calculate leaderboard (sales persons)
  const leaderboard = useMemo(() => {
    const salesUsers = allUsers.filter(u => u.role === 'sales');
    return salesUsers
      .map(user => {
        const userCampaigns = campaigns.filter(c => c.salesPersonId === user.id);
        const userCampaignIds = userCampaigns.map(c => c.id);
        const userOrders = orders.filter(o => userCampaignIds.includes(o.campaignId));
        const totalRevenue = userOrders.reduce((sum, o) => sum + o.orderTotal, 0);
        const totalCommission = userOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
        const orderCount = userOrders.length;
        return {
          ...user,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalCommission: Math.round(totalCommission * 100) / 100,
          orderCount,
          avgOrderValue: orderCount > 0 ? Math.round((totalRevenue / orderCount) * 100) / 100 : 0,
          avatar: getAvatar(user.name),
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [orders, campaigns, allUsers]);

  // Calculate campaign leaderboard
  const campaignLeaderboard = useMemo(() => {
    return campaigns
      .map(c => {
        const salesPerson = allUsers.find(u => u.id === c.salesPersonId);
        const campaignOrders = orders.filter(o => o.campaignId === c.id);
        const revenue = campaignOrders.reduce((sum, o) => sum + o.orderTotal, 0);
        return {
          id: c.id,
          title: c.title,
          revenue: Math.round(revenue * 100) / 100,
          platform: c.platform,
          salesPersonName: salesPerson?.name || 'Unknown',
          salesPersonAvatar: salesPerson ? getAvatar(salesPerson.name) : '?',
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [orders, campaigns, allUsers]);

  // Revenue by campaign type
  const revenueByType = useMemo(() => {
    const types = ['post', 'live', 'event'] as const;
    return types.map(type => {
      const typeCampaigns = campaigns.filter(c => c.type === type);
      const typeCampaignIds = typeCampaigns.map(c => c.id);
      const revenue = orders
        .filter(o => typeCampaignIds.includes(o.campaignId))
        .reduce((sum, o) => sum + o.orderTotal, 0);
      return { type: type.charAt(0).toUpperCase() + type.slice(1), revenue: Math.round(revenue * 100) / 100 };
    });
  }, [orders, campaigns]);

  // Top products
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};

    orders.forEach(order => {
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
  }, [orders]);

  // Cumulative revenue by month
  const cumulativeRevenue = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const monthlyRevenue = monthNames.map((month, index) => {
      if (index > currentMonth) return { month, revenue: 0, cumulative: 0 };

      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate.getMonth() === index && orderDate.getFullYear() === currentYear;
      });
      const revenue = monthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
      return { month, revenue: Math.round(revenue * 100) / 100, cumulative: 0 };
    });

    let cumulative = 0;
    for (let i = 0; i <= currentMonth; i++) {
      cumulative += monthlyRevenue[i].revenue;
      monthlyRevenue[i].cumulative = Math.round(cumulative * 100) / 100;
    }

    return monthlyRevenue.slice(0, currentMonth + 1);
  }, [orders]);

  const currentMonthRevenue = cumulativeRevenue[cumulativeRevenue.length - 1]?.revenue || 0;
  const projectedNextMonth = Math.round(currentMonthRevenue * 1.15 * 100) / 100;

  // Show only top 5 in main view
  const displayLeaderboard = leaderboard.slice(0, 5);
  const displayCampaignLeaderboard = campaignLeaderboard.slice(0, 5);

  const getPlatformIcon = (platform: string) => {
    return platform === 'facebook' ? (
      <Facebook className="w-4 h-4 text-[#1877F2]" />
    ) : (
      <Instagram className="w-4 h-4 text-[#E4405F]" />
    );
  };

  function getAvatar(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep insights into your sales performance</p>
        </div>

        {/* Forecast Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="dashboard-card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projected Revenue Next Month</p>
              {isLoading ? (
                <Skeleton className="h-8 w-32 mt-1" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-foreground">RM {projectedNextMonth.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Based on current growth rate (+15%)</p>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <div className="dashboard-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                <h2 className="text-lg font-semibold text-foreground">Leaderboard</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Toggle */}
                <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
                  <button
                    onClick={() => setLeaderboardView('salesPerson')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${leaderboardView === 'salesPerson'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Sales Persons
                  </button>
                  <button
                    onClick={() => setLeaderboardView('campaign')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${leaderboardView === 'campaign'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    Campaigns
                  </button>
                </div>
                {/* See More */}
                <button
                  onClick={() => navigate(`/analytics/leaderboard?view=${leaderboardView}`)}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  See More <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <motion.div
              key={leaderboardView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16 mt-1" />
                    </div>
                  </div>
                ))
              ) : leaderboardView === 'salesPerson' ? (
                displayLeaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No sales data yet</p>
                ) : (
                  displayLeaderboard.map((person, index) => (
                    <div key={person.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-warning text-warning-foreground' :
                        index === 1 ? 'bg-muted text-muted-foreground' :
                          index === 2 ? 'bg-orange-600 text-white' : 'bg-secondary text-secondary-foreground'
                        }`}>
                        {index + 1}
                      </div>
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {person.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{person.name}</p>
                        <p className="text-xs text-muted-foreground">{person.orderCount} orders</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">RM {person.totalRevenue.toLocaleString()}</p>
                        <p className="text-xs text-success">+RM {person.totalCommission.toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                )
              ) : (
                displayCampaignLeaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No campaign data yet</p>
                ) : (
                  displayCampaignLeaderboard.map((campaign, index) => (
                    <div
                      key={campaign.id}
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-warning text-warning-foreground' :
                        index === 1 ? 'bg-muted text-muted-foreground' :
                          index === 2 ? 'bg-orange-600 text-white' : 'bg-secondary text-secondary-foreground'
                        }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{campaign.title}</p>
                        <p className="text-xs text-muted-foreground">{campaign.salesPersonName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">RM {campaign.revenue.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center justify-center w-6">
                        {getPlatformIcon(campaign.platform)}
                      </div>
                    </div>
                  ))
                )
              )}
            </motion.div>
          </div>

          {/* Revenue by Campaign Type */}
          <div className="dashboard-card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Revenue by Type</h2>
            </div>
            <div className="h-[250px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByType} layout="vertical">
                    <XAxis type="number" tickFormatter={(v) => `RM${v}`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis dataKey="type" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={60} />
                    <Tooltip formatter={(v: number) => [`RM ${v.toFixed(2)}`, 'Revenue']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                      {revenueByType.map((_, index) => (
                        <Cell key={index} fill={`hsl(var(--chart-${index + 1}))`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="dashboard-card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">Top Selling Products</h2>
            </div>
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <Skeleton className="w-16 h-4" />
                      <Skeleton className="w-12 h-3" />
                    </div>
                  </div>
                ))
              ) : topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No product sales yet</p>
              ) : (
                topProducts.slice(0, 6).map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4">#{index + 1}</span>
                      <span className="text-sm text-foreground">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-foreground">RM {product.revenue.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground ml-2">({product.qty} sold)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* YTD Revenue */}
          <div className="dashboard-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">Cumulative Revenue (YTD)</h2>
            <div className="h-[250px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cumulativeRevenue}>
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => [`RM ${v.toFixed(2)}`, 'Cumulative']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;