import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import { FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import axios from "axios";
import {
  AuthSplitLayout,
  inputClass,
  labelClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "../components/auth/AuthSplitLayout";
import {
  getForgotEmailErrors,
  getLoginFieldErrors,
  getResetPasswordFieldErrors,
} from "../utils/authValidation";

const fieldErrorClass = "mt-1.5 text-xs font-semibold text-red-600";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("login");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const resetAlerts = () => {
    setError("");
    setSuccessMessage("");
    setFieldErrors({});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const errors = getLoginFieldErrors(trimmedEmail, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await login(trimmedEmail, password, rememberMe);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.message || 
        err.message || 
        "An error occurred during login. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const errors = getForgotEmailErrors(trimmedEmail);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await axios.post("/api/auth/forgot-password", { email: trimmedEmail });
      setSuccessMessage("OTP sent successfully to your email.");
      setView("forgot_otp");
    } catch (err) {
      console.error("Send reset OTP error:", err);
      const errorMessage = err.response?.data?.message || 
        err.message || 
        "Failed to send reset OTP. Verify your email is correct.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errors = getResetPasswordFieldErrors(otp, newPassword);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await axios.post("/api/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setSuccessMessage(
        "Password reset successfully! Please sign in with your new password.",
      );
      setView("login");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setFieldErrors({});
    } catch (err) {
      console.error("Reset password error:", err);
      const errorMessage = err.response?.data?.message || 
        err.message || 
        "An error occurred. Check your OTP and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const alertBlock = (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm text-center">
          {successMessage}
        </div>
      )}
    </>
  );

  const inputErrorClass = (field) =>
    fieldErrors[field]
      ? `${inputClass} border-red-300 focus:border-red-400 focus:ring-red-200`
      : inputClass;

  return (
    <AuthSplitLayout
      imagePosition="right"
      pageTitle={
        view === "login"
          ? "Welcome Back"
          : view === "forgot_email"
            ? "Reset Password"
            : "Enter Reset Details"
      }
      pageSubtitle={
        view === "login"
          ? undefined
          : view === "forgot_email"
            ? "Enter your email to receive a password reset OTP"
            : "Check your email for the 6-digit OTP code"
      }
      alternateLink={{ label: "back to Home", to: "/" }}
    >
      {alertBlock}

      {view === "login" && (
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label className={labelClass} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputErrorClass("email")}
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
            />
            {fieldErrors.email && (
              <p className={fieldErrorClass}>{fieldErrors.email}</p>
            )}
          </div>

          <div className="relative">
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className={`${inputErrorClass("password")} pr-12`}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#0c0407] p-1 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <FiEyeOff className="w-5 h-5" />
              ) : (
                <FiEye className="w-5 h-5" />
              )}
            </button>
            {fieldErrors.password && (
              <p className={fieldErrorClass}>{fieldErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center text-[#636363] cursor-pointer select-none gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-[#fc362d] focus:ring-[#fc362d]/30"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => {
                setView("forgot_email");
                resetAlerts();
              }}
              className="text-[#fc362d] hover:text-[#e02d25] font-medium transition-colors bg-transparent border-none cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} className={buttonPrimaryClass}>
            <FiLogIn className="w-5 h-5" />
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      )}

      {view === "forgot_email" && (
        <form onSubmit={handleSendResetOtp} className="space-y-4" noValidate>
          <div>
            <label className={labelClass} htmlFor="reset-email">
              Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              className={inputErrorClass("email")}
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError("email");
              }}
            />
            {fieldErrors.email && (
              <p className={fieldErrorClass}>{fieldErrors.email}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className={buttonPrimaryClass}>
            {loading ? "Sending OTP..." : "Send Reset OTP"}
          </button>

          <button
            type="button"
            onClick={() => {
              setView("login");
              resetAlerts();
            }}
            className={buttonSecondaryClass}
          >
            Back to Sign In
          </button>
        </form>
      )}

      {view === "forgot_otp" && (
        <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
          <div>
            <label className={labelClass} htmlFor="reset-otp">
              Enter 6-digit OTP
            </label>
            <input
              id="reset-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className={`${inputErrorClass("otp")} text-center font-bold tracking-[0.25em]`}
              placeholder="------"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                clearFieldError("otp");
              }}
            />
            {fieldErrors.otp && (
              <p className={fieldErrorClass}>{fieldErrors.otp}</p>
            )}
          </div>

          <div className="relative">
            <label className={labelClass} htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              className={`${inputErrorClass("newPassword")} pr-12`}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                clearFieldError("newPassword");
              }}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#0c0407] p-1 cursor-pointer"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? (
                <FiEyeOff className="w-5 h-5" />
              ) : (
                <FiEye className="w-5 h-5" />
              )}
            </button>
            {fieldErrors.newPassword && (
              <p className={fieldErrorClass}>{fieldErrors.newPassword}</p>
            )}
          </div>

          <button type="submit" disabled={loading} className={buttonPrimaryClass}>
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={() => {
              setView("forgot_email");
              resetAlerts();
            }}
            className={buttonSecondaryClass}
          >
            Back to Email Input
          </button>
        </form>
      )}
    </AuthSplitLayout>
  );
};

export default Login;
