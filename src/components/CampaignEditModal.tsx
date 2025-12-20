import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Campaign, users } from '@/lib/mockData';
import { StopCircle } from 'lucide-react';

interface CampaignEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (formData: CampaignFormData) => void;
    onEndCampaign?: () => void;
    campaign?: Campaign | null;
    isCreation?: boolean;
}

export interface CampaignFormData {
    title: string;
    platform: 'facebook' | 'instagram';
    type: 'post' | 'live' | 'event';
    url: string;
    assignedSalesPersonId: string;
    startDate: string;
    endDate: string;
}

export const CampaignEditModal = ({
    open,
    onOpenChange,
    onSubmit,
    onEndCampaign,
    campaign,
    isCreation = false
}: CampaignEditModalProps) => {
    // We need to manage state here to handle both creation (empty state) and edit (pre-filled)
    // However, for simplicity and to avoid state sync issues, we can stick to uncontrolled inputs with defaults
    // OR switch to controlled state. Given the complexity, let's use uncontrolled for now but handle the defaults properly.

    // Actually, controlled state might be better to handle the "reset" on open/close for creation.
    // Let's use uncontrolled with key to force re-render, simpler.

    if (!open) return null;

    const salesUsers = users.filter(u => u.role === 'sales');
    const salesPerson = campaign ? users.find(u => u.id === campaign.assignedSalesPersonId) : null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSubmit({
            title: formData.get('title') as string,
            platform: formData.get('platform') as 'facebook' | 'instagram',
            type: formData.get('type') as 'post' | 'live' | 'event',
            url: formData.get('url') as string,
            assignedSalesPersonId: formData.get('assignedSalesPersonId') as string || campaign?.assignedSalesPersonId || '',
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{isCreation ? 'Create Campaign' : 'Edit Campaign'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            name="title"
                            required
                            defaultValue={campaign?.title || ''}
                            className="form-input"
                            placeholder="Summer Sale 2025"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Platform</label>
                            <select
                                name="platform"
                                defaultValue={campaign?.platform || 'facebook'}
                                className="form-select"
                            >
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Type</label>
                            <select
                                name="type"
                                defaultValue={campaign?.type || 'post'}
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
                            type="text"
                            name="url"
                            required
                            defaultValue={campaign?.url || ''}
                            className="form-input"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="form-label">Assigned Sales Person</label>
                        {isCreation ? (
                            <select
                                name="assignedSalesPersonId"
                                required
                                defaultValue=""
                                className="form-select"
                            >
                                <option value="">Select...</option>
                                {salesUsers.map(user => (
                                    <option key={user.id} value={user.id}>{user.name} ({user.commissionRate}%)</option>
                                ))}
                            </select>
                        ) : (
                            <div className="form-input bg-muted/50 cursor-not-allowed text-muted-foreground flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                    {salesPerson?.avatar}
                                </div>
                                <span>{salesPerson?.name || 'Unknown'}</span>
                                <span className="text-xs ml-auto">Cannot be changed</span>
                                {/* Hidden input to keep the value in form submission if needed, but we handle it in handleSubmit */}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                defaultValue={campaign?.startDate || ''}
                                className="form-input"
                            />
                        </div>
                        <div>
                            <label className="form-label">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                defaultValue={campaign?.endDate || ''}
                                className="form-input"
                            />
                        </div>
                    </div>

                    {!isCreation && campaign?.status === 'active' && onEndCampaign && (
                        <button
                            type="button"
                            onClick={onEndCampaign}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                            <StopCircle className="w-4 h-4" />
                            End Campaign Now
                        </button>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => onOpenChange(false)} className="btn-secondary flex-1">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            {isCreation ? 'Create Campaign' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
