import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthSwitchLink } from "../components/auth/AuthSwitchLink";
import { useAuth } from "../app/AuthContext";
import { HashLoader } from 'react-spinners';
import { FiChevronDown, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import axios from "axios";
import {
  AuthSplitLayout,
  inputClass,
  labelClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "../components/auth/AuthSplitLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("login");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred during login. Try a demo account from the top right!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      await login(demoEmail, "demo1234");
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to login with demo account.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSuccessMessage("OTP sent successfully to your email.");
      setView("forgot_otp");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset OTP. Verify your email is correct.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await axios.post("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      setSuccessMessage(
        "Password reset successfully! Please sign in with your new password.",
      );
      setView("login");
      setPassword("");
      setOtp("");
      setNewPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred. Check your OTP and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetAlerts = () => {
    setError("");
    setSuccessMessage("");
  };

  const demoSelector = (
    <div className="relative hidden sm:block">
      <select
        onChange={(e) => {
          if (e.target.value) handleQuickLogin(e.target.value);
        }}
        defaultValue=""
        className="pl-3 pr-8 py-2 text-xs font-semibold text-[#636363] border border-black/10 rounded-full bg-white outline-none cursor-pointer appearance-none hover:border-[#fc362d]/30 transition-colors max-w-[140px]"
      >
        <option value="" disabled>
          Demo access
        </option>
        <option value="admin@tims.com">Admin</option>
        <option value="hr@tims.com">HR</option>
        <option value="trainer@tims.com">Trainer</option>
        <option value="student@tims.com">Student</option>
      </select>
      <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af] pointer-events-none" />
    </div>
  );

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
      topAction={demoSelector}
    >
      {alertBlock}

      {view === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className={inputClass}
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className={labelClass} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              className={`${inputClass} pr-12`}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center text-[#636363] cursor-pointer select-none gap-2">
              <input
                type="checkbox"
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
        <form onSubmit={handleSendResetOtp} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="reset-email">
              Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              required
              className={inputClass}
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="reset-otp">
              Enter 6-digit OTP
            </label>
            <input
              id="reset-otp"
              type="text"
              required
              maxLength={6}
              className={`${inputClass} text-center font-bold tracking-[0.25em]`}
              placeholder="------"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className={labelClass} htmlFor="new-password">
              New Password
            </label>
            <input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              required
              className={`${inputClass} pr-12`}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

      {view === "login" && (
        <p className="mt-8 text-center text-sm text-[#636363]">
          Don&apos;t have an account?{" "}
          <AuthSwitchLink
            to="/signup"
            className="text-[#fc362d] hover:text-[#e02d25] font-semibold transition-colors"
          >
            Sign up
          </AuthSwitchLink>
        </p>
      )}

      
      <div className="relative sm:hidden mt-6">
        <select
          onChange={(e) => {
            if (e.target.value) handleQuickLogin(e.target.value);
          }}
          defaultValue=""
          className="w-full pl-4 pr-10 py-3 text-sm font-semibold text-[#636363] border border-black/10 rounded-full bg-white outline-none cursor-pointer appearance-none"
        >
          <option value="" disabled>
            Quick Demo Access
          </option>
          <option value="admin@tims.com">Admin</option>
          <option value="hr@tims.com">HR</option>
          <option value="trainer@tims.com">Trainer</option>
          <option value="student@tims.com">Student</option>
        </select>
        <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
      </div>
    </AuthSplitLayout>
  );
};

export default Login;
