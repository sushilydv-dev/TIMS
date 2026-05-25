import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../app/AuthContext";
import { Mail, Lock, Sparkles } from "lucide-react";
import logo from "../assets/logo.png";
import { AuthLayout } from "../components/AuthLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during login.",
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
            Welcome Back
          </h2>
          <p className="text-sm text-neutral-500 font-medium">
            Sign in to continue to <span className="text-neutral-700 font-semibold">MSAI INDIA</span>
          </p>
        </div>

        {/* Error Message Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
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

          {/* Remember Me & Forget Password */}
          <div className="flex items-center justify-between text-xs font-semibold pt-1">
            <label className="flex items-center text-neutral-500 cursor-pointer select-none">
              <input
                type="checkbox"
                className="mr-2 rounded border-neutral-200 bg-white text-cyan-600 focus:ring-cyan-500 h-4 w-4"
              />
              Remember me
            </label>
            <a
              href="#"
              className="text-cyan-600 hover:text-cyan-700 transition-colors"
            >
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Toggle Route */}
        <p className="mt-8 text-center text-neutral-500 text-sm font-medium">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-cyan-600 hover:text-cyan-700 font-bold transition-colors ml-1"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
