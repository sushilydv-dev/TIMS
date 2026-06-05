import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthSwitchLink } from "../components/auth/AuthSwitchLink";
import { FiEye, FiEyeOff } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../app/AuthContext";
import {
  AuthSplitLayout,
  inputClass,
  labelClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "../components/auth/AuthSplitLayout";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();
  const { register } = useAuth();

  useEffect(() => {
    if (step !== 2) return undefined;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/auth/send-otp", { email });
      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(username, email, password, otp, "STUDENT");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "An error occurred during signup.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOtp("");
    setError("");
    setCountdown(60);
    setStep(1);
  };

  return (
    <AuthSplitLayout
      pageTitle={step === 1 ? "Sign Up" : "Verify Email"}
      pageSubtitle={
        step === 1
          ? "Create your account to get started"
          : `We sent a 6-digit code to ${email}`
      }
      alternateLink={{ label: "back to Home", to: "/" }}
    >
      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              className={inputClass}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className={inputClass}
              placeholder="Email"
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

          <button type="submit" disabled={loading} className={buttonPrimaryClass}>
            {loading ? "Sending OTP..." : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="otp">
              Enter 6-digit OTP
            </label>
            <input
              id="otp"
              type="text"
              required
              maxLength={6}
              className={`${inputClass} text-center font-bold tracking-[0.25em]`}
              placeholder="------"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <div className="text-center text-sm">
            {countdown > 0 ? (
              <p className="text-[#636363]">
                OTP expires in{" "}
                <span className="text-[#fc362d] font-bold">{countdown}s</span>
              </p>
            ) : (
              <p className="text-red-500 font-medium">
                OTP has expired. Please try signing up again.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || countdown === 0}
            className={buttonPrimaryClass}
          >
            {loading ? "Verifying..." : "Verify & Register"}
          </button>

          <button
            type="button"
            onClick={handleBackToDetails}
            className={buttonSecondaryClass}
          >
            Back to details
          </button>
        </form>
      )}

      {step === 1 && (
        <p className="mt-8 text-center text-sm text-[#636363]">
          Already have an account?{" "}
          <AuthSwitchLink
            to="/login"
            className="text-[#fc362d] hover:text-[#e02d25] font-semibold transition-colors"
          >
            Log in
          </AuthSwitchLink>
        </p>
      )}
    </AuthSplitLayout>
  );
};

export default Signup;
