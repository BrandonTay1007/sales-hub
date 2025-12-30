import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ordersApi, campaignsApi, getErrorMessage, type Order, type Campaign } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Calendar, Download, MessageSquare, TrendingUp, ChevronDown, ChevronRight, Wallet, ArrowUpRight, ArrowDownRight, MoreHorizontal, Filter, Search, Loader2, PauseCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const PayoutsPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [filterCampaign, setFilterCampaign] = useState('');
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  // Redirect admin to team payouts
  if (isAdmin) {
    return <Navigate to="/team-payouts" replace />;
  }

  const years = [2024, 2025, 2026];
  const months = [
    { value: 1, label: 'January', short: 'Jan' },
    { value: 2, label: 'February', short: 'Feb' },
    { value: 3, label: 'March', short: 'Mar' },
    { value: 4, label: 'April', short: 'Apr' },
    { value: 5, label: 'May', short: 'May' },
    { value: 6, label: 'June', short: 'Jun' },
    { value: 7, label: 'July', short: 'Jul' },
    { value: 8, label: 'August', short: 'Aug' },
    { value: 9, label: 'September', short: 'Sep' },
    { value: 10, label: 'October', short: 'Oct' },
    { value: 11, label: 'November', short: 'Nov' },
    { value: 12, label: 'December', short: 'Dec' },
  ];

  // Fetch campaigns for this user
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await campaignsApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  // Fetch all orders (API returns only user's orders for non-admin)
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await ordersApi.list({});
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  const isLoading = campaignsLoading || ordersLoading;

  // Get user's campaigns
  const userCampaigns = useMemo(() =>
    campaigns.filter(c => c.salesPersonId === user?.id),
    [campaigns, user?.id]
  );

  // Get user's orders for selected month
  const userMonthOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const matchesDate = orderDate.getFullYear() === selectedYear &&
        (orderDate.getMonth() + 1) === selectedMonth;
      const belongsToUser = userCampaigns.some(c => c.id === order.campaignId);
      const matchesCampaign = !filterCampaign || order.campaignId === filterCampaign;
      return matchesDate && belongsToUser && matchesCampaign;
    });
  }, [orders, selectedYear, selectedMonth, userCampaigns, filterCampaign]);

  // Calculate totals
  const totalSales = userMonthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const totalCommission = userMonthOrders.reduce((sum, o) => sum + (o.commissionPaused ? 0 : o.commissionAmount), 0);

  // Group orders by campaign
  const campaignBreakdown = useMemo(() => {
    return userCampaigns.map(campaign => {
      const campaignOrders = userMonthOrders.filter(o => o.campaignId === campaign.id);
      const campaignSales = campaignOrders.reduce((sum, o) => sum + o.orderTotal, 0);
      const campaignCommission = campaignOrders.reduce((sum, o) => sum + (o.commissionPaused ? 0 : o.commissionAmount), 0);
      const avgRate = campaignOrders.length > 0
        ? campaignOrders.reduce((sum, o) => sum + o.snapshotRate, 0) / campaignOrders.length
        : user?.commissionRate || 0;
      return {
        campaign,
        orders: campaignOrders,
        totalSales: campaignSales,
        totalCommission: campaignCommission,
        avgRate,
      };
    })
      .filter(b => b.orders.length > 0) // Only show campaigns with orders in selected month/year
      .filter(b => !filterCampaign || b.campaign.id === filterCampaign);
  }, [userMonthOrders, userCampaigns, filterCampaign, user?.commissionRate]);

  // Calculate monthly earnings for the last 6 months (for trend chart)
  const earningsTrend = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const matchesDate = orderDate.getFullYear() === year &&
          (orderDate.getMonth() + 1) === month;
        const belongsToUser = userCampaigns.some(c => c.id === order.campaignId);
        return matchesDate && belongsToUser;
      });

      const commission = monthOrders.reduce((sum, o) => sum + (o.commissionPaused ? 0 : o.commissionAmount), 0);
      result.push({
        month: months.find(m => m.value === month)?.short || '',
        commission: Math.round(commission * 100) / 100,
      });
    }
    return result;
  }, [orders, currentMonth, currentYear, userCampaigns]);

  // Calculate progress toward monthly target
  const monthlyTarget = 5000;
  const progressPercent = Math.min((totalSales / monthlyTarget) * 100, 100);



  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Payouts</h1>
            <p className="text-muted-foreground mt-1">
              {user?.name} • Current Rate: <span className="text-primary font-medium">{user?.commissionRate}%</span>
            </p>
          </div>
        </div>

        {/* Filters - Sticky */}
        <div className="sticky top-0 z-10 bg-background py-4 -mx-6 px-6 border-b border-border">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="form-select w-auto"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="form-select w-auto"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="form-select w-auto"
            >
              <option value="">All Campaigns</option>
              {userCampaigns.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Header with Progress Ring */}
        <div className="dashboard-card bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Your Commission for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-3xl font-bold text-foreground">RM {totalSales.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commission Earned</p>
                <p className="text-3xl font-bold text-success">RM {totalCommission.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-secondary"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-primary"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${progressPercent}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {Math.round(progressPercent)}%
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Target</p>
                  <p className="text-sm font-medium">RM {totalSales.toFixed(0)} / {monthlyTarget}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Earnings Trend Chart */}
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Earnings Trend (Last 6 Months)</h3>
          </div>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={earningsTrend}>
                <XAxis
                  dataKey="month"
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
                <RechartsTooltip
                  formatter={(value: number) => [`RM ${value.toFixed(2)}`, 'Commission']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Breakdown */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Campaign Breakdown</h3>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="dashboard-card">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          ) : campaignBreakdown.length === 0 ? (
            <div className="dashboard-card text-center py-8">
              <p className="text-muted-foreground">No orders found for this period</p>
            </div>
          ) : (
            campaignBreakdown.map((breakdown) => (
              <div key={breakdown.campaign.id} className={`dashboard-card cursor-pointer transition-all duration-200 hover:border-primary/50 ${expandedCampaign === breakdown.campaign.id ? 'ring-2 ring-primary/20' : ''}`}
                onClick={() => setExpandedCampaign(
                  expandedCampaign === breakdown.campaign.id ? null : breakdown.campaign.id
                )}>
                <div
                  className="flex items-center justify-between"
                >
                  <div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/campaigns/${breakdown.campaign.id}?month=${selectedMonth}&year=${selectedYear}`);
                      }}
                      className="font-medium text-foreground hover:text-primary hover:underline transition-colors text-left"
                    >
                      {breakdown.campaign.title}
                    </button>
                    <p className="text-sm text-muted-foreground">
                      {breakdown.orders.length} orders
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-success">RM {breakdown.totalCommission.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">from RM {breakdown.totalSales.toFixed(2)}</p>
                    </div>
                    {expandedCampaign === breakdown.campaign.id ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Inline Order Breakdown - Click to expand */}
                {expandedCampaign === breakdown.campaign.id && (
                  <div className="mt-4 pt-4 border-t border-border animate-in fade-in slide-in-from-top-2">

                    {/* Summary Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6 bg-muted/50 p-4 rounded-lg">
                      <div className="text-center sm:text-left">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Sales</p>
                        <p className="font-bold text-lg mt-1">RM {breakdown.totalSales.toFixed(2)}</p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Commission</p>
                        <p className="font-bold text-lg mt-1 text-success">RM {breakdown.totalCommission.toFixed(2)}</p>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1 justify-center sm:justify-start">
                          Avg Rate
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="cursor-help text-muted-foreground/70">ⓘ</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Average snapshot rate used for this campaign's orders
                            </TooltipContent>
                          </Tooltip>
                        </p>
                        <p className="font-bold text-lg mt-1">{breakdown.avgRate.toFixed(1)}%</p>
                      </div>
                    </div>

                    <h4 className="text-sm font-medium mb-3 text-muted-foreground">Order Details</h4>
                    {breakdown.orders.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic text-center py-4">No orders yet.</p>
                    ) : (
                      <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-2">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-background z-10">
                            <tr className="border-b border-border shadow-sm">
                              <th className="text-left py-2 text-muted-foreground font-medium w-24 bg-background">Ref</th>
                              <th className="text-left py-2 text-muted-foreground font-medium bg-background">Date</th>
                              <th className="text-left py-2 text-muted-foreground font-medium bg-background">Products</th>
                              <th className="text-right py-2 text-muted-foreground font-medium bg-background">Sales</th>
                              <th className="text-right py-2 text-muted-foreground font-medium bg-background">
                                <Tooltip>
                                  <TooltipTrigger>Rate</TooltipTrigger>
                                  <TooltipContent>Snapshot rate at order time</TooltipContent>
                                </Tooltip>
                              </th>
                              <th className="text-right py-2 text-muted-foreground font-medium bg-background">Commission</th>
                            </tr>
                          </thead>
                          <tbody>
                            {breakdown.orders.map((order) => (
                              <tr key={order.id} className="border-b border-border/50">
                                <td className="py-2 font-mono text-xs text-muted-foreground">{order.referenceId}</td>
                                <td className="py-2">{order.createdAt.split('T')[0]}</td>
                                <td className="py-2 text-muted-foreground text-xs">
                                  {order.products.map(p => `${p.name} (${p.qty})`).join(', ')}
                                </td>
                                <td className="py-2 text-right">RM {order.orderTotal.toFixed(2)}</td>
                                <td className="py-2 text-right text-primary">{order.snapshotRate}%</td>
                                <td className="py-2 text-right font-medium">
                                  {order.commissionPaused ? (
                                    <span className="flex items-center gap-1 justify-end text-muted-foreground">
                                      <PauseCircle className="w-3 h-3 text-amber-500" />
                                      RM 0.00
                                    </span>
                                  ) : (
                                    <span className="text-success">RM {order.commissionAmount.toFixed(2)}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="sticky bottom-0 bg-secondary/30">
                            <tr>
                              <td className="py-2 font-medium" colSpan={4}>
                                Total: RM {breakdown.totalSales.toFixed(2)} × {breakdown.avgRate.toFixed(1)}%
                              </td>
                              <td className="py-2 text-right font-bold text-success" colSpan={2}>
                                = RM {breakdown.totalCommission.toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                    <div className="mt-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/campaigns/${breakdown.campaign.id}?month=${selectedMonth}&year=${selectedYear}`);
                        }}
                        className="btn-secondary text-sm"
                      >
                        See Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PayoutsPage;
