import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '~/hooks/AuthContext';

const AuthLayout = () => {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
    