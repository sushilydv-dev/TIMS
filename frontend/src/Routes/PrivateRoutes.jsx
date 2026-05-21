import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import { HashLoader } from "react-spinners";
export const PrivateRoutes = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden gap-5">
        <HashLoader color="#14b8a6" cssOverride={{}} />
        <div>Fetching details...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PrivateRoutes;
