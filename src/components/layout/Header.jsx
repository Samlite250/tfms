import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  User,
  Settings,
  LogOut,
  X,
  Shield,
} from 'lucide-react';
import { ROLE_LABELS } from '../../utils/constants';

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const breadcrumbMap = {
  dashboard: 'Dashboard',
  farmers: 'Farmers',
  collections: 'Tea Collection',
  production: 'Production',
  inventory: 'Inventory',
  sales: 'Sales',
  expenses: 'Expenses',
  reports: 'Reports',
  employees: 'Employees',
  settings: 'Settings',
  admin: 'Admin Panel',
  profile: 'Profile',
  login: 'Login',
  register: 'Register',
};

export default function Header({
  title,
  onMenuToggle,
  user,
  notifications = [],
  onLogout,
}) {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const breadcrumbs = location.pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => ({
      label: breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      path: '/' + arr.slice(0, index + 1).join('/'),
      isLast: index === arr.length - 1,
    }));

  const pageTitle = title || breadcrumbMap[location.pathname.split('/')[1]] || 'Dashboard';

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex items-center h-16 px-4 sm:px-6 bg-white border-b border-border shadow-sm">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title & breadcrumbs */}
      <div className="ml-2 lg:ml-0 min-w-0">
        <h1 className="text-lg font-semibold text-text-primary truncate">{pageTitle}</h1>
        {breadcrumbs.length > 1 && (
          <nav className="hidden sm:flex items-center text-xs text-text-secondary">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.path} className="flex items-center">
                {i > 0 && <ChevronRight className="w-3 h-3 mx-1" />}
                {crumb.isLast ? (
                  <span className="text-primary font-medium">{crumb.label}</span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="hover:text-primary transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1 sm:gap-2 ml-auto">
        {/* Search */}
        <div className="relative">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute right-0 top-1/2 -translate-y-1/2 overflow-hidden"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-8 text-sm rounded-lg border border-border bg-bg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-text-secondary hover:text-text-primary"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {!searchOpen && (
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-danger rounded-full ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-border z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-primary font-medium">{unreadCount} unread</span>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-text-secondary">
                    No notifications yet
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 hover:bg-bg transition-colors ${
                          !notif.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <p className="text-sm text-text-primary">{notif.message}</p>
                        <p className="text-xs text-text-secondary mt-1">{notif.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-bg transition-colors"
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {user?.displayName
                    ? user.displayName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                    : 'U'}
                </span>
              </div>
            )}
          </button>
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden"
              >
                {user && (
                  <div className="px-4 py-3 border-b border-border bg-bg/50">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs text-text-secondary truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Shield className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        {ROLE_LABELS[user.role] || user.role || 'Staff'}
                      </span>
                    </div>
                  </div>
                )}
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg transition-colors"
                  >
                    <User className="w-4 h-4 text-text-secondary" />
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-primary hover:bg-bg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-text-secondary" />
                    Settings
                  </Link>
                </div>
                <div className="border-t border-border py-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      onLogout?.();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
