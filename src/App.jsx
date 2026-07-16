import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MessagesProvider } from './contexts/MessagesContext';
import { ToastProvider } from './components/ui/Toast';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { ROLE_PERMISSIONS } from './utils/constants';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';

// Module Pages
import FarmersPage from './pages/farmers/FarmersPage';
import FarmerFormPage from './pages/farmers/FarmerFormPage';
import FarmerProfilePage from './pages/farmers/FarmerProfilePage';

import EmployeesPage from './pages/employees/EmployeesPage';
import EmployeeFormPage from './pages/employees/EmployeeFormPage';
import EmployeeProfilePage from './pages/employees/EmployeeProfilePage';

import CollectionPage from './pages/collection/CollectionPage';
import CollectionFormPage from './pages/collection/CollectionFormPage';
import CollectionDetailPage from './pages/collection/CollectionDetailPage';

import ProductionPage from './pages/production/ProductionPage';
import ProductionFormPage from './pages/production/ProductionFormPage';
import ProductionDetailPage from './pages/production/ProductionDetailPage';

import InventoryPage from './pages/inventory/InventoryPage';
import InventoryFormPage from './pages/inventory/InventoryFormPage';
import StockMovementPage from './pages/inventory/StockMovementPage';
import LowStockAlerts from './pages/inventory/LowStockAlerts';

import SalesPage from './pages/sales/SalesPage';
import SalesFormPage from './pages/sales/SalesFormPage';
import SalesDetailPage from './pages/sales/SalesDetailPage';
import CustomersPage from './pages/sales/CustomersPage';

import ExpensesPage from './pages/expenses/ExpensesPage';
import ExpenseFormPage from './pages/expenses/ExpenseFormPage';
import ExpenseDetailPage from './pages/expenses/ExpenseDetailPage';

import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import AdminPage from './pages/admin/AdminPage';
import MyCollectionsPage from './pages/farmer/MyCollectionsPage';
import MessagingPage from './pages/messages/MessagingPage';

const routePermissionMap = {
  '/farmers': 'farmers',
  '/collections': 'collections',
  '/production': 'production',
  '/inventory': 'inventory',
  '/sales': 'sales',
  '/expenses': 'expenses',
  '/reports': 'reports',
  '/employees': 'employees',
  '/settings': 'settings',
  '/admin': 'admin',
};

function ProtectedRoute({ children, permission }) {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission && userProfile) {
    const permissions = ROLE_PERMISSIONS[userProfile.role] || [];
    if (!permissions.includes(permission)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, userProfile, logout } = useAuth();

  const mockUser = {
    name: user?.displayName || 'User',
    email: user?.email || '',
    role: userProfile?.role || 'collection_officer',
    avatar: null,
  };

  const mockNotifications = [
    { id: 1, message: 'Low stock alert: Jute Bags', time: '5 min ago', read: false },
    { id: 2, message: 'New collection recorded by Epiphanie', time: '1 hour ago', read: false },
    { id: 3, message: 'Monthly report is ready', time: '3 hours ago', read: true },
    { id: 4, message: 'Payment received from Nairobi Coffee Merchants', time: '1 day ago', read: true },
  ];

  function AuthenticatedLayout({ children }) {
    return (
      <ProtectedRoute>
        <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
          {children}
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<AuthenticatedLayout><DashboardPage /></AuthenticatedLayout>} />
      <Route path="/farmers" element={<AuthenticatedLayout><FarmersPage /></AuthenticatedLayout>} />
      <Route path="/farmers/new" element={<AuthenticatedLayout><FarmerFormPage /></AuthenticatedLayout>} />
      <Route path="/farmers/:id" element={<AuthenticatedLayout><FarmerProfilePage /></AuthenticatedLayout>} />
      <Route path="/farmers/:id/edit" element={<AuthenticatedLayout><FarmerFormPage /></AuthenticatedLayout>} />
      <Route path="/employees" element={<AuthenticatedLayout><EmployeesPage /></AuthenticatedLayout>} />
      <Route path="/employees/new" element={<AuthenticatedLayout><EmployeeFormPage /></AuthenticatedLayout>} />
      <Route path="/employees/:id" element={<AuthenticatedLayout><EmployeeProfilePage /></AuthenticatedLayout>} />
      <Route path="/employees/:id/edit" element={<AuthenticatedLayout><EmployeeFormPage /></AuthenticatedLayout>} />
      <Route path="/collections" element={<AuthenticatedLayout><CollectionPage /></AuthenticatedLayout>} />
      <Route path="/collections/new" element={<AuthenticatedLayout><CollectionFormPage /></AuthenticatedLayout>} />
      <Route path="/collections/:id" element={<AuthenticatedLayout><CollectionDetailPage /></AuthenticatedLayout>} />
      <Route path="/collections/:id/edit" element={<AuthenticatedLayout><CollectionFormPage /></AuthenticatedLayout>} />
      <Route path="/production" element={<AuthenticatedLayout><ProductionPage /></AuthenticatedLayout>} />
      <Route path="/production/new" element={<AuthenticatedLayout><ProductionFormPage /></AuthenticatedLayout>} />
      <Route path="/production/:id" element={<AuthenticatedLayout><ProductionDetailPage /></AuthenticatedLayout>} />
      <Route path="/production/:id/edit" element={<AuthenticatedLayout><ProductionFormPage /></AuthenticatedLayout>} />
      <Route path="/inventory" element={<AuthenticatedLayout><InventoryPage /></AuthenticatedLayout>} />
      <Route path="/inventory/new" element={<AuthenticatedLayout><InventoryFormPage /></AuthenticatedLayout>} />
      <Route path="/inventory/:id/edit" element={<AuthenticatedLayout><InventoryFormPage /></AuthenticatedLayout>} />
      <Route path="/inventory/movements" element={<AuthenticatedLayout><StockMovementPage /></AuthenticatedLayout>} />
      <Route path="/inventory/alerts" element={<AuthenticatedLayout><LowStockAlerts /></AuthenticatedLayout>} />
      <Route path="/sales" element={<AuthenticatedLayout><SalesPage /></AuthenticatedLayout>} />
      <Route path="/sales/new" element={<AuthenticatedLayout><SalesFormPage /></AuthenticatedLayout>} />
      <Route path="/sales/:id" element={<AuthenticatedLayout><SalesDetailPage /></AuthenticatedLayout>} />
      <Route path="/sales/:id/edit" element={<AuthenticatedLayout><SalesFormPage /></AuthenticatedLayout>} />
      <Route path="/customers" element={<AuthenticatedLayout><CustomersPage /></AuthenticatedLayout>} />
      <Route path="/expenses" element={<AuthenticatedLayout><ExpensesPage /></AuthenticatedLayout>} />
      <Route path="/expenses/new" element={<AuthenticatedLayout><ExpenseFormPage /></AuthenticatedLayout>} />
      <Route path="/expenses/:id" element={<AuthenticatedLayout><ExpenseDetailPage /></AuthenticatedLayout>} />
      <Route path="/expenses/:id/edit" element={<AuthenticatedLayout><ExpenseFormPage /></AuthenticatedLayout>} />
      <Route path="/reports" element={<AuthenticatedLayout><ReportsPage /></AuthenticatedLayout>} />
      <Route path="/settings" element={<AuthenticatedLayout><SettingsPage /></AuthenticatedLayout>} />
      <Route path="/my-collections" element={<AuthenticatedLayout><MyCollectionsPage /></AuthenticatedLayout>} />
      <Route path="/messages" element={<AuthenticatedLayout><MessagingPage /></AuthenticatedLayout>} />
      <Route path="/admin" element={<AuthenticatedLayout><AdminPage /></AuthenticatedLayout>} />

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <MessagesProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </MessagesProvider>
      </AuthProvider>
    </Router>
  );
}
