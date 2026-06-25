import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/AuthContext";
import axios from "axios";
import { HashLoader } from "react-spinners";

export const RequireTrainerProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      // Only check for trainers
      if (user?.role !== "TRAINER") {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get("/api/trainer/profile");
        if (data.profile_completed) {
          setProfileCompleted(true);
        } else {
          // Redirect to profile completion if not completed
          navigate("/complete-trainer-profile", { replace: true });
        }
      } catch (err) {
        console.error("Failed to check profile completion:", err);
        // On error, allow access (don't block user)
        setProfileCompleted(true);
      } finally {
        setLoading(false);
      }
    };

    checkProfileCompletion();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-900">
        <HashLoader color="#14b8a6" />
        <div className="text-white">Checking profile status...</div>
      </div>
    );
  }

  // If not a trainer or profile is completed, allow access
  if (user?.role !== "TRAINER" || profileCompleted) {
    return <Outlet />;
  }

  // This shouldn't be reached as we redirect above, but just in case
  return null;
};
