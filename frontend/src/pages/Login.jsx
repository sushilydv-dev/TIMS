import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import logo from "../assets/logo.png";

const Login = () => {
  const [role, setRole] = useState("student");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/auth/login", {
        emailOrPhone,
        password,
        role,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: BookOpenIcon,
      title: "Expert-Curated Courses",
      description: "Learn from industry experts",
    },
    {
      icon: ChartBarIcon,
      title: "Track Your Progress",
      description: "Monitor learning and achievements",
    },
    {
      icon: CheckBadgeIcon,
      title: "Earn Certificates",
      description: "Showcase your skills",
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#dff8f1] text-[#083943] flex overflow-x-hidden select-none">
      <section className="relative flex min-h-screen w-full items-center overflow-hidden bg-white/38 backdrop-blur-xl">
        
        {/* Dynamic Background Blobs - Slowly Animating floating effect */}
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-[#f5fff7]/80 blur-3xl animate-[pulse_6s_infinite_alternate]" />
        <div className="absolute left-[25%] -top-32 h-[350px] w-[450px] rounded-full bg-[#7fe2cd]/45 blur-[24px] animate-[pulse_8s_infinite_alternate_2s]" />
        <div className="absolute left-[35%] top-[25%] h-[280px] w-[320px] rounded-full bg-[#b8f4e5]/55 blur-[32px] animate-[pulse_7s_infinite_alternate_1s]" />
        <div className="absolute bottom-[-5rem] left-[30%] h-[350px] w-[350px] rounded-full bg-[#f5fff4]/70 blur-[24px] animate-[pulse_9s_infinite_alternate_3s]" />
        <div className="absolute right-[-6rem] top-[-6rem] h-[300px] w-[300px] rounded-full bg-[#cbf9ef]/75 blur-3xl animate-[pulse_6s_infinite_alternate_1s]" />

        <div className="relative z-10 grid min-h-screen w-full grid-cols-1 items-center gap-8 px-4 py-5 sm:px-6 sm:py-7 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-16 lg:py-6 xl:px-28">
          
          {/* Left Side: Info with Fade-in and Slide-right Animation */}
          <div className="flex flex-col justify-between gap-6 self-center py-2 animate-[fadeIn_0.8s_ease-out] transition-all sm:gap-7 lg:h-full lg:max-h-[75vh] lg:gap-4">
            <div className="flex items-center gap-2 group cursor-pointer">
              <img src={logo} alt="MSAI INDIA" className="h-8 w-8 object-contain transition-transform duration-500 group-hover:rotate-12 sm:h-9 sm:w-9" />
              <span className="text-base font-extrabold tracking-tight text-[#0a3b45] sm:text-lg">
                MSAI INDIA
              </span>
            </div>

            <div className="max-w-[480px]">
              <h1 className="text-[34px] font-black leading-tight text-[#083943] sm:text-4xl md:text-5xl lg:text-4xl xl:text-5xl">
                Learn. Grow. <br />
                <span className="text-[#24b7b5]">Build Your Future.</span>
              </h1>
              <p className="mt-3 max-w-[440px] text-sm leading-relaxed text-[#26485c] sm:text-base">
                Access industry-ready courses, practical learning, and recognized certificates - all in one platform.
              </p>

              {/* Feature Cards with hover elevation */}
              <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-3 lg:block lg:space-y-4">
                {features.map(({ icon: Icon, title, description }, index) => (
                  <div 
                    className="flex items-center gap-3 group rounded-xl p-2 transition-all duration-300 hover:bg-white/40 hover:shadow-sm sm:flex-col sm:items-start sm:gap-2 lg:-mx-2 lg:flex-row lg:items-center lg:gap-4" 
                    key={title}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/86 text-[#22b9b0] shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#22b9b0] group-hover:text-white group-hover:shadow-md sm:h-11 sm:w-11">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-[#102f3e] transition-colors duration-300 group-hover:text-[#24b7b5]">{title}</h2>
                      <p className="text-xs text-[#385467] leading-normal">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-[#6ccfc4]/35 pt-4 text-xs font-medium text-[#13999b]">
              <SparklesIcon className="h-4 w-4 animate-pulse" />
              <span>Empowering learners. Building futures.</span>
            </div>
          </div>

          {/* Right Side: Form Container with Smooth Slide-up Fade Entrance */}
          <div className="flex h-full items-center justify-center animate-[slideUp_0.7s_ease-out_backward] lg:justify-end">
            <div className="w-full max-w-[430px] rounded-2xl border border-white/90 bg-white/92 px-4 py-6 shadow-xl backdrop-blur transition-all duration-500 hover:shadow-2xl hover:shadow-[#0c5452]/5 min-[380px]:px-5 sm:px-6 sm:py-7 md:px-8 md:py-8">
              <div className="text-center">
                <h2 className="text-[26px] font-black text-[#0a3b45] sm:text-2xl">Welcome Back</h2>
                <p className="mt-1.5 text-xs text-[#6b7f92] md:text-sm">
                  Sign in to continue your learning journey
                </p>
              </div>

              {error && (
                <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-center text-xs font-medium text-red-600 animate-[shake_0.4s_ease-in-out]">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#102f3e]" htmlFor="emailOrPhone">
                    Email or Phone
                  </label>
                  <div className="relative group">
                    <EnvelopeIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#718799] transition-colors duration-300 group-focus-within:text-[#26b9b7]" />
                    <input
                      id="emailOrPhone"
                      type="text"
                      required
                      className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white pl-11 pr-4 text-sm text-[#102f3e] outline-none shadow-inner transition-all duration-300 placeholder:text-[#8191a2] focus:border-[#26b9b7] focus:ring-4 focus:ring-[#26b9b7]/10"
                      placeholder="Enter your email or phone number"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#102f3e]" htmlFor="password">
                    Password
                  </label>
                  <div className="relative group">
                    <LockClosedIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#718799] transition-colors duration-300 group-focus-within:text-[#26b9b7]" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white pl-11 pr-11 text-sm text-[#102f3e] outline-none shadow-inner transition-all duration-300 placeholder:text-[#8191a2] focus:border-[#26b9b7] focus:ring-4 focus:ring-[#26b9b7]/10"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#718799] transition-colors duration-300 hover:text-[#26b9b7]"
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-xs min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                  <label className="flex cursor-pointer select-none items-center gap-1.5 text-[#718799] group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-[#cbd6de] accent-[#26b9b7] transition-transform duration-200 group-hover:scale-105"
                    />
                    <span className="transition-colors duration-200 group-hover:text-[#102f3e]">Remember me</span>
                  </label>
                  <a href="#" className="font-semibold text-[#20aaa7] transition-colors duration-300 hover:text-[#138f8d]">
                    Forgot password?
                  </a>
                </div>

                {/* Submit button with smooth scaling and gradient shift effect */}
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-gradient-to-r from-[#5bdcb9] to-[#17aaa8] bg-[length:200%_auto] text-sm font-bold text-white shadow-md transition-all duration-500 hover:bg-right hover:scale-[1.01] hover:shadow-lg hover:shadow-[#17aaa8]/20 focus:outline-none focus:ring-4 focus:ring-[#26b9b7]/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : "Login"}
                </button>
              </form>

              <div className="my-4 flex items-center gap-3 text-xs text-[#435767]">
                <div className="h-px flex-1 bg-[#dce4ea]" />
                <span>or</span>
                <div className="h-px flex-1 bg-[#dce4ea]" />
              </div>

              {/* Google Button with subtle transform */}
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-[#d4dde5] bg-white text-xs font-bold text-[#102f3e] transition-all duration-300 hover:border-[#26b9b7] hover:bg-[#f8fffd] hover:scale-[1.01] active:scale-[0.99]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.32 7.5 9.03 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.5 12.25c0-.82-.07-1.6-.2-2.35H12v4.45h6.45c-.28 1.47-1.1 2.7-2.35 3.55l3.65 2.83c2.13-1.97 3.75-4.87 3.75-8.48z" />
                  <path fill="#FBBC05" d="M5.36 14.5c-.24-.73-.38-1.5-.38-2.3s.14-1.57.38-2.3L1.5 6.9C.54 8.84 0 10.58 0 12.2s.54 3.36 1.5 5.3l3.86-3z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.65-2.83c-1.1.74-2.5 1.18-4.3 1.18-3.32 0-6.14-2.23-7.14-5.25L1.5 16.4C3.4 20.35 7.35 23 12 23z" />
                </svg>
                Continue with Google
              </button>

              <p className="mt-4 text-center text-xs text-[#718799]">
                Don't have an account?{" "}
                <Link to="/signup" className="font-bold text-[#20aaa7] transition-colors duration-300 hover:text-[#138f8d] underline underline-offset-2">
                  Register now
                </Link>
              </p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Login;
