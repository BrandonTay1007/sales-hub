import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { ordersApi, campaignsApi, usersApi, getErrorMessage } from '@/lib/api';
import { Trophy, Facebook, Instagram, ArrowLeft, Loader2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

type ViewMode = 'salesPerson' | 'campaign';
type TimeRange = 'month' | 'year' | 'all';

const LeaderboardPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialView = searchParams.get('view') === 'salesPerson' ? 'salesPerson' : 'campaign';
    const [view, setView] = useState<ViewMode>(initialView);
    const [timeRange, setTimeRange] = useState<TimeRange>('month'); // Default to month

    // Fetch Data
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

    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await usersApi.list();
            if (!response.success) throw new Error(getErrorMessage(response));
            return response.data || [];
        },
    });

    const isLoading = ordersLoading || campaignsLoading || usersLoading;

    // Filter Data by Time Range
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
        const currentYear = now.getFullYear().toString();

        return orders.filter(order => {
            if (timeRange === 'month') return order.createdAt.startsWith(currentMonth);
            if (timeRange === 'year') return order.createdAt.startsWith(currentYear);
            return true;
        });
    }, [orders, timeRange]);

    // Calculate Leaderboards
    const { leaderboard, campaignLeaderboard } = useMemo(() => {
        // 1. Sales Person Leaderboard
        const salesStats = new Map<string, {
            id: string;
            name: string;
            avatar: string;
            commissionRate: number;
            orderCount: number;
            totalRevenue: number;
            totalCommission: number;
        }>();

        // Initialize with all sales users (so even those with 0 sales show up)
        users.filter(u => u.role === 'sales').forEach(u => {
            salesStats.set(u.id, {
                id: u.id,
                name: u.name,
                avatar: u.name.substring(0, 2).toUpperCase(),
                commissionRate: u.commissionRate,
                orderCount: 0,
                totalRevenue: 0,
                totalCommission: 0,
            });
        });

        // 2. Campaign Leaderboard
        const campaignStats = new Map<string, {
            id: string;
            title: string;
            platform: 'facebook' | 'instagram';
            salesPersonName: string;
            revenue: number;
        }>();

        campaigns.forEach(c => {
            const salesPerson = users.find(u => u.id === c.salesPersonId);
            campaignStats.set(c.id, {
                id: c.id,
                title: c.title,
                platform: c.platform,
                salesPersonName: salesPerson?.name || 'Unknown',
                revenue: 0,
            });
        });

        // Aggregate Orders
        filteredOrders.forEach(order => {
            // Find Campaign
            const campaign = campaigns.find(c => c.id === order.campaignId);
            if (!campaign) return;

            // Update Campaign Stats
            const cStats = campaignStats.get(campaign.id);
            if (cStats) {
                cStats.revenue += order.orderTotal;
            }

            // Update Sales Person Stats
            const sStats = salesStats.get(campaign.salesPersonId);
            if (sStats) {
                sStats.orderCount += 1;
                sStats.totalRevenue += order.orderTotal;
                sStats.totalCommission += order.commissionAmount;
            }
        });

        // Convert to Array & Sort
        const sortedSalesLeaderboard = Array.from(salesStats.values())
            .map(s => ({
                ...s,
                avgOrderValue: s.orderCount > 0 ? s.totalRevenue / s.orderCount : 0,
            }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue);

        const sortedCampaignLeaderboard = Array.from(campaignStats.values())
            .sort((a, b) => b.revenue - a.revenue);

        return {
            leaderboard: sortedSalesLeaderboard,
            campaignLeaderboard: sortedCampaignLeaderboard,
        };
    }, [filteredOrders, campaigns, users]);

    const getPlatformIcon = (platform: string) => {
        return platform === 'facebook' ? (
            <Facebook className="w-4 h-4 text-[#1877F2]" />
        ) : (
            <Instagram className="w-4 h-4 text-[#E4405F]" />
        );
    };

    const getAvatar = (name: string) => name.substring(0, 2).toUpperCase();

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/analytics')}
                            className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-warning" />
                                <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
                            </div>
                            <p className="text-muted-foreground mt-1">Performance rankings</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Time Range Filter */}
                        <div className="flex items-center bg-secondary rounded-lg p-1">
                            <button
                                onClick={() => setTimeRange('month')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${timeRange === 'month'
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                This Month
                            </button>
                            <button
                                onClick={() => setTimeRange('year')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${timeRange === 'year'
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                YTD
                            </button>
                            <button
                                onClick={() => setTimeRange('all')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${timeRange === 'all'
                                    ? 'bg-background shadow-sm text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                All Time
                            </button>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-2 p-1 bg-secondary rounded-lg">
                            <button
                                onClick={() => setView('salesPerson')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'salesPerson'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Sales Persons
                            </button>
                            <button
                                onClick={() => setView('campaign')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'campaign'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Campaigns
                            </button>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Content */}
                <motion.div
                    key={`${view}-${timeRange}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="dashboard-card"
                >
                    <div className="space-y-3">
                        {view === 'salesPerson' ? (
                            // Sales Person View
                            leaderboard.length > 0 ? (
                                leaderboard.map((person, index) => (
                                    <div key={person.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-secondary/30">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-warning text-warning-foreground' :
                                                index === 1 ? 'bg-muted text-muted-foreground' :
                                                    index === 2 ? 'bg-orange-600 text-white' : 'bg-secondary text-secondary-foreground'
                                                }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                                                {person.avatar}
                                            </div>
                                            <div className="flex-1 min-w-[120px]">
                                                <p className="font-medium text-foreground truncate">{person.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {person.orderCount} orders • {person.commissionRate}% rate
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end flex-1 gap-4 sm:gap-8 ml-14 sm:ml-0">
                                            <div className="text-left sm:text-right hidden sm:block">
                                                <p className="text-sm text-muted-foreground">Avg Order</p>
                                                <p className="font-medium text-foreground">RM {person.avgOrderValue.toFixed(2)}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-foreground">RM {person.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                <p className="text-sm text-success">+RM {person.totalCommission.toFixed(2)} commission</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    No sales data found for this period.
                                </div>
                            )
                        ) : (
                            // Campaign View
                            campaignLeaderboard.length > 0 ? (
                                campaignLeaderboard.map((campaign, index) => (
                                    <div
                                        key={campaign.id}
                                        onClick={() => navigate(`/campaigns/${campaign.id}`)}
                                        className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
                                    >
                                        <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-warning text-warning-foreground' :
                                            index === 1 ? 'bg-muted text-muted-foreground' :
                                                index === 2 ? 'bg-orange-600 text-white' : 'bg-secondary text-secondary-foreground'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {getPlatformIcon(campaign.platform)}
                                                <p className="font-medium text-foreground truncate">{campaign.title}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">{campaign.salesPersonName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-foreground">RM {campaign.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    No campaign data found for this period.
                                </div>
                            )
                        )}
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
};

export default LeaderboardPage;
