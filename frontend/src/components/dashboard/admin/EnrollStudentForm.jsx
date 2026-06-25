import React, { useState, useEffect } from "react";
import { FiUser, FiBookOpen, FiDollarSign, FiCalendar, FiArrowLeft, FiPlus, FiTrash2, FiCheck } from "react-icons/fi";
import axios from "axios";
import { Panel, PanelHeader, PrimaryButton, SecondaryButton, Toast } from "../DashboardUI";
import { inputClass } from "../dashboardTheme";

export function EnrollStudentForm({ onBack, onSuccess }) {
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    college_name: "",
    qualification: "10th",
    degree_name: "",
    course_id: "",
    batch_id: "",
    discount_amount: 0,
    payment_scheme_mode: "FULL", // "FULL" or "INSTALLMENT"
    installments: [],
  });


  // Fetch courses on load
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get("/api/admin/curriculum");
        // Flatten courses from departments
        const flattened = [];
        if (Array.isArray(data?.departments)) {
          data.departments.forEach((dept) => {
            if (Array.isArray(dept.courses)) {
              dept.courses.forEach((c) => {
                flattened.push({
                  ...c,
                  department_name: dept.name,
                });
              });
            }
          });
        }
        setCourses(flattened);
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  // Fetch batches when course changes
  useEffect(() => {
    if (!formData.course_id) {
      setBatches([]);
      return;
    }

    const fetchBatches = async () => {
      setLoadingBatches(true);
      try {
        const { data } = await axios.get(`/api/admin/courses/${formData.course_id}/batches`);
        setBatches(data);
      } catch (err) {
        console.error("Failed to load batches", err);
      } finally {
        setLoadingBatches(false);
      }
    };
    fetchBatches();
  }, [formData.course_id]);

  const selectedCourse = courses.find((c) => c.id === formData.course_id);
  const baseFee = selectedCourse ? Number(selectedCourse.fees || 0) : 0;
  const finalPayableFee = Math.max(0, baseFee - Number(formData.discount_amount || 0));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "discount_amount" ? Number(value) : value,
    }));
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      course_id: courseId,
      batch_id: "", // Reset batch
      installments: [], // Reset installments
    }));
  };

  const handleSchemeChange = (mode) => {
    setFormData((prev) => ({
      ...prev,
      payment_scheme_mode: mode,
      installments:
        mode === "INSTALLMENT"
          ? [
              { label: "First Installment", amount_due: Math.round(finalPayableFee / 2), due_date: "" },
              { label: "Second Installment", amount_due: Math.round(finalPayableFee / 2), due_date: "" },
            ]
          : [],
    }));
  };

  const addInstallmentRow = () => {
    setFormData((prev) => {
      const currentSum = prev.installments.reduce((sum, inst) => sum + Number(inst.amount_due || 0), 0);
      const remaining = Math.max(0, finalPayableFee - currentSum);
      return {
        ...prev,
        installments: [
          ...prev.installments,
          {
            label: `Milestone ${prev.installments.length + 1}`,
            amount_due: remaining,
            due_date: "",
          },
        ],
      };
    });
  };

  const removeInstallmentRow = (idx) => {
    setFormData((prev) => ({
      ...prev,
      installments: prev.installments.filter((_, i) => i !== idx),
    }));
  };

  const handleInstallmentChange = (idx, field, value) => {
    setFormData((prev) => {
      const updated = prev.installments.map((inst, i) => {
        if (i === idx) {
          return {
            ...inst,
            [field]: field === "amount_due" ? Number(value) : value,
          };
        }
        return inst;
      });
      return { ...prev, installments: updated };
    });
  };

  const showToastMsg = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 4000);
  };

  const validateStep1 = () => {
    if (!formData.name?.trim()) return "Full Name is required";
    if (!formData.email?.trim() || !formData.email.includes("@")) return "A valid Email Address is required";
    if (!formData.phone?.trim()) return "Phone Number is required";
    if (!formData.address?.trim()) return "Permanent Address is required";
    if (!formData.city?.trim()) return "City is required";
    if (!formData.state?.trim()) return "State is required";
    if (!formData.pincode?.trim()) return "Pincode is required";
    if (!formData.qualification) return "Highest Qualification is required";
    if (
      (formData.qualification === "graduate" || formData.qualification === "post graduate") &&
      !formData.degree_name?.trim()
    ) {
      return "Degree Name is required";
    }
    return null;
  };


  const validateStep2And3 = () => {
    if (!formData.course_id) return "Please select a Course";
    // batch_id is optional — student can be enrolled without a batch
    if (formData.discount_amount < 0) return "Discount amount cannot be negative";
    if (formData.discount_amount > baseFee) return "Discount cannot exceed base course fee";
    return null;
  };

  const validateStep4 = () => {
    if (formData.payment_scheme_mode === "INSTALLMENT") {
      if (formData.installments.length === 0) return "Please add at least one installment row";
      const sum = formData.installments.reduce((acc, inst) => acc + Number(inst.amount_due || 0), 0);
      if (sum !== finalPayableFee) {
        return `Installments sum (₹${sum.toLocaleString("en-IN")}) must equal the final payable fee (₹${finalPayableFee.toLocaleString("en-IN")})`;
      }
      for (let i = 0; i < formData.installments.length; i++) {
        const inst = formData.installments[i];
        if (!inst.label?.trim()) return `Label for row ${i + 1} is empty`;
        if (Number(inst.amount_due) <= 0) return `Amount due for row ${i + 1} must be positive`;
        if (!inst.due_date) return `Due date for row ${i + 1} is required`;
      }
    }
    return null;
  };

  const handleNext = () => {
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        showToastMsg(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2And3();
      if (err) {
        showToastMsg(err);
        return;
      }
      // Sync installments amount if full mode, or adjust dynamic template amounts to new total
      if (formData.payment_scheme_mode === "INSTALLMENT") {
        const count = formData.installments.length;
        if (count > 0) {
          const splitAmount = Math.round(finalPayableFee / count);
          const adjusted = formData.installments.map((inst, idx) => ({
            ...inst,
            amount_due: idx === count - 1 ? finalPayableFee - splitAmount * (count - 1) : splitAmount,
          }));
          setFormData((prev) => ({ ...prev, installments: adjusted }));
        }
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep4();
    if (err) {
      showToastMsg(err);
      return;
    }

    const combinedAddress = `${formData.address.trim()}, City: ${formData.city.trim()}, State: ${formData.state.trim()} - ${formData.pincode.trim()}`;
    const combinedQualification = (formData.qualification === "graduate" || formData.qualification === "post graduate")
      ? `${formData.qualification.charAt(0).toUpperCase() + formData.qualification.slice(1)} (${formData.degree_name.trim()})`
      : formData.qualification;

    setSubmitting(true);
    try {
      await axios.post("/api/admin/students/enroll", {
        ...formData,
        address: combinedAddress,
        qualification: combinedQualification,
        discount_amount: Number(formData.discount_amount),
      });

      showToastMsg("Student enrolled successfully! Invitation email triggered.");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      showToastMsg(err.response?.data?.message || "Enrolling student failed");
    } finally {
      setSubmitting(false);
    }
  };

  const sumInstallments = formData.installments.reduce((acc, inst) => acc + Number(inst.amount_due || 0), 0);

  return (
    <div className="space-y-6">
      <Toast message={toast} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-black/10 bg-white text-[#475569] flex items-center justify-center hover:bg-[#f8fafc] cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#0c0407] tracking-tight">Enroll New Student</h2>
          <p className="text-xs text-[#636363]">Register user, create profile, and set up billing.</p>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between max-w-lg mx-auto bg-white border border-black/[0.06] rounded-2xl p-4 shadow-sm">
        {[
          { num: 1, label: "Profile", icon: <FiUser /> },
          { num: 2, label: "Academic & Fees", icon: <FiBookOpen /> },
          { num: 3, label: "Payment blueprint", icon: <FiDollarSign /> },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                step === s.num
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                  : step > s.num
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-[#475569]"
              }`}
            >
              {step > s.num ? <FiCheck className="w-4 h-4" /> : s.icon}
            </div>
            <span className={`text-xs font-bold ${step === s.num ? "text-[#0c0407]" : "text-gray-400"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <Panel className="max-w-xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Personal & Academic Meta Fields */}
          {step === 1 && (
            <div className="space-y-4">
              <PanelHeader title="Personal & Academic Meta Fields" eyebrow="Step 1 of 3" />

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Alex Manda"
                  required
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. alex.manda@tims.com"
                  required
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 9876543210"
                  required
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Permanent Address</label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full street address..."
                  required
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Delhi"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Delhi"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="e.g. 110001"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">College/University</label>
                  <input
                    type="text"
                    name="college_name"
                    value={formData.college_name}
                    onChange={handleInputChange}
                    placeholder="e.g. VIT University"
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Highest Qualification</label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="10th">10th</option>
                    <option value="12th">12th</option>
                    <option value="graduate">Graduate</option>
                    <option value="post graduate">Post Graduate</option>
                  </select>
                </div>
              </div>

              {(formData.qualification === "graduate" || formData.qualification === "post graduate") && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Degree Name</label>
                  <input
                    type="text"
                    name="degree_name"
                    value={formData.degree_name}
                    onChange={handleInputChange}
                    placeholder="e.g. B.Tech, MCA, BCA, MBA"
                    required
                    className={inputClass}
                  />
                </div>
              )}


              <div className="pt-3 flex justify-end">
                <PrimaryButton type="button" onClick={handleNext}>
                  Continue to Program Selection
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* Step 2: Academic Track Matching & Ledger Customization */}
          {step === 2 && (
            <div className="space-y-4">
              <PanelHeader title="Academic Track & Fee Ledger" eyebrow="Step 2 of 3" />

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Select Course</label>
                {loadingCourses ? (
                  <p className="text-xs text-gray-400">Loading courses...</p>
                ) : (
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleCourseChange}
                    required
                    className={inputClass}
                  >
                    <option value="">-- Choose Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.department_name}] {c.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Base Course Fee</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                    <input
                      type="text"
                      readOnly
                      value={baseFee.toLocaleString("en-IN")}
                      className={`${inputClass} pl-7 bg-slate-50 text-[#64748b] cursor-not-allowed`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                    Select Batch <span className="text-[#94a3b8] font-normal normal-case">(optional)</span>
                  </label>
                  <select
                    name="batch_id"
                    value={formData.batch_id}
                    onChange={handleInputChange}
                    disabled={!formData.course_id || loadingBatches}
                    className={inputClass}
                  >
                    <option value="">— Skip for now —</option>
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.batch_name} ({b.start_date} to {b.end_date})
                      </option>
                    ))}
                  </select>
                  {loadingBatches && <span className="text-[10px] text-[#94a3b8]">Loading batches…</span>}
                  {!loadingBatches && formData.course_id && batches.length === 0 && (
                    <p className="text-[10px] text-amber-600 font-semibold mt-1">
                      No batches exist for this course yet. You can assign one later from the Student panel.
                    </p>
                  )}
                  {!formData.batch_id && (
                    <p className="text-[10px] text-[#94a3b8] font-medium mt-1">
                      Student will be enrolled without a batch. You can assign one later.
                    </p>
                  )}
                </div>
              </div>

              <div className="h-[1px] bg-slate-100 my-2"></div>

              <PanelHeader title="Fee Customization" />

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Discount Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    name="discount_amount"
                    min={0}
                    max={baseFee}
                    value={formData.discount_amount}
                    onChange={handleInputChange}
                    className={`${inputClass} pl-7`}
                  />
                </div>
              </div>


              <div className="p-4 rounded-xl bg-slate-50 border border-black/[0.04] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase">Final Payable Fee</h4>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Base Course Fee minus discount applied</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-[#0c0407]">
                    ₹{finalPayableFee.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-between">
                <SecondaryButton type="button" onClick={() => setStep(1)}>
                  Back
                </SecondaryButton>
                <PrimaryButton type="button" onClick={handleNext}>
                  Configure Payment Scheme
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* Step 3: Payment Plan Blueprint Fields */}
          {step === 3 && (
            <div className="space-y-4">
              <PanelHeader title="Payment Plan Blueprint" eyebrow="Step 3 of 3" />

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Payment Scheme Mode</label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => handleSchemeChange("FULL")}
                    className={`p-3.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                      formData.payment_scheme_mode === "FULL"
                        ? "border-rose-500 bg-rose-500/5 text-rose-500 shadow-sm"
                        : "border-black/10 hover:bg-[#fafafa]"
                    }`}
                  >
                    <span>Full Payment</span>
                    <span className="text-[10px] font-normal text-gray-400">Single complete transaction</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSchemeChange("INSTALLMENT")}
                    className={`p-3.5 rounded-xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all ${
                      formData.payment_scheme_mode === "INSTALLMENT"
                        ? "border-rose-500 bg-rose-500/5 text-rose-500 shadow-sm"
                        : "border-black/10 hover:bg-[#fafafa]"
                    }`}
                  >
                    <span>Installment Plan</span>
                    <span className="text-[10px] font-normal text-gray-400">Multiple structured installments</span>
                  </button>
                </div>
              </div>

              {formData.payment_scheme_mode === "INSTALLMENT" ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-black/[0.06] pb-3 mt-5">
                    <div>
                      <h4 className="text-xs font-bold text-[#0c0407]">Installment Structural Configurator</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">Sum of amounts must equal final payable fee.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addInstallmentRow}
                      className="px-2.5 py-1.5 bg-[#475569]/5 hover:bg-[#f1f5f9]/10 border border-black/10 rounded-lg text-[10px] font-extrabold text-[#475569] flex items-center gap-1 cursor-pointer"
                    >
                      <FiPlus /> Add Row
                    </button>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {formData.installments.map((inst, idx) => (
                      <div key={idx} className="flex gap-2 items-end bg-[#fafafa]/50 border border-gray-100 p-3 rounded-xl">
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Label</label>
                          <input
                            type="text"
                            value={inst.label || inst.installment_label || ""}
                            onChange={(e) => handleInstallmentChange(idx, "label", e.target.value)}
                            placeholder="e.g. First Installment"
                            className={inputClass}
                          />
                        </div>

                        <div className="w-28 space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Due Amount</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">₹</span>
                            <input
                              type="number"
                              value={inst.amount_due}
                              onChange={(e) => handleInstallmentChange(idx, "amount_due", e.target.value)}
                              className={`${inputClass} pl-6`}
                            />
                          </div>
                        </div>

                        <div className="w-32 space-y-1">
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Due Date</label>
                          <input
                            type="date"
                            value={inst.due_date}
                            onChange={(e) => handleInstallmentChange(idx, "due_date", e.target.value)}
                            className={inputClass}
                          />
                        </div>

                        {formData.installments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInstallmentRow(idx)}
                            className="w-9 h-9 border border-red-500/10 text-red-500 rounded-xl bg-red-500/5 hover:bg-red-500/10 flex items-center justify-center cursor-pointer shrink-0"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Calculations Status */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    sumInstallments === finalPayableFee
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600"
                      : "bg-amber-500/5 border-amber-500/20 text-amber-600"
                  }`}>
                    <span>
                      Sum: ₹{sumInstallments.toLocaleString("en-IN")} of ₹{finalPayableFee.toLocaleString("en-IN")}
                    </span>
                    <span>
                      {sumInstallments === finalPayableFee ? "Match Verified" : `Difference: ₹${(finalPayableFee - sumInstallments).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-black/[0.04] text-xs font-semibold text-gray-500 leading-relaxed">
                  A single full payment installment row of <strong className="text-[#0c0407]">₹{finalPayableFee.toLocaleString("en-IN")}</strong> will be generated automatically.
                </div>
              )}

              <div className="pt-3 flex justify-between border-t border-slate-100">
                <SecondaryButton type="button" onClick={() => setStep(2)}>
                  Back
                </SecondaryButton>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl text-white bg-rose-500 hover:bg-rose-600 active:scale-[0.99] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? "Enrolling..." : "Enroll Student"}
                </button>
              </div>
            </div>
          )}
        </form>
      </Panel>
    </div>
  );
}

export default EnrollStudentForm;
