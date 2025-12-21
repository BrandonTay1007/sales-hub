import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PayoutsPage from './PayoutsPage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock API
vi.mock('@/lib/api', () => ({
    ordersApi: {
        list: vi.fn().mockResolvedValue({ success: true, data: [] }),
    },
    campaignsApi: {
        list: vi.fn().mockResolvedValue({
            success: true,
            data: [
                { id: 'c1', title: 'Test Campaign', salesPersonId: 'u1' }
            ]
        }),
    },
    getErrorMessage: (err: any) => err.message,
}));

// Mock Recharts
vi.mock('recharts', () => {
    const OriginalModule = vi.importActual('recharts');
    return {
        ...OriginalModule,
        ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
        LineChart: ({ children }: any) => <div>{children}</div>,
        Line: () => <div></div>,
        XAxis: () => <div></div>,
        YAxis: () => <div></div>,
        Tooltip: () => <div></div>,
    };
});

// Mock Auth
const mockUser = { id: 'u1', name: 'Test User', commissionRate: 10, role: 'sales' };
vi.mock('@/contexts/AuthContext', async () => {
    const actual = await vi.importActual('@/contexts/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            user: mockUser,
            isAdmin: false,
        }),
    };
});

// Setup wrappers
const queryClient = new QueryClient({
    defaultOptions: {
        queries: { retry: false },
    },
});

import { TooltipProvider } from '@/components/ui/tooltip';

const renderComponent = () => {
    return render(
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <BrowserRouter>
                    <PayoutsPage />
                </BrowserRouter>
            </TooltipProvider>
        </QueryClientProvider>
    );
};

describe('PayoutsPage Interaction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('toggles expansion when clicking the campaign card container', async () => {
        renderComponent();

        // Wait for data to load
        const campaignTitle = await screen.findByText('Test Campaign', {}, { timeout: 4000 });
        const card = campaignTitle.closest('.dashboard-card');

        expect(card).toBeInTheDocument();

        // Initially order table should not be visible (collapsed)
        expect(screen.queryByText('Order Details')).not.toBeInTheDocument();

        // Click the card
        fireEvent.click(card!);

        // Now order table should be visible (expanded)
        // Note: The text might be "Order Details" or "Summary" based on implementation, 
        // but we check for expansion evidence.
        await waitFor(() => {
            // We look for elements that only appear in expanded state
            // In current implementation it shows "Order Details" text
            expect(screen.getByText(/Order Details/i)).toBeInTheDocument();
        });

        // Click again to collapse
        fireEvent.click(card!);

        await waitFor(() => {
            expect(screen.queryByText(/Order Details/i)).not.toBeInTheDocument();
        });
    });

    it('does not toggle expansion when clicking internal navigation link', async () => {
        renderComponent();

        const campaignTitleLink = await screen.findByText('Test Campaign', {}, { timeout: 4000 });
        const card = campaignTitleLink.closest('.dashboard-card');

        // Initially collapsed
        expect(screen.queryByText('Order Details')).not.toBeInTheDocument();

        // Click the title link (which navigates)
        fireEvent.click(campaignTitleLink);

        // Should REMAIN collapsed (because propagation stopped)
        // Note: In a real browser this navigates away, but in test we just check state didn't change
        expect(screen.queryByText('Order Details')).not.toBeInTheDocument();

        // Click the card itself to prove it still works
        fireEvent.click(card!);
        await waitFor(() => {
            expect(screen.getByText(/Order Details/i)).toBeInTheDocument();
        });
    });
});
