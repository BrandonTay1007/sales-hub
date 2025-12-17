import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { campaigns, users, orders as initialOrders, Order } from '@/lib/mockData';
import { Plus, Trash2, Info } from 'lucide-react';

interface ProductRow {
  name: string;
  qty: number;
  basePrice: number;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [products, setProducts] = useState<ProductRow[]>([{ name: '', qty: 1, basePrice: 0 }]);

  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const linkedSalesPerson = selectedCampaign 
    ? users.find(u => u.id === selectedCampaign.assignedSalesPersonId)
    : null;

  const orderTotal = products.reduce((sum, p) => sum + (p.qty * p.basePrice), 0);
  const commissionAmount = linkedSalesPerson ? orderTotal * (linkedSalesPerson.commissionRate / 100) : 0;

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
    };

    setOrders([...orders, newOrder]);
    setSelectedCampaignId('');
    setProducts([{ name: '', qty: 1, basePrice: 0 }]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Entry</h1>
          <p className="text-muted-foreground mt-1">Record new sales orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="dashboard-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">New Order</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                      Linked Sales Person: {linkedSalesPerson.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current Rate: <span className="font-semibold text-primary">{linkedSalesPerson.commissionRate}%</span>
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
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Product name"
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
                        className="form-input w-20"
                      />
                      <input
                        type="number"
                        placeholder="Price"
                        step="0.01"
                        min="0"
                        value={product.basePrice || ''}
                        onChange={(e) => updateProduct(index, 'basePrice', e.target.value)}
                        className="form-input w-24"
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

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Total</span>
                  <span className="font-semibold text-foreground">${orderTotal.toFixed(2)}</span>
                </div>
                {linkedSalesPerson && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Commission ({linkedSalesPerson.commissionRate}%)</span>
                    <span className="font-semibold text-success">${commissionAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <button type="submit" className="btn-primary w-full" disabled={!selectedCampaignId}>
                Record Order
              </button>
            </form>
          </div>

          <div className="dashboard-card">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Orders</h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {orders.slice().reverse().map((order) => {
                const campaign = campaigns.find(c => c.id === order.campaignId);
                return (
                  <div key={order.id} className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{campaign?.title}</span>
                      <span className="text-xs text-muted-foreground">{order.createdAt}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{order.products.length} items</span>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">${order.orderTotal.toFixed(2)}</p>
                        <p className="text-xs text-success">+${order.commissionAmount.toFixed(2)} comm.</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
