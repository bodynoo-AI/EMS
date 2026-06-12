import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { getMeThunk } from './store/slices/authSlice';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Main Layout
import Layout from './components/common/Layout';

// Dashboard
import Dashboard from './pages/Dashboard';

// Employee Pages
import Employees from './pages/employees/Employees';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import EmployeeForm from './pages/employees/EmployeeForm';
import MyProfile from './pages/employees/MyProfile';

// Leave Pages
import LeaveList from './pages/leaves/LeaveList';
import LeaveApply from './pages/leaves/LeaveApply';
import LeaveApprovals from './pages/leaves/LeaveApprovals';

// Asset Pages
import Assets from './pages/assets/Assets';
import AssetDetail from './pages/assets/AssetDetail';
import AssetForm from './pages/assets/AssetForm';

// Other Pages
import Departments from './pages/Departments';
import Skills from './pages/Skills';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Notifications from './pages/Notifications';

// Protected Route
const ProtectedRoute = ({ children, roles }) => {
  const { user, accessToken } = useSelector(state => state.auth);
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { accessToken } = useSelector(state => state.auth);
  if (accessToken) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppContent = () => {
  const dispatch = useDispatch();
  const { accessToken } = useSelector(state => state.auth);

  useEffect(() => {
    if (accessToken) dispatch(getMeThunk());
  }, [accessToken, dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPassword /></PublicRoute>} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected Routes inside Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="notifications" element={<Notifications />} />

          {/* Employee Management */}
          <Route path="employees" element={<ProtectedRoute roles={['ADMIN', 'HR', 'MANAGER']}><Employees /></ProtectedRoute>} />
          <Route path="employees/new" element={<ProtectedRoute roles={['ADMIN', 'HR']}><EmployeeForm /></ProtectedRoute>} />
          <Route path="employees/:id" element={<EmployeeDetail />} />
          <Route path="employees/:id/edit" element={<ProtectedRoute roles={['ADMIN', 'HR']}><EmployeeForm /></ProtectedRoute>} />

          {/* Leave Management */}
          <Route path="leaves" element={<LeaveList />} />
          <Route path="leaves/apply" element={<LeaveApply />} />
          <Route path="leaves/approvals" element={<ProtectedRoute roles={['ADMIN', 'HR', 'MANAGER']}><LeaveApprovals /></ProtectedRoute>} />

          {/* Asset Management */}
          <Route path="assets" element={<Assets />} />
          <Route path="assets/new" element={<ProtectedRoute roles={['ADMIN', 'HR']}><AssetForm /></ProtectedRoute>} />
          <Route path="assets/:id" element={<AssetDetail />} />

          {/* Masters */}
          <Route path="departments" element={<ProtectedRoute roles={['ADMIN', 'HR']}><Departments /></ProtectedRoute>} />
          <Route path="skills" element={<ProtectedRoute roles={['ADMIN', 'HR']}><Skills /></ProtectedRoute>} />

          {/* Reports & Audit */}
          <Route path="reports" element={<ProtectedRoute roles={['ADMIN', 'HR']}><Reports /></ProtectedRoute>} />
          <Route path="audit-logs" element={<ProtectedRoute roles={['ADMIN', 'HR']}><AuditLogs /></ProtectedRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: '#1e293b', color: '#f1f5f9', borderRadius: '10px', padding: '14px 18px' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </Router>
  );
};

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
