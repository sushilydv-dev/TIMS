import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

/**
 * Public routes — redirects logged-in users to dashboard.
 * Login/Signup blocking is handled by AuthPresenceWrapper.
 */
export const PublicRoutes = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

export default PublicRoutes;
