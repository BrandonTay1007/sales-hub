import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { orders, campaigns, users } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const PayoutsPage = () => {
  const { user, isAdmin } = useAuth();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

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

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const matchesDate = orderDate.getFullYear() === selectedYear && 
                         (orderDate.getMonth() + 1) === selectedMonth;
      const isActive = order.status === 'active';
      return matchesDate && isActive;
    });
  }, [selectedYear, selectedMonth]);

  // Group orders by sales person for accordion view
  const salesPersonPayouts = useMemo(() => {
    const salesUsers = users.filter(u => u.role === 'sales');
    
    return salesUsers.map(salesUser => {
      const userCampaigns = campaigns.filter(c => c.assignedSalesPersonId === salesUser.id);
      const userOrders = filteredOrders.filter(o => 
        userCampaigns.some(c => c.id === o.campaignId)
      );
      
      const totalSales = userOrders.reduce((sum, o) => sum + o.orderTotal, 0);
      const totalCommission = userOrders.reduce((sum, o) => sum + o.commissionAmount, 0);

      // Group by campaign for breakdown
      const campaignBreakdown = userCampaigns.map(campaign => {
        const campaignOrders = userOrders.filter(o => o.campaignId === campaign.id);
        const campaignSales = campaignOrders.reduce((sum, o) => sum + o.orderTotal, 0);
        const campaignCommission = campaignOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
        return {
          campaign,
          orders: campaignOrders,
          totalSales: campaignSales,
          totalCommission: campaignCommission,
        };
      }).filter(b => b.orders.length > 0);

      return {
        user: salesUser,
        totalSales,
        totalCommission,
        orderCount: userOrders.length,
        campaignBreakdown,
      };
    }).filter(p => p.orderCount > 0 || isAdmin);
  }, [filteredOrders, isAdmin]);

  // For non-admin, filter to only their data
  const displayPayouts = isAdmin 
    ? salesPersonPayouts 
    : salesPersonPayouts.filter(p => p.user.id === user?.id);

  const totalPayout = displayPayouts.reduce((sum, p) => sum + p.totalCommission, 0);
  const totalSales = displayPayouts.reduce((sum, p) => sum + p.totalSales, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payout Report</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? 'Commission breakdown by sales person' : 'Your commission earnings'}
          </p>
        </div>

        {/* Sticky Year/Month Picker */}
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
          </div>
        </div>

        {/* Summary Header */}
        <div className="dashboard-card bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Total Payout for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-3xl font-bold text-foreground">RM {totalSales.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Commission</p>
              <p className="text-3xl font-bold text-success">RM {totalPayout.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Sales Person Accordion */}
        {displayPayouts.length === 0 ? (
          <div className="dashboard-card text-center py-12">
            <p className="text-muted-foreground">No orders found for this period</p>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {displayPayouts.map((payout) => (
              <AccordionItem 
                key={payout.user.id} 
                value={payout.user.id}
                className="dashboard-card overflow-hidden border-0"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-secondary/30">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                        {payout.user.avatar}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">{payout.user.name}</p>
                        <p className="text-sm text-muted-foreground">{payout.orderCount} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-success">RM {payout.totalCommission.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">from RM {payout.totalSales.toFixed(2)}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 mt-2">
                    {payout.campaignBreakdown.map((breakdown) => (
                      <div key={breakdown.campaign.id} className="border border-border rounded-lg overflow-hidden">
                        <div className="bg-secondary/30 px-4 py-3 flex items-center justify-between">
                          <span className="font-medium text-foreground">{breakdown.campaign.title}</span>
                          <span className="text-success font-semibold">RM {breakdown.totalCommission.toFixed(2)}</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-secondary/20">
                              <tr>
                                <th className="table-header text-xs">Date</th>
                                <th className="table-header text-xs text-right">Sales</th>
                                <th className="table-header text-xs text-right">Rate</th>
                                <th className="table-header text-xs text-right">Commission</th>
                              </tr>
                            </thead>
                            <tbody>
                              {breakdown.orders.map((order) => (
                                <tr key={order.id} className="border-t border-border">
                                  <td className="table-cell text-sm py-2">{order.createdAt}</td>
                                  <td className="table-cell text-sm py-2 text-right">RM {order.orderTotal.toFixed(2)}</td>
                                  <td className="table-cell text-sm py-2 text-right text-primary">{order.snapshotRate}%</td>
                                  <td className="table-cell text-sm py-2 text-right font-medium text-success">
                                    RM {order.commissionAmount.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-secondary/10">
                              <tr>
                                <td className="table-cell text-sm py-2 font-medium">Formula</td>
                                <td colSpan={3} className="table-cell text-sm py-2 text-right text-muted-foreground">
                                  RM {breakdown.totalSales.toFixed(2)} × {payout.user.commissionRate}% = <span className="text-success font-semibold">RM {breakdown.totalCommission.toFixed(2)}</span>
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PayoutsPage;
