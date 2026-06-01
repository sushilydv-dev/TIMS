import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';

const SignupForm = () => {
  const [isLoginView, setIsLoginView] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    agreed: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!isLoginView) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.agreed) newErrors.agreed = 'You must agree to the Terms & Conditions';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form data submitted:', formData);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setErrors({});
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      agreed: false
    });
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-wide" style={{ fontFamily: "'Syne', 'Plus Jakarta Sans', sans-serif" }}>
          {isLoginView ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-gray-400">
          {isLoginView ? "Don't have an account? " : "Already have an account? "}
          <button onClick={toggleView} className="text-brand hover:underline focus:outline-none font-medium cursor-pointer">
            {isLoginView ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLoginView && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-[#2e2e42] text-white px-4 py-3.5 rounded-xl border border-transparent focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500"
              />
              {errors.firstName && <p className="text-brand text-xs mt-1 ml-1">{errors.firstName}</p>}
            </div>
            <div className="flex-1">
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-[#2e2e42] text-white px-4 py-3.5 rounded-xl border border-transparent focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500"
              />
              {errors.lastName && <p className="text-brand text-xs mt-1 ml-1">{errors.lastName}</p>}
            </div>
          </div>
        )}

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-[#2e2e42] text-white px-4 py-3.5 rounded-xl border border-transparent focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500"
          />
          {errors.email && <p className="text-brand text-xs mt-1 ml-1">{errors.email}</p>}
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-[#2e2e42] text-white px-4 py-3.5 pr-12 rounded-xl border border-transparent focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all placeholder:text-gray-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </button>
          {errors.password && <p className="text-brand text-xs mt-1 ml-1">{errors.password}</p>}
        </div>

        {!isLoginView && (
          <div className="pt-1">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-[#2e2e42] checked:bg-brand checked:border-brand focus:ring-2 focus:ring-brand/30 focus:outline-none transition-all cursor-pointer"
                />
                <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                I agree to the <a href="#" className="text-brand hover:underline">Terms & Conditions</a>
              </span>
            </label>
            {errors.agreed && <p className="text-brand text-xs mt-1 ml-1">{errors.agreed}</p>}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-brand text-white font-semibold py-3.5 rounded-xl hover:bg-[#e02e26] transition-all shadow-[0_4px_14px_rgba(252,54,45,0.4)] hover:shadow-[0_6px_20px_rgba(252,54,45,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#252535] focus:ring-brand active:scale-[0.98] cursor-pointer mt-4"
        >
          {isLoginView ? 'Log in' : 'Create account'}
        </button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-700"></div>
        <span className="text-sm text-gray-500 whitespace-nowrap">Or register with</span>
        <div className="flex-1 h-px bg-gray-700"></div>
      </div>

      <div className="flex gap-4">
        <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-[#2e2e42] hover:bg-[#383854] text-white py-3.5 rounded-xl border border-gray-600 transition-colors focus:outline-none focus:border-brand cursor-pointer">
          <FcGoogle size={20} />
          <span className="font-medium text-sm">Google</span>
        </button>
        <button type="button" className="flex-1 flex items-center justify-center gap-2 bg-[#2e2e42] hover:bg-[#383854] text-white py-3.5 rounded-xl border border-gray-600 transition-colors focus:outline-none focus:border-brand cursor-pointer">
          <FaApple size={20} />
          <span className="font-medium text-sm">Apple</span>
        </button>
      </div>
    </div>
  );
};

export default SignupForm;
