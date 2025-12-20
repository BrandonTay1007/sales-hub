import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { campaigns as initialCampaigns, users, orders as allOrders, Order, getCampaignRevenue, Campaign } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, ExternalLink, Settings, Facebook, Instagram, Plus, Trash2, X, Info, StopCircle, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ProductRow {
  name: string;
  qty: number;
  basePrice: number;
}

const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [campaignsState, setCampaignsState] = useState<Campaign[]>(initialCampaigns);
  const campaign = campaignsState.find(c => c.id === id);
  const salesPerson = campaign ? users.find(u => u.id === campaign.assignedSalesPersonId) : null;

  const [orders, setOrders] = useState<Order[]>(allOrders);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>([{ name: '', qty: 1, basePrice: 0 }]);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProducts, setEditProducts] = useState<ProductRow[]>([]);

  const [editForm, setEditForm] = useState({
    title: campaign?.title || '',
    url: campaign?.url || '',
    platform: campaign?.platform || 'facebook',
    type: campaign?.type || 'post',
    startDate: campaign?.startDate || '',
    endDate: campaign?.endDate || '',
  });

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Campaign not found</p>
          <Link to="/campaigns" className="text-primary hover:underline mt-2 inline-block">
            Back to Campaigns
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const campaignOrders = orders.filter(o => o.campaignId === campaign.id);
  const activeOrders = campaignOrders.filter(o => o.status === 'active');
  const totalRevenue = activeOrders.reduce((sum, o) => sum + o.orderTotal, 0);
  const totalCommission = activeOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const totalItemsSold = activeOrders.reduce((sum, o) => sum + o.products.reduce((s, p) => s + p.qty, 0), 0);

  const orderTotal = products.reduce((sum, p) => sum + (p.qty * p.basePrice), 0);
  const commissionAmount = salesPerson ? orderTotal * (salesPerson.commissionRate / 100) : 0;

  const addProductRow = () => setProducts([...products, { name: '', qty: 1, basePrice: 0 }]);

  const removeProductRow = (index: number) => {
    if (products.length > 1) setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof ProductRow, value: string | number) => {
    const updated = [...products];
    if (field === 'name') updated[index].name = value as string;
    else if (field === 'qty') updated[index].qty = Number(value) || 0;
    else updated[index].basePrice = Number(value) || 0;
    setProducts(updated);
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salesPerson) return;

    const newOrder: Order = {
      id: String(orders.length + 1),
      campaignId: campaign.id,
      products: products.filter(p => p.name && p.qty > 0),
      orderTotal,
      snapshotRate: salesPerson.commissionRate,
      commissionAmount,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    setOrders([...orders, newOrder]);
    setShowAddOrder(false);
    setProducts([{ name: '', qty: 1, basePrice: 0 }]);
    toast.success('Order added successfully!');
  };

  const deleteOrder = (orderId: string) => {
    const orderToDelete = orders.find(o => o.id === orderId);
    if (!orderToDelete) return;

    // Hard delete from state
    setOrders(prev => prev.filter(o => o.id !== orderId));

    // Show undo toast
    toast.success('Order deleted', {
      description: 'Order removed from records',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          setOrders(prev => [...prev, orderToDelete].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
          toast.success('Order restored');
        },
      },
    });
  };

  const handleRowClick = (order: Order) => {
    setViewingOrder(order);
    setIsEditMode(false);
    setEditProducts(order.products.map(p => ({ ...p })));
  };

  const handleSaveEdit = () => {
    if (!viewingOrder) return;

    const validProducts = editProducts.filter(p => p.name && p.qty > 0);
    if (validProducts.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    const newTotal = validProducts.reduce((sum, p) => sum + (p.qty * p.basePrice), 0);
    const newCommission = newTotal * (viewingOrder.snapshotRate / 100);

    setOrders(orders.map(o =>
      o.id === viewingOrder.id
        ? { ...o, products: validProducts, orderTotal: newTotal, commissionAmount: newCommission }
        : o
    ));

    setViewingOrder({ ...viewingOrder, products: validProducts, orderTotal: newTotal, commissionAmount: newCommission });
    setIsEditMode(false);
    toast.success('Order updated!');
  };

  const updateEditProduct = (index: number, field: keyof ProductRow, value: string | number) => {
    const updated = [...editProducts];
    if (field === 'name') updated[index].name = value as string;
    else if (field === 'qty') updated[index].qty = Number(value) || 0;
    else updated[index].basePrice = Number(value) || 0;
    setEditProducts(updated);
  };

  const addEditProductRow = () => setEditProducts([...editProducts, { name: '', qty: 1, basePrice: 0 }]);
  const removeEditProductRow = (index: number) => {
    if (editProducts.length > 1) setEditProducts(editProducts.filter((_, i) => i !== index));
  };

  const handleSaveSettings = () => {
    setCampaignsState(campaignsState.map(c =>
      c.id === campaign.id
        ? {
          ...c,
          title: editForm.title,
          url: editForm.url,
          platform: editForm.platform as 'facebook' | 'instagram',
          type: editForm.type as 'post' | 'live' | 'event',
          startDate: editForm.startDate || undefined,
          endDate: editForm.endDate || undefined,
        }
        : c
    ));
    setShowSettings(false);
    toast.success('Campaign updated!');
  };

  const handleEndCampaign = () => {
    setCampaignsState(campaignsState.map(c =>
      c.id === campaign.id
        ? { ...c, status: 'completed' as const, endDate: new Date().toISOString().split('T')[0] }
        : c
    ));
    setShowSettings(false);
    toast.success('Campaign ended!');
  };

  const getPlatformIcon = (platform: string) => {
    return platform === 'facebook' ? (
      <Facebook className="w-5 h-5 text-[#1877F2]" />
    ) : (
      <Instagram className="w-5 h-5 text-[#E4405F]" />
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-3">
              {getPlatformIcon(campaign.platform)}
              <div>
                <h1 className="text-2xl font-bold text-foreground">{campaign.title}</h1>
                <a
                  href={campaign.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View Campaign <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-3">
              <button onClick={() => setShowSettings(true)} className="btn-secondary">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card">
            <span className="text-sm text-muted-foreground">Total Revenue</span>
            <p className="text-2xl font-bold text-foreground">RM {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <span className="text-sm text-muted-foreground">Commission Generated</span>
            <p className="text-2xl font-bold text-success">RM {totalCommission.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <span className="text-sm text-muted-foreground">Items Sold</span>
            <p className="text-2xl font-bold text-foreground">{totalItemsSold}</p>
          </div>
        </div>

        {/* Sales Person Info Card */}
        {salesPerson && (
          <div className="dashboard-card">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Assigned Sales Person</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                {salesPerson.avatar}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{salesPerson.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-muted-foreground">
                    Commission Rate: <span className="text-primary font-medium">{salesPerson.commissionRate}%</span>
                  </span>
                  <span className={salesPerson.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                    {salesPerson.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="orders">Orders ({campaignOrders.length})</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            <div className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Campaign Orders</h3>
                {isAdmin && (
                  <button onClick={() => setShowAddOrder(true)} className="btn-primary text-sm">
                    <Plus className="w-4 h-4" />
                    Add Order
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="table-header">Date</th>
                      <th className="table-header">Products</th>
                      <th className="table-header text-right">Total</th>
                      <th className="table-header text-right">Commission</th>
                      <th className="table-header">Status</th>
                      {isAdmin && <th className="table-header">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {campaignOrders.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 6 : 5} className="table-cell text-center text-muted-foreground py-8">
                          No orders yet
                        </td>
                      </tr>
                    ) : (
                      campaignOrders.map((order) => (
                        <tr
                          key={order.id}
                          className={`table-row cursor-pointer hover:bg-secondary/70 ${order.status === 'cancelled' ? 'opacity-50' : ''}`}
                          onClick={() => handleRowClick(order)}
                        >
                          <td className="table-cell">{order.createdAt}</td>
                          <td className="table-cell">
                            <span className={order.status === 'cancelled' ? 'line-through text-muted-foreground' : ''}>
                              {order.products.length} items
                            </span>
                          </td>
                          <td className="table-cell text-right font-medium">RM {order.orderTotal.toFixed(2)}</td>
                          <td className="table-cell text-right text-success">RM {order.commissionAmount.toFixed(2)}</td>
                          <td className="table-cell">
                            <span className={order.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                              {order.status}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="table-cell">
                              {order.status === 'active' && (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setViewingOrder(order); setIsEditMode(true); setEditProducts(order.products.map(p => ({ ...p }))); }}
                                    className="p-1 hover:bg-secondary rounded transition-colors"
                                    title="Edit Order"
                                  >
                                    <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }}
                                    className="p-1 hover:bg-destructive/10 rounded transition-colors"
                                    title="Delete Order"
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-4">
            <div className="dashboard-card">
              <h3 className="font-semibold text-foreground mb-4">Performance Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-xl font-bold text-foreground">{campaignOrders.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-xl font-bold text-foreground">{activeOrders.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                  <p className="text-xl font-bold text-foreground">
                    RM {activeOrders.length > 0 ? (totalRevenue / activeOrders.length).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm text-muted-foreground">Commission Rate</p>
                  <p className="text-xl font-bold text-primary">{salesPerson?.commissionRate || 0}%</p>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">Assigned Sales Person</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {salesPerson?.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{salesPerson?.name}</p>
                    <p className="text-sm text-muted-foreground">{salesPerson?.commissionRate}% commission rate</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Settings Modal (Centered Dialog) */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Platform</label>
                  <select
                    value={editForm.platform}
                    onChange={(e) => setEditForm({ ...editForm, platform: e.target.value as 'facebook' | 'instagram' })}
                    className="form-select"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as 'post' | 'live' | 'event' })}
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
                  value={editForm.url}
                  onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                  className="form-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {campaign.status === 'active' && (
                <button
                  onClick={handleEndCampaign}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <StopCircle className="w-4 h-4" />
                  End Campaign Now
                </button>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowSettings(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleSaveSettings} className="btn-primary flex-1">
                  Save Changes
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Order Modal */}
        {showAddOrder && (
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-lg border border-border">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Add Order to {campaign.title}</h2>
                <button onClick={() => setShowAddOrder(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddOrder} className="p-6 space-y-5">
                {salesPerson && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Sales Person: {salesPerson.name}</p>
                      <p className="text-sm text-muted-foreground">Rate: <span className="font-semibold text-primary">{salesPerson.commissionRate}%</span></p>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="form-label mb-0">Products</label>
                    <button type="button" onClick={addProductRow} className="btn-ghost text-xs py-1 px-2">
                      <Plus className="w-3 h-3" /> Add Row
                    </button>
                  </div>
                  <div className="space-y-3">
                    {products.map((product, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Product"
                          value={product.name}
                          onChange={(e) => updateProduct(index, 'name', e.target.value)}
                          className="form-input flex-1"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={product.qty || ''}
                          onChange={(e) => updateProduct(index, 'qty', e.target.value)}
                          className="form-input w-16"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          step="0.01"
                          min="0"
                          value={product.basePrice || ''}
                          onChange={(e) => updateProduct(index, 'basePrice', e.target.value)}
                          className="form-input w-20"
                        />
                        <button
                          type="button"
                          onClick={() => removeProductRow(index)}
                          className="p-2 text-muted-foreground hover:text-destructive"
                          disabled={products.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Total</span>
                    <span className="font-semibold text-foreground">RM {orderTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Est. Commission ({salesPerson?.commissionRate}%)</span>
                    <span className="font-semibold text-success">RM {commissionAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAddOrder(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Add Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        <Dialog open={!!viewingOrder} onOpenChange={() => { setViewingOrder(null); setIsEditMode(false); }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>
            {viewingOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{viewingOrder.createdAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span className={viewingOrder.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                      {viewingOrder.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Products</p>
                  {isEditMode ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {editProducts.map((product, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => updateEditProduct(index, 'name', e.target.value)}
                            className="form-input flex-1 text-sm"
                            placeholder="Product"
                          />
                          <input
                            type="number"
                            value={product.qty || ''}
                            onChange={(e) => updateEditProduct(index, 'qty', e.target.value)}
                            className="form-input w-14 text-sm"
                            min="1"
                          />
                          <input
                            type="number"
                            value={product.basePrice || ''}
                            onChange={(e) => updateEditProduct(index, 'basePrice', e.target.value)}
                            className="form-input w-20 text-sm"
                            step="0.01"
                          />
                          <button
                            onClick={() => removeEditProductRow(index)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                            disabled={editProducts.length === 1}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addEditProductRow}
                        className="text-xs text-primary hover:underline"
                      >
                        + Add product
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {viewingOrder.products.map((product, index) => (
                        <div key={index} className="flex justify-between p-2 bg-secondary/30 rounded">
                          <span>{product.name} × {product.qty}</span>
                          <span className="font-medium">RM {(product.basePrice * product.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Order Total</span>
                    <span className="font-bold">
                      RM {isEditMode
                        ? editProducts.reduce((sum, p) => sum + (p.qty * p.basePrice), 0).toFixed(2)
                        : viewingOrder.orderTotal.toFixed(2)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Snapshot Rate</span>
                    <span className="text-primary font-medium">{viewingOrder.snapshotRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Commission</span>
                    <span className="text-success font-bold">
                      RM {isEditMode
                        ? (editProducts.reduce((sum, p) => sum + (p.qty * p.basePrice), 0) * (viewingOrder.snapshotRate / 100)).toFixed(2)
                        : viewingOrder.commissionAmount.toFixed(2)
                      }
                    </span>
                  </div>
                </div>

                {isEditMode ? (
                  <div className="flex gap-3">
                    <button onClick={() => setIsEditMode(false)} className="btn-secondary flex-1">
                      Cancel
                    </button>
                    <button onClick={handleSaveEdit} className="btn-primary flex-1">
                      Save Changes
                    </button>
                  </div>
                ) : (
                  viewingOrder.status === 'active' && isAdmin && (
                    <button
                      onClick={() => { deleteOrder(viewingOrder.id); setViewingOrder(null); }}
                      className="w-full text-destructive hover:bg-destructive/10 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      Delete Order
                    </button>
                  )
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CampaignDetailPage;