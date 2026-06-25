import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { HashLoader } from "react-spinners";
import { FiUpload, FiUser, FiBriefcase, FiCalendar } from "react-icons/fi";
import { useAuth } from "../app/AuthContext";

const inputClass =
  "w-full rounded-full border border-black/10 bg-white px-5 py-3.5 text-sm text-[#0c0407] placeholder:text-[#9ca3af] outline-none transition focus:border-[#fc362d]/40 focus:ring-2 focus:ring-[#fc362d]/15";

const CompleteTrainerProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    specialization: "",
    experience_year: "",
    profile_img: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role !== "TRAINER") {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Load current trainer profile
    const loadProfile = async () => {
      try {
        const { data } = await axios.get("/api/trainer/profile");
        setFormData({
          name: data.user?.name || "",
          email: data.user?.email || "",
          role: user.role,
          specialization: data.specialization || "",
          experience_year: data.experience_year || "",
          profile_img: data.profile_img || "",
        });
        
        // If profile is already completed, redirect to dashboard
        if (data.profile_completed) {
          navigate("/dashboard/trainer/profile", { replace: true });
        }
      } catch (err) {
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profile_img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.specialization || !formData.experience_year) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.put("/api/trainer/complete-profile", {
        name: formData.name,
        specialization: formData.specialization,
        experience_year: parseInt(formData.experience_year),
        profile_img: formData.profile_img,
      });

      navigate("/dashboard/trainer/profile", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#fafafa]">
        <HashLoader color="#fc362d" />
        <p className="text-sm text-[#636363] font-medium">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0c0407] mb-2">
            Complete Your Profile Setup
          </h1>
          <p className="text-[#636363]">
            Please provide your details to get started with your trainer dashboard
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#fef2f2] border border-[#b91c1c]/20 rounded-2xl">
            <p className="text-sm text-[#b91c1c] font-semibold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {formData.profile_img ? (
                  <img
                    src={formData.profile_img}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <label
                htmlFor="profile-upload"
                className="absolute bottom-0 right-0 bg-[#fc362d] text-white p-2 rounded-full cursor-pointer hover:bg-[#e02d24] transition shadow-lg"
              >
                <FiUpload className="w-4 h-4" />
              </label>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-[#0c0407] mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              className={inputClass}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-[#0c0407] mb-2">
              Email
            </label>
            <input
              type="email"
              className={inputClass + " bg-gray-100 cursor-not-allowed"}
              value={formData.email}
              readOnly
              disabled
            />
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="block text-sm font-semibold text-[#0c0407] mb-2">
              Role
            </label>
            <input
              type="text"
              className={inputClass + " bg-gray-100 cursor-not-allowed"}
              value={formData.role}
              readOnly
              disabled
            />
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-sm font-semibold text-[#0c0407] mb-2">
              Specialization
            </label>
            <div className="relative">
              <FiBriefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                required
                className={inputClass + " pl-12"}
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Web Development, Data Science"
              />
            </div>
          </div>

          {/* Years of Experience */}
          <div>
            <label className="block text-sm font-semibold text-[#0c0407] mb-2">
              Years of Experience
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                required
                min="0"
                max="50"
                className={inputClass + " pl-12"}
                value={formData.experience_year}
                onChange={(e) => setFormData({ ...formData, experience_year: e.target.value })}
                placeholder="Enter years of experience"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#fc362d] text-white py-4 rounded-full font-semibold hover:bg-[#e02d24] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving Profile..." : "Complete Profile Setup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteTrainerProfile;
