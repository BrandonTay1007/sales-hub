import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Users',
  campaigns: 'Campaigns',
  orders: 'Orders',
  payouts: 'My Payouts',
  analytics: 'Analytics',
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4">
      <Link 
        to="/dashboard" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const isLast = index === pathSegments.length - 1;
        const label = routeLabels[segment] || segment;
        
        // Check if it's an ID (for campaign detail pages)
        const isId = /^\d+$/.test(segment);
        
        return (
          <span key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2" />
            {isLast ? (
              <span className="text-foreground font-medium">
                {isId ? `Campaign #${segment}` : label}
              </span>
            ) : (
              <Link 
                to={path} 
                className="hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};
