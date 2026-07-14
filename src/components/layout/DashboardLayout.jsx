import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const defaultMenuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Farmers', path: '/farmers', icon: 'Users' },
  { label: 'Tea Collection', path: '/collections', icon: 'Coffee' },
  { label: 'Production', path: '/production', icon: 'Factory' },
  { label: 'Inventory', path: '/inventory', icon: 'Package' },
  { label: 'Sales', path: '/sales', icon: 'ShoppingCart' },
  { label: 'Expenses', path: '/expenses', icon: 'Receipt' },
  { label: 'Reports', path: '/reports', icon: 'BarChart3' },
  { label: 'Employees', path: '/employees', icon: 'UserCog' },
  { label: 'Settings', path: '/settings', icon: 'Settings' },
  { label: 'Admin Panel', path: '/admin', icon: 'Shield' },
];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => setIsDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isDesktop;
}

export default function DashboardLayout({ children, user, onLogout, notifications = [] }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useIsDesktop();

  const menuItems = defaultMenuItems.filter((item) => {
    const role = user?.role;
    if (role === 'admin') return true;
    if (role === 'factory_manager') {
      return !['Admin Panel'].includes(item.label);
    }
    if (role === 'collection_officer') {
      return ['Dashboard', 'Farmers', 'Tea Collection'].includes(item.label);
    }
    if (role === 'production_officer') {
      return ['Dashboard', 'Production', 'Inventory'].includes(item.label);
    }
    if (role === 'store_keeper') {
      return ['Dashboard', 'Inventory'].includes(item.label);
    }
    if (role === 'accountant') {
      return ['Dashboard', 'Sales', 'Expenses', 'Reports'].includes(item.label);
    }
    return ['Dashboard'].includes(item.label);
  });

  const marginLeft = isDesktop ? (collapsed ? 72 : 260) : 0;

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        user={user}
        menuItems={menuItems}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className="transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ marginLeft }}
      >
        <Header
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          user={user}
          notifications={notifications}
          onLogout={onLogout}
        />

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
