import { useEffect, useState } from "react";
import {
  FiChevronLeft, FiChevronRight, FiUsers, FiCheck,
  FiArrowLeft, FiCalendar, FiLayers,
} from "react-icons/fi";
import axios from "axios";
import { Panel, WelcomeBanner } from "../DashboardUI";
import { BasicProfile, useBasicProfile } from "../BasicProfile";
import { ProfileAvatar } from "../ProfileAvatar";
import {
  pageWrapClass, cardClass, cardLightClass, labelMutedClass,
  primaryBtnClass, secondaryBtnClass, inputClass,
} from "../dashboardTheme";

/* ── tiny helpers ────────────────────────────────────── */
const pad = (n) => String(n).padStart(2, "0");
const ymd = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const todayStr = () => {
  const n = new Date();
  return ymd(n.getFullYear(), n.getMonth(), n.getDate());
};
const fmtDate = (d) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "—";
const fmtShort = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const STATUS_CFG = {
  PRESENT: { label: "Present", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  ABSENT:  { label: "Absent",  color: "bg-red-100 text-red-600 border-red-200" },
  LATE:    { label: "Late",    color: "bg-amber-100 text-amber-700 border-amber-200" },
};

/* ════════════════════════════════════════════════════════
   STEP 3 — Attendance sheet for one batch + one date
   ════════════════════════════════════════════════════════ */
function AttendanceSheet({ batch, date, onBack, onSaved, onOpenStudentProfile }) {
  const [students, setStudents] = useState([]);
  const [entries, setEntries]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  /* load enrolled students + any existing records for this date */
  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/trainer/batches/${batch.id}/attendance`, { params: { date } })
      .then(({ data }) => {
        setStudents(data.students || []);
        const map = {};
        (data.records || []).forEach((r) => { map[r.student_id] = r.status; });
        setEntries(map);
      })
      .catch(() => { setStudents([]); setEntries({}); })
      .finally(() => setLoading(false));
  }, [batch.id, date]);

  const markAll = (status) => {
    const next = {};
    students.forEach((s) => { next[s.student_id] = status; });
    setEntries(next);
  };

  const toggle = (studentId, status) =>
    setEntries((p) => ({
      ...p,
      [studentId]: p[studentId] === status ? undefined : status,
    }));

  const handleSave = async () => {
    const payload = students
      .filter((s) => entries[s.student_id])
      .map((s) => ({ student_id: s.student_id, status: entries[s.student_id] }));
    if (!payload.length) { showToast("Mark at least one student"); return; }
    setSaving(true);
    try {
      await axios.post(`/api/trainer/batches/${batch.id}/attendance`, {
        date,
        entries: payload,
      });
      showToast(`Attendance saved for ${date}`);
      onSaved(date);
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const markedCount  = students.filter((s) => entries[s.student_id]).length;
  const presentCount = students.filter((s) => entries[s.student_id] === "PRESENT").length;
  const absentCount  = students.filter((s) => entries[s.student_id] === "ABSENT").length;
  const lateCount    = students.filter((s) => entries[s.student_id] === "LATE").length;

  return (
    <div className="space-y-5">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center text-[#475569] hover:text-[#fc362d] cursor-pointer transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className={`${labelMutedClass} mb-0.5`}>{batch.batch_name}</p>
          <h2 className="text-lg font-extrabold text-[#0c0407]">
            Attendance — {fmtDate(date)}
          </h2>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Total",    count: students.length,             color: "bg-[#f1f5f9] text-[#475569]" },
          { label: "Present",  count: presentCount,                color: "bg-emerald-100 text-emerald-700" },
          { label: "Absent",   count: absentCount,                 color: "bg-red-100 text-red-600" },
          { label: "Late",     count: lateCount,                   color: "bg-amber-100 text-amber-700" },
          { label: "Unmarked", count: students.length - markedCount, color: "bg-[#fafafa] text-[#94a3b8] border border-black/[0.07]" },
        ].map((s) => (
          <span key={s.label} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${s.color}`}>
            {s.label}: {s.count}
          </span>
        ))}
      </div>

      {/* Bulk mark */}
      <div className={`${cardClass} p-4 flex flex-wrap items-center gap-3`}>
        <span className={`${labelMutedClass} shrink-0`}>Bulk mark all:</span>
        {Object.entries(STATUS_CFG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => markAll(key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all hover:opacity-90 ${cfg.color}`}
          >
            All {cfg.label}
          </button>
        ))}
        <button
          onClick={() => setEntries({})}
          className="ml-auto px-4 py-2 rounded-xl text-xs font-bold border border-black/[0.07] bg-[#fafafa] text-[#94a3b8] hover:text-[#0c0407] cursor-pointer"
        >
          Clear all
        </button>
      </div>

      {/* Student table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-8 h-8 border-3 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
          <p className="text-sm text-[#94a3b8]">Loading students…</p>
        </div>
      ) : students.length === 0 ? (
        <Panel>
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <FiUsers className="w-10 h-10 text-[#94a3b8]" />
            <p className="text-xs text-[#94a3b8] font-semibold">No students enrolled in this batch</p>
          </div>
        </Panel>
      ) : (
        <div className={`${cardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.07] bg-[#fafafa]">
                  <th className="py-3 px-4 text-left text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">#</th>
                  <th className="py-3 px-4 text-left text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Student</th>
                  <th className="py-3 px-4 text-center text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider" colSpan={3}>
                    Mark Attendance
                  </th>
                  <th className="py-3 px-4 text-center text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {students.map((s, i) => {
                  const current = entries[s.student_id];
                  return (
                    <tr key={s.student_id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="py-3.5 px-4 text-[#94a3b8] font-bold text-xs">{i + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <ProfileAvatar
                            src={s.profile_img}
                            name={s.name}
                            profileType="student"
                            onClick={() => onOpenStudentProfile?.(s.student_id)}
                          />
                          <span className="font-bold text-[#0c0407]">{s.name}</span>
                        </div>
                      </td>
                      {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                        <td key={key} className="py-3.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => toggle(s.student_id, key)}
                            className={`w-full min-w-[76px] py-2 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all duration-150 ${
                              current === key
                                ? cfg.color + " shadow-sm scale-[1.03]"
                                : "bg-[#fafafa] text-[#94a3b8] border-black/[0.07] hover:scale-[1.02]"
                            }`}
                          >
                            {current === key && <FiCheck className="inline w-3 h-3 mr-1" />}
                            {cfg.label}
                          </button>
                        </td>
                      ))}
                      <td className="py-3.5 px-4 text-center">
                        {current ? (
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${STATUS_CFG[current]?.color || ""}`}>
                            {current}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#fafafa] text-[#94a3b8] border border-black/[0.06]">
                            Unmarked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sticky save bar */}
      <div className="sticky bottom-4 flex items-center justify-between gap-4 bg-white border border-black/[0.08] rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <p className="text-xs font-semibold text-[#636363]">
          {markedCount}/{students.length} marked
          {markedCount > 0 && (
            <span className="ml-2 text-[#94a3b8]">
              · {presentCount}P / {absentCount}A / {lateCount}L
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <button onClick={onBack} className={`${secondaryBtnClass} text-xs py-2`}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || markedCount === 0}
            className={`${primaryBtnClass} text-xs py-2 disabled:opacity-50`}
          >
            {saving ? "Saving…" : "Save Attendance"}
          </button>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0c0407] text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   STEP 2 — Calendar for a selected batch
   ════════════════════════════════════════════════════════ */
function BatchCalendar({ batch, onBack, onSelectDate }) {
  const now = new Date();
  const [year, setYear]               = useState(now.getFullYear());
  const [month, setMonth]             = useState(now.getMonth());
  const [markedDates, setMarkedDates] = useState(new Set());

  /* ── Load all dates that already have attendance for this batch ── */
  useEffect(() => {
    axios.get(`/api/trainer/batches/${batch.id}/attendance`)
      .then(({ data }) => {
        const dates = new Set(
          (data.records || []).map((r) => r.attendance_date)
        );
        setMarkedDates(dates);
      })
      .catch(() => {}); // silent — calendar still works without it
  }, [batch.id]);

  const handlePrev = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  };
  const handleNext = () => {
    const n = new Date();
    if (year > n.getFullYear() || (year === n.getFullYear() && month >= n.getMonth())) return;
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  };
  const isFutureMonth =
    year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth());

  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const cells     = Array(firstDay).fill(null).concat(
    Array.from({ length: daysCount }, (_, i) => i + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const todayS    = todayStr();
  const batchStart = batch.start_date || "1970-01-01";
  const batchEnd   = batch.end_date   || "2099-12-31";

  return (
    <div className="space-y-5">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center text-[#475569] hover:text-[#fc362d] cursor-pointer transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className={`${labelMutedClass} mb-0.5`}>Select a date</p>
          <h2 className="text-lg font-extrabold text-[#0c0407]">{batch.batch_name}</h2>
          {batch.course && (
            <p className="text-xs text-[#636363] font-medium">{batch.course.title}</p>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#636363]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#fc362d] inline-block" /> Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Attendance saved
        </span>
      </div>

      {/* Calendar */}
      <div className={`${cardClass} p-5 sm:p-6`}>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrev}
            className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center text-[#475569] hover:border-[#fc362d]/30 hover:text-[#fc362d] cursor-pointer transition-all"
          >
            <FiChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-base font-extrabold text-[#0c0407]">
            {MONTHS[month]} {year}
          </h3>
          <button
            onClick={handleNext}
            disabled={isFutureMonth}
            className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center text-[#475569] hover:border-[#fc362d]/30 hover:text-[#fc362d] cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateStr   = ymd(year, month, day);
            const isToday   = dateStr === todayS;
            const isEnabled = dateStr >= batchStart && dateStr <= todayS;
            const isMarked  = markedDates.has(dateStr);

            /* Priority: today > marked > normal enabled > disabled */
            let tileClass = "bg-white text-[#0c0407] border border-black/[0.07] hover:bg-[#fafafa] hover:border-[#fc362d]/25 cursor-pointer";
            if (!isEnabled) {
              tileClass = "bg-[#fafafa] text-[#c0bccf] border border-black/[0.05]";
            } else if (isToday && isMarked) {
              tileClass = "bg-[#fc362d] text-white border border-[#fc362d] hover:bg-[#e02d25] cursor-pointer";
            } else if (isToday) {
              tileClass = "bg-[#fc362d]/10 text-[#fc362d] border border-[#fc362d]/30 hover:bg-[#fc362d]/20 cursor-pointer font-extrabold";
            } else if (isMarked) {
              tileClass = "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 cursor-pointer";
            }

            return (
              <button
                key={i}
                type="button"
                disabled={!isEnabled}
                onClick={() => onSelectDate(dateStr, (d) => setMarkedDates((prev) => new Set([...prev, d])))}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-sm font-bold transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed ${tileClass}`}
              >
                <span>{day}</span>
                {isMarked && isEnabled && !isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute bottom-1" />
                )}
                {isMarked && isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-[#94a3b8] text-center mt-5 font-medium">
          Click any date from the batch start date up to today to mark attendance
        </p>
      </div>

      {/* Batch info strip */}
      <div className={`${cardClass} p-4 flex flex-wrap gap-4 text-xs font-semibold text-[#475569]`}>
        <span className="flex items-center gap-1.5">
          <FiCalendar className="w-3.5 h-3.5 text-[#fc362d]" />
          {fmtShort(batch.start_date)} → {fmtShort(batch.end_date)}
        </span>
        <span className="flex items-center gap-1.5">
          <FiUsers className="w-3.5 h-3.5 text-[#fc362d]" />
          {batch.student_count} students
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   STEP 1 — Batch selection list
   ════════════════════════════════════════════════════════ */
export function TrainerAttendance() {
  const [batches, setBatches]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedDate, setSelectedDate]   = useState(null);
  const [markSaved, setMarkSaved]     = useState(null); // callback from calendar cell
  const {
    basicProfileOpen,
    basicProfileType,
    basicProfileId,
    openBasicProfile,
    closeBasicProfile,
  } = useBasicProfile();

  const profilePanel = (
    <BasicProfile
      open={basicProfileOpen}
      profileType={basicProfileType}
      profileId={basicProfileId}
      onClose={closeBasicProfile}
    />
  );

  useEffect(() => {
    axios
      .get("/api/trainer/me")
      .then(({ data }) => setBatches(data?.batches || []))
      .catch(() => setBatches([]))
      .finally(() => setLoading(false));
  }, []);

  /* ── Step 3: Attendance sheet ── */
  if (selectedBatch && selectedDate) {
    return (
      <div className={pageWrapClass}>
        {profilePanel}
        <AttendanceSheet
          batch={selectedBatch}
          date={selectedDate}
          onBack={() => setSelectedDate(null)}
          onSaved={(date) => {
            if (markSaved) markSaved(date);
            setSelectedDate(null);
          }}
          onOpenStudentProfile={(studentId) => openBasicProfile("student", studentId)}
        />
      </div>
    );
  }

  /* ── Step 2: Calendar for selected batch ── */
  if (selectedBatch) {
    return (
      <div className={pageWrapClass}>
        {profilePanel}
        <BatchCalendar
          batch={selectedBatch}
          onBack={() => setSelectedBatch(null)}
          onSelectDate={(date, savedCb) => {
            setMarkSaved(() => savedCb);
            setSelectedDate(date);
          }}
        />
      </div>
    );
  }

  /* ── Step 1: Batch list ── */
  const fmtRange = (s, e) =>
    s && e
      ? `${new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })} → ${new Date(e + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
      : "—";

  return (
    <div className={pageWrapClass}>
      {profilePanel}
      <WelcomeBanner
        badge="Attendance Register"
        title="Mark Attendance"
        description="Select a batch to open its calendar, then pick a date to mark student attendance."
      />

      {loading ? (
        <Panel>
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-12 h-12 border-4 border-[#fc362d]/20 border-t-[#fc362d] rounded-full animate-spin" />
            <p className="text-sm font-semibold text-[#94a3b8]">Loading your batches…</p>
          </div>
        </Panel>
      ) : batches.length === 0 ? (
        <Panel className={cardLightClass}>
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <FiCalendar className="w-12 h-12 text-[#fc362d]/40" />
            <p className="text-sm font-semibold text-[#475569]">No batches assigned yet</p>
            <p className="text-xs text-[#94a3b8]">Contact your administrator to get assigned to a cohort.</p>
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {batches.map((b) => {
            const now    = todayStr();
            const active = now >= (b.start_date || "") && now <= (b.end_date || "");

            return (
              <button
                key={b.id}
                onClick={() => setSelectedBatch(b)}
                className={`${cardClass} p-6 text-left cursor-pointer hover:border-[#fc362d]/25 hover:shadow-[0_8px_32px_rgba(252,54,45,0.09)] transition-all duration-300 group w-full`}
              >
                {/* Icon + badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#fc362d]/10 flex items-center justify-center shrink-0">
                    <FiCalendar className="w-5 h-5 text-[#fc362d]" />
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${
                    active
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-[#f1f5f9] text-[#94a3b8] border-black/[0.07]"
                  }`}>
                    {active ? "Active now" : "Inactive"}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-base font-extrabold text-[#0c0407] group-hover:text-[#fc362d] transition-colors leading-snug mb-1">
                  {b.batch_name}
                </h3>
                {b.course && (
                  <p className="text-xs text-[#636363] font-medium mb-3 truncate">{b.course.title}</p>
                )}

                <div className="flex items-center gap-3 text-[10px] font-semibold text-[#94a3b8] mb-1">
                  <span className="flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {fmtRange(b.start_date, b.end_date)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-[#94a3b8]">
                  <FiUsers className="w-3 h-3" />
                  {b.student_count} students enrolled
                </div>

                <div className="mt-4 pt-4 border-t border-black/[0.05]">
                  <span className="text-[10px] font-bold text-[#fc362d] uppercase tracking-wider group-hover:underline">
                    Open calendar →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default TrainerAttendance;
