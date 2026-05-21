import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleLayout from './layouts/RoleLayout';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';
import DashboardPage from './pages/admin/DashboardPage';
import BranchesPage from './pages/admin/BranchesPage';
import PricingPolicyPage from './pages/admin/PricingPolicyPage';
import ProductsPage from './pages/admin/ProductsPage';
import ReportsPage from './pages/admin/ReportsPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import PosPage from './pages/staff/PosPage';
import OrdersPage from './pages/staff/OrdersPage';
import InventoryPage from './pages/staff/InventoryPage';
import ShiftPage from './pages/staff/ShiftPage';
import HomePage from './pages/customer/HomePage';
import HistoryPage from './pages/customer/HistoryPage';

function AdminApp() {
  return (
    <RoleLayout
      title="POS Admin"
      subtitle="Quản trị hệ thống"
      navItems={[
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/branches', label: 'Branches' },
        { to: '/admin/products', label: 'Products' },
        { to: '/admin/pricing-policy', label: 'Pricing & Tax' },
        { to: '/admin/staff', label: 'Staff Management' },
        { to: '/admin/reports', label: 'Reports' },
      ]}
    >
      <Routes>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="pricing-policy" element={<PricingPolicyPage />} />
        <Route path="staff" element={<StaffManagementPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </RoleLayout>
  );
}

function StaffApp() {
  return (
    <RoleLayout
      title="POS Staff"
      subtitle="Thu ngân / vận hành"
      navItems={[
        { to: '/staff/pos', label: 'POS' },
        { to: '/staff/orders', label: 'Orders' },
        { to: '/staff/inventory', label: 'Inventory' },
        { to: '/staff/shifts', label: 'Shifts' },
      ]}
    >
      <Routes>
        <Route path="pos" element={<PosPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="shifts" element={<ShiftPage />} />
        <Route path="*" element={<Navigate to="pos" replace />} />
      </Routes>
    </RoleLayout>
  );
}

function CustomerApp() {
  return (
    <RoleLayout
      title="Customer Portal"
      subtitle="Khách hàng"
      navItems={[
        { to: '/customer/home', label: 'Home' },
        { to: '/customer/history', label: 'History' },
      ]}
    >
      <Routes>
        <Route path="home" element={<HomePage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="home" replace />} />
      </Routes>
    </RoleLayout>
  );
}

function SwaggerRedirect() {
  window.location.replace('http://localhost:8000/api/docs/');
  return null;
}

function RouterRoot() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/swagger" element={<SwaggerRedirect />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/admin/*" element={<ProtectedRoute roles={["admin"]}><AdminApp /></ProtectedRoute>} />
      <Route path="/staff/*" element={<ProtectedRoute roles={["admin", "cashier"]}><StaffApp /></ProtectedRoute>} />
      <Route path="/customer/*" element={<ProtectedRoute roles={["customer"]}><CustomerApp /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={isAuthenticated ? (role === 'admin' ? '/admin/dashboard' : role === 'cashier' ? '/staff/pos' : '/customer/home') : '/'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterRoot />
    </AuthProvider>
  );
}
