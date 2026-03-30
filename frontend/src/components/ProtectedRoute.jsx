import { Navigate } from "react-router-dom";
import { getToken } from "../lib/auth";

function ProtectedRoute({ children }) {

  const isAuthenticated = getToken();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
