import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import Login from './components/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function AppRouter() {
  const [route, setRoute] = useState(window.location.pathname);
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    const handleRouteChange = () => {
      setRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);

    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  useEffect(() => {
    if (!loading && user && profile) {
      if (route === '/' || route === '/employee/login' || route === '/admin/login') {
        if (profile.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (profile.role === 'employee') {
          window.location.href = '/employee/dashboard';
        }
      }
    }
  }, [user, profile, loading, route]);

  if (route === '/') {
    return <HomePage />;
  }

  if (route === '/employee/login') {
    return user && profile ? null : <Login userType="employee" />;
  }

  if (route === '/admin/login') {
    return user && profile ? null : <Login userType="admin" />;
  }

  if (route === '/employee/dashboard') {
    return (
      <ProtectedRoute requiredRole="employee">
        <EmployeeDashboard />
      </ProtectedRoute>
    );
  }

  if (route === '/admin/dashboard') {
    return (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    );
  }

  return <HomePage />;
}

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
