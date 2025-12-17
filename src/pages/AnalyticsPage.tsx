import { DashboardLayout } from '@/components/DashboardLayout';
import { getLeaderboard, getRevenueByType, getTopProducts, getTopCampaigns, getCumulativeRevenue } from '@/lib/mockData';
import { Trophy, TrendingUp, Package, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';

const AnalyticsPage = () => {
  const leaderboard = getLeaderboard();
  const revenueByType = getRevenueByType();
  const topProducts = getTopProducts();
  const topCampaigns = getTopCampaigns(5);
  const cumulativeRevenue = getCumulativeRevenue();

  const currentMonthRevenue = cumulativeRevenue[11]?.revenue || 0;
  const projectedNextMonth = Math.round(currentMonthRevenue * 1.15 * 100) / 100;

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
              <p className="text-2xl font-bold text-foreground">RM {projectedNextMonth.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Based on current growth rate (+15%)</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <div className="dashboard-card">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-semibold text-foreground">Sales Leaderboard</h2>
            </div>
            <div className="space-y-3">
              {leaderboard.map((person, index) => (
                <div key={person.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-warning text-warning-foreground' :
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
              ))}
            </div>
          </div>

          {/* Revenue by Campaign Type */}
          <div className="dashboard-card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Revenue by Type</h2>
            </div>
            <div className="h-[250px]">
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
            </div>
          </div>

          {/* Top Products */}
          <div className="dashboard-card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-foreground">Top Selling Products</h2>
            </div>
            <div className="space-y-2">
              {topProducts.slice(0, 6).map((product, index) => (
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
              ))}
            </div>
          </div>

          {/* YTD Revenue */}
          <div className="dashboard-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">Cumulative Revenue (YTD)</h2>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeRevenue}>
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => [`RM ${v.toFixed(2)}`, 'Cumulative']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="cumulative" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
