import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { orders, campaigns, users } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Calendar, Download, MessageSquare, TrendingUp, Target, ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  const [disputeNotes, setDisputeNotes] = useState('');

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

  // Get user's campaigns
  const userCampaigns = campaigns.filter(c => c.assignedSalesPersonId === user?.id);

  // Get user's orders for selected month
  const userMonthOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const matchesDate = orderDate.getFullYear() === selectedYear &&
        (orderDate.getMonth() + 1) === selectedMonth;
      const isActive = order.status === 'active';
      const belongsToUser = userCampaigns.some(c => c.id === order.campaignId);
      const matchesCampaign = !filterCampaign || order.campaignId === filterCampaign;
      return matchesDate && isActive && belongsToUser && matchesCampaign;
    });
  }, [selectedYear, selectedMonth, userCampaigns, filterCampaign]);

  // Calculate totals
  const totalSales = userMonthOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const totalCommission = userMonthOrders.reduce((sum, o) => sum + o.commissionAmount, 0);

  // Group orders by campaign
  const campaignBreakdown = useMemo(() => {
    return userCampaigns.map(campaign => {
      const campaignOrders = userMonthOrders.filter(o => o.campaignId === campaign.id);
      const campaignSales = campaignOrders.reduce((sum, o) => sum + o.orderTotal, 0);
      const campaignCommission = campaignOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
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
    }).filter(b => !filterCampaign || b.campaign.id === filterCampaign);
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
        const isActive = order.status === 'active';
        const belongsToUser = userCampaigns.some(c => c.id === order.campaignId);
        return matchesDate && isActive && belongsToUser;
      });

      const commission = monthOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
      result.push({
        month: months.find(m => m.value === month)?.short || '',
        commission: Math.round(commission * 100) / 100,
      });
    }
    return result;
  }, [currentMonth, currentYear, userCampaigns]);

  // Calculate progress toward monthly target
  const monthlyTarget = user?.monthlyTarget || 5000;
  const progressPercent = Math.min((totalSales / monthlyTarget) * 100, 100);

  const handleDispute = () => {
    toast.success('Dispute submitted', {
      description: 'Admin will review your submission',
    });
    setDisputeNotes('');
  };

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
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <button className="btn-secondary">
                  <MessageSquare className="w-4 h-4" />
                  Dispute
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dispute Payout</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    If you believe there's an error in your commission calculation, please describe the issue below.
                  </p>
                  <textarea
                    value={disputeNotes}
                    onChange={(e) => setDisputeNotes(e.target.value)}
                    placeholder="Describe the issue..."
                    className="form-input min-h-[100px]"
                  />
                  <button onClick={handleDispute} className="btn-primary w-full" disabled={!disputeNotes.trim()}>
                    Submit Dispute
                  </button>
                </div>
              </DialogContent>
            </Dialog>
            <button className="btn-secondary">
              <Download className="w-4 h-4" />
              Export
            </button>
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

        {/* Campaign Breakdown - Flat List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Campaign Breakdown</h3>

          {campaignBreakdown.length === 0 ? (
            <div className="dashboard-card text-center py-8">
              <p className="text-muted-foreground">No orders found for this period</p>
            </div>
          ) : (
            campaignBreakdown.map((breakdown) => (
              <div key={breakdown.campaign.id} className="dashboard-card">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedCampaign(
                    expandedCampaign === breakdown.campaign.id ? null : breakdown.campaign.id
                  )}
                >
                  <div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${breakdown.campaign.id}`); }}
                      className="font-medium text-foreground hover:text-primary hover:underline transition-colors text-left"
                    >
                      {breakdown.campaign.title}
                    </button>
                    <p className="text-sm text-muted-foreground">
                      {breakdown.orders.length} orders •
                      <Tooltip>
                        <TooltipTrigger className="ml-1 underline decoration-dotted">
                          Avg Rate: {breakdown.avgRate.toFixed(1)}%
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Average snapshot rate used for this campaign's orders</p>
                        </TooltipContent>
                      </Tooltip>
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
                {expandedCampaign === breakdown.campaign.id && breakdown.orders.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Order Details</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                            <th className="text-left py-2 text-muted-foreground font-medium">Products</th>
                            <th className="text-right py-2 text-muted-foreground font-medium">Sales</th>
                            <th className="text-right py-2 text-muted-foreground font-medium">
                              <Tooltip>
                                <TooltipTrigger>Rate</TooltipTrigger>
                                <TooltipContent>Snapshot rate at order time</TooltipContent>
                              </Tooltip>
                            </th>
                            <th className="text-right py-2 text-muted-foreground font-medium">Commission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {breakdown.orders.map((order) => (
                            <tr key={order.id} className="border-b border-border/50">
                              <td className="py-2">{order.createdAt}</td>
                              <td className="py-2 text-muted-foreground text-xs">
                                {order.products.map(p => `${p.name} (${p.qty})`).join(', ')}
                              </td>
                              <td className="py-2 text-right">RM {order.orderTotal.toFixed(2)}</td>
                              <td className="py-2 text-right text-primary">{order.snapshotRate}%</td>
                              <td className="py-2 text-right font-medium text-success">
                                RM {order.commissionAmount.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-secondary/30">
                            <td className="py-2 font-medium" colSpan={3}>
                              Total: RM {breakdown.totalSales.toFixed(2)} × {breakdown.avgRate.toFixed(1)}%
                            </td>
                            <td className="py-2 text-right font-bold text-success" colSpan={2}>
                              = RM {breakdown.totalCommission.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div className="mt-4 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/campaigns/${breakdown.campaign.id}`); }}
                        className="btn-secondary text-sm"
                      >
                        See Details
                      </button>
                    </div>
                  </div>
                )}

                {breakdown.orders.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {expandedCampaign === breakdown.campaign.id ? 'Click to collapse' : 'Click to see order details'}
                  </p>
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
