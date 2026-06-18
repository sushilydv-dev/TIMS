import React, { useCallback, useEffect, useState } from "react";
import { FiUsers, FiSearch, FiEdit, FiX, FiShield, FiUser } from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner,
  StatCards,
  Panel,
  PanelHeader,
  StatusBadge,
  Toast,
  PrimaryButton,
} from "../DashboardUI";
import { pageWrapClass, inputClass, secondaryBtnClass, primaryBtnClass } from "../dashboardTheme";
import { UserListPagination } from "./UserListPagination";
import { InviteUserModal } from "./InviteUserModal";
import hrPlaceholder from "../../../assets/hr_placeholder.png";


const PAGE_SIZE = 10;

export const HrControl = () => {
  const [hrList, setHrList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  
  // Stats
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    inactiveCount: 0,
  });

  // Selected HR for profile panel
  const [selectedHr, setSelectedHr] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  
  // Panel form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    status: "",
    profile_img: "",
  });

  const [panelEditMode, setPanelEditMode] = useState(false);

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

  const showToastMsg = (msg) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 4000);
  };

  const handleInviteSuccess = () => {
    showToastMsg("Invitation sent successfully");
    setPage(1);
    fetchHr(1);
  };

  const fetchHr = useCallback(async (targetPage = page) => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/hr/browse", {
        params: {
          limit: PAGE_SIZE,
          page: targetPage,
          offset: (targetPage - 1) * PAGE_SIZE,
          search: debouncedSearch || undefined,
        },
      });
      setHrList(data?.hrList || []);
      setTotal(data?.total || 0);

      // Compute stats
      const totalCount = data?.total || 0;
      let activeCount = 0;
      let inactiveCount = 0;
      if (Array.isArray(data?.hrList)) {
        data.hrList.forEach((h) => {
          if (h.User?.status === "active") activeCount++;
          else inactiveCount++;
        });
      }
      setStats({
        totalCount,
        activeCount,
        inactiveCount,
      });

    } catch (err) {
      setHrList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchHr(page);
  }, [page, debouncedSearch, fetchHr]);

  const openHrProfile = (hr) => {
    setSelectedHr(hr);
    setProfileForm({
      name: hr.User?.name || "",
      email: hr.User?.email || "",
      status: hr.User?.status || "inactive",
      profile_img: hr.profile_img || "",
    });
    setPanelEditMode(false);
    setPanelOpen(true);
  };

  const handleToggleStatus = async () => {
    const nextStatus = profileForm.status === "active" ? "suspended" : "active";
    setLoading(true);
    try {
      await axios.put(`/api/admin/hr/${selectedHr.id}`, {
        ...profileForm,
        status: nextStatus,
      });
      showToastMsg(
        nextStatus === "suspended"
          ? "Account deactivated successfully"
          : "Account activated successfully"
      );
      setProfileForm(prev => ({ ...prev, status: nextStatus }));
      fetchHr(page);
    } catch (err) {
      showToastMsg(err.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    if (e) e.preventDefault();

    setLoading(true);
    try {
      const { data } = await axios.put(`/api/admin/hr/${selectedHr.id}`, profileForm);
      showToastMsg("HR profile updated successfully!");
      setPanelEditMode(false);
      if (data?.hr) {
        setSelectedHr(data.hr);
        setProfileForm({
          name: data.hr.User?.name || "",
          email: data.hr.User?.email || "",
          status: data.hr.User?.status || "inactive",
          profile_img: data.hr.profile_img || "",
        });
      }
      fetchHr(page);
    } catch (err) {
      showToastMsg(err.response?.data?.message || "Failed to update HR details");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className={pageWrapClass}>
      <Toast message={toast} />

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={handleInviteSuccess}
        fixedRole="HR"
      />

      <WelcomeBanner
        badge="HR Control Center"
        title="HR & Admin Coordinators Management"
        description="Monitor recruitment coordinator staff registry, update credentials metadata, and toggle operational access permissions."
        actions={
          <PrimaryButton type="button" onClick={() => setInviteOpen(true)}>
            Invite HR
          </PrimaryButton>
        }
      />

      <StatCards
        stats={[
          {
            label: "Total HR Coordinators",
            value: String(total),
            change: "Staff directory count",
            icon: <FiUsers className="w-5 h-5" />,
          },
          {
            label: "Active Coordinators",
            value: String(stats.activeCount),
            change: `${stats.activeCount} online`,
            icon: <FiShield className="w-5 h-5" />,
            trendType: "up",
          },
          {
            label: "Suspended/Inactive",
            value: String(stats.inactiveCount),
            change: "Access restricted",
            icon: <FiUser className="w-5 h-5" />,
            trendType: "down",
          },
        ]}
      />

      <Panel>
        <PanelHeader
          eyebrow="Directory"
          title="HR Registry"
          action={
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="search"
                placeholder="Search by name or email..."
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
                <th className="pb-3 px-3">HR Coordinator</th>
                <th className="pb-3 px-2">Account Status</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[#94a3b8] font-semibold">
                    Loading HR registry list…
                  </td>
                </tr>
              ) : hrList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-[#94a3b8] font-semibold">
                    {debouncedSearch ? "No HR coordinators match your search." : "No HR coordinators found."}
                  </td>
                </tr>
              ) : (
                hrList.map((h) => (
                  <tr
                    key={h.id}
                    className="border-b border-black/[0.04] hover:bg-[#fafafa]"
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            h.profile_img ||
                            hrPlaceholder
                          }
                          alt=""
                          className="w-8 h-8 rounded-lg bg-slate-50 border border-black/5 object-cover"
                          onError={(e) => {
                            e.target.src = hrPlaceholder;
                          }}
                        />

                        <div>
                          <p className="font-bold text-[#0c0407]">{h.User?.name}</p>
                          <p className="text-[#94a3b8] font-semibold mt-0.5">{h.User?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <StatusBadge variant={h.User?.status === "active" ? "ok" : "danger"}>
                        {h.User?.status}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => openHrProfile(h)}
                        className="px-3 py-1.5 text-[10px] font-bold text-[#fc362d] border border-red-500/10 hover:border-red-500/20 rounded-lg hover:bg-rose-500/5 transition-all cursor-pointer"
                      >
                        Manage Profile
                      </button>
                    </td>
                  </tr>
                ))
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
          onPageChange={(next) => setPage(next)}
          loading={loading}
        />
      </Panel>

      {/* Slideout Panel: HR Detail/Edit */}
      {panelOpen && selectedHr && (
        <div className="fixed inset-0 z-[120] flex justify-end" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-[#0c0407]/40 backdrop-blur-sm cursor-default"
            aria-label="Close"
            onClick={() => setPanelOpen(false)}
          />

          <div
            className="relative w-full max-w-md h-full bg-white border-l border-black/[0.08] shadow-[-12px_0_40px_rgba(0,0,0,0.08)] flex flex-col animate-[slideInRight_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 sm:p-6 border-b border-black/[0.06] shrink-0">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
                  HR Coordinator Profile
                </span>
                <h2 className="text-xl font-bold text-[#0c0407] mt-1 tracking-tight truncate">
                  {profileForm.name || "HR Details"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPanelOpen(false)}
                className="w-9 h-9 rounded-xl border border-black/10 bg-[#fafafa] text-[#475569] flex items-center justify-center hover:bg-[#f1f5f9] cursor-pointer shrink-0"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Profile Card Header */}
              {/* Header card with profile image & background */}
              <div className="relative rounded-2xl overflow-hidden border border-black/[0.04] bg-[#fafafa]">
                {/* Decorative Brand Gradient Background Banner */}
                <div className="h-24 bg-gradient-to-r from-rose-500 to-[#fc362d] w-full" />
                
                {/* Circular Profile Image */}
                <div className="flex flex-col items-center pb-5 mt-[-48px]">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-white">
                    <img
                      src={
                        profileForm.profile_img ||
                        hrPlaceholder
                      }
                      alt="HR Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = hrPlaceholder;
                      }}
                    />
                  </div>
                  
                  {/* Basic Metadata */}
                  <div className="text-center mt-3 space-y-1">
                    <h3 className="text-base font-bold text-[#0c0407]">
                      {profileForm.name}
                    </h3>
                    <p className="text-xs text-[#64748b] font-bold">
                      HR Coordinator Staff
                    </p>
                    <div className="flex justify-center pt-1">
                      <span className={`text-[8px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                        profileForm.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-600 border border-red-500/20"
                      }`}>
                        {profileForm.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exact Two Actions: Toggle Status / Edit details */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                    profileForm.status === "active"
                      ? "bg-red-500/5 border-red-500/10 text-red-600 hover:bg-red-500/10"
                      : "bg-emerald-500/5 border-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10"
                  }`}
                >
                  {profileForm.status === "active" ? "Deactivate Account" : "Activate Account"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    if (panelEditMode) {
                      handleUpdateProfile(e);
                    } else {
                      setPanelEditMode(true);
                    }
                  }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl text-white ${primaryBtnClass}`}
                >
                  {panelEditMode ? "Save Details" : "Edit Profile"}
                </button>
              </div>

              {panelEditMode && (
                <div className="flex justify-end -mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPanelEditMode(false);
                      setProfileForm({
                        name: selectedHr.User?.name || "",
                        email: selectedHr.User?.email || "",
                        status: selectedHr.User?.status || "inactive",
                        profile_img: selectedHr.profile_img || "",
                      });
                    }}
                    className="text-[10px] font-bold text-[#fc362d] hover:underline"
                  >
                    Cancel Editing
                  </button>
                </div>
              )}


              {/* Detail fields */}
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      disabled={!panelEditMode}
                      className={`${inputClass} disabled:bg-[#fafafa] disabled:text-[#64748b] disabled:cursor-not-allowed`}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      disabled={!panelEditMode}
                      className={`${inputClass} disabled:bg-[#fafafa] disabled:text-[#64748b] disabled:cursor-not-allowed`}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Profile Image URL</label>
                    <input
                      type="text"
                      value={profileForm.profile_img}
                      onChange={(e) => setProfileForm({ ...profileForm, profile_img: e.target.value })}
                      disabled={!panelEditMode}
                      placeholder="https://example.com/avatar.jpg"
                      className={`${inputClass} disabled:bg-[#fafafa] disabled:text-[#64748b] disabled:cursor-not-allowed`}
                    />
                  </div>
                </div>


              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrControl;
