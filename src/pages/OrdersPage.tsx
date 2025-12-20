import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { campaigns, users, orders as initialOrders, Order } from '@/lib/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Info, Filter, X, ShoppingCart, ArrowUpDown, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProductRow {
  name: string;
  qty: number;
  basePrice: number;
}

type SortOption = 'latest' | 'oldest' | 'highest' | 'lowest';

const OrdersPage = () => {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [products, setProducts] = useState<ProductRow[]>([{ name: '', qty: 1, basePrice: 0 }]);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editProducts, setEditProducts] = useState<ProductRow[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  // Filters
  const [filterCampaign, setFilterCampaign] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'week' | 'month'>('all');

  // Get user's campaigns for filtering
  const userCampaigns = campaigns.filter(c => c.assignedSalesPersonId === user?.id);
  const availableCampaigns = isAdmin ? campaigns : userCampaigns;
  const activeCampaigns = availableCampaigns.filter(c => c.status === 'active');

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const linkedSalesPerson = selectedCampaign
    ? users.find(u => u.id === selectedCampaign.assignedSalesPersonId)
    : null;

  const orderTotal = products.reduce((sum, p) => sum + (p.qty * p.basePrice), 0);
  const commissionAmount = linkedSalesPerson ? orderTotal * (linkedSalesPerson.commissionRate / 100) : 0;

  const filteredOrders = useMemo(() => {
    // First filter by user's campaigns if not admin
    let filtered = isAdmin
      ? orders
      : orders.filter(o => userCampaigns.some(c => c.id === o.campaignId));

    // Apply quick filters
    if (quickFilter === 'week') {
      const weekAgo = new Date('2025-12-10');
      filtered = filtered.filter(o => new Date(o.createdAt) >= weekAgo);
    } else if (quickFilter === 'month') {
      filtered = filtered.filter(o => o.createdAt.startsWith('2025-12'));
    }

    // Apply other filters
    filtered = filtered.filter(order => {
      if (filterCampaign && order.campaignId !== filterCampaign) return false;
      if (filterStatus && order.status !== filterStatus) return false;
      if (filterDateFrom && order.createdAt < filterDateFrom) return false;
      if (filterDateTo && order.createdAt > filterDateTo) return false;
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
  }, [orders, filterCampaign, filterStatus, filterDateFrom, filterDateTo, quickFilter, isAdmin, userCampaigns, sortBy]);

  const addProductRow = () => {
    setProducts([...products, { name: '', qty: 1, basePrice: 0 }]);
  };

  const removeProductRow = (index: number) => {
    if (products.length > 1) {
      setProducts(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (index: number, field: keyof ProductRow, value: string | number) => {
    const updated = [...products];
    if (field === 'name') {
      updated[index].name = value as string;
    } else if (field === 'qty') {
      updated[index].qty = Number(value) || 0;
    } else if (field === 'basePrice') {
      updated[index].basePrice = Number(value) || 0;
    }
    setProducts(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !linkedSalesPerson) return;

    // Validate at least 1 product
    const validProducts = products.filter(p => p.name && p.qty > 0);
    if (validProducts.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    const newOrder: Order = {
      id: String(orders.length + 1),
      campaignId: selectedCampaignId,
      products: validProducts,
      orderTotal,
      snapshotRate: linkedSalesPerson.commissionRate,
      commissionAmount,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
    };

    setOrders([...orders, newOrder]);
    setSelectedCampaignId('');
    setProducts([{ name: '', qty: 1, basePrice: 0 }]);
    setShowAddOrder(false);
    setSortBy('latest'); // Reset to default sort so new order appears at top
    toast.success('Order created successfully!');
  };

  const deleteOrder = (orderId: string) => {
    const orderToDelete = orders.find(o => o.id === orderId);
    if (!orderToDelete) return;

    // Check if user can delete (admin or owner) - although UI hides it, safer to check
    const campaign = campaigns.find(c => c.id === orderToDelete.campaignId);
    const canDelete = isAdmin || campaign?.assignedSalesPersonId === user?.id;

    if (!canDelete) {
      toast.error('You can only delete your own orders');
      return;
    }

    // Remove order from state
    setOrders(prev => prev.filter(o => o.id !== orderId));

    // Show undo toast
    toast.success('Order deleted', {
      description: 'Order removed from records',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          // Restore order in correct sorting position (simplest is just add back)
          setOrders(prev => [...prev, orderToDelete].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
          toast.success('Order restored');
        },
      },
    });
  };

  const clearFilters = () => {
    setFilterCampaign('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setQuickFilter('all');
  };

  const hasFilters = filterCampaign || filterStatus || filterDateFrom || filterDateTo || quickFilter !== 'all';

  const handleRowClick = (order: Order) => {
    setViewingOrder(order);
    setIsEditMode(false);
    setEditProducts(order.products.map(p => ({ ...p })));
  };

  const handleEditOrder = () => {
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!viewingOrder) return;

    // Validate at least 1 product
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
    if (field === 'name') {
      updated[index].name = value as string;
    } else if (field === 'qty') {
      updated[index].qty = Number(value) || 0;
    } else if (field === 'basePrice') {
      updated[index].basePrice = Number(value) || 0;
    }
    setEditProducts(updated);
  };

  const addEditProductRow = () => {
    setEditProducts([...editProducts, { name: '', qty: 1, basePrice: 0 }]);
  };

  const removeEditProductRow = (index: number) => {
    if (editProducts.length > 1) {
      setEditProducts(editProducts.filter((_, i) => i !== index));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isAdmin ? 'Order Management' : 'My Orders'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin ? 'Record and manage sales orders' : 'View and manage your sales orders'}
            </p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowAddOrder(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Add Order
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Campaign</label>
              <select
                value={filterCampaign}
                onChange={(e) => setFilterCampaign(e.target.value)}
                className="form-select"
              >
                <option value="">All Campaigns</option>
                {availableCampaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="form-label">From Date</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="form-input"
              />
            </div>
            <div>
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

        {/* Sort and Orders Table */}
        <div className="dashboard-card overflow-hidden p-0">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-sm text-muted-foreground">
              {filteredOrders.length} orders
            </span>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="form-select w-auto text-sm py-1"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Value</option>
                <option value="lowest">Lowest Value</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="table-header">Date</th>
                  <th className="table-header">Campaign</th>
                  <th className="table-header">Products</th>
                  <th className="table-header text-right">Total</th>
                  <th className="table-header text-right">Commission</th>
                  <th className="table-header">Status</th>
                  {isAdmin && <th className="table-header">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} className="table-cell text-center text-muted-foreground py-8">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const campaign = campaigns.find(c => c.id === order.campaignId);

                    return (
                      <tr
                        key={order.id}
                        className={`table-row cursor-pointer hover:bg-secondary/70 ${order.status === 'cancelled' ? 'opacity-50' : ''}`}
                        onClick={() => handleRowClick(order)}
                      >
                        <td className="table-cell">{order.createdAt}</td>
                        <td className="table-cell font-medium">{campaign?.title}</td>
                        <td className="table-cell">
                          <span className={order.status === 'cancelled' ? 'line-through text-muted-foreground' : ''}>
                            {order.products.length} items
                          </span>
                        </td>
                        <td className="table-cell text-right font-medium">
                          RM {order.orderTotal.toFixed(2)}
                        </td>
                        <td className="table-cell text-right">
                          <Tooltip>
                            <TooltipTrigger>
                              <span className="text-success font-medium">RM {order.commissionAmount.toFixed(2)}</span>
                              <span className="text-xs text-muted-foreground ml-1">({order.snapshotRate}%)</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Snapshot Rate: {order.snapshotRate}%</p>
                              <p className="text-xs text-muted-foreground">Rate locked at order creation</p>
                            </TooltipContent>
                          </Tooltip>
                        </td>
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
                                  onClick={(e) => { e.stopPropagation(); setViewingOrder(order); setIsEditMode(true); }}
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Click on a row to view order details
        </p>
      </div>

      {/* Order Detail Modal */}
      <Dialog open={!!viewingOrder} onOpenChange={() => { setViewingOrder(null); setIsEditMode(false); }}>
        <DialogContent className="max-w-md">
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
                  <div className="space-y-2">
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
                  <div className="space-y-2">
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
                  <Tooltip>
                    <TooltipTrigger className="text-muted-foreground underline decoration-dotted">
                      Snapshot Rate
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rate locked at order creation time</p>
                    </TooltipContent>
                  </Tooltip>
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

      {/* Add Order Modal */}
      {showAddOrder && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-lg border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">New Order</h2>
              </div>
              <button onClick={() => setShowAddOrder(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="form-label">Select Campaign</label>
                <select
                  required
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="form-select"
                >
                  <option value="">Choose a campaign...</option>
                  {activeCampaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                {!isAdmin && activeCampaigns.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No active campaigns assigned to you
                  </p>
                )}
              </div>

              {linkedSalesPerson && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Sales Person: {linkedSalesPerson.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Rate: <span className="font-semibold text-primary">{linkedSalesPerson.commissionRate}%</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This rate will be locked as snapshot rate
                    </p>
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
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
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
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        disabled={products.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Commission Preview */}
              <div className="border border-success/30 rounded-lg p-4 bg-success/5">
                <p className="text-xs text-muted-foreground mb-2">Commission Preview</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Total</p>
                    <p className="text-lg font-bold text-foreground">RM {orderTotal.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Est. Commission</p>
                    <p className="text-lg font-bold text-success">RM {commissionAmount.toFixed(2)}</p>
                  </div>
                </div>
                {linkedSalesPerson && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    {orderTotal.toFixed(2)} × {linkedSalesPerson.commissionRate}% = {commissionAmount.toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddOrder(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={!selectedCampaignId}>
                  Record Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrdersPage;