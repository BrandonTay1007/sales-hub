import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { campaigns as initialCampaigns, users, Campaign, getCampaignRevenue } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Facebook, Instagram, Edit2, ExternalLink, Lock, StopCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const CampaignsPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    platform: 'facebook' as 'facebook' | 'instagram',
    type: 'post' as 'post' | 'live' | 'event',
    url: '',
    assignedSalesPersonId: '',
    startDate: '',
    endDate: '',
  });

  const salesUsers = users.filter(u => u.role === 'sales');

  // Filter campaigns based on role
  const displayCampaigns = isAdmin 
    ? campaigns 
    : campaigns.filter(c => c.assignedSalesPersonId === user?.id);

  const resetForm = () => {
    setFormData({ title: '', platform: 'facebook', type: 'post', url: '', assignedSalesPersonId: '', startDate: '', endDate: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCampaign: Campaign = {
      id: String(campaigns.length + 1),
      title: formData.title,
      platform: formData.platform,
      type: formData.type,
      url: formData.url,
      assignedSalesPersonId: formData.assignedSalesPersonId,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      startDate: formData.startDate || new Date().toISOString().split('T')[0],
      endDate: formData.endDate || undefined,
    };
    setCampaigns([...campaigns, newCampaign]);
    setShowModal(false);
    resetForm();
    toast.success('Campaign created successfully!');
  };

  const handleEditClick = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      platform: campaign.platform,
      type: campaign.type,
      url: campaign.url,
      assignedSalesPersonId: campaign.assignedSalesPersonId,
      startDate: campaign.startDate || '',
      endDate: campaign.endDate || '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    
    setCampaigns(campaigns.map(c => 
      c.id === editingCampaign.id 
        ? { 
            ...c, 
            title: formData.title,
            platform: formData.platform,
            type: formData.type,
            url: formData.url,
            assignedSalesPersonId: formData.assignedSalesPersonId,
            startDate: formData.startDate || undefined,
            endDate: formData.endDate || undefined,
          } 
        : c
    ));
    setEditingCampaign(null);
    resetForm();
    toast.success('Campaign updated successfully!');
  };

  const handleEndCampaign = () => {
    if (!editingCampaign) return;
    
    setCampaigns(campaigns.map(c => 
      c.id === editingCampaign.id 
        ? { ...c, status: 'completed' as const, endDate: new Date().toISOString().split('T')[0] } 
        : c
    ));
    setEditingCampaign(null);
    resetForm();
    toast.success('Campaign ended successfully!');
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
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Campaign
            </button>
          )}
        </div>

        <div className="dashboard-card overflow-hidden p-0">
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
                {displayCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center text-muted-foreground py-8">
                      {isAdmin ? 'No campaigns found' : 'No campaigns assigned to you yet'}
                    </td>
                  </tr>
                ) : (
                  displayCampaigns.map((campaign) => {
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
                              <button 
                                className="p-1.5 hover:bg-secondary rounded transition-colors"
                                onClick={(e) => handleEditClick(campaign, e)}
                              >
                                <Edit2 className="w-4 h-4 text-muted-foreground" />
                              </button>
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

      {/* Create Campaign Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Create Campaign</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  placeholder="Summer Sale 2025"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'facebook' | 'instagram' })}
                    className="form-select"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'post' | 'live' | 'event' })}
                    className="form-select"
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
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="form-input"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="form-label">Assign Sales Person</label>
                <select
                  required
                  value={formData.assignedSalesPersonId}
                  onChange={(e) => setFormData({ ...formData, assignedSalesPersonId: e.target.value })}
                  className="form-select"
                >
                  <option value="">Select...</option>
                  {salesUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.commissionRate}%)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">End Date (optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      <Dialog open={!!editingCampaign} onOpenChange={() => { setEditingCampaign(null); resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="form-label">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'facebook' | 'instagram' })}
                  className="form-select"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                </select>
              </div>
              <div>
                <label className="form-label">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'post' | 'live' | 'event' })}
                  className="form-select"
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
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Assign Sales Person</label>
              <select
                required
                value={formData.assignedSalesPersonId}
                onChange={(e) => setFormData({ ...formData, assignedSalesPersonId: e.target.value })}
                className="form-select"
              >
                <option value="">Select...</option>
                {salesUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.commissionRate}%)</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
            
            {editingCampaign?.status === 'active' && (
              <button 
                type="button" 
                onClick={handleEndCampaign}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <StopCircle className="w-4 h-4" />
                End Campaign Now
              </button>
            )}
            
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setEditingCampaign(null); resetForm(); }} className="btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Save Changes
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CampaignsPage;