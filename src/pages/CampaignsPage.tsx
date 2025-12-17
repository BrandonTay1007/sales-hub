import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { campaigns as initialCampaigns, users, Campaign, getCampaignRevenue } from '@/lib/mockData';
import { Plus, X, Facebook, Instagram, Edit2, Trash2, ExternalLink } from 'lucide-react';

const CampaignsPage = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    platform: 'facebook' as 'facebook' | 'instagram',
    type: 'post' as 'post' | 'live',
    url: '',
    assignedSalesPersonId: '',
  });

  const salesUsers = users.filter(u => u.role === 'sales');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCampaign: Campaign = {
      id: String(campaigns.length + 1),
      ...formData,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCampaigns([...campaigns, newCampaign]);
    setShowModal(false);
    setFormData({ title: '', platform: 'facebook', type: 'post', url: '', assignedSalesPersonId: '' });
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
            <h1 className="text-2xl font-bold text-foreground">Campaign Hub</h1>
            <p className="text-muted-foreground mt-1">Manage marketing campaigns and track performance</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
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
                  <th className="table-header text-right">Revenue</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const salesPerson = users.find(u => u.id === campaign.assignedSalesPersonId);
                  const revenue = getCampaignRevenue(campaign.id);
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
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(campaign.platform)}
                          <span className="capitalize">{campaign.platform}</span>
                        </div>
                      </td>
                      <td className="table-cell text-right font-semibold text-foreground">
                        RM {revenue.toFixed(2)}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="p-1.5 hover:bg-secondary rounded transition-colors"
                            onClick={() => handleRowClick(campaign.id)}
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </button>
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
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Click on a campaign row to view details and orders
        </p>
      </div>

      {showModal && (
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
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'post' | 'live' })}
                    className="form-select"
                  >
                    <option value="post">Post</option>
                    <option value="live">Live</option>
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
    </DashboardLayout>
  );
};

export default CampaignsPage;
