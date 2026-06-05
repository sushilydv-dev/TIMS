import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { PageLoader } from "../components/PageLoader";
import { useAuth } from "../app/AuthContext";

export const PublicRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader label="Loading" />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
export default PublicRoutes;
