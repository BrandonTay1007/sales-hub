import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import Login from "@/features/auth/Login";
import Dashboard from "@/features/dashboard/Dashboard";
import UsersPage from "@/features/users/UsersPage";
import CampaignsPage from "@/features/campaigns/CampaignsPage";
import CampaignDetailPage from "@/features/campaigns/CampaignDetailPage";
import OrdersPage from "@/features/orders/OrdersPage";
import PayoutsPage from "@/features/orders/PayoutsPage";
import TeamPayoutsPage from "@/features/orders/TeamPayoutsPage";
import AnalyticsPage from "@/features/analytics/AnalyticsPage";
import LeaderboardPage from "@/features/analytics/LeaderboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/payouts" element={<PayoutsPage />} />
              <Route path="/team-payouts" element={<TeamPayoutsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/analytics/leaderboard" element={<LeaderboardPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

