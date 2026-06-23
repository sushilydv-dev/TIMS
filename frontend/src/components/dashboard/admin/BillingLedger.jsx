import { useCallback, useEffect, useState } from "react";
import {
  FiDollarSign, FiCreditCard, FiAlertCircle, FiSearch,
  FiCheckCircle, FiChevronDown, FiChevronUp, FiX,
  FiRefreshCw, FiUsers, FiClock, FiDownload,
} from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner, StatCards, Panel, PanelHeader, StatusBadge, Toast,
} from "../DashboardUI";
import { pageWrapClass, inputClass, labelMutedClass, cardClass } from "../dashboardTheme";
import { generatePaymentReceipt } from "../../../utils/generatePaymentReceipt";

/* ── helpers ─────────────────────────────────────────── */
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const inrL = (n) => {
  const v = Number(n || 0);
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  return inr(v);
};
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_CFG = {
  COMPLETED:             { label: "Paid",         variant: "ok",     dot: "bg-emerald-500" },
  ACTIVE:                { label: "Active",        variant: "ok",     dot: "bg-blue-500" },
  OVERDUE:               { label: "Overdue",       variant: "danger", dot: "bg-[#b91c1c]" },
  PENDING_FIRST_PAYMENT: { label: "Unpaid",        variant: "warn",   dot: "bg-amber-500" },
  PARTIAL:               { label: "Partial",       variant: "warn",   dot: "bg-amber-500" },
};
const getStatus = (s) => STATUS_CFG[(s || "").toUpperCase()] || { label: s || "—", variant: "info", dot: "bg-[#94a3b8]" };

/* ── InstallmentRow ──────────────────────────────────── */
function InstallmentRow({ inst }) {
  const isPaid    = inst.status === "PAID";
  const isOverdue = inst.status === "OVERDUE";
  return (
    <div className={`flex items-center justify-between gap-3 py-2 px-3 rounded-lg text-[10px] ${
      isPaid ? "bg-emerald-50 border border-emerald-200" : isOverdue ? "bg-[#fef2f2] border border-[#b91c1c]/20" : "bg-[#f1f5f9] border border-black/[0.06]"
    }`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isPaid ? "bg-emerald-500" : isOverdue ? "bg-[#b91c1c]" : "bg-amber-500"}`} />
        <span className="font-bold text-[#0c0407] truncate">{inst.label}</span>
        <span className="text-[#94a3b8] shrink-0">Due {fmtDate(inst.due_date)}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-bold text-[#0c0407]">{inr(inst.amount_due)}</span>
        {isPaid && <span className="text-emerald-600 font-extrabold">✓ Paid</span>}
        {!isPaid && inst.settled > 0 && (
          <span className="text-amber-600 font-bold">{inr(inst.settled)} settled</span>
        )}
      </div>
    </div>
  );
}

/* ── PaymentRow — with per-payment receipt download ─── */
function PaymentRow({ p }) {
  const [downloading, setDownloading] = useState(false);
  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#fafafa] border border-black/[0.06] hover:bg-white transition-colors">
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
          <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#0c0407] truncate">{p.student_name}</p>
          <p className="text-[10px] text-[#94a3b8] font-semibold">{p.student_code}</p>
          <p className="text-[9px] text-[#94a3b8] mt-0.5 font-medium truncate">
            {fmtDate(p.payment_date)} · {p.method}
          </p>
          {p.transaction_id && p.transaction_id !== "—" && (
            <p className="text-[9px] text-[#94a3b8] font-mono truncate">{p.transaction_id}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <p className="text-sm font-extrabold text-emerald-600">+{inr(p.amount)}</p>
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
          p.status === "SUCCESS"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}>{p.status}</span>
        <button
          disabled={downloading}
          onClick={async () => {
            setDownloading(true);
            try {
              await generatePaymentReceipt({
                studentName:   p.student_name,
                studentCode:   p.student_code,
                studentEmail:  p.student_email || "—",
                courseName:    p.course_title  || "—",
                batchName:     p.batch_name    || "—",
                amount:        p.amount,
                paymentDate:   fmtDate(p.payment_date),
                paymentMethod: p.method,
                transactionId: p.transaction_id,
                status:        p.status || "SUCCESS",
              });
            } catch { /* silent */ }
            finally { setDownloading(false); }
          }}
          className="flex items-center gap-1 text-[9px] font-bold text-[#475569] hover:text-[#fc362d] cursor-pointer px-2 py-1 rounded-lg border border-black/[0.07] hover:border-[#fc362d]/30 bg-white transition-all disabled:opacity-50"
        >
          <FiDownload className="w-3 h-3" />
          {downloading ? "…" : "Receipt"}
        </button>
      </div>
    </div>
  );
}

/* ── StudentFeeRow ───────────────────────────────────── */
function StudentFeeRow({ row }) {
  const [open, setOpen] = useState(false);
  const st   = getStatus(row.payment_status);
  const pct  = row.total_amount > 0 ? Math.round((row.paid_amount / row.total_amount) * 100) : 0;

  return (
    <div className="border border-black/[0.06] rounded-2xl overflow-hidden bg-white hover:border-[#fc362d]/20 transition-colors">
      {/* Summary row */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-[#fafafa] transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#fc362d]/10 flex items-center justify-center text-[#fc362d] text-[10px] font-extrabold shrink-0">
          {(row.student_name || "?").slice(0, 2).toUpperCase()}
        </div>
        {/* Name + course */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#0c0407] truncate">{row.student_name}</p>
          <p className="text-[10px] text-[#94a3b8] font-semibold truncate">
            {row.student_code} · {row.course_title}
          </p>
        </div>
        {/* Progress bar */}
        <div className="hidden sm:flex flex-col items-end gap-1 w-28 shrink-0">
          <div className="w-full h-1.5 rounded-full bg-[#f1f5f9] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? "#059669" : pct > 0 ? "#d97706" : "#b91c1c",
              }}
            />
          </div>
          <span className="text-[9px] font-bold text-[#94a3b8]">{pct}% paid</span>
        </div>
        {/* Amounts */}
        <div className="text-right shrink-0">
          <p className="text-sm font-extrabold text-[#0c0407]">{inr(row.total_amount)}</p>
          {row.due_amount > 0 && (
            <p className="text-[10px] font-bold text-[#b91c1c]">{inr(row.due_amount)} due</p>
          )}
        </div>
        {/* Status badge */}
        <StatusBadge variant={st.variant}>{st.label}</StatusBadge>
        {/* Chevron */}
        {open ? <FiChevronUp className="w-4 h-4 text-[#94a3b8] shrink-0" />
               : <FiChevronDown className="w-4 h-4 text-[#94a3b8] shrink-0" />}
      </button>

      {/* Detail drawer */}
      {open && (
        <div className="border-t border-black/[0.06] px-4 py-4 bg-[#fafafa] space-y-3">
          {/* Fee summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Fee",    value: inr(row.total_amount) },
              { label: "Paid",         value: inr(row.paid_amount),  color: "text-emerald-600" },
              { label: "Due",          value: inr(row.due_amount),   color: row.due_amount > 0 ? "text-[#b91c1c]" : "text-emerald-600" },
              { label: "Discount",     value: inr(row.discount) },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-black/[0.06] p-3">
                <p className={labelMutedClass}>{s.label}</p>
                <p className={`text-sm font-extrabold mt-1 ${s.color || "text-[#0c0407]"}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Scheme + batch */}
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-[#475569]">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-black/[0.07]">
              Scheme: {row.scheme}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-black/[0.07]">
              Batch: {row.batch_name}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-black/[0.07]">
              Email: {row.student_email}
            </span>
          </div>

          {/* Installments */}
          {row.installments.length > 0 && (
            <div className="space-y-1.5">
              <p className={labelMutedClass}>Installment Schedule</p>
              {row.installments.map(i => (
                <InstallmentRow key={i.id} inst={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main BillingLedger ──────────────────────────────── */
export const BillingLedger = () => {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast]       = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 4000); };

  const fetchBilling = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await axios.get("/api/admin/billing");
      setData(res);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load billing data");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBilling(); }, [fetchBilling]);

  const stats   = data?.stats          || {};
  const payments = data?.recent_payments || [];
  const allFees  = data?.student_fees   || [];

  /* Filter fee rows */
  const filtered = allFees.filter(row => {
    const matchSearch = !search.trim() ||
      row.student_name.toLowerCase().includes(search.toLowerCase()) ||
      row.student_code.toLowerCase().includes(search.toLowerCase()) ||
      row.course_title.toLowerCase().includes(search.toLowerCase()) ||
      row.batch_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" ||
      (row.payment_status || "").toUpperCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  const STATUS_FILTERS = [
    { key: "ALL",                  label: "All" },
    { key: "COMPLETED",            label: "Paid" },
    { key: "ACTIVE",               label: "Active" },
    { key: "PENDING_FIRST_PAYMENT",label: "Unpaid" },
    { key: "OVERDUE",              label: "Overdue" },
  ];

  return (
    <div className={pageWrapClass}>
      <Toast message={toast} />

      <WelcomeBanner
        badge="Billing Ledger"
        title="Payments & Revenue"
        description="Live view of all student fee collections, installment schedules, and payment history."
        actions={
          <button onClick={fetchBilling}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-black/10 bg-white text-[#475569] text-xs font-bold hover:bg-[#f8fafc] cursor-pointer transition-colors">
            <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        }
      />

      {/* Stats */}
      <StatCards stats={[
        {
          label: "Total Collected",
          value: loading ? "…" : inrL(stats.total_revenue),
          change: "Across all students",
          icon: <FiDollarSign className="w-5 h-5" />,
          trendType: "up",
        },
        {
          label: "Pending Dues",
          value: loading ? "…" : inrL(stats.total_pending),
          change: `${stats.students_pending || 0} students`,
          icon: <FiClock className="w-5 h-5" />,
          trendType: "down",
        },
        {
          label: "Overdue",
          value: loading ? "…" : inrL(stats.total_overdue),
          change: `${stats.students_overdue || 0} students`,
          icon: <FiAlertCircle className="w-5 h-5" />,
          trendType: "down",
        },
        {
          label: "Total Students",
          value: loading ? "…" : String(stats.total_students || 0),
          change: "With fee records",
          icon: <FiUsers className="w-5 h-5" />,
        },
      ]} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Left: Fee ledger table ── */}
        <div className="xl:col-span-2 space-y-4">
          <Panel>
            <PanelHeader eyebrow="Student Fees" title="Fee Ledger" />

            {/* Search + filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="search" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, ID, course…"
                  className={`${inputClass} pl-9`}
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#0c0407] cursor-pointer">
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {STATUS_FILTERS.map(f => (
                  <button key={f.key} onClick={() => setStatusFilter(f.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      statusFilter === f.key
                        ? "bg-[#fc362d] text-white border-[#fc362d]"
                        : "bg-white text-[#475569] border-black/[0.08] hover:border-[#fc362d]/30"
                    }`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-[#94a3b8] text-center py-12">Loading billing data…</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 bg-[#fafafa] rounded-2xl border border-dashed border-black/[0.07]">
                <FiDollarSign className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
                <p className="text-sm font-semibold text-[#94a3b8]">
                  {search || statusFilter !== "ALL" ? "No matching fee records." : "No fee records found."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-[#94a3b8] font-semibold mb-3">
                  Showing {filtered.length} of {allFees.length} students
                  {statusFilter !== "ALL" && ` · filtered by "${STATUS_FILTERS.find(f=>f.key===statusFilter)?.label}"`}
                </p>
                {filtered.map(row => (
                  <StudentFeeRow key={row.fee_id || row.student_id} row={row} />
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* ── Right: Recent payments ── */}
        <div className="space-y-5">
          <Panel>
            <PanelHeader eyebrow="Transactions" title="Recent Payments" />
            {loading ? (
              <p className="text-sm text-[#94a3b8] text-center py-8">Loading…</p>
            ) : payments.length === 0 ? (
              <p className="text-xs text-[#94a3b8] text-center py-8 bg-[#fafafa] rounded-xl border border-dashed border-black/[0.07]">
                No payment transactions yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {payments.map(p => <PaymentRow key={p.id} p={p} />)}
              </div>
            )}
          </Panel>

          {/* Overdue alert card */}
          {!loading && stats.students_overdue > 0 && (
            <div className={`${cardClass} p-5 border-[#b91c1c]/20 bg-[#fef2f2]`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#b91c1c]/10 flex items-center justify-center shrink-0">
                  <FiAlertCircle className="w-5 h-5 text-[#b91c1c]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#b91c1c]">
                    {stats.students_overdue} student{stats.students_overdue !== 1 ? "s" : ""} overdue
                  </h3>
                  <p className="text-xs text-[#b91c1c]/80 font-medium mt-1">
                    Total overdue: <strong>{inr(stats.total_overdue)}</strong>
                  </p>
                  <button
                    onClick={() => setStatusFilter("OVERDUE")}
                    className="mt-3 text-[10px] font-bold text-[#b91c1c] hover:underline cursor-pointer">
                    View overdue students →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingLedger;
