// Shared constants, helpers and type config for trainer batch tabs

export const MAT_CFG = {
  PDF: { bg: "bg-red-50 text-red-700 border-red-200",          label: "PDF" },
  DOC: { bg: "bg-blue-50 text-blue-700 border-blue-200",       label: "DOC" },
  PPT: { bg: "bg-orange-50 text-orange-700 border-orange-200", label: "PPT" },
};

export const getMatCfg     = (t) => MAT_CFG[(t || "").toUpperCase()] || MAT_CFG.PDF;
export const isB64         = (u) => Boolean(u?.startsWith("data:"));
export const matDlName     = (m) => {
  const ext = m.material_type === "DOC" ? ".docx" : m.material_type === "PPT" ? ".pptx" : ".pdf";
  return `${(m.title || "file").replace(/\s+/g, "_")}${ext}`;
};
export const detectMatType = (name) => {
  const n = name.toLowerCase();
  return n.endsWith(".doc") || n.endsWith(".docx") ? "DOC"
       : n.endsWith(".ppt") || n.endsWith(".pptx") ? "PPT"
       : "PDF";
};
export const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
