import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children, allowRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowRoles.length > 0 && !allowRoles.includes(user?.role)) {
    return <Navigate to="/locations" replace />;
  }

  return children;
};

export default ProtectedRoute;
