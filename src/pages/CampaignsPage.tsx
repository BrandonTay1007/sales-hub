import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { campaigns as initialCampaigns, users, Campaign, getCampaignRevenue, orders as initialOrders, Order } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Facebook, Instagram, Edit2, ExternalLink, Lock, Filter, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { CampaignEditModal, CampaignFormData } from '@/components/CampaignEditModal';

const CampaignsPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  // Filter State
  const [filterSalesPerson, setFilterSalesPerson] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'week' | 'month'>('all');

  const salesUsers = users.filter(u => u.role === 'sales');

  // Available campaigns based on role (for filtering logic)
  const availableCampaigns = isAdmin
    ? campaigns
    : campaigns.filter(c => c.assignedSalesPersonId === user?.id);

  const filteredCampaigns = useMemo(() => {
    let filtered = availableCampaigns;

    // Quick Filters
    if (quickFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split('T')[0];
      filtered = filtered.filter(c => (c.startDate || c.createdAt) >= weekAgoStr);
    } else if (quickFilter === 'month') {
      const monthPrefix = new Date().toISOString().slice(0, 7); // 2025-12
      filtered = filtered.filter(c => (c.startDate || c.createdAt).startsWith(monthPrefix));
    }

    // Explicit Filters
    filtered = filtered.filter(campaign => {
      if (filterSalesPerson && campaign.assignedSalesPersonId !== filterSalesPerson) return false;
      if (filterPlatform && campaign.platform !== filterPlatform) return false;
      if (filterStatus && campaign.status !== filterStatus) return false;
      if (filterDateFrom && (campaign.startDate || campaign.createdAt) < filterDateFrom) return false;
      if (filterDateTo && (campaign.startDate || campaign.createdAt) > filterDateTo) return false;
      return true;
    });

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [availableCampaigns, filterSalesPerson, filterPlatform, filterStatus, filterDateFrom, filterDateTo, quickFilter]);

  const clearFilters = () => {
    setFilterSalesPerson('');
    setFilterPlatform('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setQuickFilter('all');
  };

  const hasFilters = filterSalesPerson || filterPlatform || filterStatus || filterDateFrom || filterDateTo || quickFilter !== 'all';

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

  const handleModalSubmit = (data: CampaignFormData) => {
    if (editingCampaign) {
      // Update
      setCampaigns(campaigns.map(c =>
        c.id === editingCampaign.id
          ? {
            ...c,
            ...data,
            assignedSalesPersonId: data.assignedSalesPersonId, // Explicitly update this
            startDate: data.startDate || undefined,
            endDate: data.endDate || undefined,
          }
          : c
      ));
      toast.success('Campaign updated successfully!');
    } else {
      // Create
      const newCampaign: Campaign = {
        id: String(campaigns.length + 1),
        ...data,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0],
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || undefined,
      };
      setCampaigns([...campaigns, newCampaign]);
      toast.success('Campaign created successfully!');
    }
    closeModal();
  };

  const handleEndCampaign = () => {
    if (!editingCampaign) return;

    setCampaigns(campaigns.map(c =>
      c.id === editingCampaign.id
        ? { ...c, status: 'completed' as const, endDate: new Date().toISOString().split('T')[0] }
        : c
    ));
    toast.success('Campaign ended successfully!');
    closeModal();
  };

  const deleteCampaign = (campaignId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const campaignToDelete = campaigns.find(c => c.id === campaignId);
    if (!campaignToDelete) return;

    // Find related orders
    const relatedOrders = orders.filter(o => o.campaignId === campaignId);

    // Remove campaign and related orders
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    setOrders(prev => prev.filter(o => o.campaignId !== campaignId));

    toast.success('Campaign deleted', {
      description: `Campaign and ${relatedOrders.length} related orders removed`,
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          setCampaigns(prev => [...prev, campaignToDelete].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
          setOrders(prev => [...prev, ...relatedOrders]);
          toast.success('Campaign and orders restored');
        },
      },
    });
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'facebook' ? (
      <Facebook className="w-4 h-4 text-[#1877F2]" />
    ) : (
      <Instagram className="w-4 h-4 text-[#E4405F]" />
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'badge-active';
      case 'paused': return 'badge-paused';
      default: return 'badge-inactive';
    }
  };

  const handleRowClick = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

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

          {/* Quick Filter Toggles */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setQuickFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${quickFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
            >
              All Time
            </button>
            <button
              onClick={() => setQuickFilter('week')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${quickFilter === 'week'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
            >
              This Week
            </button>
            <button
              onClick={() => setQuickFilter('month')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${quickFilter === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
            >
              This Month
            </button>
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
                <option value="paused">Paused</option>
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
                  <th className="table-header">Status</th>
                  <th className="table-header">Title</th>
                  <th className="table-header">Sales Person</th>
                  <th className="table-header">Platform</th>
                  <th className="table-header">Period</th>
                  <th className="table-header text-right">Revenue</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center text-muted-foreground py-8">
                      {isAdmin
                        ? (hasFilters ? 'No campaigns match your filters' : 'No campaigns found')
                        : (hasFilters ? 'No campaigns match your filters' : 'No campaigns assigned to you yet')
                      }
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign) => {
                    const salesPerson = users.find(u => u.id === campaign.assignedSalesPersonId);
                    const revenue = getCampaignRevenue(campaign.id);
                    const isOwner = campaign.assignedSalesPersonId === user?.id;

                    return (
                      <tr
                        key={campaign.id}
                        className="table-row cursor-pointer hover:bg-secondary/70"
                        onClick={() => handleRowClick(campaign.id)}
                      >
                        <td className="table-cell">
                          <span className={getStatusBadge(campaign.status)}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="table-cell font-medium">{campaign.title}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {salesPerson?.avatar}
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
                        <td className="table-cell text-sm text-muted-foreground">
                          {campaign.startDate && (
                            <span>
                              {campaign.startDate}
                              {campaign.endDate ? ` - ${campaign.endDate}` : ' - ongoing'}
                            </span>
                          )}
                        </td>
                        <td className="table-cell text-right font-semibold text-foreground">
                          RM {revenue.toFixed(2)}
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

      <CampaignEditModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleModalSubmit}
        onEndCampaign={handleEndCampaign}
        campaign={editingCampaign}
        isCreation={!editingCampaign}
      />
    </DashboardLayout>
  );
};

export default CampaignsPage;