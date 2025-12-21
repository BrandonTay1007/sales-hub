import { useState, useMemo } from 'react';
import { type Order, type Campaign } from '@/lib/api';

export type SortOption = 'latest' | 'oldest' | 'highest' | 'lowest';
export type QuickFilterOption = 'all' | 'week' | 'month';

interface UseOrderFiltersProps {
    orders: Order[];
    campaignsMap?: Map<string, Campaign>;
    isAdmin?: boolean;
    userCampaigns?: Campaign[];
}

export const useOrderFilters = ({
    orders,
    campaignsMap,
    isAdmin = false,
    userCampaigns = [],
}: UseOrderFiltersProps) => {
    const [filterCampaign, setFilterCampaign] = useState('');
    const [filterSalesPerson, setFilterSalesPerson] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [quickFilter, setQuickFilter] = useState<QuickFilterOption>('all');
    const [sortBy, setSortBy] = useState<SortOption>('latest');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOrders = useMemo(() => {
        let filtered = isAdmin
            ? orders
            : orders.filter(o => userCampaigns.some(c => c.id === o.campaignId));

        // If no userCampaigns provided and not admin (e.g. specialized view like CampaignDetail), 
        // we assume the orders passed in are already authorized/filtered for that view context,
        // unless userCampaigns is explicitly passed for permission checking.
        // However, keeping logic consistent with OrdersPage:
        if (!isAdmin && userCampaigns.length === 0 && orders.length > 0) {
            // Corner case: if userCampaigns is empty but we have orders? 
            // In OrdersPage it filters. 
            // For generic use, if userCampaigns is not provided, we might want to skip this check
            // or assume the component handles data scope. 
            // Let's stick to the OrdersPage logic: if userCampaigns IS provided, use it.
            // If not provided (length 0), we might just return orders if that matches intent.
            // But standard OrdersPage passes userUserCampaigns. 
        }

        // Apply strict search first if exists
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(o =>
                (o.referenceId && o.referenceId.toLowerCase().includes(searchLower)) ||
                o.products.some(p => p.name.toLowerCase().includes(searchLower))
            );
        }

        // Applying quick filters
        const now = new Date();
        if (quickFilter === 'week') {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            filtered = filtered.filter(o => new Date(o.createdAt) >= weekAgo);
        } else if (quickFilter === 'month') {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            filtered = filtered.filter(o => new Date(o.createdAt) >= monthStart);
        }

        // Apply other filters
        filtered = filtered.filter(order => {
            if (filterCampaign && order.campaignId !== filterCampaign) return false;

            if (filterSalesPerson && campaignsMap) {
                const campaign = campaignsMap.get(order.campaignId);
                if (!campaign || campaign.salesPersonId !== filterSalesPerson) return false;
            }

            const orderDate = order.createdAt.split('T')[0];
            if (filterDateFrom && orderDate < filterDateFrom) return false;
            if (filterDateTo && orderDate > filterDateTo) return false;

            return true;
        });

        // Apply sorting
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'latest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'highest':
                    return b.orderTotal - a.orderTotal;
                case 'lowest':
                    return a.orderTotal - b.orderTotal;
                default:
                    return 0;
            }
        });
    }, [
        orders,
        filterCampaign,
        filterSalesPerson,
        filterDateFrom,
        filterDateTo,
        quickFilter,
        sortBy,
        searchTerm,
        isAdmin,
        userCampaigns,
        campaignsMap
    ]);

    const clearFilters = () => {
        setFilterCampaign('');
        setFilterSalesPerson('');
        setFilterDateFrom('');
        setFilterDateTo('');
        setQuickFilter('all');
        setSearchTerm('');
    };

    const hasFilters = !!(filterCampaign || filterSalesPerson || filterDateFrom || filterDateTo || quickFilter !== 'all' || searchTerm);

    return {
        filteredOrders,
        filters: {
            campaign: filterCampaign,
            salesPerson: filterSalesPerson,
            dateFrom: filterDateFrom,
            dateTo: filterDateTo,
            quick: quickFilter,
            sortBy,
            search: searchTerm
        },
        setters: {
            setCampaign: setFilterCampaign,
            setSalesPerson: setFilterSalesPerson,
            setDateFrom: setFilterDateFrom,
            setDateTo: setFilterDateTo,
            setQuick: setQuickFilter,
            setSortBy,
            setSearch: setSearchTerm
        },
        clearFilters,
        hasFilters
    };
};
