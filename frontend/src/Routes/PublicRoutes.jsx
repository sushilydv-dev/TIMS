import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

export const PublicRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 p-8 rounded-3xl backdrop-blur-2xl bg-white/5 border border-white/10 shadow-2xl flex flex-col items-center max-w-sm text-center">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-white/5"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Loading</h3>
          <p className="text-gray-400 text-sm">Preparing your experience...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoutes;
