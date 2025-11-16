import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'employee';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !profile) {
        setRedirect(true);
        window.location.href = '/';
      } else if (requiredRole && profile.role !== requiredRole) {
        setRedirect(true);
        window.location.href = '/';
      } else if (!profile.is_active) {
        setRedirect(true);
        window.location.href = '/';
      }
    }
  }, [user, profile, loading, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (redirect || !user || !profile) {
    return null;
  }

  return <>{children}</>;
}
