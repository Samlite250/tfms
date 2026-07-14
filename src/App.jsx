import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import LoadingSpinner from './components/ui/LoadingSpinner';

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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

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
    name: user?.displayName || 'Admin User',
    email: user?.email || 'admin@tfms.com',
    role: userProfile?.role || 'admin',
    avatar: null,
  };

  const mockNotifications = [
    { id: 1, message: 'Low stock alert: Packaging Materials', time: '5 min ago', read: false },
    { id: 2, message: 'New collection recorded by John', time: '1 hour ago', read: false },
    { id: 3, message: 'Monthly report is ready', time: '3 hours ago', read: true },
    { id: 4, message: 'Payment received from TeaCorp Ltd', time: '1 day ago', read: true },
  ];

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <DashboardPage user={mockUser} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Farmer Routes */}
      <Route
        path="/farmers"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <FarmersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmers/new"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <FarmerFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmers/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <FarmerProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmers/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <FarmerFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Employee Routes */}
      <Route
        path="/employees"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <EmployeesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/new"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <EmployeeFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <EmployeeProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <EmployeeFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Tea Collection Routes */}
      <Route
        path="/collections"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <CollectionPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collections/new"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <CollectionFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collections/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <CollectionDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/collections/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <CollectionFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Production Routes */}
      <Route
        path="/production"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <ProductionPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/new"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <ProductionFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <ProductionDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/production/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <ProductionFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Inventory Routes */}
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <InventoryPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/new"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <InventoryFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <InventoryFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/movements"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <StockMovementPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/alerts"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <LowStockAlerts />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Sales Routes */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <SalesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/new"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <SalesFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <SalesDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <SalesFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <CustomersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Expense Routes */}
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <ExpensesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses/new"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <ExpenseFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <ExpenseDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <ExpenseFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Reports Route */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <ReportsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Settings Route */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <SettingsPage user={mockUser} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout user={mockUser} onLogout={logout} notifications={mockNotifications}>
              <AdminPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
