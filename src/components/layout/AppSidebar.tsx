import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Megaphone, ShoppingCart, Wallet, LogOut, BarChart3, UsersRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

/**
 * Get navigation items based on user role
 * Admin users see full navigation, sales users see limited navigation
 * @param isAdmin - Whether the current user is an admin
 * @returns Array of navigation items with title, url, and icon
 */
const getNavItems = (isAdmin: boolean) => {
  if (isAdmin) {
    return [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Campaigns', url: '/campaigns', icon: Megaphone },
      { title: 'Orders', url: '/orders', icon: ShoppingCart },
      { title: 'Users', url: '/users', icon: Users },
      { title: 'Team Payouts', url: '/team-payouts', icon: UsersRound },
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
    ];
  }
  return [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { title: 'My Campaigns', url: '/campaigns', icon: Megaphone },
    { title: 'My Orders', url: '/orders', icon: ShoppingCart },
    { title: 'My Payouts', url: '/payouts', icon: Wallet },
  ];
};

/**
 * AppSidebar Component
 * Main navigation sidebar for the application
 * Displays role-based navigation items, user profile, and logout button
 * Uses framer-motion for active tab animation
 */
export const AppSidebar = () => {
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navItems = getNavItems(isAdmin);

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-accent flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">P</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Pebble</h1>
            <p className="text-xs text-sidebar-muted">Sales Tracker</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url ||
              (item.url !== '/dashboard' && location.pathname.startsWith(item.url));
            return (
              <li key={item.url}>
                <Link
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-medium">
            {user?.avatar || user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-xs text-sidebar-muted capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
