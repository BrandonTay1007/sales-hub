import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Megaphone, ShoppingCart, Wallet, LogOut, Menu, BarChart3, UsersRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from './ThemeToggle';

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

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navItems = getNavItems(isAdmin);

  return (
    <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between h-14 px-4 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <span className="text-primary-foreground font-bold">P</span>
        </div>
        <span className="font-semibold text-foreground">Pebble</span>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] p-0 bg-sidebar">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-medium">
                    {user?.avatar || user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
                    <p className="text-xs text-sidebar-muted capitalize">{user?.role}</p>
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
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                            }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="p-4 border-t border-sidebar-border">
                <button
                  onClick={() => { logout(); setOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
