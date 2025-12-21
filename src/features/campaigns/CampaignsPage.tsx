import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { campaignsApi, usersApi, ordersApi, type Campaign, type User, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Facebook, Instagram, Edit2, ExternalLink, Lock, Filter, Trash2, Loader2, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StopCircle, RefreshCcw } from 'lucide-react';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';

interface CampaignFormData {
  title: string;
  platform: 'facebook' | 'instagram';
  type: 'post' | 'live' | 'event';
  url: string;
  salesPersonId: string;
  startDate?: string;
}

const CampaignsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSalesPerson, setFilterSalesPerson] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'week' | 'month'>('all');

  // Delete confirmation state
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; timer: ReturnType<typeof setTimeout> } | null>(null);

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await campaignsApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  // Fetch users for sales person filter and display
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
    enabled: isAdmin, // Only fetch for admin - sales persons get 403
  });

  // Fetch orders for revenue calculation
  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await ordersApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  const salesUsers = allUsers.filter(u => u.role === 'sales');

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await campaignsApi.create({
        title: data.title,
        platform: data.platform,
        type: data.type,
        url: data.url,
        salesPersonId: data.salesPersonId,
        startDate: data.startDate,
      });
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setIsModalOpen(false);
      toast.success('Campaign created successfully!');
    },
    onError: (error: Error) => {
      toast.error('Failed to create campaign', { description: error.message });
    },
  });

  // Update campaign mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CampaignFormData> }) => {
      const response = await campaignsApi.update(id, {
        title: data.title,
        platform: data.platform,
        type: data.type,
        url: data.url,
        startDate: data.startDate,
      });
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setIsModalOpen(false);
      setEditingCampaign(null);
      toast.success('Campaign updated successfully!');
    },
    onError: (error: Error) => {
      toast.error('Failed to update campaign', { description: error.message });
    },
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await campaignsApi.delete(id);
      if (!response.success) throw new Error(getErrorMessage(response));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Campaign deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete campaign', { description: error.message });
    },
  });

  // Calculate campaign revenue from orders
  const getCampaignRevenue = (campaignId: string) => {
    return orders
      .filter(o => o.campaignId === campaignId)
      .reduce((sum, o) => sum + o.orderTotal, 0);
  };

  // Calculate campaign commission from orders
  const getCampaignCommission = (campaignId: string) => {
    return orders
      .filter(o => o.campaignId === campaignId)
      .reduce((sum, o) => sum + o.commissionAmount, 0);
  };

  // Filter logic
  const filteredCampaigns = useMemo(() => {
    // Role-based filtering: sales sees only their campaigns
    let filtered = isAdmin
      ? campaigns
      : campaigns.filter(c => c.salesPersonId === user?.id);

    // Apply strict search first if exists
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchLower) ||
        (c.referenceId && c.referenceId.toLowerCase().includes(searchLower))
      );
    }

    // Helper to get effective date for filtering (prefer startDate, fallback to createdAt)
    const getEffectiveDate = (c: Campaign) => {
      if (c.startDate) return new Date(c.startDate);
      return new Date(c.createdAt);
    };

    // Quick Filters (Robust Date Logic - Overlap)
    const now = new Date();
    const windowEnd = new Date(now);
    windowEnd.setHours(23, 59, 59, 999);

    if (quickFilter === 'week') {
      const windowStart = new Date(now);
      windowStart.setDate(windowStart.getDate() - 7);
      windowStart.setHours(0, 0, 0, 0);

      filtered = filtered.filter(c => {
        const start = getEffectiveDate(c);
        const end = c.endDate ? new Date(c.endDate) : null;
        return start <= windowEnd && (!end || end >= windowStart);
      });
    } else if (quickFilter === 'month') {
      const windowStart = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(c => {
        const start = getEffectiveDate(c);
        const end = c.endDate ? new Date(c.endDate) : null;
        return start <= windowEnd && (!end || end >= windowStart);
      });
    }

    // Explicit Filters
    filtered = filtered.filter(campaign => {
      if (filterSalesPerson && campaign.salesPersonId !== filterSalesPerson) return false;
      if (filterPlatform && campaign.platform !== filterPlatform) return false;
      if (filterStatus && campaign.status !== filterStatus) return false;

      const campaignDate = getEffectiveDate(campaign).toISOString().split('T')[0];
      if (filterDateFrom && campaignDate < filterDateFrom) return false;
      if (filterDateTo && campaignDate > filterDateTo) return false;
      return true;
    });

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [campaigns, isAdmin, user?.id, searchTerm, filterSalesPerson, filterPlatform, filterStatus, filterDateFrom, filterDateTo, quickFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSalesPerson('');
    setFilterPlatform('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setQuickFilter('all');
  };

  const hasFilters = searchTerm || filterSalesPerson || filterPlatform || filterStatus || filterDateFrom || filterDateTo || quickFilter !== 'all';

  const handleCreateClick = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  const handleModalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDateValue = formData.get('startDate') as string;
    const data: CampaignFormData = {
      title: formData.get('title') as string,
      platform: formData.get('platform') as 'facebook' | 'instagram',
      type: formData.get('type') as 'post' | 'live' | 'event',
      url: formData.get('url') as string,
      salesPersonId: formData.get('salesPersonId') as string || editingCampaign?.salesPersonId || '',
      startDate: startDateValue || undefined,
    };

    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const deleteCampaign = (campaignId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteCampaignId(campaignId);
  };

  const confirmDeleteCampaign = () => {
    if (!deleteCampaignId) return;
    const campaignId = deleteCampaignId;
    setDeleteCampaignId(null);

    let timer: NodeJS.Timeout;

    // Show undo toast with 5-second window
    const toastId = toast('Campaign will be deleted in 5 seconds', {
      action: {
        label: 'Undo',
        onClick: () => {
          clearTimeout(timer);
          setPendingDelete(null);
          toast.dismiss(toastId);
          toast.info('Deletion cancelled');
        },
      },
      duration: 5000,
    });

    // Set timeout for actual deletion after 5 seconds
    timer = setTimeout(() => {
      deleteMutation.mutate(campaignId);
      setPendingDelete(null);
    }, 5000);

    setPendingDelete({ id: campaignId, timer });
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'facebook' ? (
      <Facebook className="w-4 h-4 text-[#1877F2]" />
    ) : (
      <Instagram className="w-4 h-4 text-[#E4405F]" />
    );
  };

  const handleRowClick = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  const getAvatar = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isLoading = campaignsLoading;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isAdmin ? 'Campaign Hub' : 'My Campaigns'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin
                ? 'Manage marketing campaigns and track performance'
                : 'View your assigned campaigns and their performance'}
            </p>
          </div>
          {isAdmin && (
            <button onClick={handleCreateClick} className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Filters</span>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-primary hover:underline ml-auto">
                Clear all
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 mb-4">
            {/* Search and Quick Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-9"
                />
              </div>

              {/* Quick Filter Toggles */}
              <div className="flex w-full md:w-auto gap-2 bg-secondary/20 p-1 rounded-lg">
                <button
                  onClick={() => setQuickFilter('all')}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-all ${quickFilter === 'all'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setQuickFilter('week')}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-all ${quickFilter === 'week'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setQuickFilter('month')}
                  className={`flex-1 md:flex-none px-3 py-1.5 rounded-md text-sm font-medium transition-all ${quickFilter === 'month'
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
            {isAdmin && (
              <div className="w-full sm:w-auto flex-1 min-w-0">
                <label className="form-label">Sales Person</label>
                <select
                  value={filterSalesPerson}
                  onChange={(e) => setFilterSalesPerson(e.target.value)}
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
              <label className="form-label">Platform</label>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="form-select"
              >
                <option value="">All Platforms</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>
            <div className="w-full sm:w-auto flex-1 min-w-0">
              <label className="form-label">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="w-full sm:w-auto flex-1 min-w-0">
              <label className="form-label">From Date</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="w-full sm:w-auto flex-1 min-w-0">
              <label className="form-label">To Date</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="dashboard-card overflow-hidden p-0">
          <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              {filteredCampaigns.length} campaigns
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="table-header">Ref</th>
                  <th className="table-header">Title</th>
                  <th className="table-header">Sales Person</th>
                  <th className="table-header">Platform</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Period</th>
                  <th className="table-header text-right">Revenue</th>
                  <th className="table-header text-right">Commission</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="table-row">
                      <td className="table-cell"><Skeleton className="h-4 w-16" /></td>
                      <td className="table-cell"><Skeleton className="h-4 w-32" /></td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-6 h-6 rounded-full" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </td>
                      <td className="table-cell"><Skeleton className="h-4 w-16" /></td>
                      <td className="table-cell"><Skeleton className="h-4 w-12" /></td>
                      <td className="table-cell"><Skeleton className="h-5 w-14" /></td>
                      <td className="table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="table-cell text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="table-cell text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="table-cell"><Skeleton className="h-6 w-16" /></td>
                    </tr>
                  ))
                ) : filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="table-cell text-center text-muted-foreground py-8">
                      {isAdmin
                        ? (hasFilters ? 'No campaigns match your filters' : 'No campaigns found')
                        : (hasFilters ? 'No campaigns match your filters' : 'No campaigns assigned to you yet')}
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign) => {
                    const salesPerson = allUsers.find(u => u.id === campaign.salesPersonId) || campaign.salesPerson;
                    const revenue = getCampaignRevenue(campaign.id);
                    const commission = getCampaignCommission(campaign.id);
                    const isOwner = campaign.salesPersonId === user?.id;

                    return (
                      <tr
                        key={campaign.id}
                        className="table-row cursor-pointer hover:bg-secondary/70"
                        onClick={() => handleRowClick(campaign.id)}
                      >
                        <td className="table-cell font-mono text-xs text-muted-foreground">{campaign.referenceId}</td>
                        <td className="table-cell font-medium">{campaign.title}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {salesPerson ? getAvatar(salesPerson.name) : '?'}
                            </div>
                            <span>{salesPerson?.name || '-'}</span>
                            {isOwner && !isAdmin && (
                              <span className="text-xs text-primary">(You)</span>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(campaign.platform)}
                            <span className="capitalize">{campaign.platform}</span>
                          </div>
                        </td>
                        <td className="table-cell capitalize">{campaign.type}</td>
                        <td className="table-cell">
                          <span className={campaign.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="table-cell text-sm text-muted-foreground">
                          {campaign.startDate ? (
                            <span>
                              {campaign.startDate.split('T')[0]}
                              {campaign.endDate ? ` - ${campaign.endDate.split('T')[0]}` : ' - ongoing'}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="table-cell text-right font-semibold text-foreground">
                          RM {revenue.toFixed(2)}
                        </td>
                        <td className="table-cell text-right font-semibold text-green-600 dark:text-green-500">
                          RM {commission.toFixed(2)}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {isAdmin ? (
                              <>
                                <button
                                  className="p-1.5 hover:bg-secondary rounded transition-colors"
                                  onClick={(e) => handleEditClick(campaign, e)}
                                  title="Edit Campaign"
                                >
                                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <button
                                  className="p-1.5 hover:bg-destructive/10 rounded transition-colors"
                                  onClick={(e) => deleteCampaign(campaign.id, e)}
                                  title="Delete Campaign"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </button>
                              </>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="p-1.5 opacity-50 cursor-not-allowed">
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Only admins can edit campaigns</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <a
                              href={campaign.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-secondary rounded transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Click on a campaign row to view details and orders
        </p>
      </div>

      {/* Campaign Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleModalSubmit} className="space-y-4">
            <div>
              <label className="form-label">Title</label>
              <input
                type="text"
                name="title"
                required
                defaultValue={editingCampaign?.title || ''}
                className="form-input"
                placeholder="Summer Sale 2025"
                key={editingCampaign?.id || 'new'}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Platform</label>
                <select
                  name="platform"
                  defaultValue={editingCampaign?.platform || 'facebook'}
                  className="form-select"
                  key={`platform-${editingCampaign?.id || 'new'}`}
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <div>
                <label className="form-label">Type</label>
                <select
                  name="type"
                  defaultValue={editingCampaign?.type || 'post'}
                  className="form-select"
                  key={`type-${editingCampaign?.id || 'new'}`}
                >
                  <option value="post">Post</option>
                  <option value="live">Live</option>
                  <option value="event">Event</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">URL</label>
              <input
                type="text"
                name="url"
                required
                defaultValue={editingCampaign?.url || ''}
                className="form-input"
                placeholder="https://..."
                key={`url-${editingCampaign?.id || 'new'}`}
              />
            </div>

            <div>
              <label className="form-label">Assigned Sales Person</label>
              {!editingCampaign ? (
                <select
                  name="salesPersonId"
                  required
                  defaultValue=""
                  className="form-select"
                >
                  <option value="">Select...</option>
                  {salesUsers.filter(u => u.status === 'active').map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.commissionRate}%)</option>
                  ))}
                </select>
              ) : (
                <div className="form-input bg-muted/50 cursor-not-allowed text-muted-foreground flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {editingCampaign.salesPerson ? getAvatar(editingCampaign.salesPerson.name) : '?'}
                  </div>
                  <span>{editingCampaign.salesPerson?.name || 'Unknown'}</span>
                  <span className="text-xs ml-auto">Cannot be changed</span>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="startDate"
                required
                defaultValue={editingCampaign?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0]}
                className="form-input"
                key={`startDate-${editingCampaign?.id || 'new'}`}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingCampaign ? 'Saving...' : 'Creating...'}
                  </span>
                ) : (
                  editingCampaign ? 'Save Changes' : 'Create Campaign'
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Campaign Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteCampaignId}
        onOpenChange={(open) => !open && setDeleteCampaignId(null)}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? All orders in this campaign will also be deleted. You can undo this action within 5 seconds."
        onConfirm={confirmDeleteCampaign}
        isLoading={false}
      />
    </DashboardLayout>
  );
};

export default CampaignsPage;