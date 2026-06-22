import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiBook,
  FiAward, FiCalendar, FiCamera, FiSave,
  FiAlertCircle, FiCheckCircle, FiLayers,
} from "react-icons/fi";
import axios from "axios";
import { WelcomeBanner, Toast } from "../DashboardUI";
import {
  pageWrapClass, cardClass, labelMutedClass, inputClass,
  primaryBtnClass, secondaryBtnClass,
} from "../dashboardTheme";

/* ── helpers ─────────────────────────────────────────── */
const fmt = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  }) : "—";

/* ── compress avatar via canvas ─────────────────────── */
function compressAvatar(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) { reject(new Error("Image must be under 10 MB")); return; }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 256;
      let { width, height } = img;
      if (width >= height) { height = Math.round((height / width) * MAX); width = MAX; }
      else { width = Math.round((width / height) * MAX); height = MAX; }
      const canvas = document.createElement("canvas");
      canvas.width  = MAX; canvas.height = MAX;
      const ctx = canvas.getContext("2d");
      // Draw circle clip
      ctx.beginPath();
      ctx.arc(MAX / 2, MAX / 2, MAX / 2, 0, Math.PI * 2);
      ctx.clip();
      const offX = (MAX - width) / 2;
      const offY = (MAX - height) / 2;
      ctx.drawImage(img, offX, offY, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.88));
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

/* ── Main ────────────────────────────────────────────── */
export default function StudentProfile() {
  const fileInputRef = useRef(null);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState("");
  const [imgPreview, setImgPreview] = useState(null); // base64 preview
  const [imgData, setImgData]       = useState(null); // base64 to save

  // Editable fields
  const [form, setForm] = useState({
    phone: "", address: "", college_name: "", qualification: "",
  });

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 4000); };

  const fetchProfile = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data } = await axios.get("/api/students/me/profile");
      setProfile(data);
      setForm({
        phone:         data.phone         || "",
        address:       data.address       || "",
        college_name:  data.college_name  || "",
        qualification: data.qualification || "",
      });
      setImgPreview(data.profile_img || null);
      setImgData(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await compressAvatar(file);
      setImgPreview(data);
      setImgData(data);
    } catch (err) { showToast(err.message); }
    e.target.value = "";
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      if (imgData !== null) payload.profile_img = imgData;
      await axios.put("/api/students/me/profile", payload);
      showToast("Profile updated successfully!");
      setEditing(false);
      setImgData(null);
      fetchProfile();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setEditing(false);
    setImgData(null);
    if (profile) {
      setForm({
        phone: profile.phone || "", address: profile.address || "",
        college_name: profile.college_name || "", qualification: profile.qualification || "",
      });
      setImgPreview(profile.profile_img || null);
    }
  };

  if (loading) return (
    <div className={pageWrapClass}>
      <div className="text-center py-16 text-sm text-[#94a3b8] font-semibold">Loading profile…</div>
    </div>
  );

  if (error || !profile) return (
    <div className={pageWrapClass}>
      <div className={`${cardClass} flex flex-col items-center py-12 gap-3 text-center`}>
        <FiAlertCircle className="w-10 h-10 text-[#fc362d]" />
        <p className="text-sm font-semibold text-[#636363]">{error || "Profile not found"}</p>
        <button onClick={fetchProfile} className={`${primaryBtnClass}`}>Retry</button>
      </div>
    </div>
  );

  const initials = (profile.user?.name || "ST").slice(0, 2).toUpperCase();

  return (
    <div className={pageWrapClass}>
      <Toast message={toast} />

      <WelcomeBanner
        badge="My Profile"
        title="Student Profile"
        description="Your personal details, enrolment information and course details."
        actions={
          editing ? (
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving}
                className={`${primaryBtnClass} flex items-center gap-1.5 disabled:opacity-50`}>
                <FiSave className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={handleCancel} className={secondaryBtnClass}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className={secondaryBtnClass}>
              Edit Profile
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Avatar + ID card ── */}
        <div className="flex flex-col gap-5">

          {/* Avatar */}
          <div className={`${cardClass} p-6 flex flex-col items-center gap-4`}>
            {/* Circle avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-[#f0eef4] border-4 border-white shadow-md flex items-center justify-center">
                {imgPreview ? (
                  <img src={imgPreview} alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setImgPreview(null)}
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-[#94a3b8] select-none">{initials}</span>
                )}
              </div>
              {/* Camera button */}
              {editing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#fc362d] border-2 border-white flex items-center justify-center shadow-md cursor-pointer hover:bg-[#e02d25] transition-colors"
                  aria-label="Change photo"
                >
                  <FiCamera className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="hidden" onChange={handleAvatarChange} />

            <div className="text-center">
              <h2 className="text-lg font-extrabold text-[#0c0407]">{profile.user?.name}</h2>
              <p className="text-xs text-[#94a3b8] font-semibold mt-0.5">{profile.user?.email}</p>
            </div>

            {editing && (
              <p className="text-[10px] text-[#94a3b8] text-center">
                Click the camera icon to upload a new photo
              </p>
            )}
          </div>

          {/* Student ID card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a1f] via-[#141418] to-[#0c0407] p-5 text-white shadow-[0_8px_28px_rgba(0,0,0,0.22)]">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full blur-lg" />
            <div className="relative z-10">
              <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-white/20 uppercase tracking-wider">
                Student ID Card
              </span>
              <h3 className="text-base font-extrabold tracking-tight mt-2 mb-0.5">
                {profile.user?.name || "—"}
              </h3>
              <p className="text-[9px] text-white/60 font-bold uppercase tracking-wider mb-4">
                {profile.course?.title || "No course enrolled"}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[7px] font-bold text-white/40 uppercase">Student ID</p>
                  <p className="text-sm font-bold font-mono tracking-wider">
                    {profile.student_code || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] font-bold text-white/40 uppercase">Batch</p>
                  <p className="text-[9px] font-bold">{profile.batch?.batch_name || "Unassigned"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Details ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Personal details */}
          <div className={`${cardClass} p-6`}>
            <h3 className="text-sm font-extrabold text-[#0c0407] mb-1">Personal Information</h3>
            <p className={`${labelMutedClass} mb-4`}>
              {editing ? "Edit your contact and personal details below" : "Your registered details"}
            </p>

            <InfoRow icon={FiUser}  label="Full Name"    value={profile.user?.name} />
            <InfoRow icon={FiMail}  label="Email"        value={profile.user?.email} />
            <InfoRow icon={FiAward} label="Student ID"   value={profile.student_code} />
            <InfoRow
              icon={FiPhone} label="Phone Number"
              value={form.phone}
              editing={editing}
              inputProps={{
                type: "tel", value: form.phone,
                onChange: e => setForm(p => ({ ...p, phone: e.target.value })),
                placeholder: "+91 98765 43210",
              }}
            />
            <InfoRow
              icon={FiMapPin} label="Address"
              value={form.address}
              editing={editing}
              inputProps={{
                type: "text", value: form.address,
                onChange: e => setForm(p => ({ ...p, address: e.target.value })),
                placeholder: "Street, City, State",
              }}
            />
            <InfoRow
              icon={FiBook} label="College / Institution"
              value={form.college_name}
              editing={editing}
              inputProps={{
                type: "text", value: form.college_name,
                onChange: e => setForm(p => ({ ...p, college_name: e.target.value })),
                placeholder: "College name",
              }}
            />
            <InfoRow
              icon={FiAward} label="Qualification"
              value={form.qualification}
              editing={editing}
              inputProps={{
                type: "text", value: form.qualification,
                onChange: e => setForm(p => ({ ...p, qualification: e.target.value })),
                placeholder: "e.g. B.Tech, BCA, MCA…",
              }}
            />
          </div>

          {/* Enrolment & course */}
          <div className={`${cardClass} p-6`}>
            <h3 className="text-sm font-extrabold text-[#0c0407] mb-1">Enrolment & Course</h3>
            <p className={`${labelMutedClass} mb-4`}>Read-only — managed by admin</p>

            <InfoRow icon={FiBook}     label="Course Enrolled"     value={profile.course?.title} />
            <InfoRow icon={FiLayers}   label="Batch"               value={profile.batch?.batch_name} />
            <InfoRow icon={FiCalendar} label="Enrolment Date"      value={fmt(profile.enrollment?.enrollment_date || profile.joining_date)} />
            <InfoRow icon={FiCalendar} label="Course Start Date"   value={fmt(profile.batch?.start_date)} />
            <InfoRow icon={FiCalendar} label="Course End Date"     value={fmt(profile.batch?.end_date)} />
            <InfoRow icon={FiCheckCircle} label="Enrolment Status" value={profile.enrollment?.status || "—"} />
          </div>

          {/* Save bar when editing */}
          {editing && (
            <div className="sticky bottom-4 flex items-center justify-end gap-3 bg-white border border-black/[0.08] rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <p className="text-xs text-[#94a3b8] font-semibold flex-1">Unsaved changes</p>
              <button onClick={handleCancel} className={`${secondaryBtnClass} text-xs py-2`}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className={`${primaryBtnClass} text-xs py-2 flex items-center gap-1.5 disabled:opacity-50`}>
                <FiSave className="w-3.5 h-3.5" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
