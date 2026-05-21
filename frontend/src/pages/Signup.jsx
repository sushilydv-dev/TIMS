import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpenIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  EnvelopeIcon,
  LockClosedIcon,
  SparklesIcon,
  UserIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import logo from "../assets/logo.png";

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
      setError(err.response?.data?.message || "An error occurred during signup.");
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

        {/* Content Layout Grid */}
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
              
              {/* Form Title Block with Step Key Animations */}
              <div key={step} className="text-center animate-[fadeIn_0.4s_ease-out]">
                <h2 className="text-[26px] font-black text-[#0a3b45] sm:text-2xl">
                  {step === 1 ? "Create Account" : "Verify Email"}
                </h2>
                <p className="mt-1.5 break-words text-xs text-[#6b7f92] md:text-sm">
                  {step === 1 ? "Join MSAI INDIA today" : `OTP sent to ${email}`}
                </p>
              </div>

              {error && (
                <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-center text-xs font-medium text-red-600 animate-[shake_0.4s_ease-in-out]">
                  {error}
                </div>
              )}

              {step === 1 ? (
                /* STEP 1: Registration Details Form */
                <form onSubmit={handleSendOtp} className="mt-5 space-y-4 animate-[slideUp_0.5s_ease-out]">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#102f3e]" htmlFor="username">
                      Username
                    </label>
                    <div className="relative group">
                      <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#718799] transition-colors duration-300 group-focus-within:text-[#26b9b7]" />
                      <input
                        id="username"
                        type="text"
                        required
                        className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white pl-11 pr-4 text-sm text-[#102f3e] outline-none shadow-inner transition-all duration-300 placeholder:text-[#8191a2] focus:border-[#26b9b7] focus:ring-4 focus:ring-[#26b9b7]/10"
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#102f3e]" htmlFor="email">
                      Email Address
                    </label>
                    <div className="relative group">
                      <EnvelopeIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#718799] transition-colors duration-300 group-focus-within:text-[#26b9b7]" />
                      <input
                        id="email"
                        type="email"
                        required
                        className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white pl-11 pr-4 text-sm text-[#102f3e] outline-none shadow-inner transition-all duration-300 placeholder:text-[#8191a2] focus:border-[#26b9b7] focus:ring-4 focus:ring-[#26b9b7]/10"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        type="password"
                        required
                        className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white pl-11 pr-4 text-sm text-[#102f3e] outline-none shadow-inner transition-all duration-300 placeholder:text-[#8191a2] focus:border-[#26b9b7] focus:ring-4 focus:ring-[#26b9b7]/10"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

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
                        Sending OTP...
                      </span>
                    ) : "Continue"}
                  </button>
                </form>
              ) : (
                /* STEP 2: OTP Verification Form */
                <form onSubmit={handleSignup} className="mt-5 space-y-4 animate-[slideUp_0.5s_ease-out]">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#102f3e]" htmlFor="otp">
                      Enter 6-digit OTP
                    </label>
                    <div className="relative group">
                      <KeyIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#718799] transition-colors duration-300 group-focus-within:text-[#26b9b7]" />
                      <input
                        id="otp"
                        type="text"
                        required
                        maxLength="6"
                        className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white pl-11 pr-4 text-sm font-bold tracking-[0.18em] text-[#102f3e] outline-none shadow-inner transition-all duration-300 placeholder:tracking-normal placeholder:text-[#8191a2] focus:border-[#26b9b7] focus:ring-4 focus:ring-[#26b9b7]/10 sm:tracking-[0.25em]"
                        placeholder="------"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="text-center text-xs">
                    {countdown > 0 ? (
                      <p className="text-[#6b7f92]">
                        OTP expires in{" "}
                        <span className="text-[#20aaa7] font-bold">{countdown}s</span>
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
                    className="h-11 w-full rounded-lg bg-gradient-to-r from-[#5bdcb9] to-[#17aaa8] bg-[length:200%_auto] text-sm font-bold text-white shadow-md transition-all duration-500 hover:bg-right hover:scale-[1.01] hover:shadow-lg hover:shadow-[#17aaa8]/20 focus:outline-none focus:ring-4 focus:ring-[#26b9b7]/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : "Verify & Register"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                    }}
                    className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white text-xs font-bold text-[#102f3e] transition-all duration-300 hover:border-[#26b9b7] hover:bg-[#f8fffd] hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Back to details
                  </button>
                </form>
              )}

              {step === 1 && (
                <p className="mt-5 text-center text-xs text-[#718799]">
                  Already have an account?{" "}
                  <Link to="/login" className="font-bold text-[#20aaa7] transition-colors duration-300 hover:text-[#138f8d] underline underline-offset-2">
                    Sign in
                  </Link>
                </p>
              )}

            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Signup;
