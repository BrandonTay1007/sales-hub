import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationsPopover } from './NotificationsPopover';
import { Badge } from '@/components/ui/badge';

export const TopBar = () => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 hidden lg:flex items-center justify-end px-6 gap-3">
      <ThemeToggle />
      <NotificationsPopover />
      
      <div className="h-6 w-px bg-border mx-1" />
      
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
          {user?.avatar || user?.name?.charAt(0)}
        </div>
        {isAdmin && (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Admin
          </Badge>
        )}
      </div>
    </header>
  );
};
