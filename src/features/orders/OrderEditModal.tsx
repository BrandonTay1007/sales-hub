import { useState, useEffect } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Order, type Product } from '@/lib/api';

interface ProductRow {
    name: string;
    qty: number;
    basePrice: number;
}

interface OrderEditModalProps {
    /** The order to edit (null for create mode) */
    order: Order | null;
    /** Whether the modal is open */
    open: boolean;
    /** Close handler */
    onOpenChange: (open: boolean) => void;
    /** Save handler - receives order ID and updated products */
    onSave: (orderId: string, products: Product[]) => void;
    /** Whether save is in progress */
    isLoading?: boolean;
    /** Snapshot rate for commission preview (from order or campaign) */
    snapshotRate?: number;
}

/**
 * Modal for editing order products
 * Used by both OrdersPage and CampaignDetailPage
 */
export const OrderEditModal = ({
    order,
    open,
    onOpenChange,
    onSave,
    isLoading = false,
    snapshotRate = 0,
}: OrderEditModalProps) => {
    const [products, setProducts] = useState<ProductRow[]>([{ name: '', qty: 1, basePrice: 0 }]);

    // Initialize products when order changes
    useEffect(() => {
        if (order && open) {
            setProducts(order.products.map(p => ({ ...p })));
        } else if (!order && open) {
            setProducts([{ name: '', qty: 1, basePrice: 0 }]);
        }
    }, [order, open]);

    const handleClose = () => {
        onOpenChange(false);
    };

    const updateProduct = (index: number, field: keyof ProductRow, value: string | number) => {
        const updated = [...products];
        if (field === 'name') {
            updated[index].name = value as string;
        } else if (field === 'qty') {
            updated[index].qty = Math.max(0, Number(value) || 0);
        } else if (field === 'basePrice') {
            updated[index].basePrice = Math.max(0, Number(value) || 0);
        }
        setProducts(updated);
    };

    const addProductRow = () => {
        setProducts([...products, { name: '', qty: 1, basePrice: 0 }]);
    };

    const removeProductRow = (index: number) => {
        if (products.length > 1) {
            setProducts(products.filter((_, i) => i !== index));
        }
    };

    const handleSave = () => {
        if (!order) return;

        const validProducts = products.filter(p => p.name.trim() && p.qty > 0);
        if (validProducts.length === 0) return;

        onSave(order.id, validProducts.map(p => ({
            name: p.name.trim(),
            qty: p.qty,
            basePrice: p.basePrice,
        })));
    };

    const orderTotal = products.reduce((sum, p) => sum + (p.qty * p.basePrice), 0);
    const rate = order?.snapshotRate || snapshotRate;
    const commissionPreview = orderTotal * (rate / 100);
    const validProductCount = products.filter(p => p.name.trim() && p.qty > 0).length;

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Order</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Order Date (read-only display) */}
                    <div>
                        <label className="form-label">Order Date</label>
                        <p className="text-sm text-muted-foreground">{order.createdAt.split('T')[0]}</p>
                    </div>

                    {/* Products */}
                    <div>
                        <label className="form-label">Products</label>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {products.map((product, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={product.name}
                                        onChange={(e) => updateProduct(index, 'name', e.target.value)}
                                        className="form-input flex-1"
                                        placeholder="Product name"
                                    />
                                    <input
                                        type="number"
                                        value={product.qty || ''}
                                        onChange={(e) => updateProduct(index, 'qty', e.target.value)}
                                        className="form-input w-16"
                                        placeholder="Qty"
                                        min="1"
                                    />
                                    <input
                                        type="number"
                                        value={product.basePrice || ''}
                                        onChange={(e) => updateProduct(index, 'basePrice', e.target.value)}
                                        className="form-input w-24"
                                        placeholder="Price"
                                        step="0.01"
                                        min="0"
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
                        <button
                            type="button"
                            onClick={addProductRow}
                            className="text-sm text-primary hover:underline mt-2"
                        >
                            + Add product
                        </button>
                    </div>

                    {/* Totals Preview */}
                    <div className="border-t border-border pt-4 bg-secondary/30 rounded-lg p-3">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Order Total</span>
                            <span className="font-medium">RM {orderTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">Snapshot Rate</span>
                            <span className="text-primary font-medium">{rate}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Commission Preview</span>
                            <span className="text-success font-medium">RM {commissionPreview.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn-secondary flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn-primary flex-1"
                            disabled={isLoading || validProductCount === 0}
                        >
                            {isLoading ? (
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
    );
};

export default OrderEditModal;
