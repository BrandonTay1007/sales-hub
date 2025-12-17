import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { orders, campaigns, users } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

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
    // Get campaigns assigned to current user (for non-admin)
    const userCampaignIds = isAdmin 
      ? campaigns.map(c => c.id)
      : campaigns.filter(c => c.assignedSalesPersonId === user?.id).map(c => c.id);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const matchesDate = orderDate.getFullYear() === selectedYear && 
                         (orderDate.getMonth() + 1) === selectedMonth;
      const matchesCampaign = userCampaignIds.includes(order.campaignId);
      return matchesDate && matchesCampaign;
    });
  }, [selectedYear, selectedMonth, user?.id, isAdmin]);

  const totalSales = filteredOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const totalCommission = filteredOrders.reduce((sum, o) => sum + o.commissionAmount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Payouts</h1>
          <p className="text-muted-foreground mt-1">View your commission earnings</p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Sales</span>
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">${totalSales.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{filteredOrders.length} orders</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Commission Earned</span>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-3xl font-bold text-success">${totalCommission.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">
              {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </p>
          </div>
        </div>

        <div className="dashboard-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Campaign</th>
                  <th className="table-header text-right">Order Value</th>
                  <th className="table-header text-right">Rate Applied</th>
                  <th className="table-header text-right">Commission</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-cell text-center text-muted-foreground py-8">
                      No orders found for this period
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const campaign = campaigns.find(c => c.id === order.campaignId);
                    return (
                      <tr key={order.id} className="table-row">
                        <td className="table-cell">{order.createdAt}</td>
                        <td className="table-cell font-medium">{campaign?.title}</td>
                        <td className="table-cell text-right">${order.orderTotal.toFixed(2)}</td>
                        <td className="table-cell text-right">
                          <span className="badge-sales">{order.snapshotRate}%</span>
                        </td>
                        <td className="table-cell text-right font-semibold text-success">
                          ${order.commissionAmount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PayoutsPage;
