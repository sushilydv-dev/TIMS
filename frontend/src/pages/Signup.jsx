import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineBookOpen,
  HiOutlineChartBar,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineKey,
} from "react-icons/hi2";
import { HiOutlineBadgeCheck } from "react-icons/hi";

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
      setError(
        err.response?.data?.message || "An error occurred during signup.",
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: HiOutlineBookOpen,
      title: "Expert-Curated Courses",
      description: "Learn from industry experts",
    },
    {
      icon: HiOutlineChartBar,
      title: "Track Your Progress",
      description: "Monitor learning and achievements",
    },
    {
      icon: HiOutlineBadgeCheck,
      title: "Earn Certificates",
      description: "Showcase your skills",
    },
  ];

  return (
    <main className="h-screen w-screen bg-[#dff8f1] text-[#083943] flex overflow-hidden select-none">
      <section className="relative flex w-full h-full items-center overflow-hidden bg-white/38 backdrop-blur-xl">
        {/* Background Blobs */}
        <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-[#f5fff7]/80 blur-3xl" />
        <div className="absolute left-[25%] -top-32 h-[350px] w-[450px] rounded-full bg-[#7fe2cd]/45 blur-[24px]" />
        <div className="absolute left-[35%] top-[25%] h-[280px] w-[320px] rounded-full bg-[#b8f4e5]/55 blur-[32px]" />
        <div className="absolute bottom-[-5rem] left-[30%] h-[350px] w-[350px] rounded-full bg-[#f5fff4]/70 blur-[24px]" />
        <div className="absolute right-[-6rem] top-[-6rem] h-[300px] w-[300px] rounded-full bg-[#cbf9ef]/75 blur-3xl" />

        {/* Content Layout Grid */}
        <div className="relative z-10 grid w-full h-full grid-cols-1 items-center gap-8 px-8 py-6 md:px-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-20 xl:px-28">
          {/* Left Side: Info */}
          <div className="flex flex-col justify-between h-full max-h-[75vh] py-2 gap-4 self-center">
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="MSAI INDIA"
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-extrabold tracking-tight text-[#0a3b45]">
                MSAI INDIA
              </span>
            </div>

            <div className="max-w-[480px]">
              <h1 className="text-3xl font-black leading-tight text-[#083943] sm:text-4xl lg:text-4xl xl:text-5xl">
                Learn. Grow. <br />
                <span className="text-[#24b7b5]">Build Your Future.</span>
              </h1>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-[#26485c]">
                Access industry-ready courses, practical learning, and
                recognized certificates - all in one platform.
              </p>

              <div className="mt-6 space-y-4">
                {features.map(({ icon: Icon, title, description }) => (
                  <div className="flex items-center gap-4" key={title}>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/86 text-[#22b9b0] shadow-sm">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#102f3e]">
                        {title}
                      </h2>
                      <p className="text-xs text-[#385467] leading-normal">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-[#6ccfc4]/35 pt-4 text-xs font-medium text-[#13999b]">
              <span>Empowering learners. Building futures.</span>
            </div>
          </div>

          {/* Right Side: Form Container */}
          <div className="flex justify-center lg:justify-end items-center h-full">
            <div className="w-full max-w-[430px] rounded-2xl border border-white/90 bg-white/92 px-6 py-7 shadow-xl backdrop-blur md:px-8 md:py-8">
              <div className="text-center">
                <h2 className="text-2xl font-black text-[#0a3b45]">
                  {step === 1 ? "Create Account" : "Verify Email"}
                </h2>
                <p className="mt-1.5 text-xs md:text-sm text-[#6b7f92]">
                  {step === 1
                    ? "Join MSAI INDIA today"
                    : `OTP sent to ${email}`}
                </p>
              </div>

              {error && (
                <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-center text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              {step === 1 ? (
                /* STEP 1: Registration Details Form */
                <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-bold text-[#102f3e]"
                      htmlFor="username"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#718799]" />
                      <input
                        id="username"
                        type="text"
                        required
                        className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white pl-11 pr-4 text-sm text-[#102f3e] outline-none transition placeholder:text-[#8191a2] focus:border-[#26b9b7] focus:ring-2 focus:ring-[#26b9b7]/15"
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-xs font-bold text-[#102f3e]"
                      htmlFor="email"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <HiOutlineEnvelope className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#718799]" />
                      <input
                        id="email"
                        type="email"
                        required
                        className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white pl-11 pr-4 text-sm text-[#102f3e] outline-none transition placeholder:text-[#8191a2] focus:border-[#26b9b7] focus:ring-2 focus:ring-[#26b9b7]/15"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="mb-1.5 block text-xs font-bold text-[#102f3e]"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <HiOutlineLockClosed className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#718799]" />
                      <input
                        id="password"
                        type="password"
                        required
                        className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white pl-11 pr-4 text-sm text-[#102f3e] outline-none transition placeholder:text-[#8191a2] focus:border-[#26b9b7] focus:ring-2 focus:ring-[#26b9b7]/15"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-lg bg-gradient-to-r from-[#5bdcb9] to-[#17aaa8] text-sm font-bold text-white shadow-md transition hover:from-[#48d1ad] hover:to-[#119c9b] focus:outline-none focus:ring-2 focus:ring-[#26b9b7]/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending OTP..." : "Continue"}
                  </button>
                </form>
              ) : (
                /* STEP 2: OTP Verification Form */
                <form onSubmit={handleSignup} className="mt-5 space-y-4">
                  <div>
                    <label
                      className="mb-1.5 block text-xs font-bold text-[#102f3e]"
                      htmlFor="otp"
                    >
                      Enter 6-digit OTP
                    </label>
                    <div className="relative">
                      <HiOutlineKey className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#718799]" />
                      <input
                        id="otp"
                        type="text"
                        required
                        maxLength="6"
                        className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white pl-11 pr-4 text-sm font-bold tracking-[0.25em] text-[#102f3e] outline-none transition placeholder:tracking-normal placeholder:text-[#8191a2] focus:border-[#26b9b7] focus:ring-2 focus:ring-[#26b9b7]/15"
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
                        <span className="text-[#20aaa7] font-bold">
                          {countdown}s
                        </span>
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
                    className="h-11 w-full rounded-lg bg-gradient-to-r from-[#5bdcb9] to-[#17aaa8] text-sm font-bold text-white shadow-md transition hover:from-[#48d1ad] hover:to-[#119c9b] focus:outline-none focus:ring-2 focus:ring-[#26b9b7]/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify & Register"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                    }}
                    className="h-11 w-full rounded-lg border border-[#d4dde5] bg-white text-xs font-bold text-[#102f3e] transition hover:border-[#26b9b7] hover:bg-[#f8fffd]"
                  >
                    Back to details
                  </button>
                </form>
              )}

              {step === 1 && (
                <p className="mt-5 text-center text-xs text-[#718799]">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-[#20aaa7] hover:text-[#138f8d]"
                  >
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
