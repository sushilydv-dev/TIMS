import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiLayers, FiSearch, FiEdit2, FiUsers, FiCalendar, FiPlus,
} from "react-icons/fi";
import axios from "axios";
import {
  WelcomeBanner, StatCards, Panel, PanelHeader, Toast, PrimaryButton,
} from "../DashboardUI";
import { pageWrapClass, inputClass } from "../dashboardTheme";
import { BasicProfile, useBasicProfile } from "../BasicProfile";
import { ProfileAvatar } from "../ProfileAvatar";
import { BatchEditPanel } from "./BatchEditPanel";
import { BatchFormModal } from "./BatchFormModal";

export const BatchesList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [batches, setBatches]     = useState([]);
  const [stats, setStats]         = useState({ batches: 0, totalStudents: 0, avgStudents: 0 });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [editBatch, setEditBatch] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast]         = useState("");
  const {
    basicProfileOpen,
    basicProfileType,
    basicProfileId,
    openBasicProfile,
    closeBasicProfile,
  } = useBasicProfile();

  const batchIdParam = searchParams.get("batchId");

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/batches");
      const loadedBatches = Array.isArray(data) ? data : [];
      setBatches(loadedBatches);

      let totalStudents = 0;
      loadedBatches.forEach((b) => {
        totalStudents += Number(b.student_count || 0);
      });

      const batchCount = loadedBatches.length;
      setStats({
        batches: batchCount,
        totalStudents,
        avgStudents: batchCount > 0 ? Number((totalStudents / batchCount).toFixed(1)) : 0,
      });

      // If deep linked, find and open
      if (batchIdParam) {
        const matching = loadedBatches.find((b) => b.id === batchIdParam);
        if (matching) {
          setEditBatch(matching);
        } else {
          // Fetch from API
          try {
            const res = await axios.get(`/api/admin/batches/${batchIdParam}`);
            setEditBatch(res.data);
          } catch {
            setToast("Deep linked batch not found");
            window.setTimeout(() => setToast(""), 4000);
          }
        }
      }
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }, [batchIdParam]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleOpenDrawer = (batch) => {
    setEditBatch(batch);
    setSearchParams((prev) => {
      prev.set("batchId", batch.id);
      return prev;
    });
  };

  const handleCloseDrawer = () => {
    setEditBatch(null);
    setSearchParams((prev) => {
      prev.delete("batchId");
      prev.delete("studentId"); // Clear student param if open
      return prev;
    });
  };

  const handleBatchEditSuccess = () => {
    setToast("Batch updated successfully");
    fetchBatches();
    window.setTimeout(() => setToast(""), 4000);
  };

  const handleBatchCreateSuccess = () => {
    setToast("Batch created successfully!");
    fetchBatches();
    window.setTimeout(() => setToast(""), 4000);
  };

  const filteredBatches = batches.filter((b) => {
    const term = search.toLowerCase();
    return (
      b.batch_name?.toLowerCase().includes(term) ||
      b.course_title?.toLowerCase().includes(term) ||
      b.trainer?.name?.toLowerCase().includes(term)
    );
  });

  return (
    <div className={pageWrapClass}>
      <BasicProfile
        open={basicProfileOpen}
        profileType={basicProfileType}
        profileId={basicProfileId}
        onClose={closeBasicProfile}
      />
      {/* Create batch modal — standalone (picks course internally) */}
      <BatchFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleBatchCreateSuccess}
      />

      {editBatch && (
        <BatchEditPanel
          open={Boolean(editBatch)}
          batch={editBatch}
          courseTitle={editBatch.course_title}
          onClose={handleCloseDrawer}
          onSuccess={handleBatchEditSuccess}
        />
      )}

      <WelcomeBanner
        badge="Batches Setup"
        title="Master Cohorts"
        description="View and manage active student batches, assign trainers, and track schedules."
        actions={
          <PrimaryButton onClick={() => setCreateOpen(true)}>
            <span className="inline-flex items-center gap-1.5">
              <FiPlus className="w-3.5 h-3.5" /> New Batch
            </span>
          </PrimaryButton>
        }
      />

      <StatCards
        stats={[
          {
            label: "Active Cohorts",
            value: String(stats.batches),
            change: loading ? "Loading…" : "Across all programs",
            icon: <FiLayers className="w-5 h-5" />,
          },
          {
            label: "Enrolled Students",
            value: String(stats.totalStudents),
            change: "Total active enrollment",
            icon: <FiUsers className="w-5 h-5" />,
          },
          {
            label: "Avg Students / Batch",
            value: String(stats.avgStudents),
            change: "Class capacity ratio",
            icon: <FiLayers className="w-5 h-5" />,
          },
        ]}
      />

      <Panel>
        <PanelHeader
          eyebrow="Organization Cohorts"
          title="All active batches"
          action={
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input
                type="search"
                placeholder="Search by batch, course, or trainer…"
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
              <tr className="border-b border-black/[0.08] text-[#94a3b8] uppercase tracking-wider">
                <th className="pb-3 font-bold px-2">Batch Name</th>
                <th className="pb-3 font-bold px-2">Course Program</th>
                <th className="pb-3 font-bold px-2">Assigned Trainer</th>
                <th className="pb-3 font-bold px-2">Timeline</th>
                <th className="pb-3 font-bold px-2">Enrolled Count</th>
                <th className="pb-3 font-bold px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#94a3b8] font-semibold">
                    Loading cohorts…
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#94a3b8] font-semibold">
                    {search ? "No batches match your search" : "No active batches found."}
                  </td>
                </tr>
              ) : (
                filteredBatches.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => handleOpenDrawer(row)}
                    className="border-b border-black/[0.04] hover:bg-[#fafafa] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-2">
                      <p className="font-extrabold text-[#0c0407] group-hover:text-[#fc362d] transition-colors">
                        {row.batch_name}
                      </p>
                    </td>
                    <td className="py-3.5 px-2 font-bold text-[#475569]">
                      {row.course_title}
                    </td>
                    <td className="py-3.5 px-2 font-semibold text-[#636363]" onClick={(e) => e.stopPropagation()}>
                      {row.trainer ? (
                        <div className="flex items-center gap-2.5">
                          <ProfileAvatar
                            src={row.trainer.profile_img}
                            name={row.trainer.name}
                            profileType="trainer"
                            onClick={() => openBasicProfile("trainer", row.trainer.id)}
                          />
                          <div>
                            <p className="font-bold text-[#0c0407]">{row.trainer.name}</p>
                            <p className="text-[10px] text-[#94a3b8] font-semibold">{row.trainer.specialization}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[#94a3b8] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 font-semibold text-[#475569]">
                      <span className="inline-flex items-center gap-1">
                        <FiCalendar className="w-3.5 h-3.5 text-[#94a3b8]" />
                        {row.start_date} → {row.end_date}
                      </span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="text-[10px] font-bold text-[#475569] bg-[#f1f5f9] px-2.5 py-0.5 rounded border border-black/[0.05]">
                        {row.student_count} student{row.student_count !== 1 ? "s" : ""}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenDrawer(row)}
                        className="p-2 rounded-lg border border-black/10 text-[#475569] hover:bg-[#f1f5f9] cursor-pointer inline-flex items-center gap-1 font-bold text-[10px]"
                      >
                        <FiEdit2 className="w-3 h-3" /> Edit Batch
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Toast message={toast} />
    </div>
  );
};

export default BatchesList;
