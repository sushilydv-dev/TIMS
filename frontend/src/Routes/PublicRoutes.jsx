import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Public routes — no auth gate here.
 * Login/Signup blocking is handled by AuthPresenceWrapper.
 * Removing the auth loading check means About Us, All Courses etc.
 * render instantly without waiting for the auth API call.
 */
export const PublicRoutes = () => {
  return <Outlet />;
};

export default PublicRoutes;
