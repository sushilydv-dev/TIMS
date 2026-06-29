import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiAward, FiDownload, FiClock, FiCheckCircle, FiExternalLink } from "react-icons/fi";
import { cardClass, labelMutedClass, primaryBtnClass } from "../dashboardTheme";
import { INSTITUTE_NAME } from "../../../constants";

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const { data } = await axios.get("/api/certificates/my-certificates");
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificateUrl) => {
    // Construct full URL if it's a relative path
    const fullUrl = certificateUrl.startsWith('http') 
      ? certificateUrl 
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${certificateUrl}`;
    window.open(fullUrl, "_blank");
  };

  const getVerificationUrl = (verificationCode) => {
    return `https://sushildev.in/verify/${verificationCode}`;
  };

  if (loading) {
    return (
      <div className={cardClass}>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className={cardClass}>
      <div className="p-6 border-b border-black/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fc362d]/10 flex items-center justify-center">
            <FiAward className="w-5 h-5 text-[#fc362d]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#0c0407]">My Certificates</h3>
            <p className={labelMutedClass}>View and download your course completion certificates</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <FiAward className="w-16 h-16 text-[#cbd5e1] mx-auto mb-4" />
            <p className="text-sm font-semibold text-[#94a3b8]">No certificates issued yet</p>
            <p className="text-xs text-[#94a3b8] mt-1">
              Complete your courses and meet attendance requirements to receive certificates
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-xl border border-black/[0.08] bg-gradient-to-br from-[#fc362d]/5 to-transparent hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-base font-bold text-[#0c0407]">
                        {cert.Batch.Course.title}
                      </h4>
                      {cert.status === "issued" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#ecfdf5] text-[#059669] border border-[#059669]/20">
                          <FiCheckCircle className="w-3 h-3" />
                          Issued
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#d97706] border border-[#d97706]/20">
                          <FiClock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <p className="text-sm text-[#636363]">
                        <span className={labelMutedClass}>Certificate No:</span>{" "}
                        <span className="font-mono font-semibold">{cert.certificate_no}</span>
                      </p>
                      <p className="text-sm text-[#636363]">
                        <span className={labelMutedClass}>Issue Date:</span>{" "}
                        {new Date(cert.issue_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-[#636363]">
                        <span className={labelMutedClass}>Attendance:</span>{" "}
                        <span className="font-semibold">{cert.attendance_percentage}%</span>
                        {cert.bypass_approved && (
                          <span className="ml-2 text-xs text-[#d97706]">(Approved via bypass)</span>
                        )}
                      </p>
                    </div>

                    {cert.status === "issued" && cert.verification_code && (
                      <div className="flex items-center gap-2 p-3 bg-[#f8fafc] rounded-lg">
                        <FiExternalLink className="w-4 h-4 text-[#94a3b8]" />
                        <p className="text-xs text-[#636363]">
                          Verify at:{" "}
                          <a
                            href={getVerificationUrl(cert.verification_code)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#fc362d] font-semibold hover:underline"
                          >
                            {getVerificationUrl(cert.verification_code)}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>

                  {cert.status === "issued" && cert.certificate_url ? (
                    <button
                      onClick={() => handleDownload(cert.certificate_url)}
                      className={`${primaryBtnClass} flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold`}
                    >
                      <FiDownload className="w-4 h-4" />
                      Download PDF
                    </button>
                  ) : (
                    <div className="px-4 py-2.5 rounded-lg bg-[#f8fafc] text-sm font-semibold text-[#94a3b8]">
                      Processing...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCertificates;
