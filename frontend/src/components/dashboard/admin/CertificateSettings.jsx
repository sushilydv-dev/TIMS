import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiX, FiSave, FiUpload } from "react-icons/fi";
import { PrimaryButton, Toast } from "../DashboardUI";
import { inputClass, labelMutedClass, secondaryBtnClass } from "../dashboardTheme";

const defaultSettings = {
  attendance_threshold: 75,
  allow_bypass: true,
  auto_generate: false,
  verification_domain: "sushildev.in",
  digital_signature_url: "",
  signature_title: "Course Coordinator",
};

export function CertificateSettingsModal({ open, onClose, onSaved }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [clearSignature, setClearSignature] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const fetchSettings = async () => {
      setLoading(true);
      setToast("");
      setSignatureData(null);
      setClearSignature(false);

      try {
        const { data } = await axios.get("/api/certificates/settings");
        setSettings({
          attendance_threshold: data.attendance_threshold || 75,
          allow_bypass: data.allow_bypass !== undefined ? data.allow_bypass : true,
          auto_generate: data.auto_generate === true,
          verification_domain: data.verification_domain || "sushildev.in",
          digital_signature_url: data.digital_signature_url || "",
          signature_title: data.signature_title || "Course Coordinator",
        });
        setSignaturePreview(data.digital_signature_url || null);
      } catch (error) {
        console.error("Error fetching certificate settings:", error);
        setToast("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [open]);

  const handleSignatureUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setToast("Signature image must be under 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSignaturePreview(reader.result);
      setSignatureData(reader.result);
      setClearSignature(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast("");

    try {
      const payload = {
        attendance_threshold: settings.attendance_threshold,
        allow_bypass: settings.allow_bypass,
        auto_generate: settings.auto_generate,
        verification_domain: settings.verification_domain,
        signature_title: settings.signature_title,
      };

      if (signatureData) {
        payload.digital_signature_url = signatureData;
      } else if (clearSignature) {
        payload.digital_signature_url = null;
      }

      await axios.put("/api/certificates/settings", payload);
      setToast("Settings saved successfully!");
      onSaved?.();
      setTimeout(() => {
        onClose();
      }, 600);
    } catch (error) {
      console.error("Error saving certificate settings:", error);
      setToast("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close settings"
      />
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-black/[0.08]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="certificate-settings-title"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-4 border-b border-black/[0.06] bg-white">
          <div>
            <p className={labelMutedClass}>Certificate configuration</p>
            <h3 id="certificate-settings-title" className="text-lg font-bold text-[#0c0407]">
              Certificate Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#636363] hover:bg-[#f8fafc] transition-colors"
            aria-label="Close"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <Toast message={toast} />

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className={`${labelMutedClass} block mb-2`}>
                  Attendance Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.attendance_threshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      attendance_threshold: parseFloat(e.target.value),
                    })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-xl">
                <div>
                  <label className="text-sm font-semibold text-[#0c0407] block">
                    Allow Bypass
                  </label>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Approve certificates below the attendance threshold
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, allow_bypass: !settings.allow_bypass })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.allow_bypass ? "bg-[#fc362d]" : "bg-[#cbd5e1]"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.allow_bypass ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-xl">
                <div>
                  <label className="text-sm font-semibold text-[#0c0407] block">
                    Automatic Generation
                  </label>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Auto-issue certificates when students become eligible
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings({ ...settings, auto_generate: !settings.auto_generate })
                  }
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.auto_generate ? "bg-[#fc362d]" : "bg-[#cbd5e1]"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.auto_generate ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className={`${labelMutedClass} block mb-2`}>
                  Verification Domain
                </label>
                <input
                  type="text"
                  value={settings.verification_domain}
                  onChange={(e) =>
                    setSettings({ ...settings, verification_domain: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={`${labelMutedClass} block mb-2`}>
                  Digital Signature
                </label>
                <div className="rounded-xl border border-dashed border-black/[0.12] bg-[#f8fafc] p-4">
                  {signaturePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={signaturePreview}
                        alt="Signature preview"
                        className="max-h-20 object-contain"
                      />
                      <div className="flex gap-2">
                        <label className={`${secondaryBtnClass} cursor-pointer inline-flex items-center gap-2 text-sm`}>
                          <FiUpload className="w-4 h-4" />
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleSignatureUpload}
                          />
                        </label>
                        <button
                          type="button"
                          className={`${secondaryBtnClass} text-sm`}
                          onClick={() => {
                            setSignaturePreview(null);
                            setSignatureData(null);
                            setClearSignature(true);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 py-4 cursor-pointer">
                      <FiUpload className="w-6 h-6 text-[#94a3b8]" />
                      <span className="text-sm font-semibold text-[#636363]">
                        Upload signature image
                      </span>
                      <span className="text-xs text-[#94a3b8]">
                        PNG or JPG, max 2 MB — placed on issued certificates
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSignatureUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className={`${labelMutedClass} block mb-2`}>
                  Signature Title
                </label>
                <input
                  type="text"
                  value={settings.signature_title}
                  onChange={(e) =>
                    setSettings({ ...settings, signature_title: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Course Coordinator"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className={secondaryBtnClass}>
                  Cancel
                </button>
                <PrimaryButton
                  type="submit"
                  disabled={saving}
                  icon={<FiSave className="w-4 h-4" />}
                >
                  {saving ? "Saving..." : "Save Settings"}
                </PrimaryButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CertificateSettingsModal;
