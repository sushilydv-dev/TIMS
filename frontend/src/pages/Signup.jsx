import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import background from "../assets/background.jpg";

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
    <div
      className="min-h-screen flex items-center justify-center bg-gray-900 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 w-full max-w-md p-8 m-4 rounded-3xl backdrop-blur-3xl backdrop-brightness-75 bg-white/10 border border-white/20 shadow-2xl transition-all duration-300">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-wide">
            {step === 1 ? "Create Account" : "Verify Email"}
          </h2>
          <p className="text-gray-300">
            {step === 1 ? "Join MSAI INDIA today" : `OTP sent to ${email}`}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium text-gray-200 mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-200 mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-200 mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 mt-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending OTP..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium text-gray-200 mb-2"
                htmlFor="otp"
              >
                Enter 6-digit OTP
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength="6"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all duration-300 text-center text-2xl tracking-[0.5em]"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="text-center text-sm">
              {countdown > 0 ? (
                <p className="text-gray-300">
                  OTP expires in{" "}
                  <span className="text-indigo-400 font-bold">
                    {countdown}s
                  </span>
                </p>
              ) : (
                <p className="text-red-400">
                  OTP has expired. Please try signing up again.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || countdown === 0}
              className="w-full py-3 px-4 mt-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Register"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
              }}
              className="w-full py-3 px-4 mt-2 rounded-xl font-semibold text-gray-300 bg-transparent border border-white/10 hover:bg-white/5 focus:outline-none transition-all duration-300"
            >
              Back to details
            </button>
          </form>
        )}

        {step === 1 && (
          <p className="mt-8 text-center text-gray-300 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;
