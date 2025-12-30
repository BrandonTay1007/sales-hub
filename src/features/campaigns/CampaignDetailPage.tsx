import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ordersApi, campaignsApi, usersApi, type Campaign, type Order, type Product, getErrorMessage } from '@/lib/api';
import { ExternalLink, Calendar, User, MessageCircle, AlertCircle, Trash2, Plus, ArrowLeft, Loader2, Clock, CheckCircle2, Facebook, Instagram, StopCircle, RefreshCcw, Settings, Edit2, X, Info, PauseCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useOrderFilters } from '@/hooks/useOrderFilters';
import { OrderFilters } from '@/features/orders/OrderFilters';

interface ProductRow {
	name: string;
	qty: number;
	basePrice: number;
}

const CampaignDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { isAdmin } = useAuth();
	const [searchParams] = useSearchParams();
	const initialDateFilter = searchParams.get('date') || '';

	const [showAddOrder, setShowAddOrder] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [products, setProducts] = useState<ProductRow[]>([{ name: '', qty: 1, basePrice: 0 }]);
	const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
	const [isEditMode, setIsEditMode] = useState(false);
	const [editProducts, setEditProducts] = useState<ProductRow[]>([]);

	// Fetch campaign
	const { data: campaign, isLoading: campaignLoading, error: campaignError } = useQuery({
		queryKey: ['campaign', id],
		queryFn: async () => {
			const response = await campaignsApi.get(id!);
			if (!response.success) throw new Error(getErrorMessage(response));
			return response.data;
		},
		enabled: !!id,
	});

	// Fetch orders for this campaign
	const { data: campaignOrders = [], isLoading: ordersLoading } = useQuery({
		queryKey: ['orders', { campaignId: id }],
		queryFn: async () => {
			const response = await ordersApi.list({ campaignId: id });
			if (!response.success) throw new Error(getErrorMessage(response));
			return response.data || [];
		},
		enabled: !!id,
	});

	// Fetch sales person details
	const { data: salesPerson } = useQuery({
		queryKey: ['user', campaign?.salesPersonId],
		queryFn: async () => {
			if (!campaign?.salesPersonId) return null;
			const response = await usersApi.get(campaign.salesPersonId);
			if (!response.success) return null;
			return response.data;
		},
		enabled: !!campaign?.salesPersonId,
	});

	// Use order filters hook
	const {
		filteredOrders,
		filters,
		setters,
		clearFilters,
		hasFilters
	} = useOrderFilters({
		orders: campaignOrders,
		isAdmin: true, // We already fetched orders specific to this campaign, so bypass the hook's ownership check
	});

	// Apply URL parameter filters (from PayoutsPage navigation)
	useEffect(() => {
		const month = searchParams.get('month');
		const year = searchParams.get('year');

		// If month/year match current month, use "This month" quick filter
		if (month && year) {
			const currentMonth = new Date().getMonth() + 1;
			const currentYear = new Date().getFullYear();

			if (parseInt(month) === currentMonth && parseInt(year) === currentYear) {
				setters.setQuick('month');
			} else {
				// For other months, calculate the date range
				const monthNum = parseInt(month);
				const yearNum = parseInt(year);

				const startDate = new Date(yearNum, monthNum - 1, 1);
				const endDate = new Date(yearNum, monthNum, 0);

				setters.setDateFrom(startDate.toISOString().split('T')[0]);
				setters.setDateTo(endDate.toISOString().split('T')[0]);
			}
		}
	}, [searchParams, setters]);

	// Settings form state
	const [editForm, setEditForm] = useState({
		title: '',
		url: '',
		platform: 'facebook' as 'facebook' | 'instagram',
		type: 'post' as 'post' | 'live' | 'event',
		startDate: '',
	});

	// Delete state
	const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
	const [pendingDelete, setPendingDelete] = useState<{ id: string; timer: ReturnType<typeof setTimeout> } | null>(null);
	const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null);

	// Update form when campaign loads
	useEffect(() => {
		if (campaign && editForm.title === '') {
			setEditForm({
				title: campaign.title,
				url: campaign.url,
				platform: campaign.platform,
				type: campaign.type,
				startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
			});
		}
	}, [campaign, editForm.title]);

	// Create order mutation
	const createOrderMutation = useMutation({
		mutationFn: async (data: { campaignId: string; products: Product[] }) => {
			const response = await ordersApi.create(data);
			if (!response.success) throw new Error(getErrorMessage(response));
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['orders'] });
			setShowAddOrder(false);
			setProducts([{ name: '', qty: 1, basePrice: 0 }]);
			toast.success('Order added successfully!');
		},
		onError: (error: Error) => {
			toast.error('Failed to add order', { description: error.message });
		},
	});

	// Update order mutation
	const updateOrderMutation = useMutation({
		mutationFn: async ({ id, products }: { id: string; products: Product[] }) => {
			const response = await ordersApi.update(id, { products });
			if (!response.success) throw new Error(getErrorMessage(response));
			return response.data;
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['orders'] });
			setViewingOrder(data || null);
			setIsEditMode(false);
			toast.success('Order updated!');
		},
		onError: (error: Error) => {
			toast.error('Failed to update order', { description: error.message });
		},
	});

	// Delete order mutation
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

	// Update campaign mutation
	const updateCampaignMutation = useMutation({
		mutationFn: async (data: { title: string; url: string; platform: 'facebook' | 'instagram'; type: 'post' | 'live' | 'event'; startDate?: string }) => {
			const response = await campaignsApi.update(id!, data);
			if (!response.success) throw new Error(getErrorMessage(response));
			return response.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaign', id] });
			setShowSettings(false);
			toast.success('Campaign updated!');
		},
		onError: (error: Error) => {
			toast.error('Failed to update campaign', { description: error.message });
		},
	});

	// Update campaign status mutation
	const updateStatusMutation = useMutation({
		mutationFn: async (newStatus: 'active' | 'completed') => {
			// When ending a campaign, set endDate to now; when reactivating, clear endDate
			const updateData = {
				status: newStatus,
				...(newStatus === 'completed' && { endDate: new Date().toISOString() }),
				...(newStatus === 'active' && { endDate: null }),
			};
			const response = await campaignsApi.update(id!, updateData);
			if (!response.success) throw new Error(getErrorMessage(response));
			return response.data;
		},
		onSuccess: (_, newStatus) => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			queryClient.invalidateQueries({ queryKey: ['campaign', id] });
			toast.success(newStatus === 'completed' ? 'Campaign ended successfully' : 'Campaign reactivated');
		},
		onError: (error: Error) => {
			toast.error('Failed to update campaign status', { description: error.message });
		},
	});

	// Delete campaign mutation
	const deleteCampaignMutation = useMutation({
		mutationFn: async (campaignId: string) => {
			const response = await campaignsApi.delete(campaignId);
			if (!response.success) throw new Error(getErrorMessage(response));
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['campaigns'] });
			navigate('/campaigns');
			toast.success('Campaign deleted');
		},
		onError: (error: Error) => {
			toast.error('Failed to delete campaign', { description: error.message });
		},
	});

	const confirmDeleteCampaign = () => {
		if (!deleteCampaignId) return;
		const campaignId = deleteCampaignId;
		setDeleteCampaignId(null);

		let timer: NodeJS.Timeout;

		// Initial toast with undo
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

		// Set timer for actual deletion
		timer = setTimeout(() => {
			deleteCampaignMutation.mutate(campaignId);
			setPendingDelete(null);
		}, 5000);

		setPendingDelete({ id: campaignId, timer });
	};

	if (campaignError) {
		return (
			<DashboardLayout>
				<div className="text-center py-12">
					<p className="text-destructive">Error: {(campaignError as Error).message}</p>
					<Link to="/campaigns" className="text-primary hover:underline mt-2 inline-block">
						Back to Campaigns
					</Link>
				</div>
			</DashboardLayout>
		);
	}

	if (campaignLoading) {
		return (
			<DashboardLayout>
				<div className="space-y-6">
					<div className="flex items-center gap-4">
						<Skeleton className="w-10 h-10 rounded-lg" />
						<div>
							<Skeleton className="h-6 w-48 mb-2" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						{[1, 2, 3].map(i => (
							<div key={i} className="stat-card">
								<Skeleton className="h-4 w-24 mb-2" />
								<Skeleton className="h-8 w-32" />
							</div>
						))}
					</div>
				</div>
			</DashboardLayout>
		);
	}

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

	const totalRevenue = campaignOrders.reduce((sum, o) => sum + o.orderTotal, 0);
	const totalCommission = campaignOrders.reduce((sum, o) => sum + (o.commissionPaused ? 0 : o.commissionAmount), 0);
	const totalItemsSold = campaignOrders.reduce((sum, o) => sum + o.products.reduce((s, p) => s + p.qty, 0), 0);

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

		const validProducts = products.filter(p => p.name && p.qty > 0);
		if (validProducts.length === 0) {
			toast.error('Please add at least one product');
			return;
		}

		createOrderMutation.mutate({
			campaignId: campaign.id,
			products: validProducts.map(p => ({ name: p.name, qty: p.qty, basePrice: p.basePrice })),
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

		updateOrderMutation.mutate({
			id: viewingOrder.id,
			products: validProducts.map(p => ({ name: p.name, qty: p.qty, basePrice: p.basePrice })),
		});
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
		updateCampaignMutation.mutate(editForm);
	};

	const getPlatformIcon = (platform: string) => {
		return platform === 'facebook' ? (
			<Facebook className="w-5 h-5 text-[#1877F2]" />
		) : (
			<Instagram className="w-5 h-5 text-[#E4405F]" />
		);
	};

	const getAvatar = (name: string) => {
		return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
								<div className="flex items-center gap-2">
									<span className="text-lg font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
										{campaign.referenceId}
									</span>
									<h1 className="text-2xl font-bold text-foreground">{campaign.title}</h1>
									<span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${campaign.type === 'post' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
										campaign.type === 'live' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
											'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
										}`}>
										{campaign.type}
									</span>
									<span className={campaign.status === 'active' ? 'badge-active' : 'badge-inactive'}>
										{campaign.status}
									</span>
								</div>
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
							{campaign.status === 'active' && (
								<button
									onClick={() => updateStatusMutation.mutate('completed')}
									className="btn-secondary text-destructive border-destructive/50 hover:bg-destructive/10"
									disabled={updateStatusMutation.isPending}
								>
									<StopCircle className="w-4 h-4" />
									{updateStatusMutation.isPending ? 'Ending...' : 'End Campaign'}
								</button>
							)}
							{campaign.status === 'completed' && (
								<button
									onClick={() => updateStatusMutation.mutate('active')}
									className="btn-primary"
									disabled={updateStatusMutation.isPending}
								>
									<RefreshCcw className="w-4 h-4" />
									{updateStatusMutation.isPending ? 'Reactivating...' : 'Reactivate Campaign'}
								</button>
							)}

							<button
								onClick={() => setDeleteCampaignId(campaign.id)}
								className="btn-secondary text-destructive border-destructive/50 hover:bg-destructive/10"
								disabled={deleteCampaignMutation.isPending || !!pendingDelete}
							>
								<Trash2 className="w-4 h-4" />
								Delete
							</button>
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
								{getAvatar(salesPerson.name)}
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
							<div className="flex flex-col gap-4 mb-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<h3 className="font-semibold text-foreground">Campaign Orders</h3>
										<span className="text-sm text-muted-foreground">({filteredOrders.length})</span>
									</div>
									{isAdmin && (
										<Tooltip>
											<TooltipTrigger asChild>
												<span>
													<button
														onClick={() => setShowAddOrder(true)}
														className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
														disabled={campaign.status !== 'active'}
													>
														<Plus className="w-4 h-4" />
														Add Order
													</button>
												</span>
											</TooltipTrigger>
											{campaign.status !== 'active' && (
												<TooltipContent>
													<p>Reactivate campaign to add orders</p>
												</TooltipContent>
											)}
										</Tooltip>
									)}
								</div>

								{/* Filters */}
								<OrderFilters
									filters={filters}
									setters={setters}
									onClear={clearFilters}
									hasFilters={hasFilters}
									isAdmin={false} // Hide sales person filter in campaign detail view
									userCampaigns={[]} // Not needed
									salesUsers={[]} // Not needed
									showCampaignFilter={false}
									className="mb-4"
								/>
							</div>

							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-secondary/50">
										<tr>
											<th className="table-header">Ref</th>
											<th className="table-header">Date</th>
											<th className="table-header">Products</th>
											<th className="table-header text-right">Total</th>
											<th className="table-header text-right">Commission</th>
											{isAdmin && <th className="table-header">Actions</th>}
										</tr>
									</thead>
									<tbody>
										{ordersLoading ? (
											Array.from({ length: 3 }).map((_, i) => (
												<tr key={i} className="table-row">
													<td className="table-cell"><Skeleton className="h-4 w-20" /></td>
													<td className="table-cell"><Skeleton className="h-4 w-20" /></td>
													<td className="table-cell"><Skeleton className="h-4 w-16" /></td>
													<td className="table-cell text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
													<td className="table-cell text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
													{isAdmin && <td className="table-cell"><Skeleton className="h-6 w-16" /></td>}
												</tr>
											))
										) : filteredOrders.length === 0 ? (
											<tr>
												<td colSpan={isAdmin ? 6 : 5} className="table-cell text-center text-muted-foreground py-8">
													{hasFilters ? 'No orders match your filters' : 'No orders yet'}
												</td>
											</tr>
										) : (
											filteredOrders.map((order) => (
												<tr
													key={order.id}
													className="table-row cursor-pointer hover:bg-secondary/70"
													onClick={() => handleRowClick(order)}
												>
													<td className="table-cell font-mono text-xs text-muted-foreground">{order.referenceId}</td>
													<td className="table-cell">{order.createdAt.split('T')[0]}</td>
													<td className="table-cell">
														<Tooltip>
															<TooltipTrigger className="text-left">
																<span className="text-sm">
																	{order.products[0]?.name || 'No products'}
																	{order.products.length > 1 && ` +${order.products.length - 1} more`}
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
													<td className="table-cell text-right font-medium">RM {order.orderTotal.toFixed(2)}</td>
													<td className="table-cell text-right">
														{order.commissionPaused ? (
															<Tooltip>
																<TooltipTrigger className="flex items-center gap-1 justify-end">
																	<PauseCircle className="w-3.5 h-3.5 text-amber-500" />
																	<span className="text-muted-foreground">RM 0.00</span>
																</TooltipTrigger>
																<TooltipContent>
																	<p className="text-amber-500">Commission Paused</p>
																	<p className="text-xs text-muted-foreground">Original: RM {order.commissionAmount.toFixed(2)}</p>
																</TooltipContent>
															</Tooltip>
														) : (
															<span className="text-success">RM {order.commissionAmount.toFixed(2)}</span>
														)}
													</td>
													{isAdmin && (
														<td className="table-cell">
															<div className="flex items-center gap-2">
																<button
																	onClick={(e) => { e.stopPropagation(); setViewingOrder(order); setIsEditMode(true); setEditProducts(order.products.map(p => ({ ...p }))); }}
																	className="p-1 hover:bg-secondary rounded transition-colors"
																	title="Edit Order"
																>
																	<Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
																</button>
																<button
																	onClick={(e) => { e.stopPropagation(); setDeleteOrderId(order.id); }}
																	className="p-1 hover:bg-destructive/10 rounded transition-colors"
																	title="Delete Order"
																	disabled={pendingDelete?.id === order.id}
																>
																	<Trash2 className="w-4 h-4 text-destructive" />
																</button>
															</div>
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
									<p className="text-sm text-muted-foreground">Items Sold</p>
									<p className="text-xl font-bold text-foreground">{totalItemsSold}</p>
								</div>
								<div className="p-4 rounded-lg bg-secondary/30">
									<p className="text-sm text-muted-foreground">Avg. Order Value</p>
									<p className="text-xl font-bold text-foreground">
										RM {campaignOrders.length > 0 ? (totalRevenue / campaignOrders.length).toFixed(2) : '0.00'}
									</p>
								</div>
								<div className="p-4 rounded-lg bg-secondary/30">
									<p className="text-sm text-muted-foreground">Commission Rate</p>
									<p className="text-xl font-bold text-primary">{salesPerson?.commissionRate || 0}%</p>
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>

				{/* Settings Modal */}
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

							<div>
								<label className="form-label">Start Date</label>
								<input
									type="date"
									value={editForm.startDate}
									onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
									className="form-input"
								/>
							</div>

							<div className="flex gap-3 pt-2">
								<button onClick={() => setShowSettings(false)} className="btn-secondary flex-1">
									Cancel
								</button>
								<button
									onClick={handleSaveSettings}
									className="btn-primary flex-1"
									disabled={updateCampaignMutation.isPending}
								>
									{updateCampaignMutation.isPending ? (
										<span className="flex items-center justify-center gap-2">
											<Loader2 className="w-4 h-4 animate-spin" />
											Saving...
										</span>
									) : (
										'Save Changes'
									)}
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
													onBlur={(e) => {
														const val = parseFloat(e.target.value);
														if (!isNaN(val) && val >= 0) {
															updateProduct(index, 'basePrice', val.toFixed(2));
														}
													}}
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
									<button
										type="submit"
										className="btn-primary flex-1"
										disabled={createOrderMutation.isPending}
									>
										{createOrderMutation.isPending ? (
											<span className="flex items-center justify-center gap-2">
												<Loader2 className="w-4 h-4 animate-spin" />
												Adding...
											</span>
										) : (
											'Add Order'
										)}
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
							<DialogTitle className="flex items-center gap-2">
								Order Details
								{viewingOrder?.referenceId && (
									<span className="text-sm font-mono font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded">
										{viewingOrder.referenceId}
									</span>
								)}
							</DialogTitle>
						</DialogHeader>
						{viewingOrder && (
							<div className="space-y-4">
								<div>
									<p className="text-sm text-muted-foreground">Date</p>
									<p className="font-medium">{viewingOrder.createdAt.split('T')[0]}</p>
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
										{viewingOrder.commissionPaused ? (
											<Tooltip>
												<TooltipTrigger className="flex items-center gap-1">
													<PauseCircle className="w-4 h-4 text-amber-500" />
													<span className="text-muted-foreground font-bold">RM 0.00</span>
												</TooltipTrigger>
												<TooltipContent>
													<p className="text-amber-500">Commission Paused</p>
													<p className="text-xs text-muted-foreground">Original: RM {viewingOrder.commissionAmount.toFixed(2)}</p>
												</TooltipContent>
											</Tooltip>
										) : (
											<span className="text-success font-bold">
												RM {isEditMode
													? (editProducts.reduce((sum, p) => sum + (p.qty * p.basePrice), 0) * (viewingOrder.snapshotRate / 100)).toFixed(2)
													: viewingOrder.commissionAmount.toFixed(2)
												}
											</span>
										)}
									</div>
								</div>

								{isEditMode ? (
									<div className="flex gap-3">
										<button onClick={() => setIsEditMode(false)} className="btn-secondary flex-1">
											Cancel
										</button>
										<button
											onClick={handleSaveEdit}
											className="btn-primary flex-1"
											disabled={updateOrderMutation.isPending}
										>
											{updateOrderMutation.isPending ? (
												<span className="flex items-center justify-center gap-2">
													<Loader2 className="w-4 h-4 animate-spin" />
													Saving...
												</span>
											) : (
												'Save Changes'
											)}
										</button>
									</div>
								) : (
									isAdmin && (
										<button
											onClick={() => { deleteOrderMutation.mutate(viewingOrder.id); }}
											className="w-full text-destructive hover:bg-destructive/10 py-2 rounded-lg transition-colors text-sm font-medium"
											disabled={deleteOrderMutation.isPending}
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
			{/* Confirm Delete Order Dialog */}
			<ConfirmDeleteDialog
				open={!!deleteOrderId}
				onOpenChange={(open) => !open && setDeleteOrderId(null)}
				title="Delete Order"
				description="Are you sure you want to delete this order? This action cannot be undone."
				onConfirm={confirmDeleteOrder}
			/>

			{/* Confirm Delete Campaign Dialog */}
			<ConfirmDeleteDialog
				open={!!deleteCampaignId}
				onOpenChange={(open) => !open && setDeleteCampaignId(null)}
				title="Delete Campaign"
				description="Are you sure you want to delete this campaign? This action cannot be undone and will delete all associated orders."
				onConfirm={confirmDeleteCampaign}
			/>
		</DashboardLayout >
	);
};

export default CampaignDetailPage;
