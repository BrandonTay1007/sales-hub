import { useState, useMemo } from 'react';
import { Plus, Trash2, Info, X, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type Product, type User, type Campaign } from '@/lib/api';

export interface ProductRow {
    name: string;
    qty: number;
    basePrice: number;
}

interface OrderFormProps {
    /** Available campaigns to select from */
    campaigns: Campaign[];
    /** Currently selected campaign (for pre-selection, e.g., in CampaignDetailPage) */
    selectedCampaignId?: string;
    /** Whether campaign selection is locked (used when adding order to specific campaign) */
    campaignLocked?: boolean;
    /** User lookup map for getting sales person info */
    usersMap: Map<string, User>;
    /** Submit handler - receives campaign ID, products array, and date */
    onSubmit: (data: { campaignId: string; products: Product[]; createdAt: string }) => void;
    /** Cancel handler */
    onCancel: () => void;
    /** Whether form is submitting */
    isSubmitting?: boolean;
}

export const OrderForm = ({
    campaigns,
    selectedCampaignId: initialCampaignId = '',
    campaignLocked = false,
    usersMap,
    onSubmit,
    onCancel,
    isSubmitting = false,
}: OrderFormProps) => {
    const [selectedCampaignId, setSelectedCampaignId] = useState(initialCampaignId);
    const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [products, setProducts] = useState<ProductRow[]>([{ name: '', qty: 1, basePrice: 0 }]);

    // Get today's date for max date validation
    const today = new Date().toISOString().split('T')[0];

    const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
    const linkedSalesPerson = selectedCampaign
        ? usersMap.get(selectedCampaign.salesPersonId)
        : null;

    const orderTotal = useMemo(() =>
        products.reduce((sum, p) => sum + (p.qty * p.basePrice), 0),
        [products]
    );

    const commissionAmount = linkedSalesPerson
        ? orderTotal * (linkedSalesPerson.commissionRate / 100)
        : 0;

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
            updated[index].qty = Math.max(0, Number(value) || 0);
        } else if (field === 'basePrice') {
            updated[index].basePrice = Math.max(0, Number(value) || 0);
        }
        setProducts(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCampaignId) return;

        const validProducts = products.filter(p => p.name.trim() && p.qty > 0);
        if (validProducts.length === 0) return;

        onSubmit({
            campaignId: selectedCampaignId,
            products: validProducts.map(p => ({
                name: p.name.trim(),
                qty: p.qty,
                basePrice: p.basePrice,
            })),
            createdAt: orderDate,
        });
    };

    const hasValidProducts = products.some(p => p.name.trim() && p.qty > 0);

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campaign Selection */}
            <div>
                <label className="form-label">Campaign</label>
                {campaignLocked && selectedCampaign ? (
                    <div className="form-input bg-muted/50 cursor-not-allowed text-muted-foreground">
                        {selectedCampaign.title}
                    </div>
                ) : (
                    <select
                        required
                        value={selectedCampaignId}
                        onChange={(e) => setSelectedCampaignId(e.target.value)}
                        className="form-select"
                    >
                        <option value="">Choose a campaign...</option>
                        {campaigns.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Reference ID Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
                <Info className="w-4 h-4 text-primary" />
                <span>
                    {selectedCampaign
                        ? <>Reference ID will be generated as: <span className="font-mono text-foreground font-medium">{selectedCampaign.referenceId}-XX</span></>
                        : "Reference ID will be auto-generated upon creation"}
                </span>
            </div>

            {/* Sales Person Info */}
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

            {/* Order Date */}
            <div>
                <label className="form-label">Order Date</label>
                <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    max={today}
                    className="form-input"
                    required
                />
                <p className="text-xs text-muted-foreground mt-1">Cannot be a future date</p>
            </div>

            {/* Products */}
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

            {/* Commission Preview */}
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

            {/* Actions */}
            <div className="flex gap-3">
                <button type="button" onClick={onCancel} className="btn-secondary flex-1">
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={!selectedCampaignId || !hasValidProducts || isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </span>
                    ) : (
                        'Record Order'
                    )}
                </button>
            </div>
        </form>
    );
};

export default OrderForm;
