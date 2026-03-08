import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type AuthState } from '../../stores/useAuthStore';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
