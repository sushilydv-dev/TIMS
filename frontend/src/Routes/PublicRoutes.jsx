import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";


export const PublicRoutes = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Outlet />;
};

export default PublicRoutes;
