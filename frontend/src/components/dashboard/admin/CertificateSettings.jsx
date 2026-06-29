import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiSettings, FiSave, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { Panel, PanelHeader, PrimaryButton, Toast } from "../DashboardUI";
import { inputClass, labelMutedClass } from "../dashboardTheme";

const CertificateSettings = () => {
  const [settings, setSettings] = useState({
    attendance_threshold: 75,
    allow_bypass: true,
    verification_domain: "sushildev.in",
    certificate_template_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get("/api/certificates/settings");
      setSettings({
        attendance_threshold: data.attendance_threshold || 75,
        allow_bypass: data.allow_bypass !== undefined ? data.allow_bypass : true,
        verification_domain: data.verification_domain || "sushildev.in",
        certificate_template_url: data.certificate_template_url || "",
      });
    } catch (error) {
      console.error("Error fetching certificate settings:", error);
      setToast("Failed to load settings");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setToast("");

    try {
      await axios.put("/api/certificates/settings", settings);
      setToast("Settings saved successfully!");
      setTimeout(() => setToast(""), 3000);
    } catch (error) {
      console.error("Error saving certificate settings:", error);
      setToast("Failed to save settings");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Panel>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <Toast message={toast} />
      <PanelHeader
        icon={<FiSettings className="w-5 h-5" />}
        title="Certificate Settings"
        description="Configure global certificate generation policies"
      />

      <form onSubmit={handleSave} className="space-y-6 mt-6">
        {/* Attendance Threshold */}
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
              setSettings({ ...settings, attendance_threshold: parseFloat(e.target.value) })
            }
            className={inputClass}
            required
          />
          <p className="text-xs text-[#94a3b8] mt-1">
            Minimum attendance required for automatic certificate eligibility
          </p>
        </div>

        {/* Allow Bypass Toggle */}
        <div className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-xl">
          <div>
            <label className="text-sm font-semibold text-[#0c0407] block">
              Allow Bypass
            </label>
            <p className="text-xs text-[#94a3b8] mt-0.5">
              Allow admins to manually approve certificates for students below threshold
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSettings({ ...settings, allow_bypass: !settings.allow_bypass })}
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

        {/* Verification Domain */}
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
            placeholder="e.g., sushildev.in"
            required
          />
          <p className="text-xs text-[#94a3b8] mt-1">
            Domain used for certificate verification links
          </p>
        </div>

        {/* Certificate Template URL */}
        <div>
          <label className={`${labelMutedClass} block mb-2`}>
            Certificate Template URL (Optional)
          </label>
          <input
            type="url"
            value={settings.certificate_template_url}
            onChange={(e) =>
              setSettings({ ...settings, certificate_template_url: e.target.value })
            }
            className={inputClass}
            placeholder="https://example.com/template.png"
          />
          <p className="text-xs text-[#94a3b8] mt-1">
            URL to custom certificate template image
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <PrimaryButton
            type="submit"
            disabled={saving}
            icon={<FiSave className="w-4 h-4" />}
          >
            {saving ? "Saving..." : "Save Settings"}
          </PrimaryButton>
        </div>
      </form>
    </Panel>
  );
};

export default CertificateSettings;
