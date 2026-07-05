import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ReactLenis } from "lenis/react";
import axios from "axios";
import { FiAward, FiCheckCircle, FiXCircle, FiLoader, FiCalendar, FiUser, FiBook } from "react-icons/fi";
import { INSTITUTE_NAME } from "../constants";

const CertificateVerification = () => {
  const { code } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    verifyCertificate();
  }, [code]);

  const verifyCertificate = async () => {
    try {
      const { data } = await axios.get(`/api/certificates/verify/${code}`);
      setCertificate(data);
    } catch (error) {
      console.error("Error verifying certificate:", error);
      setError(error.response?.data?.message || "Certificate not found or invalid");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ReactLenis
        root
        options={{
          duration: 1.25,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 0.85,
          touchMultiplier: 1.2,
        }}
      >
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center">
          <div className="text-center">
            <FiLoader className="w-12 h-12 text-[#fc362d] animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-[#636363]">Verifying certificate...</p>
          </div>
        </div>
      </ReactLenis>
    );
  }

  if (error) {
    return (
      <ReactLenis
        root
        options={{
          duration: 1.25,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 0.85,
          touchMultiplier: 1.2,
        }}
      >
        <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-[#fef2f2] flex items-center justify-center mx-auto mb-4">
              <FiXCircle className="w-8 h-8 text-[#b91c1c]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0c0407] mb-2">Certificate Not Found</h1>
            <p className="text-[#636363] mb-6">{error}</p>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#fc362d] text-white font-semibold hover:bg-[#e02d25] transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      </ReactLenis>
    );
  }

  return (
    <ReactLenis
      root
      options={{
        duration: 1.25,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.85,
        touchMultiplier: 1.2,
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#fc362d]/10 mb-4">
              <FiAward className="w-8 h-8 text-[#fc362d]" />
            </div>
            <h1 className="text-3xl font-bold text-[#0c0407] mb-2">Certificate Verification</h1>
            <p className="text-[#636363]">Verify the authenticity of this certificate</p>
          </div>

          {/* Certificate Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Status Banner */}
            <div className="bg-gradient-to-r from-[#ecfdf5] to-[#d1fae5] px-6 py-4 border-b border-[#059669]/20">
              <div className="flex items-center gap-3">
                <FiCheckCircle className="w-6 h-6 text-[#059669]" />
                <div>
                  <p className="text-sm font-bold text-[#059669]">Valid Certificate</p>
                  <p className="text-xs text-[#059669]/80">This certificate is authentic and issued by {INSTITUTE_NAME}</p>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="p-6 space-y-6">
              {/* Student Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#fc362d]/10 flex items-center justify-center shrink-0">
                  <FiUser className="w-6 h-6 text-[#fc362d]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Student Name</p>
                  <p className="text-lg font-bold text-[#0c0407]">{certificate.Student.User.name}</p>
                </div>
              </div>

              {/* Course Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#fc362d]/10 flex items-center justify-center shrink-0">
                  <FiBook className="w-6 h-6 text-[#fc362d]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Course Completed</p>
                  <p className="text-lg font-bold text-[#0c0407]">{certificate.Batch.Course.title}</p>
                </div>
              </div>

              {/* Certificate Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#f8fafc] rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Certificate No.</p>
                  <p className="text-sm font-mono font-bold text-[#0c0407]">{certificate.certificate_no}</p>
                </div>
                <div className="bg-[#f8fafc] rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Verification Code</p>
                  <p className="text-sm font-mono font-bold text-[#0c0407]">{certificate.verification_code}</p>
                </div>
              </div>

              {/* Issue Date */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#fc362d]/10 flex items-center justify-center shrink-0">
                  <FiCalendar className="w-6 h-6 text-[#fc362d]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-1">Issue Date</p>
                  <p className="text-base font-semibold text-[#0c0407]">
                    {new Date(certificate.issue_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Additional Details */}
              <div className="border-t border-black/[0.08] pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#636363]">Attendance Score</span>
                  <span className="text-sm font-bold text-[#0c0407]">{certificate.attendance_percentage}%</span>
                </div>
                {certificate.bypass_approved && (
                  <div className="flex justify-between">
                    <span className="text-sm text-[#636363]">Approval Method</span>
                    <span className="text-sm font-bold text-[#d97706]">Admin Bypass</span>
                  </div>
                )}
                {certificate.approver && (
                  <div className="flex justify-between">
                    <span className="text-sm text-[#636363]">Approved By</span>
                    <span className="text-sm font-bold text-[#0c0407]">{certificate.approver.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#f8fafc] px-6 py-4 border-t border-black/[0.08]">
              <p className="text-xs text-center text-[#94a3b8]">
                This certificate was digitally issued by {INSTITUTE_NAME}. For any inquiries, please contact the administration.
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#636363] hover:text-[#fc362d] transition-colors"
            >
              ← Return to {INSTITUTE_NAME} Homepage
            </a>
          </div>
        </div>
      </div>
    </ReactLenis>
  );
};

export default CertificateVerification;
