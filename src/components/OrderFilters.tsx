import { Filter, Search, ArrowUpDown } from 'lucide-react';
import { type Campaign, type User } from '@/lib/api';
import { type SortOption, type QuickFilterOption } from '@/hooks/useOrderFilters';

interface OrderFiltersProps {
    filters: {
        campaign: string;
        salesPerson: string;
        dateFrom: string;
        dateTo: string;
        quick: QuickFilterOption;
        sortBy: SortOption;
        search: string;
    };
    setters: {
        setCampaign: (value: string) => void;
        setSalesPerson: (value: string) => void;
        setDateFrom: (value: string) => void;
        setDateTo: (value: string) => void;
        setQuick: (value: QuickFilterOption) => void;
        setSortBy: (value: SortOption) => void;
        setSearch: (value: string) => void;
    };
    onClear: () => void;
    hasFilters: boolean;
    isAdmin: boolean;
    userCampaigns: Campaign[];
    salesUsers: User[];
    showCampaignFilter?: boolean; // Sometimes unnecessary (e.g. Campaign Detail Page)
    className?: string;
}

export const OrderFilters = ({
    filters,
    setters,
    onClear,
    hasFilters,
    isAdmin,
    userCampaigns,
    salesUsers,
    showCampaignFilter = true,
    className = '',
}: OrderFiltersProps) => {
    return (
        <div className={`dashboard-card ${className}`}>
            <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">Filters</span>
                {hasFilters && (
                    <button onClick={onClear} className="text-xs text-primary hover:underline ml-auto">
                        Clear all
                    </button>
                )}
            </div>

            {/* Search and Quick Filters */}
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search ref ID or product..."
                            value={filters.search}
                            onChange={(e) => setters.setSearch(e.target.value)}
                            className="form-input pl-9"
                        />
                    </div>

                    <div className="flex w-full md:w-auto gap-2 bg-secondary/20 p-1 rounded-lg">
                        <button
                            onClick={() => setters.setQuick('all')}
                            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filters.quick === 'all'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            All Time
                        </button>
                        <button
                            onClick={() => setters.setQuick('week')}
                            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filters.quick === 'week'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setters.setQuick('month')}
                            className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-all ${filters.quick === 'month'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            This Month
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap lg:flex-nowrap gap-3">
                {showCampaignFilter && (
                    <div className="w-full sm:w-auto flex-1 min-w-0">
                        <label className="form-label">Campaign</label>
                        <select
                            value={filters.campaign}
                            onChange={(e) => setters.setCampaign(e.target.value)}
                            className="form-select"
                        >
                            <option value="">All Campaigns</option>
                            {userCampaigns.map(campaign => (
                                <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
                            ))}
                        </select>
                    </div>
                )}

                {isAdmin && (
                    <div className="w-full sm:w-auto flex-1 min-w-0">
                        <label className="form-label">Sales Person</label>
                        <select
                            value={filters.salesPerson}
                            onChange={(e) => setters.setSalesPerson(e.target.value)}
                            className="form-select"
                        >
                            <option value="">All Sales People</option>
                            {salesUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="w-full sm:w-auto flex-1 min-w-0">
                    <label className="form-label">From Date</label>
                    <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setters.setDateFrom(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="w-full sm:w-auto flex-1 min-w-0">
                    <label className="form-label">To Date</label>
                    <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setters.setDateTo(e.target.value)}
                        className="form-input"
                    />
                </div>

                <div className="w-full sm:w-auto flex-1 min-w-0 relative">
                    <label className="form-label flex items-center gap-1">
                        Sort <ArrowUpDown className="w-3 h-3" />
                    </label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => setters.setSortBy(e.target.value as SortOption)}
                        className="form-select"
                    >
                        <option value="latest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Value</option>
                        <option value="lowest">Lowest Value</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
