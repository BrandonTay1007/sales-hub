import { Fragment, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ordersApi, campaignsApi, usersApi, getErrorMessage, type Order, type Campaign, type User } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Wallet, Download, Search, Filter, ChevronDown, ChevronRight, User as UserIcon, Loader2, Calendar } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const TeamPayoutsPage = () => {
  const { isAdmin } = useAuth();

  // Important: keep this component hook-simple so we don't get hook-order errors
  // if auth state flips during initial render.
  if (!isAdmin) {
    return <Navigate to="/payouts" replace />;
  }

  return <AdminTeamPayouts />;
};

const AdminTeamPayouts = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [expandedUsers, setExpandedUsers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'total' | 'name'>('total');

  const years = [2024, 2025, 2026];
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // Fetch all required data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.list();
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

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await ordersApi.list({});
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  const isLoading = usersLoading || campaignsLoading || ordersLoading;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const matchesDate =
        orderDate.getFullYear() === selectedYear &&
        orderDate.getMonth() + 1 === selectedMonth;
      return matchesDate;
    });
  }, [orders, selectedYear, selectedMonth]);

  // Calculate YTD orders for each user
  const ytdOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getFullYear() === selectedYear;
    });
  }, [orders, selectedYear]);

  const salesPersonPayouts = useMemo(() => {
    const salesUsers = users.filter((u) => u.role === 'sales');

    return salesUsers.map((salesUser) => {
      const userCampaigns = campaigns.filter(
        (c) => c.salesPersonId === salesUser.id,
      );
      const userOrders = filteredOrders.filter((o) =>
        userCampaigns.some((c) => c.id === o.campaignId),
      );
      const userYtdOrders = ytdOrders.filter((o) =>
        userCampaigns.some((c) => c.id === o.campaignId),
      );

      const totalSales = userOrders.reduce((sum, o) => sum + o.orderTotal, 0);
      const totalCommission = userOrders.reduce(
        (sum, o) => sum + (o.commissionPaused ? 0 : o.commissionAmount),
        0,
      );
      const ytdCommission = userYtdOrders.reduce(
        (sum, o) => sum + (o.commissionPaused ? 0 : o.commissionAmount),
        0,
      );

      // Group by campaign for breakdown
      const campaignBreakdown = userCampaigns
        .map((campaign) => {
          const campaignOrders = userOrders.filter(
            (o) => o.campaignId === campaign.id,
          );
          const campaignSales = campaignOrders.reduce(
            (sum, o) => sum + o.orderTotal,
            0,
          );
          const campaignCommission = campaignOrders.reduce(
            (sum, o) => sum + (o.commissionPaused ? 0 : o.commissionAmount),
            0,
          );
          return {
            campaign,
            orders: campaignOrders,
            totalSales: campaignSales,
            totalCommission: campaignCommission,
          };
        })
        .filter((b) => b.orders.length > 0);

      return {
        user: salesUser,
        totalSales,
        totalCommission,
        ytdCommission,
        orderCount: userOrders.length,
        campaignBreakdown,
        avgRate:
          userOrders.length > 0
            ? userOrders.reduce((sum, o) => sum + o.snapshotRate, 0) /
            userOrders.length
            : salesUser.commissionRate,
      };
    });
  }, [users, campaigns, filteredOrders, ytdOrders]);

  const sortedPayouts = useMemo(() => {
    return [...salesPersonPayouts].sort((a, b) => {
      if (sortBy === 'total') return b.totalCommission - a.totalCommission;
      return a.user.name.localeCompare(b.user.name);
    });
  }, [salesPersonPayouts, sortBy]);

  const totalPayout = salesPersonPayouts.reduce(
    (sum, p) => sum + p.totalCommission,
    0,
  );
  const totalSales = salesPersonPayouts.reduce((sum, p) => sum + p.totalSales, 0);

  const toggleExpanded = (userId: string) => {
    setExpandedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };



  const getAvatar = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team Payouts</h1>
            <p className="text-muted-foreground mt-1">
              Commission overview for all sales team members
            </p>
          </div>
        </div>

        {/* Sticky Filters */}
        <div className="sticky top-0 z-10 bg-background py-4 -mx-6 px-6 border-b border-border">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="form-select w-auto"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="form-select w-auto"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'total' | 'name')}
                className="form-select w-auto"
              >
                <option value="total">Total Earned</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Header */}
        <div className="dashboard-card bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">
              Team Payout for {months.find((m) => m.value === selectedMonth)?.label}{' '}
              {selectedYear}
            </h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
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
                <p className="text-sm text-muted-foreground">Total Commission Owed</p>
                <p className="text-3xl font-bold text-success">RM {totalPayout.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Team Members</p>
                <p className="text-3xl font-bold text-foreground">
                  {sortedPayouts.filter((p) => p.orderCount > 0).length}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Team Members Table with Inline Expansion */}
        <div className="dashboard-card overflow-hidden p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="table-header w-8"></th>
                  <th className="table-header">Sales Person</th>
                  <th className="table-header text-right">
                    <Tooltip>
                      <TooltipTrigger>This Month</TooltipTrigger>
                      <TooltipContent>Commission for selected month</TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="table-header text-right">
                    <Tooltip>
                      <TooltipTrigger>YTD</TooltipTrigger>
                      <TooltipContent>Year-to-date commission</TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="table-header text-right">
                    <Tooltip>
                      <TooltipTrigger>Avg Rate</TooltipTrigger>
                      <TooltipContent>
                        Average snapshot rate for this month's orders
                      </TooltipContent>
                    </Tooltip>
                  </th>
                  <th className="table-header text-center">Orders</th>
                </tr>
              </thead>
              <tbody>
                {sortedPayouts.map((payout) => {
                  const isExpanded = expandedUsers.includes(payout.user.id);
                  return (
                    <Fragment key={payout.user.id}>
                      <tr
                        className={`table-row cursor-pointer hover:bg-secondary/50 ${isExpanded ? 'bg-secondary/30' : ''
                          }`}
                        onClick={() => toggleExpanded(payout.user.id)}
                      >
                        <td className="table-cell">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                              {getAvatar(payout.user.name)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{payout.user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Current Rate: {payout.user.commissionRate}%
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell text-right">
                          <span className="text-lg font-bold text-success">
                            RM {payout.totalCommission.toFixed(2)}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            from RM {payout.totalSales.toFixed(2)}
                          </p>
                        </td>
                        <td className="table-cell text-right font-medium">
                          RM {payout.ytdCommission.toFixed(2)}
                        </td>
                        <td className="table-cell text-right">
                          <span className="text-primary font-medium">
                            {payout.avgRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="table-cell text-center">{payout.orderCount}</td>
                      </tr>

                      {/* Inline Expanded Details */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0">
                            <div className="bg-secondary/20 px-6 py-4 border-y border-border">
                              <h4 className="text-sm font-semibold text-foreground mb-3">
                                Campaign Breakdown
                              </h4>
                              {payout.campaignBreakdown.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                  No orders this month
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {payout.campaignBreakdown.map((breakdown) => (
                                    <div
                                      key={breakdown.campaign.id}
                                      className="bg-background rounded-lg p-3 border border-border cursor-pointer hover:bg-secondary/30 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/campaigns/${breakdown.campaign.id}?month=${selectedMonth}&year=${selectedYear}`);
                                      }}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-foreground hover:text-primary flex items-center gap-2">
                                          <span className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                                            {breakdown.campaign.referenceId}
                                          </span>
                                          {breakdown.campaign.title}
                                        </span>
                                        <span className="text-success font-semibold">
                                          RM {breakdown.totalCommission.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        <span>
                                          Sales: RM {breakdown.totalSales.toFixed(2)}
                                        </span>
                                        <span className="mx-2">•</span>
                                        <span>{breakdown.orders.length} orders</span>
                                        <span className="mx-2">•</span>
                                        <Tooltip>
                                          <TooltipTrigger className="underline decoration-dotted">
                                            Formula
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              RM {breakdown.totalSales.toFixed(2)} ×{' '}
                                              {payout.user.commissionRate}% = RM{' '}
                                              {breakdown.totalCommission.toFixed(2)}
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamPayoutsPage;
