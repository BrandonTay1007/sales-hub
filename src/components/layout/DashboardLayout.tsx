import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { MobileNav } from './MobileNav';
import { TopBar } from './TopBar';
import { Breadcrumbs } from './Breadcrumbs';
import { QuickActions } from '../shared/QuickActions';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Props for DashboardLayout component
 */
interface DashboardLayoutProps {
  /** Child components to render within the layout */
  children: ReactNode;
}

/**
 * DashboardLayout Component
 * Main layout wrapper for authenticated pages
 * Handles responsive layout with sidebar, top bar, breadcrumbs, and quick actions
 * Redirects to login if user is not authenticated
 */
export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* Mobile Navigation */}
      <MobileNav />

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar - desktop only */}
        <TopBar />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>

      {/* Quick Actions FAB - Admin only */}
      {isAdmin && <QuickActions />}
    </div>
  );
};
