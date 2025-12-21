import { Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmDeleteDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Handler when open state changes */
    onOpenChange: (open: boolean) => void;
    /** Dialog title (e.g., "Delete Order") */
    title: string;
    /** Dialog description/warning message */
    description: string;
    /** Handler when delete is confirmed */
    onConfirm: () => void;
    /** Whether the delete action is in progress */
    isLoading?: boolean;
    /** Custom confirm button text (default: "Delete") */
    confirmText?: string;
}

/**
 * Reusable delete confirmation dialog
 * Replaces browser confirm() with styled AlertDialog
 */
export const ConfirmDeleteDialog = ({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    isLoading = false,
    confirmText = 'Delete',
}: ConfirmDeleteDialogProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        disabled={isLoading}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Deleting...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmDeleteDialog;
