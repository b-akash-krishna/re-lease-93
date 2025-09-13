import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'hospital_staff';
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  redirectTo 
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to appropriate login
        if (requiredRole === 'hospital_staff') {
          navigate('/hospital/login');
        } else {
          navigate('/patient/login');
        }
        return;
      }

      if (requiredRole && profile && profile.role !== requiredRole) {
        // Wrong role, redirect to appropriate dashboard or login
        if (profile.role === 'hospital_staff') {
          navigate('/hospital/dashboard');
        } else {
          navigate('/patient/dashboard');
        }
        return;
      }

      if (redirectTo) {
        navigate(redirectTo);
      }
    }
  }, [user, profile, loading, requiredRole, redirectTo, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && profile && profile.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};