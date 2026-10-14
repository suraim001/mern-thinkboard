import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className='min-h-screen flex items-center justify-center text-primary'>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
