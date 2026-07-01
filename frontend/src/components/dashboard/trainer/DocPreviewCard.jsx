import { useEffect, useRef, useState } from "react";
import { FiFile, FiDownload, FiExternalLink, FiTrash2 } from "react-icons/fi";
import { getMatCfg, isB64, matDlName } from "./trainerUtils";

/**
 * Gmail-style document thumbnail card.
 * Renders the first page of a base64 PDF to canvas; shows coloured placeholder for DOC/PPT.
 */
export function DocPreviewCard({ material, showDelete = false, onDelete }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const cfg  = getMatCfg(material.material_type);
  const base = isB64(material.file_url);
  
  // Handle file paths vs base64 URLs
  const fileUrl = base ? material.file_url : (material.file_url ? `http://localhost:3000${material.file_url}` : material.file_url);

  useEffect(() => {
    if (material.material_type !== "PDF") return;
    if (typeof window === "undefined" || !window.pdfjsLib) return;
    let cancelled = false;
    (async () => {
      try {
        const pdf      = await window.pdfjsLib.getDocument(fileUrl).promise;
        const page     = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas   = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width  = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        if (!cancelled) setRendered(true);
      } catch { /* silent */ }
    })();
    return () => { cancelled = true; };
  }, [fileUrl, material.material_type]);

  return (
    <div className="group flex flex-col border border-black/[0.08] rounded-2xl overflow-hidden bg-white hover:border-[#fc362d]/25 hover:shadow-md transition-all duration-200">
      {/* Preview */}
      <div className="relative w-full bg-[#f8f7fb] overflow-hidden" style={{ paddingBottom: "75%" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {material.material_type === "PDF" ? (
            <>
              <canvas ref={canvasRef}
                className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${rendered ? "opacity-100" : "opacity-0"}`}
              />
              {!rendered && (
                <div className="flex flex-col items-center gap-2 text-[#94a3b8]">
                  <FiFile className="w-8 h-8" />
                  <span className="text-[10px] font-semibold">PDF Preview</span>
                </div>
              )}
            </>
          ) : material.material_type === "DOC" ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-blue-50">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <FiFile className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-[10px] font-bold text-blue-700 text-center truncate w-full px-2">{material.title}</p>
              <span className="text-[9px] font-extrabold text-blue-500 uppercase tracking-wider">Word Document</span>
            </div>
          ) : material.material_type === "PPT" ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-orange-50">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                <FiFile className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-[10px] font-bold text-orange-700 text-center truncate w-full px-2">{material.title}</p>
              <span className="text-[9px] font-extrabold text-orange-500 uppercase tracking-wider">Presentation</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-[#94a3b8]">
              <FiFile className="w-8 h-8" />
              <span className="text-[10px] font-semibold">External link</span>
            </div>
          )}
        </div>
        <span className={`absolute top-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded-lg border shadow-sm ${cfg.bg}`}>
          {cfg.label}
        </span>
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 flex items-center gap-2 border-t border-black/[0.05]">
        <p className="flex-1 text-xs font-semibold text-[#0c0407] truncate min-w-0">{material.title}</p>
        <div className="flex gap-1 shrink-0">
          {base ? (
            <a href={fileUrl} download={matDlName(material)}
              className="w-6 h-6 rounded-lg border border-black/[0.08] flex items-center justify-center text-[#475569] hover:text-[#fc362d] hover:border-[#fc362d]/30 no-underline transition-all"
              title="Download">
              <FiDownload className="w-3 h-3" />
            </a>
          ) : (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer"
              className="w-6 h-6 rounded-lg border border-black/[0.08] flex items-center justify-center text-[#475569] hover:text-[#fc362d] hover:border-[#fc362d]/30 no-underline transition-all"
              title="Open">
              <FiExternalLink className="w-3 h-3" />
            </a>
          )}
          {showDelete && onDelete && (
            <button onClick={() => onDelete(material.id)}
              className="w-6 h-6 rounded-lg border border-black/[0.08] flex items-center justify-center text-[#94a3b8] hover:text-[#b91c1c] hover:border-[#b91c1c]/30 cursor-pointer transition-all">
              <FiTrash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocPreviewCard;
