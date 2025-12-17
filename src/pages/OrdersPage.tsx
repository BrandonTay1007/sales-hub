import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { campaigns, users, orders as initialOrders, Order } from '@/lib/mockData';
import { Plus, Trash2, Info, Filter, X, ShoppingCart } from 'lucide-react';

interface ProductRow {
  name: string;
  qty: number;
  basePrice: number;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [products, setProducts] = useState<ProductRow[]>([{ name: '', qty: 1, basePrice: 0 }]);
  const [showAddOrder, setShowAddOrder] = useState(false);

  // Filters
  const [filterCampaign, setFilterCampaign] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const linkedSalesPerson = selectedCampaign 
    ? users.find(u => u.id === selectedCampaign.assignedSalesPersonId)
    : null;

  const orderTotal = products.reduce((sum, p) => sum + (p.qty * p.basePrice), 0);
  const commissionAmount = linkedSalesPerson ? orderTotal * (linkedSalesPerson.commissionRate / 100) : 0;

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (filterCampaign && order.campaignId !== filterCampaign) return false;
      if (filterStatus && order.status !== filterStatus) return false;
      if (filterDateFrom && order.createdAt < filterDateFrom) return false;
      if (filterDateTo && order.createdAt > filterDateTo) return false;
      return true;
    });
  }, [orders, filterCampaign, filterStatus, filterDateFrom, filterDateTo]);

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

    const newOrder: Order = {
      id: String(orders.length + 1),
      campaignId: selectedCampaignId,
      products: products.filter(p => p.name && p.qty > 0),
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
  };

  const cancelOrder = (orderId: string) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' as const } : o));
  };

  const clearFilters = () => {
    setFilterCampaign('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const hasFilters = filterCampaign || filterStatus || filterDateFrom || filterDateTo;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
            <p className="text-muted-foreground mt-1">Record and manage sales orders</p>
          </div>
          <button onClick={() => setShowAddOrder(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Add Order
          </button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Campaign</label>
              <select
                value={filterCampaign}
                onChange={(e) => setFilterCampaign(e.target.value)}
                className="form-select"
              >
                <option value="">All Campaigns</option>
                {campaigns.map(c => (
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

        {/* Orders Table */}
        <div className="dashboard-card overflow-hidden p-0">
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
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center text-muted-foreground py-8">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.slice().reverse().map((order) => {
                    const campaign = campaigns.find(c => c.id === order.campaignId);
                    return (
                      <tr key={order.id} className={`table-row ${order.status === 'cancelled' ? 'opacity-50' : ''}`}>
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
                          <span className="text-success font-medium">RM {order.commissionAmount.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground ml-1">({order.snapshotRate}%)</span>
                        </td>
                        <td className="table-cell">
                          <span className={order.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                            {order.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          {order.status === 'active' && (
                            <button 
                              onClick={() => cancelOrder(order.id)}
                              className="text-destructive hover:text-destructive/80 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-sm text-muted-foreground text-center">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

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
