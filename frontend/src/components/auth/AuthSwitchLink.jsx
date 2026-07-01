import React from "react";
import { Link } from "react-router-dom";

/** In-page auth route link; slide is handled by AuthPresenceWrapper. */
export function AuthSwitchLink({ to, className, children }) {
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}
