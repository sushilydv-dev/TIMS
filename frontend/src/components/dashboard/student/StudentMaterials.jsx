import { useCallback, useEffect, useRef, useState } from "react";
import {
  FiBookOpen, FiDownload, FiExternalLink,
  FiRefreshCw, FiUser, FiLayers, FiAlertCircle,
  FiX, FiArrowRight, FiFile,
} from "react-icons/fi";
import axios from "axios";
import { WelcomeBanner, StatCards, Toast } from "../DashboardUI";
import { pageWrapClass, cardClass, labelMutedClass, secondaryBtnClass } from "../dashboardTheme";

/* ── helpers ─────────────────────────────────────────── */
const MAT_CFG = {
  PDF: { bg: "bg-red-50 text-red-700 border-red-200",          label: "PDF" },
  DOC: { bg: "bg-blue-50 text-blue-700 border-blue-200",       label: "DOC" },
  PPT: { bg: "bg-orange-50 text-orange-700 border-orange-200", label: "PPT" },
};
const getMatCfg = (t) => MAT_CFG[(t||"").toUpperCase()] || { bg: "bg-[#f1f5f9] text-[#475569] border-black/10", label: t||"FILE" };
const isB64     = (u) => Boolean(u?.startsWith("data:"));
const getFileUrl = (u) => isB64(u) ? u : `http://localhost:3000${u}`;
const dlName    = (m) => {
  const ext = m.material_type==="DOC"?".docx":m.material_type==="PPT"?".pptx":".pdf";
  return `${(m.title||"file").replace(/\s+/g,"_")}${ext}`;
};

/* ── PdfThumb — renders first page of a base64 or file path PDF ───── */
function PdfThumb({ dataUrl }) {
  const canvasRef = useRef(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!dataUrl || typeof window === "undefined" || !window.pdfjsLib) return;
    let cancelled = false;
    (async () => {
      try {
        const pdf      = await window.pdfjsLib.getDocument(dataUrl).promise;
        const page     = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas   = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width  = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        if (!cancelled) setOk(true);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [dataUrl]);

  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef}
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${ok ? "opacity-100" : "opacity-0"}`}
      />
      {!ok && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#94a3b8] absolute inset-0">
          <FiFile className="w-7 h-7" />
          <span className="text-[9px] font-semibold">PDF Preview</span>
        </div>
      )}
    </div>
  );
}

/* ── TopicPanel (slide-over) ─────────────────────────── */
function TopicPanel({ topic, files, onClose }) {
  return (
    <div className="fixed inset-0 z-[150] flex justify-end" role="dialog" aria-modal="true">
      {/* backdrop */}
      <div className="absolute inset-0 bg-[#0c0407]/35 backdrop-blur-sm" onClick={onClose} />

      {/* drawer */}
      <div className="relative w-full max-w-md h-full bg-white border-l border-black/[0.08] shadow-[-12px_0_40px_rgba(0,0,0,0.1)] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/[0.07] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#fc362d]/10 flex items-center justify-center shrink-0">
              <FiLayers className="w-4 h-4 text-[#fc362d]" />
            </div>
            <div className="min-w-0">
              <p className={`${labelMutedClass} mb-0`}>Topic</p>
              <h2 className="text-base font-extrabold text-[#0c0407] truncate">{topic}</h2>
            </div>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center text-[#94a3b8] hover:text-[#0c0407] cursor-pointer shrink-0">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* file count */}
        <div className="px-5 py-3 bg-[#fafafa] border-b border-black/[0.06] shrink-0">
          <p className="text-xs font-semibold text-[#94a3b8]">
            {files.length} resource{files.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* file list — thumbnail grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {files.map(m => {
              const cfg  = getMatCfg(m.material_type);
              const base = isB64(m.file_url);
              const fileUrl = getFileUrl(m.file_url);
              const ext  = m.material_type==="DOC"?".docx":m.material_type==="PPT"?".pptx":".pdf";
              const dl   = `${(m.title||"file").replace(/\s+/g,"_")}${ext}`;

              return (
                <div key={m.id} className="flex flex-col border border-black/[0.08] rounded-2xl overflow-hidden bg-white hover:border-[#fc362d]/25 hover:shadow-md transition-all">
                  {/* Preview */}
                  <div className="relative bg-[#f8f7fb] overflow-hidden" style={{ paddingBottom: "75%" }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {m.material_type === "PDF" ? (
                        <PdfThumb dataUrl={fileUrl} />
                      ) : m.material_type === "DOC" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 gap-2">
                          <FiFile className="w-7 h-7 text-blue-500" />
                          <span className="text-[9px] font-extrabold text-blue-500 uppercase">Word Doc</span>
                        </div>
                      ) : m.material_type === "PPT" ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50 gap-2">
                          <FiFile className="w-7 h-7 text-orange-500" />
                          <span className="text-[9px] font-extrabold text-orange-500 uppercase">Presentation</span>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#94a3b8]">
                          <FiExternalLink className="w-7 h-7" />
                          <span className="text-[9px] font-semibold">External Link</span>
                        </div>
                      )}
                    </div>
                    <span className={`absolute top-1.5 left-1.5 text-[8px] font-extrabold px-1.5 py-0.5 rounded-md border shadow-sm ${cfg.bg}`}>
                      {cfg.label}
                    </span>
                  </div>
                  {/* Footer */}
                  <div className="px-2.5 py-2 flex items-center gap-1.5 border-t border-black/[0.05]">
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-[#0c0407] truncate">{m.title}</p>
                      {m.uploader_name && (
                        <p className="text-[9px] text-[#94a3b8] font-medium truncate flex items-center gap-1">
                          <FiUser className="w-2.5 h-2.5 shrink-0" />{m.uploader_name}
                        </p>
                      )}
                    </div>
                    {base ? (
                      <a href={fileUrl} download={dl}
                        className="shrink-0 w-6 h-6 rounded-lg border border-black/[0.08] flex items-center justify-center text-[#475569] hover:text-[#fc362d] no-underline transition-all"
                        title="Download">
                        <FiDownload className="w-3 h-3" />
                      </a>
                    ) : (
                      <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 w-6 h-6 rounded-lg border border-black/[0.08] flex items-center justify-center text-[#475569] hover:text-[#fc362d] no-underline transition-all"
                        title="Open">
                        <FiExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────── */
export default function StudentMaterials() {
  const [data, setData]           = useState({ materials: [], course: null });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [openTopic, setOpenTopic] = useState(null); // topic name currently open in panel

  const fetchMaterials = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data: res } = await axios.get("/api/students/me/materials");
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load materials");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  const allMaterials = data.materials || [];

  /* Group by topic */
  const grouped = allMaterials.reduce((acc, m) => {
    const t = m.topic_name || "General";
    if (!acc[t]) acc[t] = [];
    acc[t].push(m);
    return acc;
  }, {});
  const topics = Object.keys(grouped).sort((a, b) =>
    a === "General" ? 1 : b === "General" ? -1 : a.localeCompare(b)
  );

  /* Stats */
  const downloadable = allMaterials.filter(m => isB64(m.file_url)).length;

  return (
    <div className={pageWrapClass}>
      {/* Topic panel slide-over */}
      {openTopic && (
        <TopicPanel
          topic={openTopic}
          files={grouped[openTopic] || []}
          onClose={() => setOpenTopic(null)}
        />
      )}

      <WelcomeBanner
        badge="Study Materials"
        title="Course Resources"
        description={data.course
          ? `Study materials for ${data.course.title} — organised by topic. Click a topic to view and download its files.`
          : "All study materials from your trainer, organised by topic."}
        actions={
          <button onClick={fetchMaterials} className={`${secondaryBtnClass} flex items-center gap-1.5`}>
            <FiRefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        }
      />

      <StatCards stats={[
        { label: "Total Files",   value: String(allMaterials.length), change: "All resources",  icon: <FiBookOpen className="w-5 h-5" /> },
        { label: "Topics",        value: String(topics.length),       change: "Chapters",        icon: <FiLayers   className="w-5 h-5" /> },
        { label: "Downloadable",  value: String(downloadable),        change: "Files",           icon: <FiDownload className="w-5 h-5" /> },
      ]} />

      {loading ? (
        <div className="text-center py-16 text-sm text-[#94a3b8] font-semibold">Loading study materials…</div>
      ) : error ? (
        <div className={`${cardClass} flex flex-col items-center py-12 gap-3 text-center`}>
          <FiAlertCircle className="w-10 h-10 text-[#fc362d]" />
          <p className="text-sm font-semibold text-[#636363]">{error}</p>
          <button onClick={fetchMaterials}
            className="px-5 py-2.5 rounded-xl bg-[#fc362d] text-white text-xs font-bold hover:bg-[#e02d25] cursor-pointer">Retry</button>
        </div>
      ) : topics.length === 0 ? (
        <div className={`${cardClass} flex flex-col items-center py-16 gap-3 text-center`}>
          <FiBookOpen className="w-12 h-12 text-[#94a3b8]" />
          <p className="text-base font-bold text-[#0c0407]">No materials yet</p>
          <p className="text-xs text-[#94a3b8] font-medium max-w-xs">
            Your trainer hasn't uploaded any study materials yet. Check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map(topic => {
            const files  = grouped[topic];
            const counts = files.reduce((a, m) => {
              const t = (m.material_type||"").toUpperCase();
              a[t] = (a[t]||0) + 1;
              return a;
            }, {});

            return (
              <button key={topic} onClick={() => setOpenTopic(topic)}
                className={`${cardClass} p-5 text-left cursor-pointer hover:border-[#fc362d]/25 hover:shadow-[0_8px_32px_rgba(252,54,45,0.09)] transition-all duration-300 group w-full`}>
                {/* icon + file count */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#fc362d]/10 flex items-center justify-center shrink-0">
                    <FiLayers className="w-5 h-5 text-[#fc362d]" />
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-[#f1f5f9] text-[#475569] border border-black/[0.06] shrink-0 mt-1">
                    {files.length} file{files.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Topic name */}
                <h3 className="text-sm font-extrabold text-[#0c0407] group-hover:text-[#fc362d] transition-colors leading-snug mb-3">
                  {topic}
                </h3>

                {/* Type breakdown */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {Object.entries(counts).map(([type, count]) => {
                    const cfg = getMatCfg(type);
                    return (
                      <span key={type} className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border ${cfg.bg}`}>
                        {count} {cfg.label}
                      </span>
                    );
                  })}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#fc362d] uppercase tracking-wider group-hover:gap-2.5 transition-all duration-200">
                  View & Download
                  <FiArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
