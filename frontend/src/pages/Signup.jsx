import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Key } from "lucide-react";
import axios from "axios";
import { AuthLayout } from "../components/AuthLayout";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); // Fixed bug: was loading(true) in the original code
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
      const response = await axios.post("/api/auth/register", {
        username,
        email,
        password,
        otp,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during signup.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-neutral-800 mb-2 tracking-tight">
            {step === 1 ? "Create Account" : "Verify Email"}
          </h2>
          <p className="text-sm text-neutral-500 font-medium">
            {step === 1 ? (
              <>
                Join <span className="text-neutral-700 font-semibold">MSAI INDIA</span> today
              </>
            ) : (
              <span>OTP verification code sent to <span className="text-cyan-600 font-semibold">{email}</span></span>
            )}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: Registration Details Form */
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/70 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/70 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/70 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
            >
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP Verification Form */
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2"
                htmlFor="otp"
              >
                Enter 6-digit OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength="6"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/70 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 text-sm font-bold tracking-[0.25em] text-center"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            <div className="text-center text-xs font-semibold py-1">
              {countdown > 0 ? (
                <p className="text-neutral-500">
                  OTP expires in{" "}
                  <span className="text-cyan-600 font-bold">
                    {countdown}s
                  </span>
                </p>
              ) : (
                <p className="text-red-600 font-bold bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
                  OTP has expired. Please go back to request a new OTP.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading || countdown === 0}
                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? "Verifying..." : "Verify & Register"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 bg-white/80 hover:bg-white text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-all duration-300 shadow-sm"
              >
                Back to details
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <p className="mt-8 text-center text-neutral-500 text-sm font-medium">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-600 hover:text-cyan-700 font-bold transition-colors"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </AuthLayout>
  );
};

export default Signup;
