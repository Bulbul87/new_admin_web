import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../context/Authcontext";

const ProtectedRoute = ({ children }: any) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;