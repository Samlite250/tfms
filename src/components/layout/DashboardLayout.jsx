import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { ROLE_PERMISSIONS } from '../../utils/constants';

const allMenuItems = [
  { label: 'Dashboard', path: '/dashboard', icon: 'LayoutDashboard', permission: 'dashboard' },
  { label: 'Farmers', path: '/farmers', icon: 'Users', permission: 'farmers' },
  { label: 'Coffee Collection', path: '/collections', icon: 'Coffee', permission: 'collections' },
  { label: 'Production', path: '/production', icon: 'Factory', permission: 'production' },
  { label: 'Inventory', path: '/inventory', icon: 'Package', permission: 'inventory' },
  { label: 'Sales', path: '/sales', icon: 'ShoppingCart', permission: 'sales' },
  { label: 'Expenses', path: '/expenses', icon: 'Receipt', permission: 'expenses' },
  { label: 'Reports', path: '/reports', icon: 'BarChart3', permission: 'reports' },
  { label: 'Employees', path: '/employees', icon: 'UserCog', permission: 'employees' },
  { label: 'Settings', path: '/settings', icon: 'Settings', permission: 'settings' },
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

  const role = user?.role;
  const permissions = ROLE_PERMISSIONS[role] || [];

  const menuItems = allMenuItems.filter((item) => permissions.includes(item.permission));

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
