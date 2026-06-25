import React, { useLayoutEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../app/AuthContext";
import { PageLoader } from "../PageLoader";

const slideTransition = { duration: 0.5, ease: [0.32, 0.72, 0, 1] };

const pageVariants = {
  initial: (direction) => ({ x: direction > 0 ? "100%" : "-100%" }),
  animate: { x: 0, transition: slideTransition },
  exit:    (direction) => ({ x: direction > 0 ? "-100%" : "100%", transition: slideTransition }),
};

function getSlideDirection(fromPath, toPath) {
  if (fromPath === "/login" && toPath === "/signup") return 1;
  if (fromPath === "/signup" && toPath === "/login") return -1;
  return 1;
}

export function AuthPresenceWrapper() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const prevPathRef   = useRef(location.pathname);
  const directionRef  = useRef(1);

  if (location.pathname !== prevPathRef.current) {
    directionRef.current = getSlideDirection(prevPathRef.current, location.pathname);
  }

  useLayoutEffect(() => {
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  // While auth is still resolving, show the loader only for these gated pages
  if (loading) return <PageLoader label="Loading" />;

  // Already logged in — send to dashboard
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-white">
      <AnimatePresence mode="wait" custom={directionRef.current}>
        <motion.div
          key={location.pathname}
          custom={directionRef.current}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full min-h-screen min-h-[100dvh] bg-white"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
