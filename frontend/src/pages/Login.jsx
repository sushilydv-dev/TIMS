import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1681164315051-add1906a9b07?q=80&w=1139&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    heading: "Expert Curated Courses",
    subtext: "Learn from the best instructors handpicked for quality and excellence"
  },
  {
    image: "https://images.unsplash.com/photo-1661555144338-093c85f8c588?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    heading: "Track Your Progress",
    subtext: "Stay on top of your learning journey with real-time progress tracking"
  },
  {
    image: "https://images.unsplash.com/photo-1756885427018-86c8c5969c5b?q=80&w=1111&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    heading: "Earn Certificates",
    subtext: "Get recognized for your skills with industry-accepted certificates"
  }
];

const Login = () => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email.trim() || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post("/api/auth/login", { email, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex">

      {/* Left Panel (Form) */}
      <div className="w-full md:w-1/2 h-screen overflow-y-auto flex flex-col justify-center px-8 md:px-16 bg-[#fff5f5]">
        <div className="max-w-md mx-auto w-full">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#111111] mb-2 tracking-wide" style={{ fontFamily: "'Syne', 'Plus Jakarta Sans', sans-serif" }}>
              Welcome back
            </h2>
            <div className="h-[2px] w-10 bg-brand mb-4"></div>
            <p className="text-[#555555]">
              Don't have an account?{" "}
              <Link to="/signup" className="text-brand hover:underline focus:outline-none font-medium cursor-pointer">
                Sign up
              </Link>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f5f5f5] text-[#111111] px-4 py-3.5 border-b-2 border-gray-200 focus:border-brand focus:ring-0 outline-none transition-all placeholder:text-[#9ca3af]"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f5f5f5] text-[#111111] px-4 py-3.5 pr-12 border-b-2 border-gray-200 focus:border-brand focus:ring-0 outline-none transition-all placeholder:text-[#9ca3af]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#111111] transition-colors focus:outline-none cursor-pointer"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-[#e0e0e0] rounded bg-white checked:bg-brand checked:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none transition-all cursor-pointer"
                  />
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-[#555555] group-hover:text-[#111111] transition-colors">
                  Remember me
                </span>
              </label>
              <a href="#" className="text-sm text-brand hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-white font-semibold py-3.5 rounded-xl hover:bg-[#e02e26] transition-all shadow-[0_4px_20px_rgba(252,54,45,0.4)] hover:shadow-[0_6px_25px_rgba(252,54,45,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-brand active:scale-[0.98] cursor-pointer mt-4 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Log in'}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-[#e0e0e0]"></div>
            <span className="text-sm text-[#9ca3af] whitespace-nowrap">Or log in with</span>
            <div className="flex-1 h-px bg-[#e0e0e0]"></div>
          </div>

          <div className="flex gap-4">
            <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#111111] py-3.5 rounded-xl border border-[#e0e0e0] transition-colors focus:outline-none focus:border-brand cursor-pointer">
              <FcGoogle size={20} />
              <span className="font-medium text-sm">Google</span>
            </button>
            <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-[#111111] py-3.5 rounded-xl border border-[#e0e0e0] transition-colors focus:outline-none focus:border-brand cursor-pointer">
              <FaApple size={20} />
              <span className="font-medium text-sm">Apple</span>
            </button>
          </div>

        </div>
      </div>

      {/* Right Panel (Image) */}
      <div className="hidden md:flex w-1/2 h-screen relative overflow-hidden flex-col justify-between">
        {/* Background Images with Fade */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${index === currentImgIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url('${slide.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          ></div>
        ))}

        <div className="absolute inset-0 bg-black/30 z-0" />

        <div className="relative z-10 flex justify-between items-center w-full p-10">
          <h1 className="text-3xl font-black text-white tracking-tighter">
            AMU<span className="text-brand">.</span>
          </h1>
          <Link to="/" className="px-5 py-2.5 bg-white/80 hover:bg-white backdrop-blur-md text-[#111111] text-sm font-medium rounded-full transition-colors border border-[#e0e0e0] cursor-pointer">
            Back to website &rarr;
          </Link>
        </div>

        <div className="relative z-10 mt-auto pb-8 p-10">
          <div className="relative h-24 mb-6">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute bottom-0 left-0 transition-opacity duration-700 ${index === currentImgIndex ? 'opacity-100' : 'opacity-0'}`}
              >
                <h2 className="text-3xl font-bold text-white tracking-wide" style={{ fontFamily: "'Syne', 'Plus Jakarta Sans', sans-serif" }}>
                  {slide.heading}
                </h2>
                <p className="text-white/80 text-sm mt-2 max-w-sm">
                  {slide.subtext}
                </p>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="flex gap-2 items-center">
            {slides.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setCurrentImgIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer focus:outline-none ${index === currentImgIndex ? 'w-8 bg-brand' : 'w-2 bg-white/30'}`}
              ></button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;