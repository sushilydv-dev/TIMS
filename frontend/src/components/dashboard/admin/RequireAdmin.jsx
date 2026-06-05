import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../app/AuthContext";

export function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default RequireAdmin;
