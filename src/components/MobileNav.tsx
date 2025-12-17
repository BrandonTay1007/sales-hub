import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Megaphone, ShoppingCart, Wallet, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, adminOnly: false },
  { title: 'Users', url: '/users', icon: Users, adminOnly: true },
  { title: 'Campaigns', url: '/campaigns', icon: Megaphone, adminOnly: true },
  { title: 'Orders', url: '/orders', icon: ShoppingCart, adminOnly: true },
  { title: 'My Payouts', url: '/payouts', icon: Wallet, adminOnly: false },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const filteredItems = navItems.filter(item => !item.adminOnly || isAdmin);
  const currentPage = filteredItems.find(item => item.url === location.pathname);

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors">
            <Menu className="w-6 h-6 text-sidebar-foreground" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
          <SheetHeader className="p-6 border-b border-sidebar-border">
            <SheetTitle className="text-xl font-bold text-sidebar-foreground text-left">CommissionPro</SheetTitle>
            <p className="text-xs text-sidebar-muted text-left">Sales Management</p>
          </SheetHeader>

          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {filteredItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <li key={item.url}>
                    <Link
                      to={item.url}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
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

          <div className="p-4 border-t border-sidebar-border mt-auto">
            <div className="flex items-center gap-3 px-3 py-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-medium">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
                <p className="text-xs text-sidebar-muted capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        {currentPage && (
          <>
            <currentPage.icon className="w-5 h-5 text-sidebar-foreground" />
            <span className="font-medium text-sidebar-foreground">{currentPage.title}</span>
          </>
        )}
      </div>

      <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-medium">
        {user?.name.charAt(0)}
      </div>
    </header>
  );
};
