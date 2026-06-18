import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../../app/AuthContext";

export function RequireAdminOrHR({ children }) {
  const { user } = useAuth();
  if (user?.role !== "ADMIN" && user?.role !== "HR" && user?.role !== "HR_COORDINATOR") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default RequireAdminOrHR;
