import { useRef, useState } from "react";
import axios from "axios";
import { FiUpload, FiBookOpen, FiPlus, FiX } from "react-icons/fi";
import { Panel, PanelHeader, Toast } from "../DashboardUI";
import { primaryBtnClass, secondaryBtnClass, inputClass, labelMutedClass } from "../dashboardTheme";
import { getMatCfg, detectMatType } from "./trainerUtils";
import { DocPreviewCard } from "./DocPreviewCard";

/**
 * Study Materials tab — topic-wise multi-file upload with staging queue and preview grid.
 */
export function BatchMaterials({ batchId, materials, onRefresh }) {
  const fileInputRef = useRef(null);
  const addMoreRef   = useRef(null);
  const [toast, setToast]       = useState("");
  const [queue, setQueue]       = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [saving, setSaving]     = useState(false);
  const [addTopic, setAddTopic] = useState(null);
  const [addQueue, setAddQueue] = useState([]);
  const [addSaving, setAddSaving] = useState(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3500); };

  const grouped = materials.reduce((acc, m) => {
    const t = m.topic_name || "General";
    if (!acc[t]) acc[t] = [];
    acc[t].push(m);
    return acc;
  }, {});
  const topics = Object.keys(grouped).sort();

  const pickFiles = (e, setter) => {
    Array.from(e.target.files || []).forEach(file => {
      if (file.size > 25 * 1024 * 1024) { showToast(`${file.name} exceeds 25 MB`); return; }
      const reader = new FileReader();
      reader.onload = ev => setter(prev => [...prev, {
        id: Math.random().toString(36).slice(2),
        title: file.name.replace(/\.[^.]+$/, ""),
        type: detectMatType(file.name),
        data: ev.target.result,
        fileName: file.name,
      }]);
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const uploadAll = async (queueItems, topicName, onDone) => {
    await Promise.all(queueItems.map(f =>
      axios.post(`/api/trainer/batches/${batchId}/materials`, {
        title: f.title.trim() || f.fileName,
        topic_name: topicName.trim() || "General",
        file_data: f.data,
        material_type: f.type,
      })
    ));
    onRefresh();
    onDone();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;
    try { await axios.delete(`/api/trainer/materials/${id}`); showToast("Deleted"); onRefresh(); }
    catch (err) { showToast(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <>
      <Toast message={toast} />
      <Panel>
        <PanelHeader
          eyebrow="Resources"
          title="Study Materials"
          action={
            <span className="text-[10px] font-bold text-[#94a3b8]">
              {materials.length} file{materials.length !== 1 ? "s" : ""} · {topics.length} topic{topics.length !== 1 ? "s" : ""}
            </span>
          }
        />

        {/* ── Upload new topic ── */}
        <div className="border border-black/[0.07] rounded-2xl bg-[#fafafa] p-4 mb-6 space-y-3">
          <p className={labelMutedClass}>Upload files under a new topic</p>
          <div>
            <label className={`${labelMutedClass} block mb-1.5`}>Topic / Chapter name</label>
            <input value={newTopic} onChange={e => setNewTopic(e.target.value)}
              placeholder="e.g. React Hooks, Module 3…"
              className={inputClass} />
          </div>
          <input ref={fileInputRef} type="file" multiple className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={e => pickFiles(e, setQueue)} />
          <div onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-black/[0.1] rounded-xl bg-white hover:border-[#fc362d]/40 hover:bg-[#fc362d]/[0.015] transition-all cursor-pointer flex flex-col items-center gap-1 py-5 text-[#94a3b8]">
            <FiUpload className="w-6 h-6" />
            <span className="text-xs font-semibold">Click to select files (PDF, DOC, PPT)</span>
            <span className="text-[10px]">Multiple files · max 25 MB each</span>
          </div>

          {queue.length > 0 && (
            <div className="space-y-2">
              <p className={labelMutedClass}>{queue.length} file{queue.length > 1 ? "s" : ""} staged — edit titles if needed</p>
              {queue.map(f => {
                const cfg = getMatCfg(f.type);
                return (
                  <div key={f.id} className="flex items-center gap-2 bg-white border border-black/[0.07] rounded-xl px-3 py-2">
                    <span className={`shrink-0 text-[9px] font-extrabold px-2 py-0.5 rounded-lg border ${cfg.bg}`}>{cfg.label}</span>
                    <input value={f.title}
                      onChange={e => setQueue(prev => prev.map(q => q.id === f.id ? { ...q, title: e.target.value } : q))}
                      className="flex-1 text-xs font-semibold text-[#0c0407] bg-transparent outline-none border-none" placeholder="Title…" />
                    <span className="text-[10px] text-[#94a3b8] hidden sm:block truncate max-w-[130px]">{f.fileName}</span>
                    <button type="button" onClick={() => setQueue(prev => prev.filter(q => q.id !== f.id))}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-[#b91c1c] cursor-pointer shrink-0">
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              <button
                disabled={saving || !newTopic.trim() || !queue.length}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await uploadAll(queue, newTopic, () => { setQueue([]); setNewTopic(""); });
                    showToast(`${queue.length} file${queue.length > 1 ? "s" : ""} uploaded`);
                  } catch (err) { showToast(err.response?.data?.message || "Upload failed"); }
                  finally { setSaving(false); }
                }}
                className={`${primaryBtnClass} w-full flex items-center justify-center gap-2 disabled:opacity-50`}
              >
                <FiUpload className="w-3.5 h-3.5" />
                {saving ? "Uploading…" : `Upload ${queue.length} file${queue.length > 1 ? "s" : ""} under "${newTopic || "…"}"`}
              </button>
            </div>
          )}
        </div>

        {/* ── Existing topics ── */}
        {topics.length === 0 ? (
          <div className="text-center py-12 bg-[#fafafa] rounded-2xl border border-dashed border-black/[0.07]">
            <FiBookOpen className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#94a3b8]">No materials yet. Add a topic above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map(t => (
              <div key={t} className="border border-black/[0.07] rounded-2xl overflow-hidden">
                {/* Topic header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-[#fafafa] border-b border-black/[0.06]">
                  <div className="w-7 h-7 rounded-xl bg-[#fc362d]/10 flex items-center justify-center shrink-0">
                    <FiBookOpen className="w-3.5 h-3.5 text-[#fc362d]" />
                  </div>
                  <h4 className="text-xs font-extrabold text-[#0c0407] uppercase tracking-wider flex-1">{t}</h4>
                  <span className="text-[10px] font-bold text-[#94a3b8] mr-2">
                    {grouped[t].length} file{grouped[t].length !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => { setAddTopic(addTopic === t ? null : t); setAddQueue([]); }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                      addTopic === t ? "bg-[#fc362d] text-white border-[#fc362d]" : "bg-white text-[#475569] border-black/[0.08] hover:border-[#fc362d]/30"
                    }`}
                  >
                    <FiPlus className="w-3 h-3" /> Add more
                  </button>
                </div>

                {/* Add-more sub-form */}
                {addTopic === t && (
                  <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 space-y-2">
                    <input ref={addMoreRef} type="file" multiple className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={e => pickFiles(e, setAddQueue)} />
                    <div onClick={() => addMoreRef.current?.click()}
                      className="w-full border-2 border-dashed border-amber-200 rounded-xl bg-white hover:border-[#fc362d]/40 cursor-pointer flex items-center justify-center gap-2 py-3 text-[#94a3b8]">
                      <FiUpload className="w-4 h-4" />
                      <span className="text-xs font-semibold">Pick more files for "{t}"</span>
                    </div>
                    {addQueue.length > 0 && (
                      <>
                        {addQueue.map(f => {
                          const cfg = getMatCfg(f.type);
                          return (
                            <div key={f.id} className="flex items-center gap-2 bg-white border border-black/[0.07] rounded-xl px-3 py-2">
                              <span className={`shrink-0 text-[9px] font-extrabold px-2 py-0.5 rounded-lg border ${cfg.bg}`}>{cfg.label}</span>
                              <input value={f.title}
                                onChange={e => setAddQueue(prev => prev.map(q => q.id === f.id ? { ...q, title: e.target.value } : q))}
                                className="flex-1 text-xs font-semibold text-[#0c0407] bg-transparent outline-none border-none" placeholder="Title…" />
                              <button onClick={() => setAddQueue(prev => prev.filter(q => q.id !== f.id))}
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-[#94a3b8] hover:text-[#b91c1c] cursor-pointer">
                                <FiX className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                        <div className="flex gap-2">
                          <button disabled={addSaving}
                            onClick={async () => {
                              setAddSaving(true);
                              try {
                                await uploadAll(addQueue, t, () => { setAddQueue([]); setAddTopic(null); });
                                showToast(`${addQueue.length} file${addQueue.length > 1 ? "s" : ""} added`);
                              } catch (err) { showToast(err.response?.data?.message || "Failed"); }
                              finally { setAddSaving(false); }
                            }}
                            className={`${primaryBtnClass} text-xs py-1.5 px-4 flex items-center gap-1.5 disabled:opacity-50`}
                          >
                            <FiUpload className="w-3 h-3" />
                            {addSaving ? "Uploading…" : `Upload ${addQueue.length} file${addQueue.length > 1 ? "s" : ""}`}
                          </button>
                          <button onClick={() => { setAddTopic(null); setAddQueue([]); }}
                            className={`${secondaryBtnClass} text-xs py-1.5 px-3`}>Cancel</button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Files grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
                  {grouped[t].map(m => (
                    <DocPreviewCard
                      key={m.id}
                      material={m}
                      showDelete={true}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </>
  );
}

export default BatchMaterials;
