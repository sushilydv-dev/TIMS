import React, { useState, useEffect, useCallback } from "react";
import { FiUsers, FiSearch, FiDollarSign, FiPercent, FiPlus, FiGrid, FiUser } from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner,
  StatCards,
  Panel,
  PanelHeader,
  PrimaryButton,
  StatusBadge,
  Toast,
} from "../DashboardUI";
import { pageWrapClass, inputClass } from "../dashboardTheme";
import { UserListPagination } from "./UserListPagination";
import { EnrollStudentForm } from "./EnrollStudentForm";
import { StudentFinancialProfile } from "./StudentFinancialProfile";

const PAGE_SIZE = 10;

function financialHealthBadge(status) {
  const key = String(status || "").toUpperCase();
  if (key === "COMPLETED" || key === "PAID") return { label: "Completed", variant: "ok" };
  if (key === "ACTIVE") return { label: "Active", variant: "info" };
  if (key === "OVERDUE") return { label: "Overdue", variant: "danger" };
  return { label: "Pending First Payment", variant: "warn" };
}

export const StudentControl = () => {
  const [view, setView] = useState("list"); // "list" or "enroll"
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Quick Stats
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingPaymentCount: 0,
    activeCount: 0,
    overdueCount: 0,
  });

  // Debounce search input
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchStudents = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/students/browse", {
        params: {
          limit: PAGE_SIZE,
          offset: (targetPage - 1) * PAGE_SIZE,
          search: debouncedSearch || undefined,
        },
      });
      setStudents(data?.students || []);
      setTotal(data?.total || 0);

      // Compute statistics based on currently fetched / total info or set defaults
      // For visual richness, let's fetch all student profiles (or aggregate from DB)
      // Since browseStudents provides a summary of fees, we can count:
      const totalCount = data?.total || 0;
      let pendingCount = 0;
      let activeCnt = 0;
      let overdueCnt = 0;

      // Count local stats on page
      if (Array.isArray(data?.students)) {
        data.students.forEach((s) => {
          const status = String(s.fees?.payment_status || "PENDING").toUpperCase();
          if (status === "PENDING_FIRST_PAYMENT" || status === "PENDING" || status === "NONE") {
            pendingCount++;
          } else if (status === "ACTIVE" || status === "PAID" || status === "PARTIAL") {
            activeCnt++;
          } else if (status === "OVERDUE") {
            overdueCnt++;
          }
        });
      }
      setStats({
        totalCount,
        pendingPaymentCount: pendingCount,
        activeCount: activeCnt,
        overdueCount: overdueCnt,
      });

    } catch (err) {
      setStudents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    if (view === "list") {
      fetchStudents(page);
    }
  }, [page, debouncedSearch, view, fetchStudents]);

  const handlePageChange = (nextPage) => {
    setPage(nextPage);
  };

  const handleEnrollSuccess = () => {
    setView("list");
    setPage(1);
    fetchStudents(1);
  };

  const openStudentProfile = (id) => {
    setSelectedStudentId(id);
    setProfileOpen(true);
  };

  if (view === "enroll") {
    return (
      <div className={pageWrapClass}>
        <EnrollStudentForm
          onBack={() => setView("list")}
          onSuccess={handleEnrollSuccess}
        />
      </div>
    );
  }

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className={pageWrapClass}>
      <WelcomeBanner
        badge="Student Control Center"
        title="Student Enrollment & Financials"
        description="Register student records, configure structural installment payment blueprints, audit ledger balances, and log offline cash/cheque checkouts."
        actions={
          <PrimaryButton onClick={() => setView("enroll")} className="flex items-center gap-1.5">
            <FiPlus /> Enroll New Student
          </PrimaryButton>
        }
      />

      <StatCards
        stats={[
          {
            label: "Enrolled Students",
            value: String(total),
            change: "Total registered",
            icon: <FiUsers className="w-5 h-5" />,
          },
          {
            label: "Active Accounts",
            value: String(stats.activeCount),
            change: "Access enabled",
            icon: <FiGrid className="w-5 h-5" />,
            trendType: "up",
          },
          {
            label: "Pending Initial Pay",
            value: String(stats.pendingPaymentCount),
            change: "Access restricted",
            icon: <FiDollarSign className="w-5 h-5" />,
            trendType: "down",
          },
          {
            label: "Overdue Accounts",
            value: String(stats.overdueCount),
            change: "Requires attention",
            icon: <FiPercent className="w-5 h-5" />,
            trendType: "down",
          },
        ]}
      />

      <Panel>
        <PanelHeader
          eyebrow="Student Directory"
          title="Manage Student Accounts"
          action={
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="search"
                placeholder="Search by code, name, or email..."
                className={`${inputClass} pl-9`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          }
        />

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.08] text-[#94a3b8] uppercase tracking-wider font-bold">
                <th className="pb-3 px-3">Student</th>
                <th className="pb-3 px-2">Course</th>
                <th className="pb-3 px-2">Batch</th>
                <th className="pb-3 px-2">Payment Status</th>
                <th className="pb-3 px-2 text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#94a3b8] font-semibold">
                    Loading student records…
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#94a3b8] font-semibold">
                    {debouncedSearch ? "No students match your query." : "No student records found."}
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const feeInfo = student.fees || {};
                  const statusInfo = financialHealthBadge(feeInfo.payment_status);
                  return (
                    <tr
                      key={student.id}
                      className="border-b border-black/[0.04] hover:bg-[#fafafa]"
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                            {student.name ? student.name.charAt(0).toUpperCase() : <FiUser />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-[#0c0407]">{student.name}</p>
                              {student.status && (
                                <span className={`text-[8px] px-1 py-0.2 rounded font-extrabold uppercase tracking-wider ${
                                  student.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : student.status === "suspended"
                                    ? "bg-red-500/10 text-red-600"
                                    : "bg-amber-500/10 text-amber-600"
                                }`}>
                                  {student.status}
                                </span>
                              )}
                            </div>
                            <p className="text-[#94a3b8] font-semibold mt-0.5">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-[#475569]">
                        {student.course_title || "Unassigned"}
                      </td>
                      <td className="py-3.5 px-2 font-bold text-[#0c0407]">
                        {student.batch_name || "Unassigned"}
                      </td>
                      <td className="py-3.5 px-2">
                        <StatusBadge variant={statusInfo.variant}>{statusInfo.label}</StatusBadge>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        <button
                          type="button"
                          onClick={() => openStudentProfile(student.id)}
                          className="px-3 py-1.5 text-[10px] font-bold text-[#fc362d] border border-red-500/10 hover:border-red-500/20 rounded-lg hover:bg-rose-500/5 transition-all cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <UserListPagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={PAGE_SIZE}
          offset={(page - 1) * PAGE_SIZE}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </Panel>

      <StudentFinancialProfile
        open={profileOpen}
        studentId={selectedStudentId}
        onClose={() => {
          setProfileOpen(false);
          setSelectedStudentId(null);
        }}
        onUpdate={() => fetchStudents(page)}
      />
    </div>
  );
};

export default StudentControl;
