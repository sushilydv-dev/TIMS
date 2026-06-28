import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import axios from "axios";

const TIME_SLOTS = [
  "9:00 AM – 11:00 AM",
  "11:00 AM – 1:00 PM",
  "1:00 PM – 3:00 PM",
  "3:00 PM – 5:00 PM",
  "5:00 PM – 7:00 PM",
];

const initialForm = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  preferredTime: "",
  preferredDate: "",
};

export const Consulatation = ({ open, onClose }) => {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await axios.post("/api/appointments", {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        email: form.email,
        preferredTime: form.preferredTime,
        preferredDate: form.preferredDate,
      });
      
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting appointment request:", error);
      alert("Failed to submit appointment request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setForm(initialForm);
  };

  const fieldClass =
    "w-full text-xs font-semibold p-3 border border-black/10 rounded-xl bg-white text-[#0c0407] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#94a3b8] focus:ring-2 focus:ring-[#e2e8f0]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="consultation-title"
        >
          {/* Blurred backdrop */}
          <motion.button
            type="button"
            className="absolute inset-0 w-full h-full bg-black/25 backdrop-blur-md cursor-default"
            aria-label="Close consultation form"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Form card */}
          <motion.div
            className="relative z-10 w-full h-full md:h-auto md:max-w-[480px] md:max-h-[90vh] overflow-y-auto bg-white md:rounded-2xl shadow-[0_0_0_1px_rgba(147,130,220,0.15),0_24px_80px_rgba(76,56,120,0.12)] md:ring-1 md:ring-[#e8e0f8]/50"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full  text-[#0c0407]/70 hover:bg-[#ec3d2d]/10 hover:text-[#0c0407] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center text-center px-6 pt-14 pb-8 md:px-10 md:pt-12 md:pb-10"
            >
              <h2
                id="consultation-title"
                className="text-2xl md:text-[1.65rem] font-bold text-[#1a2744] tracking-tight mb-2"
              >
                Book an Appointment
              </h2>
              <p className="text-sm text-[#636363] font-medium mb-8 max-w-xs">
                Please fill out the form below to make an appointment
              </p>

              <div className="w-full space-y-3 text-left">
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  required
                  className={fieldClass}
                />
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  required
                  className={fieldClass}
                />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className={fieldClass}
                />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className={fieldClass}
                />

                <div className="relative">
                  <select
                    name="preferredTime"
                    value={form.preferredTime}
                    onChange={handleChange}
                    required
                    className={`${fieldClass} pr-10 cursor-pointer ${!form.preferredTime ? "text-[#9a9a9a]" : ""}`}
                  >
                    <option value="" disabled>
                      Preferred Time
                    </option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot} className="text-[#0c0407]">
                        {slot}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a9a9a]"
                    aria-hidden
                  />
                </div>

                <div className="relative">
                  <input
                    type="date"
                    name="preferredDate"
                    value={form.preferredDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split("T")[0]}
                    className={`${fieldClass} pr-10 cursor-pointer ${!form.preferredDate ? "text-[#9a9a9a]" : ""}`}
                    onClick={(e) => e.target.showPicker?.()}
                  />
                 
                  <ChevronDown
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9a9a9a]"
                    aria-hidden
                  />
                </div>
              </div>

              <p className="mt-6 mb-5 text-xs text-[#636363] leading-relaxed max-w-sm">
                By clicking Send, you agree to our updated{" "}
                <span className="text-[#1a2744] font-semibold">Privacy Policy</span>{" "}
                terms and conditions.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-[#fc362d] hover:bg-[#e02d25] text-white font-bold text-base py-4 transition-colors duration-300 shadow-[0_4px_20px_rgba(252,54,45,0.3)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : submitSuccess ? "Request Sent!" : "Leave a Request"}
              </button>
              
              {submitSuccess && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-xs text-green-600 font-semibold"
                >
                  ✓ Your appointment request has been submitted successfully!
                </motion.p>
              )}
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
