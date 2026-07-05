import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import axios from "axios";
import { HashLoader } from "react-spinners";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {
  AuthSplitLayout,
  buttonPrimaryClass,
} from "../components/auth/AuthSplitLayout";
import { useAuth } from "../app/AuthContext";

const inputClass =
  "w-full rounded-full border border-black/10 bg-white px-5 py-3.5 text-sm text-[#0c0407] placeholder:text-[#9ca3af] outline-none transition focus:border-[#fc362d]/40 focus:ring-2 focus:ring-[#fc362d]/15";

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { user, loading: authLoading, establishSession } = useAuth();

  const [info, setInfo] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!token) {
      setError("Invalid activation link. Please request a new invitation.");
      setPageLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data } = await axios.get(`/api/auth/activate/${token}`);
        setInfo(data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "This activation link is invalid or has expired.",
        );
      } finally {
        setPageLoading(false);
      }
    };

    load();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post("/api/auth/activate", {
        token,
        password,
      });

      const { token: jwt, message: _msg, ...userData } = data;
      establishSession(jwt, userData);
      
      // Redirect trainers to profile completion
      if (userData.role === "TRAINER") {
        navigate("/complete-trainer-profile", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Activation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <ReactLenis
        root
        options={{
          duration: 1.25,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 0.85,
          touchMultiplier: 1.2,
        }}
      >
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#fafafa]">
          <HashLoader color="#fc362d" />
          <p className="text-sm text-[#636363] font-medium">Loading activation…</p>
        </div>
      </ReactLenis>
    );
  }

  return (
    <ReactLenis
      root
      options={{
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.85,
        touchMultiplier: 1.2,
      }}
    >
      <AuthSplitLayout
        imagePosition="right"
      pageTitle="Welcome to TIMS"
      pageSubtitle="Please set up a strong password to activate your account."
      alternateLink={{ to: "/login", label: "Sign in" }}
      footerNote={
        info?.email ? (
          <span className="text-[#636363]">
            Activating <strong className="text-[#0c0407]">{info.email}</strong>
            {info.role ? ` · ${info.role.replace(/_/g, " ")}` : ""}
          </span>
        ) : undefined
      }
    >
      {!info && error ? (
        <div className="space-y-4">
          <p className="text-sm text-[#b91c1c] font-semibold bg-[#fef2f2] border border-[#b91c1c]/20 rounded-2xl px-4 py-3">
            {error}
          </p>
          <Link
            to="/login"
            className="inline-block text-sm font-bold text-[#fc362d] hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {info?.name && (
            <p className="text-sm text-[#636363] font-medium">
              Hello <span className="font-bold text-[#0c0407]">{info.name}</span>, choose a
              private password to finish setup.
            </p>
          )}

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="New password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0c0407] cursor-pointer"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>

          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder="Confirm password"
            className={inputClass}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          {error && (
            <p className="text-sm text-[#b91c1c] font-semibold bg-[#fef2f2] border border-[#b91c1c]/20 rounded-2xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={buttonPrimaryClass}
          >
            {submitting ? "Activating…" : "Activate account"}
          </button>
        </form>
      )}
    </AuthSplitLayout>
    </ReactLenis>
  );
};

export default ActivateAccount;
