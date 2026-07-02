/**
 * Generates a TIMS payment receipt as a PNG and triggers download.
 * Works cross-browser via Blob URL.
 *
 * @param {object} opts
 * @param {string} opts.studentName
 * @param {string} opts.studentCode
 * @param {string} opts.studentEmail
 * @param {string} opts.courseName
 * @param {string} opts.batchName
 * @param {number} opts.amount          — amount paid (INR)
 * @param {string} opts.paymentDate
 * @param {string} opts.paymentMethod
 * @param {string} opts.transactionId
 * @param {string} [opts.label]         — e.g. "Full Payment" / "Instalment 1"
 * @param {string} [opts.status]        — "SUCCESS" etc.
 */
import { LOGO_PATH } from "../constants";

export function generatePaymentReceipt(opts) {
  return new Promise((resolve, reject) => {
    const {
      studentName   = "—",
      studentCode   = "—",
      studentEmail  = "—",
      courseName    = "—",
      batchName     = "—",
      amount        = 0,
      paymentDate   = "—",
      paymentMethod = "—",
      transactionId = "—",
      label         = "Payment",
      status        = "SUCCESS",
    } = opts;

    const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
    const W = 680, H = 900;

    const canvas = document.createElement("canvas");
    canvas.width  = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    /* ── Background ── */
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    /* ── Header band ── */
    ctx.fillStyle = "#0c0407";
    ctx.fillRect(0, 0, W, 96);

    /* ── Load TIMS logo ── */
    const drawContent = () => {
      /* ── TIMS wordmark ── */
      ctx.font = "bold 28px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("TIMS", 32, 50);
      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.50)";
      ctx.fillText("Training & Internship Management", 32, 70);

      /* ── "RECEIPT" label ── */
      ctx.textAlign = "right";
      ctx.font = "bold 20px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#fc362d";
      ctx.fillText("PAYMENT RECEIPT", W - 32, 44);
      ctx.font = "11px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.50)";
      const receiptNo = `RCPT-${(studentCode || "STU").toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      ctx.fillText(receiptNo, W - 32, 62);
      ctx.fillText(new Date().toLocaleDateString("en-IN"), W - 32, 78);
      ctx.textAlign = "left";

      /* ── Red accent ── */
      ctx.fillStyle = "#fc362d";
      ctx.fillRect(0, 96, W, 4);

      /* ── Success badge ── */
      const badgeX = W / 2 - 64, badgeY = 120;
      ctx.fillStyle = status.toUpperCase() === "SUCCESS" ? "#ecfdf5" : "#fef2f2";
      roundRect(ctx, badgeX, badgeY, 128, 36, 18);
      ctx.fillStyle = status.toUpperCase() === "SUCCESS" ? "#059669" : "#b91c1c";
      ctx.font = "bold 13px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(status.toUpperCase() === "SUCCESS" ? "✓  PAYMENT SUCCESSFUL" : status, W / 2, badgeY + 23);
      ctx.textAlign = "left";

      /* ── Amount ── */
      ctx.font = "bold 44px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#0c0407";
      ctx.textAlign = "center";
      ctx.fillText(inr(amount), W / 2, 208);
      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(label, W / 2, 228);
      ctx.textAlign = "left";

      /* ── Divider ── */
      let y = 255;
      ctx.strokeStyle = "#f1f5f9";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(32, y); ctx.lineTo(W - 32, y); ctx.stroke();
      y += 24;

      /* ── Detail rows ── */
      const rows = [
        ["Student Name",    studentName],
        ["Student ID",      studentCode],
        ["Email",           studentEmail],
        ["Course",          courseName],
        ["Batch",           batchName],
        ["Payment Date",    paymentDate],
        ["Payment Method",  paymentMethod],
        ["Transaction ID",  transactionId],
        ["Amount Paid",     inr(amount)],
        ["Status",          status],
      ];

      rows.forEach(([lbl, val], i) => {
        const rowY = y + i * 36;
        ctx.fillStyle = i % 2 === 0 ? "#fafafa" : "#ffffff";
        ctx.fillRect(32, rowY - 6, W - 64, 32);

        ctx.font = "11px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(lbl, 44, rowY + 14);

        ctx.font = lbl === "Amount Paid" ? "bold 13px Inter, system-ui, sans-serif" : "12px Inter, system-ui, sans-serif";
        ctx.fillStyle = lbl === "Amount Paid" ? "#059669"
                      : lbl === "Transaction ID" ? "#475569"
                      : "#0c0407";
        ctx.textAlign = "right";
        ctx.fillText(String(val || "—"), W - 44, rowY + 14);
        ctx.textAlign = "left";
      });

      y += rows.length * 36 + 16;

      /* ── Divider ── */
      ctx.strokeStyle = "#f1f5f9"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(32, y); ctx.lineTo(W - 32, y); ctx.stroke();
      y += 20;

      /* ── Footer ── */
      ctx.fillStyle = "#f8f7fb";
      ctx.fillRect(0, H - 72, W, 72);
      ctx.fillStyle = "#fc362d";
      ctx.fillRect(0, H - 72, W, 3);
      ctx.font = "11px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.textAlign = "center";
      ctx.fillText("TIMS — Training & Internship Management System", W / 2, H - 44);
      ctx.fillText("This is a computer-generated receipt and does not require a signature.", W / 2, H - 24);
      ctx.textAlign = "left";

      /* ── Download ── */
      canvas.toBlob((blob) => {
        const url  = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `TIMS-Receipt-${(studentCode || "STU").replace(/\s/g, "_")}-${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      }, "image/png");
    };

    /* Try to load the logo */
    const logo = new Image();
    logo.onload = () => {
      ctx.drawImage(logo, 32, 12, 56, 56);
      // shift wordmark right
      ctx.fillStyle = "#0c0407"; ctx.fillRect(0, 0, W, 96); // redraw header
      ctx.drawImage(logo, 32, 12, 56, 56);
      drawContent();
    };
    logo.onerror = drawContent; // proceed without logo
    logo.src = LOGO_PATH;
  });
}

/* ── Canvas roundRect polyfill ─────────────────────── */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
