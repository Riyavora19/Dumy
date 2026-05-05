import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, type = 'staff' }) => {
  const token = type === 'staff' 
    ? localStorage.getItem('staffToken')
    : localStorage.getItem('adminToken');
  
  const loginPath = type === 'staff' ? '/staff/login' : '/admin/login';

  if (!token) {
    return <Navigate to={loginPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
