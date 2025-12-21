import { Facebook, Instagram } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type Order, type Campaign, type User } from '@/lib/api';

interface OrderDetailsDialogProps {
    /** The order to display */
    order: Order | null;
    /** Campaign info for context */
    campaign?: Campaign | null;
    /** Sales person info */
    salesPerson?: User | null;
    /** Whether the dialog is open */
    open: boolean;
    /** Close handler */
    onOpenChange: (open: boolean) => void;
}

/** Format products for display in table column - "Widget ×2 +1 more" */
export const formatProductsSummary = (products: { name: string; qty: number }[]): string => {
    if (products.length === 0) return '-';

    const first = products[0];
    const firstDisplay = `${first.name} ×${first.qty}`;

    if (products.length === 1) {
        return firstDisplay;
    }

    return `${firstDisplay} +${products.length - 1} more`;
};

/** Format products for tooltip display */
export const formatProductsTooltip = (products: { name: string; qty: number; basePrice: number }[]): string => {
    return products.map(p => `${p.name} ×${p.qty} (RM${(p.qty * p.basePrice).toFixed(2)})`).join('\n');
};

const getPlatformIcon = (platform: string) => {
    return platform === 'facebook' ? (
        <Facebook className="w-4 h-4 text-[#1877F2]" />
    ) : (
        <Instagram className="w-4 h-4 text-[#E4405F]" />
    );
};

const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
        post: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        live: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        event: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[type] || 'bg-secondary'}`}>
            {type}
        </span>
    );
};

/**
 * View-only order details dialog - receipt style
 * For editing, use OrderEditModal instead
 */
export const OrderDetailsDialog = ({
    order,
    campaign,
    salesPerson,
    open,
    onOpenChange,
}: OrderDetailsDialogProps) => {
    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Order Details
                        {order.referenceId && (
                            <span className="text-sm font-mono font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                {order.referenceId}
                            </span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Campaign Context - Receipt Style */}
                    {campaign && (
                        <div className="p-3 rounded-lg bg-secondary/30 border border-border">
                            <div className="flex items-center gap-2 mb-2">
                                {getPlatformIcon(campaign.platform)}
                                <span className="font-medium text-foreground">{campaign.title}</span>
                                {getTypeBadge(campaign.type)}
                            </div>
                            {salesPerson && (
                                <p className="text-sm text-muted-foreground">
                                    Sales: {salesPerson.name} • Rate: <span className="text-primary font-medium">{order.snapshotRate}%</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">{order.createdAt.split('T')[0]}</p>
                    </div>

                    {/* Products */}
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">Products</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {order.products.map((product, index) => (
                                <div key={index} className="flex justify-between p-2 bg-secondary/30 rounded">
                                    <span>{product.name} × {product.qty}</span>
                                    <span className="font-medium">RM {(product.basePrice * product.qty).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-border pt-4">
                        <div className="flex justify-between mb-2">
                            <span className="text-muted-foreground">Order Total</span>
                            <span className="font-bold">RM {order.orderTotal.toFixed(2)}</span>
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
                            <span className="text-primary font-medium">{order.snapshotRate}%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Commission</span>
                            <span className="text-success font-bold">RM {order.commissionAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailsDialog;
