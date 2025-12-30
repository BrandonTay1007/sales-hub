import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ordersApi, campaignsApi, usersApi, type Order, type Campaign, type User, type Product, getErrorMessage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Filter, Loader2, Trash2, Edit2, ClipboardList, ShoppingCart, X, Facebook, Instagram, Pencil, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderForm } from '@/features/orders/OrderForm';
import { OrderDetailsDialog, formatProductsSummary } from '@/features/orders/OrderDetailsDialog';
import { OrderEditModal } from '@/features/orders/OrderEditModal';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { OrderFilters } from '@/features/orders/OrderFilters';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const OrdersPage = () => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [showAddOrder, setShowAddOrder] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; timer: ReturnType<typeof setTimeout> } | null>(null);

  // Fetch all required data
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await ordersApi.list({});
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await campaignsApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.list();
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data || [];
    },
    enabled: isAdmin,
  });

  // Create lookup maps
  const usersMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach(u => map.set(u.id, u));
    return map;
  }, [users]);

  const campaignsMap = useMemo(() => {
    const map = new Map<string, Campaign>();
    campaigns.forEach(c => map.set(c.id, c));
    return map;
  }, [campaigns]);

  // Get sales persons for filter dropdown (admin only)
  const salesPersons = useMemo(() =>
    users.filter(u => u.role === 'sales'),
    [users]
  );

  // Get user's campaigns for non-admin filtering
  const userCampaigns = useMemo(() =>
    campaigns.filter(c => c.salesPersonId === user?.id),
    [campaigns, user?.id]
  );

  const availableCampaigns = isAdmin ? campaigns : userCampaigns;
  const activeCampaigns = availableCampaigns.filter(c => (c as Campaign & { status?: string }).status !== 'completed');

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: async (data: { campaignId: string; products: Product[]; createdAt: string }) => {
      const response = await ordersApi.create({
        campaignId: data.campaignId,
        products: data.products,
      });
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setShowAddOrder(false);
      toast.success('Order created successfully!');
    },
    onError: (error: Error) => {
      toast.error('Failed to create order', { description: error.message });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, products }: { id: string; products: Product[] }) => {
      const response = await ordersApi.update(id, { products });
      if (!response.success) throw new Error(getErrorMessage(response));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setEditingOrder(null);
      toast.success('Order updated!');
    },
    onError: (error: Error) => {
      toast.error('Failed to update order', { description: error.message });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await ordersApi.delete(orderId);
      if (!response.success) throw new Error(getErrorMessage(response));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setViewingOrder(null);
      toast.success('Order deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete order', { description: error.message });
    },
  });

  // Use the new hook for filtering and sorting
  const {
    filteredOrders,
    filters,
    setters,
    clearFilters,
    hasFilters
  } = useOrderFilters({
    orders,
    campaignsMap,
    isAdmin,
    userCampaigns: isAdmin ? [] : userCampaigns
  });

  const isLoading = ordersLoading || campaignsLoading || (isAdmin && usersLoading);

  const handleDeleteOrder = (orderId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteOrderId(orderId);
  };

  const confirmDeleteOrder = () => {
    if (!deleteOrderId) return;
    const orderId = deleteOrderId;
    setDeleteOrderId(null);

    let timer: NodeJS.Timeout;

    // Show undo toast with 5-second window
    const toastId = toast('Order will be deleted in 5 seconds', {
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
      deleteOrderMutation.mutate(orderId);
      setPendingDelete(null);
    }, 5000);

    setPendingDelete({ id: orderId, timer });
  };

  const handleEditOrder = (order: Order, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingOrder(order);
  };

  if (ordersError) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load orders</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
            className="btn-primary mt-4"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

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
        <OrderFilters
          filters={filters}
          setters={setters}
          onClear={clearFilters}
          hasFilters={hasFilters}
          isAdmin={isAdmin}
          userCampaigns={availableCampaigns}
          salesUsers={salesPersons}
        />

        {/* Orders Table */}
        <div className="dashboard-card overflow-hidden p-0">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="text-sm text-muted-foreground">
              {isLoading ? <Skeleton className="h-4 w-20" /> : `${filteredOrders.length} orders`}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="table-header">Ref</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Campaign</th>
                  <th className="table-header">Products</th>
                  {isAdmin && <th className="table-header">Sales Person</th>}
                  <th className="table-header text-right">Total</th>
                  <th className="table-header text-right">Commission</th>
                  {isAdmin && <th className="table-header text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="table-row">
                      <td className="table-cell"><Skeleton className="h-4 w-20" /></td>
                      <td className="table-cell"><Skeleton className="h-4 w-24" /></td>
                      <td className="table-cell"><Skeleton className="h-4 w-32" /></td>
                      <td className="table-cell"><Skeleton className="h-4 w-28" /></td>
                      {isAdmin && <td className="table-cell"><Skeleton className="h-4 w-24" /></td>}
                      <td className="table-cell"><Skeleton className="h-4 w-20 ml-auto" /></td>
                      <td className="table-cell"><Skeleton className="h-4 w-20 ml-auto" /></td>
                      {isAdmin && <td className="table-cell"><Skeleton className="h-4 w-16 mx-auto" /></td>}
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 6} className="table-cell text-center text-muted-foreground py-8">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const campaign = campaignsMap.get(order.campaignId);
                    const salesPerson = campaign ? usersMap.get(campaign.salesPersonId) : null;

                    return (
                      <tr
                        key={order.id}
                        className="table-row cursor-pointer hover:bg-secondary/70"
                        onClick={() => setViewingOrder(order)}
                      >
                        <td className="table-cell font-mono text-xs text-muted-foreground">{order.referenceId}</td>
                        <td className="table-cell">{order.createdAt.split('T')[0]}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            {campaign && (
                              campaign.platform === 'facebook'
                                ? <Facebook className="w-4 h-4 text-[#1877F2]" />
                                : <Instagram className="w-4 h-4 text-[#E4405F]" />
                            )}
                            <span className="font-medium">{campaign?.title || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <Tooltip>
                            <TooltipTrigger className="text-left">
                              <span className="text-sm">
                                {formatProductsSummary(order.products)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                {order.products.map((p, i) => (
                                  <p key={i}>{p.name} ×{p.qty} (RM{(p.qty * p.basePrice).toFixed(2)})</p>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        {isAdmin && (
                          <td className="table-cell text-sm">
                            {salesPerson?.name || '-'}
                          </td>
                        )}
                        <td className="table-cell text-right font-medium">
                          RM {order.orderTotal.toFixed(2)}
                        </td>
                        <td className="table-cell text-right">
                          <Tooltip>
                            <TooltipTrigger>
                              {order.commissionPaused ? (
                                isAdmin ? (
                                  // Admin sees actual value with pause indicator
                                  <span className="flex items-center gap-1 justify-end">
                                    <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-amber-600 dark:text-amber-400 font-medium">RM {order.commissionAmount.toFixed(2)}</span>
                                    <span className="text-xs text-muted-foreground">({order.snapshotRate}%)</span>
                                  </span>
                                ) : (
                                  // Sales sees RM 0.00
                                  <span className="text-muted-foreground font-medium flex items-center gap-1 justify-end">
                                    <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                                    RM 0.00
                                  </span>
                                )
                              ) : (
                                <>
                                  <span className="text-success font-medium">RM {order.commissionAmount.toFixed(2)}</span>
                                  <span className="text-xs text-muted-foreground ml-1">({order.snapshotRate}%)</span>
                                </>
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              {order.commissionPaused ? (
                                <>
                                  <p className="text-amber-500">Commission Paused</p>
                                  <p className="text-xs text-muted-foreground">This order's commission is paused ({order.snapshotRate}%)</p>
                                </>
                              ) : (
                                <>
                                  <p>Snapshot Rate: {order.snapshotRate}%</p>
                                  <p className="text-xs text-muted-foreground">Rate locked at order creation</p>
                                </>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        {isAdmin && (
                          <td className="table-cell text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={(e) => handleEditOrder(order, e)}
                                className="p-1.5 hover:bg-secondary rounded transition-colors"
                                title="Edit Order"
                              >
                                <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteOrder(order.id, e)}
                                className="p-1.5 hover:bg-destructive/10 rounded transition-colors"
                                title="Delete Order"
                                disabled={deleteOrderMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                              </button>
                            </div>
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

      {/* View-only Order Detail Dialog */}
      <OrderDetailsDialog
        order={viewingOrder}
        campaign={viewingOrder ? campaignsMap.get(viewingOrder.campaignId) : null}
        salesPerson={viewingOrder ? usersMap.get(campaignsMap.get(viewingOrder.campaignId)?.salesPersonId || '') : null}
        open={!!viewingOrder}
        onOpenChange={(open) => !open && setViewingOrder(null)}
      />

      {/* Edit Order Modal */}
      <OrderEditModal
        order={editingOrder}
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
        onSave={(orderId, products) => updateOrderMutation.mutate({ id: orderId, products })}
        isLoading={updateOrderMutation.isPending}
      />

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

            <div className="p-6">
              <OrderForm
                campaigns={activeCampaigns}
                usersMap={usersMap}
                onSubmit={(data) => createOrderMutation.mutate(data)}
                onCancel={() => setShowAddOrder(false)}
                isSubmitting={createOrderMutation.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteOrderId}
        onOpenChange={(open) => !open && setDeleteOrderId(null)}
        title="Delete Order"
        description="Are you sure you want to delete this order? You can undo this action within 5 seconds."
        onConfirm={confirmDeleteOrder}
        isLoading={false}
      />
    </DashboardLayout>
  );
};

export default OrdersPage;