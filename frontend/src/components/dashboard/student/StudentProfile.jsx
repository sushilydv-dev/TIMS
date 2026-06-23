import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiBook,
  FiAward, FiCalendar, FiCamera, FiSave,
  FiAlertCircle, FiCheckCircle, FiLayers,
  FiDownload, FiFileText, FiCreditCard,
} from "react-icons/fi";
import axios from "axios";
import { WelcomeBanner, Toast } from "../DashboardUI";
import {
  pageWrapClass, cardClass, labelMutedClass, inputClass,
  primaryBtnClass, secondaryBtnClass,
} from "../dashboardTheme";
import logoSrc from "../../../assets/logo.png";

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

/* ── generateInvoicePDF — canvas-based PDF invoice ──── */
function generateInvoicePDF({ profile, feeData }) {
  return new Promise(async (resolve, reject) => {
    try {
      const fee          = feeData?.Fees?.[0] || null;
      const installments = [...(fee?.installments || [])].sort((a, b) => (a.sequence_number || 0) - (b.sequence_number || 0));
      const payments     = fee?.payments || [];

  const W = 794, H = 1123; // A4 at 96dpi
  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
  const fmtD = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  /* ── Background ── */
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, H);

  /* ── Header band ── */
  ctx.fillStyle = "#0c0407";
  ctx.fillRect(0, 0, W, 110);

  /* ── Logo ── */
  await new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 32, 18, 72, 72);
      resolve();
    };
    img.onerror = resolve;
    img.src = logoSrc;
  });

  /* ── TIMS title in header ── */
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Inter, system-ui, sans-serif";
  ctx.fillText("TIMS", 116, 52);
  ctx.font = "13px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText("Training & Internship Management System", 116, 74);

  /* ── Invoice title (right side of header) ── */
  ctx.font = "bold 22px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#fc362d";
  ctx.textAlign = "right";
  ctx.fillText("INVOICE", W - 36, 52);
  ctx.font = "11px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  const invoiceNo = `INV-${(profile.student_code || "STU").toUpperCase()}-${new Date().getFullYear()}`;
  ctx.fillText(invoiceNo, W - 36, 70);
  ctx.fillText(`Date: ${new Date().toLocaleDateString("en-IN")}`, W - 36, 88);
  ctx.textAlign = "left";

  /* ── Red accent line ── */
  ctx.fillStyle = "#fc362d";
  ctx.fillRect(0, 110, W, 4);

  let y = 142;

  /* ── Bill To / From section ── */
  const col1 = 36, col2 = W / 2 + 20;

  ctx.font = "bold 10px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("BILLED TO", col1, y);
  ctx.fillText("FROM", col2, y);

  y += 18;
  ctx.font = "bold 15px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#0c0407";
  ctx.fillText(profile.user?.name || "—", col1, y);
  ctx.fillText("TIMS Academy", col2, y);

  y += 18;
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#636363";
  ctx.fillText(profile.student_code || "—", col1, y);
  ctx.fillText("India", col2, y);
  y += 16;
  ctx.fillText(profile.user?.email || "—", col1, y);
  ctx.fillText("support@tims.in", col2, y);
  y += 16;
  if (profile.phone && profile.phone !== "0") ctx.fillText(profile.phone, col1, y);
  ctx.fillText("www.tims.in", col2, y);
  y += 16;
  ctx.fillText(`Course: ${profile.course?.title || "—"}`, col1, y);
  y += 16;
  ctx.fillText(`Batch: ${profile.batch?.batch_name || "—"}`, col1, y);

  y += 30;

  /* ── Divider ── */
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(36, y); ctx.lineTo(W - 36, y); ctx.stroke();
  y += 24;

  /* ── Fee summary table ── */
  const tableW = W - 72;
  const colWidths = [280, 120, 120, tableW - 520];
  const headers = ["Description", "Amount Due", "Settled", "Status"];

  // Table header bg
  ctx.fillStyle = "#f8f7fb";
  ctx.fillRect(36, y, tableW, 30);
  ctx.strokeStyle = "#e2e8f0";
  ctx.strokeRect(36, y, tableW, 30);

  ctx.font = "bold 10px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#475569";
  let cx = 46;
  headers.forEach((h, i) => {
    ctx.fillText(h, cx, y + 19);
    cx += colWidths[i];
  });
  y += 30;

  // Installment rows
  const rowH = 34;
  (installments.length > 0 ? installments : [{ installment_label: "Full Payment", amount_due: fee?.total_amount, amount_settled: fee?.paid_ammount, status: fee?.payment_status }])
    .forEach((inst, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? "#ffffff" : "#fafafa";
      ctx.fillRect(36, y, tableW, rowH);
      ctx.strokeStyle = "#f1f5f9";
      ctx.strokeRect(36, y, tableW, rowH);

      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#0c0407";
      cx = 46;
      ctx.fillText(inst.installment_label || "Payment", cx, y + 14);
      if (inst.due_date) { ctx.font = "10px Inter, system-ui, sans-serif"; ctx.fillStyle = "#94a3b8"; ctx.fillText(`Due: ${fmtD(inst.due_date)}`, cx, y + 27); ctx.font = "12px Inter, system-ui, sans-serif"; ctx.fillStyle = "#0c0407"; }
      cx += colWidths[0];
      ctx.fillText(inr(inst.amount_due), cx, y + 20);
      cx += colWidths[1];
      ctx.fillText(inr(inst.amount_settled || inst.paid_ammount || 0), cx, y + 20);
      cx += colWidths[2];
      const st = (inst.status || "").toUpperCase();
      ctx.fillStyle = st === "PAID" || st === "COMPLETED" ? "#059669" : st === "OVERDUE" ? "#b91c1c" : "#d97706";
      ctx.font = "bold 10px Inter, system-ui, sans-serif";
      ctx.fillText(st === "PENDING_FIRST_PAYMENT" ? "UNPAID" : st || "PENDING", cx, y + 20);
      y += rowH;
    });

  y += 10;

  /* ── Totals box ── */
  const totalsX = W - 36 - 220;
  const totals = [
    ["Subtotal",   inr(fee?.base_amount || fee?.total_amount)],
    ["Discount",   inr(fee?.discount_amount || 0)],
    ["Total Fee",  inr(fee?.total_amount)],
    ["Amount Paid",inr(fee?.paid_ammount)],
    ["Balance Due",inr(fee?.due_amount)],
  ];

  totals.forEach(([lbl, val], i) => {
    const isLast = i === totals.length - 1;
    if (isLast) {
      ctx.fillStyle = "#0c0407";
      ctx.fillRect(totalsX, y, 220, 30);
    }
    ctx.font = isLast ? "bold 13px Inter, system-ui, sans-serif" : "12px Inter, system-ui, sans-serif";
    ctx.fillStyle = isLast ? "#ffffff" : (lbl === "Balance Due" && Number(fee?.due_amount) > 0 ? "#b91c1c" : "#475569");
    ctx.fillText(lbl, totalsX + 10, y + (isLast ? 20 : 16));
    ctx.textAlign = "right";
    ctx.fillStyle = isLast ? "#fc362d" : ctx.fillStyle;
    ctx.fillText(val, totalsX + 210, y + (isLast ? 20 : 16));
    ctx.textAlign = "left";
    y += isLast ? 30 : 22;
  });

  y += 24;

  /* ── Payment history ── */
  if (payments.length > 0) {
    ctx.font = "bold 12px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#0c0407";
    ctx.fillText("Payment History", 36, y);
    y += 16;
    ctx.strokeStyle = "#e2e8f0"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(36, y); ctx.lineTo(W - 36, y); ctx.stroke();
    y += 14;

    payments.slice(0, 6).forEach(p => {
      ctx.font = "11px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#0c0407";
      ctx.fillText(`${fmtD(p.payment_date)} — ${p.payment_methhod || "—"}`, 36, y);
      ctx.fillStyle = "#059669";
      ctx.font = "bold 11px Inter, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`+${inr(p.amount)}`, W - 36, y);
      ctx.textAlign = "left";
      ctx.fillStyle = "#94a3b8"; ctx.font = "10px Inter, system-ui, sans-serif";
      ctx.fillText(p.transaction_id || "", 36, y + 12);
      y += 26;
    });
  }

  /* ── Footer ── */
  ctx.fillStyle = "#f8f7fb";
  ctx.fillRect(0, H - 64, W, 64);
  ctx.fillStyle = "#fc362d";
  ctx.fillRect(0, H - 64, W, 3);
  ctx.font = "11px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#94a3b8";
  ctx.textAlign = "center";
  ctx.fillText("TIMS — Training & Internship Management System", W / 2, H - 38);
  ctx.fillText("This is a computer-generated invoice and does not require a signature.", W / 2, H - 20);
  ctx.textAlign = "left";

  /* ── Download — use blob URL for cross-browser support ── */
  canvas.toBlob((blob) => {
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `TIMS-Invoice-${profile.student_code || "STU"}.png`;
    link.href     = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    resolve();
  }, "image/png");
    } catch (err) { reject(err); }
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
  const [feeData, setFeeData]       = useState(null);
  const [feeLoading, setFeeLoading] = useState(true);
  const [genInvoice, setGenInvoice] = useState(false);

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

  useEffect(() => {
    fetchProfile();
    // Also fetch fee data for invoice
    axios.get("/api/students/me/fees")
      .then(({ data }) => { setFeeData(data); setFeeLoading(false); })
      .catch(() => setFeeLoading(false));
  }, [fetchProfile]);

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

          {/* Invoice card */}
          <div className={`${cardClass} p-6`}>
            <h3 className="text-sm font-extrabold text-[#0c0407] mb-1">Billing Invoice</h3>
            <p className={`${labelMutedClass} mb-5`}>Download a PDF invoice for your TIMS fee transactions</p>

            {feeLoading ? (
              <div className="text-center py-8 text-sm text-[#94a3b8] font-semibold">Loading fee data…</div>
            ) : feeData?.Fees?.[0] ? (
              <div className="space-y-4">
                {/* Fee summary */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Total Fee",  value: `₹${Number(feeData.Fees[0].total_amount || 0).toLocaleString("en-IN")}`, color: "text-[#0c0407]" },
                    { label: "Paid",       value: `₹${Number(feeData.Fees[0].paid_ammount || 0).toLocaleString("en-IN")}`, color: "text-emerald-600" },
                    { label: "Balance",    value: `₹${Number(feeData.Fees[0].due_amount   || 0).toLocaleString("en-IN")}`, color: Number(feeData.Fees[0].due_amount) > 0 ? "text-[#b91c1c]" : "text-emerald-600" },
                  ].map(s => (
                    <div key={s.label} className="bg-[#fafafa] rounded-xl border border-black/[0.06] p-3 text-center">
                      <p className={labelMutedClass}>{s.label}</p>
                      <p className={`text-sm font-extrabold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                    (feeData.Fees[0].payment_status || "").toUpperCase() === "COMPLETED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : (feeData.Fees[0].payment_status || "").toUpperCase() === "OVERDUE"
                        ? "bg-[#fef2f2] text-[#b91c1c] border-[#b91c1c]/20"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {feeData.Fees[0].payment_status?.replace(/_/g, " ") || "—"}
                  </span>
                  <span className="text-[10px] text-[#94a3b8] font-medium">
                    {feeData.Fees[0].payment_scheme_mode === "FULL" ? "Full payment plan" : "Instalment plan"}
                  </span>
                </div>

                <button
                  disabled={genInvoice}
                  onClick={async () => {
                    setGenInvoice(true);
                    try {
                      await generateInvoicePDF({ profile, feeData });
                    } catch (err) {
                      showToast("Invoice generation failed: " + err.message);
                    } finally {
                      setGenInvoice(false);
                    }
                  }}
                  className={`${primaryBtnClass} w-full flex items-center justify-center gap-2 disabled:opacity-50`}
                >
                  <FiDownload className="w-4 h-4" />
                  {genInvoice ? "Generating invoice…" : "Download Invoice (PNG)"}
                </button>
              </div>
            ) : (
              <div className="text-center py-8 bg-[#fafafa] rounded-xl border border-dashed border-black/[0.07]">
                <FiFileText className="w-8 h-8 text-[#94a3b8] mx-auto mb-2" />
                <p className="text-xs text-[#94a3b8] font-semibold">No fee record found.</p>
                <p className="text-[10px] text-[#94a3b8] mt-1">Contact admin to set up your fee schedule.</p>
              </div>
            )}
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
