
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface PrivateRouteProps {
  userType?: "donor" | "receiver" | "admin";
}

const PrivateRoute = ({ userType }: PrivateRouteProps) => {
  const { isAuthenticated, loading, userType: authUserType } = useAuth();

  // Show loading indicator
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Check if authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Check correct user type if specified
  if (userType && authUserType !== userType) {
    // Redirect to the appropriate dashboard
    if (authUserType === "donor") {
      return <Navigate to="/donor/dashboard" replace />;
    } else if (authUserType === "receiver") {
      return <Navigate to="/receiver/dashboard" replace />;
    } else if (authUserType === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    
    // Fallback redirect if user type is unknown
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has correct user type, render the protected content
  return <Outlet />;
};

export default PrivateRoute;
