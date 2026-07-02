import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiUsers, FiSearch, FiX, FiShield, FiCalendar, FiImage, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  WelcomeBanner,
  StatCards,
  Panel,
  PanelHeader,
  StatusBadge,
  Toast,
  PrimaryButton,
} from "../DashboardUI";
import { pageWrapClass, inputClass, primaryBtnClass } from "../dashboardTheme";
import { UserListPagination } from "./UserListPagination";
import { InviteUserModal } from "./InviteUserModal";
import trainerPlaceholder from "../../../assets/trainer_placeholder.png";
import { BasicProfile, useBasicProfile } from "../BasicProfile";
import { ProfileAvatar } from "../ProfileAvatar";


const PAGE_SIZE = 10;

function formatInr(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

export const TrainerControl = () => {
  const [trainers, setTrainers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const imgInputRef = useRef(null);
  const {
    basicProfileOpen,
    basicProfileType,
    basicProfileId,
    openBasicProfile,
    closeBasicProfile,
  } = useBasicProfile();

  // Stats
  const [stats, setStats] = useState({
    totalCount: 0,
    activeCount: 0,
    avgExp: 0,
  });

  // Selected trainer for profile panel
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [batches, setBatches] = useState([]);

  // Panel form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    status: "",
    specialization: "",
    experience_year: 0,
    salary: 0,
    profile_img: "",
    batch_ids: [],
  });

  // Image upload state (separate from form — base64 data URL)
  const [imgPreview, setImgPreview] = useState(null); // shown in UI
  const [imgData, setImgData]       = useState(null); // sent to API (null = unchanged)

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
    // Always re-fetch page 1 regardless of current page state
    fetchTrainers(1);
  };

  const fetchTrainers = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/trainers/browse", {
        params: {
          limit: PAGE_SIZE,
          page: targetPage,
          offset: (targetPage - 1) * PAGE_SIZE,
          search: debouncedSearch || undefined,
        },
      });
      setTrainers(data?.trainers || []);
      setTotal(data?.total || 0);

      // Use server-computed stats when available, fall back to page-slice
      if (data?.stats) {
        setStats({
          totalCount: data.stats.totalCount,
          activeCount: data.stats.activeCount,
          avgExp: data.stats.avgExp,
        });
      } else {
        const totalCount = data?.total || 0;
        let activeCount = 0;
        let sumExp = 0;
        if (Array.isArray(data?.trainers)) {
          data.trainers.forEach((t) => {
            if (t.User?.status === "active") activeCount++;
            sumExp += Number(t.experience_year || 0);
          });
        }
        setStats({ totalCount, activeCount, avgExp: totalCount > 0 ? Math.round(sumExp / totalCount) : 0 });
      }
    } catch (err) {
      setTrainers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  const fetchAllBatches = async () => {
    try {
      const { data } = await axios.get("/api/admin/batches");
      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load batches:", err);
    }
  };

  useEffect(() => {
    fetchTrainers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchAllBatches();
  }, []);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const trainerId = params.get("trainerId");
    if (trainerId) {
      const match = trainers.find(t => t.id === trainerId);
      if (match) {
        openTrainerProfile(match);
      } else {
        const fetchTrainerById = async () => {
          try {
            const { data } = await axios.get("/api/admin/trainers/browse", {
              params: { limit: 100 }
            });
            const fullMatch = data?.trainers?.find(t => t.id === trainerId);
            if (fullMatch) {
              openTrainerProfile(fullMatch);
            }
          } catch (err) {
            console.error("Failed to find trainer by ID in deep link:", err);
          }
        };
        fetchTrainerById();
      }
    }
  }, [location.search, trainers]);

  const openTrainerProfile = (trainer) => {
    setSelectedTrainer(trainer);
    setProfileForm({
      name: trainer.User?.name || "",
      email: trainer.User?.email || "",
      status: trainer.User?.status || "inactive",
      specialization: trainer.specialization || "",
      experience_year: trainer.experience_year || 0,
      salary: trainer.salary || 0,
      profile_img: trainer.profile_img || "",
      batch_ids: Array.isArray(trainer.Batches) ? trainer.Batches.map(b => b.id) : [],
    });
    const imgUrl = trainer.profile_img || null;
    setImgPreview(imgUrl?.startsWith("data:") ? imgUrl : (imgUrl ? `http://localhost:3000${imgUrl}` : null));
    setImgData(null);
    setPanelEditMode(false);
    setPanelOpen(true);
  };

  // Canvas-based image compressor — resizes to max 512px, JPEG 85%
  const handleImgFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToastMsg("Image must be under 10 MB");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX = 512;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width >= height) { height = Math.round((height / width) * MAX); width = MAX; }
        else { width = Math.round((width / height) * MAX); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setImgPreview(dataUrl);
      setImgData(dataUrl);
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); showToastMsg("Could not read image"); };
    img.src = objectUrl;
    e.target.value = "";
  };

  const handleRemoveImg = () => {
    setImgPreview(null);
    setImgData(""); // empty string = explicitly cleared
  };

  const handleToggleStatus = async () => {
    const nextStatus = profileForm.status === "active" ? "suspended" : "active";
    setLoading(true);
    try {
      await axios.put(`/api/admin/trainers/${selectedTrainer.id}`, {
        status: nextStatus,
      });
      showToastMsg(
        nextStatus === "suspended"
          ? "Account deactivated successfully"
          : "Account activated successfully"
      );
      setProfileForm(prev => ({ ...prev, status: nextStatus }));
      fetchTrainers(page);
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
      const payload = {
        ...profileForm,
        experience_year: Number(profileForm.experience_year),
        salary: Number(profileForm.salary),
      };
      // Only send profile_img if it changed
      if (imgData !== null) payload.profile_img = imgData;

      const { data } = await axios.put(`/api/admin/trainers/${selectedTrainer.id}`, payload);
      showToastMsg("Trainer profile updated successfully!");
      setPanelEditMode(false);
      if (data?.trainer) {
        setSelectedTrainer(data.trainer);
        setProfileForm({
          name: data.trainer.User?.name || "",
          email: data.trainer.User?.email || "",
          status: data.trainer.User?.status || "inactive",
          specialization: data.trainer.specialization || "",
          experience_year: data.trainer.experience_year || 0,
          salary: data.trainer.salary || 0,
          profile_img: data.trainer.profile_img || "",
          batch_ids: Array.isArray(data.trainer.Batches) ? data.trainer.Batches.map(b => b.id) : [],
        });
        const imgUrl = data.trainer.profile_img || null;
        setImgPreview(imgUrl?.startsWith("data:") ? imgUrl : (imgUrl ? `http://localhost:3000${imgUrl}` : null));
        setImgData(null);
      }
      fetchTrainers(page);
    } catch (err) {
      showToastMsg(err.response?.data?.message || "Failed to update trainer details");
    } finally {
      setLoading(false);
    }
  };

  const handleBatchToggle = (batchId) => {
    setProfileForm(prev => {
      const ids = [...prev.batch_ids];
      if (ids.includes(batchId)) {
        return { ...prev, batch_ids: ids.filter(id => id !== batchId) };
      } else {
        return { ...prev, batch_ids: [...ids, batchId] };
      }
    });
  };

  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);

  return (
    <div className={pageWrapClass}>
      <Toast message={toast} />

      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={handleInviteSuccess}
        fixedRole="TRAINER"
      />

      <BasicProfile
        open={basicProfileOpen}
        profileType={basicProfileType}
        profileId={basicProfileId}
        onClose={closeBasicProfile}
      />

      <WelcomeBanner
        badge="Trainer Control Center"
        title="Faculty Management & Specializations"
        description="Monitor staff member payroll logs, define training competencies, assign groups, and regulate account activity."
        actions={
          <PrimaryButton type="button" onClick={() => setInviteOpen(true)}>
            Invite Trainer
          </PrimaryButton>
        }
      />

      <StatCards
        stats={[
          {
            label: "Total Trainers",
            value: String(total),
            change: "Registered staff",
            icon: <FiUsers className="w-5 h-5" />,
          },
          {
            label: "Active Accounts",
            value: String(stats.activeCount),
            change: `${stats.activeCount} online`,
            icon: <FiShield className="w-5 h-5" />,
            trendType: "up",
          },
          {
            label: "Avg Experience",
            value: `${stats.avgExp} Yrs`,
            change: "Faculty maturity",
            icon: <FiCalendar className="w-5 h-5" />,
          },
        ]}
      />

      <Panel>
        <PanelHeader
          eyebrow="Directory"
          title="Manage Trainers"
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
                <th className="pb-3 px-3">Trainer</th>
                <th className="pb-3 px-2">Specialization</th>
                <th className="pb-3 px-2">Experience</th>
                <th className="pb-3 px-2">Salary</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#94a3b8] font-semibold">
                    Loading trainers list…
                  </td>
                </tr>
              ) : trainers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#94a3b8] font-semibold">
                    {debouncedSearch ? "No trainers match your search." : "No trainers found."}
                  </td>
                </tr>
              ) : (
                trainers.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-black/[0.04] hover:bg-[#fafafa]"
                  >
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          src={t.profile_img || trainerPlaceholder}
                          name={t.User?.name}
                          profileType="trainer"
                          onClick={() => openBasicProfile("trainer", t.id)}
                        />

                        <div>
                          <p className="font-bold text-[#0c0407]">{t.User?.name}</p>
                          <p className="text-[#94a3b8] font-semibold mt-0.5">{t.User?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-2 font-semibold text-[#475569]">
                      {t.specialization || "General"}
                    </td>
                    <td className="py-3.5 px-2 font-bold text-[#0c0407]">
                      {t.experience_year} Years
                    </td>
                    <td className="py-3.5 px-2 font-extrabold text-[#059669]">
                      {formatInr(t.salary)}
                    </td>
                    <td className="py-3.5 px-2">
                      <StatusBadge variant={t.User?.status === "active" ? "ok" : "danger"}>
                        {t.User?.status}
                      </StatusBadge>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => openTrainerProfile(t)}
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

      {/* Slideout Panel: Trainer Detail/Edit */}
      {panelOpen && selectedTrainer && (
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
                  Trainer Admin Profile
                </span>
                <h2 className="text-xl font-bold text-[#0c0407] mt-1 tracking-tight truncate">
                  {profileForm.name || "Trainer details"}
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
                      src={imgPreview || trainerPlaceholder}
                      alt="Trainer Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = trainerPlaceholder; }}
                    />
                  </div>
                  
                  {/* Basic Metadata */}
                  <div className="text-center mt-3 space-y-1">
                    <h3 className="text-base font-bold text-[#0c0407]">
                      {profileForm.name}
                    </h3>
                    <p className="text-xs text-[#64748b] font-bold">
                      {profileForm.specialization || "General Trainer"}
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
                        name: selectedTrainer.User?.name || "",
                        email: selectedTrainer.User?.email || "",
                        status: selectedTrainer.User?.status || "inactive",
                        specialization: selectedTrainer.specialization || "",
                        experience_year: selectedTrainer.experience_year || 0,
                        salary: selectedTrainer.salary || 0,
                        profile_img: selectedTrainer.profile_img || "",
                        batch_ids: Array.isArray(selectedTrainer.Batches) ? selectedTrainer.Batches.map(b => b.id) : [],
                      });
                      const imgUrl = selectedTrainer.profile_img || null;
                      setImgPreview(imgUrl?.startsWith("data:") ? imgUrl : (imgUrl ? `http://localhost:3000${imgUrl}` : null));
                      setImgData(null);
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
                    <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Specialization</label>
                    <input
                      type="text"
                      value={profileForm.specialization}
                      onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                      disabled={!panelEditMode}
                      className={`${inputClass} disabled:bg-[#fafafa] disabled:text-[#64748b] disabled:cursor-not-allowed`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Experience (Years)</label>
                      <input
                        type="number"
                        value={profileForm.experience_year}
                        onChange={(e) => setProfileForm({ ...profileForm, experience_year: e.target.value })}
                        disabled={!panelEditMode}
                        className={`${inputClass} disabled:bg-[#fafafa] disabled:text-[#64748b] disabled:cursor-not-allowed`}
                        min={0}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">Salary (Monthly INR)</label>
                      <input
                        type="number"
                        value={profileForm.salary}
                        onChange={(e) => setProfileForm({ ...profileForm, salary: e.target.value })}
                        disabled={!panelEditMode}
                        className={`${inputClass} disabled:bg-[#fafafa] disabled:text-[#64748b] disabled:cursor-not-allowed`}
                        min={0}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">
                      Profile Photo
                    </label>

                    {imgPreview ? (
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-black/[0.08] bg-[#f0eef4]">
                        <img
                          src={imgPreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1.5">
                          {panelEditMode && (
                            <>
                              <button
                                type="button"
                                onClick={() => imgInputRef.current?.click()}
                                className="px-2.5 py-1 rounded-lg bg-white/90 border border-black/10 text-[10px] font-bold text-[#475569] hover:bg-white cursor-pointer"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={handleRemoveImg}
                                className="p-1.5 rounded-lg bg-white/90 border border-black/10 text-[#b91c1c] hover:bg-white cursor-pointer"
                                aria-label="Remove photo"
                              >
                                <FiTrash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : panelEditMode ? (
                      <button
                        type="button"
                        onClick={() => imgInputRef.current?.click()}
                        className="w-full py-6 rounded-xl border-2 border-dashed border-black/[0.1] bg-[#fafafa] hover:border-[#fc362d]/40 hover:bg-[#fc362d]/[0.02] transition-all flex flex-col items-center justify-center gap-1.5 text-[#94a3b8] cursor-pointer"
                      >
                        <FiImage className="w-6 h-6" />
                        <span className="text-[10px] font-semibold">Click to upload photo</span>
                        <span className="text-[9px] text-[#c0bccf]">JPEG / PNG · auto-compressed</span>
                      </button>
                    ) : (
                      <div className="w-full py-4 rounded-xl border border-black/[0.06] bg-[#fafafa] flex items-center justify-center text-[#c0bccf]">
                        <span className="text-[10px] font-medium">No photo uploaded</span>
                      </div>
                    )}

                    <input
                      ref={imgInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImgFileChange}
                    />
                  </div>
                </div>

                {/* Batch Assignments Section */}
                <div className="space-y-3 pt-3 border-t border-black/[0.06]">
                  <div>
                    <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider">Batch Assignments</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Link this trainer to institute cohorts.</p>
                  </div>

                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1 border border-black/5 rounded-xl p-3 bg-[#fafafa]/50">
                    {batches.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No batches created yet.</p>
                    ) : (
                      batches.map((b) => {
                        const isAssigned = profileForm.batch_ids.includes(b.id);
                        return (
                          <label
                            key={b.id}
                            className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                              isAssigned
                                ? "bg-rose-500/5 border-rose-500/20 text-[#0c0407]"
                                : "bg-white border-black/10 text-[#64748b] hover:bg-slate-50"
                            } ${!panelEditMode ? "opacity-90 pointer-events-none" : ""}`}
                          >
                            <div className="min-w-0">
                              <p className="font-bold truncate">{b.batch_name}</p>
                              <p className="text-[10px] text-gray-400 font-normal truncate mt-0.5">{b.course_title || "No Course"}</p>
                            </div>
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              disabled={!panelEditMode}
                              onChange={() => handleBatchToggle(b.id)}
                              className="w-4 h-4 rounded text-rose-500 border-gray-300 focus:ring-rose-500 cursor-pointer"
                            />
                          </label>
                        );
                      })
                    )}
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

export default TrainerControl;
