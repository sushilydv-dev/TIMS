import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiUser, FiMail, FiCamera, FiSave,
  FiAlertCircle, FiLock, FiEye, FiEyeOff,
} from "react-icons/fi";
import axios from "axios";
import { WelcomeBanner, Toast } from "../DashboardUI";
import {
  pageWrapClass, cardClass, cardLightClass, labelMutedClass, inputClass,
  primaryBtnClass, secondaryBtnClass,
} from "../dashboardTheme";
import ImageCropper from "../ImageCropper";

/* ── compress avatar ─────────────────────────────────── */
function compressAvatar(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) { reject(new Error("Image must be under 10 MB")); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1024;
      let { width, height } = img;
      if (width >= height) { height = Math.round((height / width) * MAX); width = MAX; }
      else { width = Math.round((width / height) * MAX); height = MAX; }
      const canvas = document.createElement("canvas");
      canvas.width = MAX; canvas.height = MAX;
      const ctx = canvas.getContext("2d");
      ctx.beginPath(); ctx.arc(MAX/2, MAX/2, MAX/2, 0, Math.PI*2); ctx.clip();
      ctx.drawImage(img, (MAX-width)/2, (MAX-height)/2, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.95));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read image")); };
    img.src = url;
  });
}

/* ── InfoRow ─────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, editing, inputProps }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-black/[0.05] last:border-0">
      <div className="w-8 h-8 rounded-xl bg-[#fc362d]/8 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-[#fc362d]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${labelMutedClass} mb-1`}>{label}</p>
        {editing && inputProps ? (
          <input {...inputProps} className={`${inputClass} text-sm`} />
        ) : (
          <p className="text-sm font-semibold text-[#0c0407] break-words">{value || "—"}</p>
        )}
      </div>
    </div>
  );
}

/* ── PasswordSection ─────────────────────────────────── */
function PasswordSection() {
  const [form, setForm]     = useState({ current: "", next: "", confirm: "" });
  const [show, setShow]     = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState({ text: "", type: "" });

  const toggle = (field) => setShow(p => ({ ...p, [field]: !p[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.next !== form.confirm) { setMsg({ text: "New passwords don't match", type: "error" }); return; }
    if (form.next.length < 6) { setMsg({ text: "New password must be at least 6 characters", type: "error" }); return; }
    setSaving(true); setMsg({ text: "", type: "" });
    try {
      await axios.put("/api/auth/change-password", {
        current_password: form.current,
        new_password:     form.next,
      });
      setMsg({ text: "Password changed successfully!", type: "ok" });
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Failed to change password", type: "error" });
    } finally { setSaving(false); }
  };

  const PasswordField = ({ field, label }) => (
    <div>
      <label className={`${labelMutedClass} block mb-1.5`}>{label}</label>
      <div className="relative">
        <input
          type={show[field] ? "text" : "password"}
          value={form[field]}
          onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
          className={`${inputClass} pr-10`}
          placeholder="••••••••"
          required
        />
        <button type="button" onClick={() => toggle(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0c0407] cursor-pointer">
          {show[field] ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className={`${cardClass} p-6`}>
      <h3 className="text-sm font-extrabold text-[#0c0407] mb-1">Change Password</h3>
      <p className={`${labelMutedClass} mb-4`}>Update your account password</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordField field="current" label="Current Password" />
        <PasswordField field="next" label="New Password" />
        <PasswordField field="confirm" label="Confirm New Password" />
        {msg.text && (
          <p className={`text-xs font-semibold ${msg.type === "error" ? "text-[#b91c1c]" : "text-[#059669]"}`}>
            {msg.text}
          </p>
        )}
        <button type="submit" disabled={saving}
          className={`${primaryBtnClass} flex items-center gap-1.5 disabled:opacity-50`}>
          <FiSave className="w-3.5 h-3.5" />{saving ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}

/* ── AdminProfile ─────────────────────────────────────── */
export default function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });
  const [imgPreview, setImgPreview] = useState(null);
  const [showImgModal, setShowImgModal] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const fileInputRef = useRef(null);

  // Lock body scroll when modals are open
  useEffect(() => {
    if (showImgModal || showCropper) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showImgModal, showCropper]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/auth/profile");
      setProfile(data);
      setForm({ name: data.name || "", email: data.email || "" });
      setImgPreview(data.profile_img || null);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setToast("Image must be under 10 MB");
      setTimeout(() => setToast(""), 3500);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedDataUrl) => {
    setImgPreview(croppedDataUrl);
    setShowCropper(false);
    setImageToCrop(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("/api/auth/profile", {
        name: form.name,
        email: form.email,
        profile_img: imgPreview,
      });
      setToast("Profile updated successfully!");
      setEditing(false);
      await fetchProfile();
    } catch (err) {
      setToast(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(""), 3500);
    }
  };

  const handleCancel = () => {
    setForm({ name: profile?.name || "", email: profile?.email || "" });
    setImgPreview(profile?.profile_img || null);
    setEditing(false);
  };

  if (loading) return (
    <div className={pageWrapClass}>
      <div className={`${cardClass} flex flex-col items-center justify-center py-16 gap-4`}>
        <div className="w-12 h-12 border-4 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#94a3b8]">Loading profile…</p>
      </div>
    </div>
  );

  if (error || !profile) return (
    <div className={pageWrapClass}>
      <div className={`${cardClass} flex flex-col items-center justify-center py-16 gap-4 text-center`}>
        <FiAlertCircle className="w-12 h-12 text-[#fc362d]" />
        <p className="text-sm font-semibold text-[#636363]">{error || "Profile not found"}</p>
        <button onClick={fetchProfile} className={primaryBtnClass}>Retry</button>
      </div>
    </div>
  );

  const initials = (profile.name || "AD").slice(0, 2).toUpperCase();

  return (
    <div className={pageWrapClass}>
      <Toast message={toast} />

      <WelcomeBanner
        badge="My Profile"
        title="Admin Profile"
        description="Your account details and settings."
        actions={
          editing ? (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className={`${primaryBtnClass} flex items-center gap-1.5 disabled:opacity-50`}>
                <FiSave className="w-3.5 h-3.5" />{saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={handleCancel} className={secondaryBtnClass}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className={secondaryBtnClass}>Edit Profile</button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Avatar + ID card ── */}
        <div className="flex flex-col gap-5">
          <div className={`${cardLightClass} p-6 flex flex-col items-center gap-4`}>
            <div className="relative">
              <button
                type="button"
                onClick={() => imgPreview && setShowImgModal(true)}
                className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-[#fc362d]/10 to-[#f43f5e]/10 border-4 border-white shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
              >
                {imgPreview ? (
                  <img src={imgPreview} alt="Profile" className="w-full h-full object-cover"
                    onError={() => setImgPreview(null)} />
                ) : (
                  <span className="text-3xl font-extrabold text-[#fc362d] select-none">{initials}</span>
                )}
              </button>
              {editing && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#fc362d] border-2 border-white flex items-center justify-center shadow-md cursor-pointer hover:bg-[#e02d25] transition-colors"
                  aria-label="Change photo">
                  <FiCamera className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleAvatarChange} />
            <div className="text-center">
              <h2 className="text-lg font-extrabold text-[#0c0407]">{profile.name}</h2>
              <p className="text-xs text-[#94a3b8] font-semibold mt-0.5 uppercase tracking-wider">{profile.role?.replace("_", " ")}</p>
            </div>
            {editing && (
              <p className="text-[10px] text-[#94a3b8] text-center">Click the camera icon to upload a photo</p>
            )}
          </div>

          {/* Admin card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#fc362d] via-[#f43f5e] to-[#e02d25] p-5 text-white shadow-[0_8px_28px_rgba(252,54,45,0.25)]">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-white/20 rounded-full blur-xl" />
            <div className="relative z-10">
              <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-white/20 uppercase tracking-wider">Admin ID</span>
              <h3 className="text-base font-extrabold mt-2 mb-0.5">{profile.name}</h3>
              <p className="text-[9px] text-white/80 font-bold uppercase tracking-wider mb-4">{profile.role?.replace("_", " ")}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[7px] font-bold text-white/60 uppercase">Email</p>
                  <p className="text-[9px] font-bold truncate max-w-[140px]">{profile.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Details + Password ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Personal details */}
          <div className={`${cardClass} p-6`}>
            <h3 className="text-sm font-extrabold text-[#0c0407] mb-1">Account Information</h3>
            <p className={`${labelMutedClass} mb-4`}>{editing ? "Edit your details below" : "Your registered profile"}</p>

            <InfoRow icon={FiUser}      label="Full Name"
              value={form.name} editing={editing}
              inputProps={{ type: "text", value: form.name, onChange: e => setForm(p => ({ ...p, name: e.target.value })), placeholder: "Your full name" }} />
            <InfoRow icon={FiMail}      label="Email"        value={profile.email} />
          </div>

          {/* Password section */}
          <PasswordSection />
        </div>
      </div>

      {/* Profile Picture Modal */}
      {showImgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative max-w-2xl w-full">
            <button
              type="button"
              onClick={() => setShowImgModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={imgPreview}
              alt="Profile Picture"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              onClick={() => setShowImgModal(false)}
            />
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && imageToCrop && (
        <ImageCropper
          imageSrc={imageToCrop}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
