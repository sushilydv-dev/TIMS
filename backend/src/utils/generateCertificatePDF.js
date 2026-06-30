import PDFDocument from "pdfkit";
import fs from "fs";

const INSTITUTE_NAME = process.env.INSTITUTE_NAME || "TIMS";

const decodeImageSource = (source) => {
  if (!source || typeof source !== "string") return null;

  if (source.startsWith("data:")) {
    const base64 = source.split(",")[1];
    return base64 ? Buffer.from(base64, "base64") : null;
  }

  if (fs.existsSync(source)) {
    return source;
  }

  return null;
};

const formatTrainingLength = (course, batch) => {
  if (batch?.start_date && batch?.end_date) {
    const start = new Date(batch.start_date);
    const end = new Date(batch.end_date);
    const diffMs = end.getTime() - start.getTime();
    const months = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24 * 30.4375)));
    return `${months} month${months === 1 ? "" : "s"}`;
  }

  const durationMonths = Number(course?.duration_month);
  if (durationMonths > 0) {
    return `${durationMonths} month${durationMonths === 1 ? "" : "s"}`;
  }

  return null;
};

const formatIssueDate = (issueDate) =>
  new Date(issueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const drawBorder = (doc, x, y, width, height, color) => {
  doc.save();
  doc.lineWidth(2).strokeColor(color);
  doc.rect(x, y, width, height).stroke();
  doc.lineWidth(0.75);
  doc.rect(x + 8, y + 8, width - 16, height - 16).stroke();
  doc.restore();
};

const drawCornerOrnaments = (doc, x, y, width, height, color) => {
  const size = 18;
  doc.save();
  doc.lineWidth(1.5).strokeColor(color);

  const corners = [
    [x + 14, y + 14],
    [x + width - 14 - size, y + 14],
    [x + 14, y + height - 14 - size],
    [x + width - 14 - size, y + height - 14 - size],
  ];

  corners.forEach(([cx, cy]) => {
    doc.moveTo(cx, cy).lineTo(cx + size, cy).stroke();
    doc.moveTo(cx, cy).lineTo(cx, cy + size).stroke();
  });

  doc.restore();
};

export const generateCertificatePDF = async ({
  student,
  course,
  batch,
  certificateNo,
  verificationCode,
  issueDate,
  settings = {},
}) => {
  const signatureTitle = settings.signature_title || "Course Coordinator";
  const trainingLength = formatTrainingLength(course, batch);
  const signatureImage = decodeImageSource(settings.digital_signature_url);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 0,
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 28;
      const innerWidth = pageWidth - margin * 2;
      const innerHeight = pageHeight - margin * 2;
      const borderColor = "#1e3a8a";
      const textColor = "#111827";
      const mutedColor = "#4b5563";
      const contentX = margin + 48;
      const contentWidth = innerWidth - 96;

      doc.rect(0, 0, pageWidth, pageHeight).fill("#ffffff");
      drawBorder(doc, margin, margin, innerWidth, innerHeight, borderColor);
      drawCornerOrnaments(doc, margin, margin, innerWidth, innerHeight, borderColor);

      doc
        .fontSize(11)
        .fillColor(borderColor)
        .font("Helvetica-Bold")
        .text(INSTITUTE_NAME.toUpperCase(), contentX, margin + 36, {
          width: contentWidth,
          align: "center",
        });

      doc
        .fontSize(34)
        .fillColor(textColor)
        .font("Times-Italic")
        .text("Certificate of Completion", contentX, margin + 72, {
          width: contentWidth,
          align: "center",
        });

      doc
        .fontSize(13)
        .fillColor(mutedColor)
        .font("Helvetica")
        .text("This document verifies that", contentX, margin + 132, {
          width: contentWidth,
          align: "center",
        });

      const studentName = student.User?.name || "Student";
      doc
        .fontSize(30)
        .fillColor(textColor)
        .font("Times-BoldItalic")
        .text(studentName, contentX, margin + 162, {
          width: contentWidth,
          align: "center",
        });

      const nameWidth = doc.widthOfString(studentName);
      const underlineX = contentX + (contentWidth - nameWidth) / 2;
      doc
        .moveTo(underlineX, margin + 198)
        .lineTo(underlineX + nameWidth, margin + 198)
        .lineWidth(0.75)
        .strokeColor("#111827")
        .stroke();

      const trainingText = trainingLength
        ? `a ${trainingLength} professional training program`
        : "a certified professional training program";

      const bodyText = `has successfully completed ${trainingText} in ${course.title} from ${INSTITUTE_NAME}, demonstrating the required competency and fulfilling all course requirements.`;

      doc
        .fontSize(12)
        .fillColor(mutedColor)
        .font("Helvetica")
        .text(bodyText, contentX + 24, margin + 220, {
          width: contentWidth - 48,
          align: "center",
          lineGap: 4,
        });

      doc
        .fontSize(10)
        .fillColor(mutedColor)
        .font("Helvetica")
        .text(`Certificate No: ${certificateNo}`, contentX, margin + 300, {
          width: contentWidth,
          align: "center",
        });

      const footerY = pageHeight - margin - 88;

      doc
        .fontSize(11)
        .fillColor(textColor)
        .font("Helvetica")
        .text(`Date: ${formatIssueDate(issueDate)}`, contentX, footerY, {
          width: contentWidth / 2,
          align: "left",
        });

      const signatureBlockWidth = 180;
      const signatureX = contentX + contentWidth - signatureBlockWidth;

      if (signatureImage) {
        doc.image(signatureImage, signatureX + 20, footerY - 18, {
          fit: [signatureBlockWidth - 40, 48],
          align: "center",
          valign: "center",
        });
      } else {
        doc
          .moveTo(signatureX + 24, footerY + 8)
          .lineTo(signatureX + signatureBlockWidth - 24, footerY + 8)
          .lineWidth(0.75)
          .strokeColor("#9ca3af")
          .stroke();
      }

      doc
        .fontSize(10)
        .fillColor(textColor)
        .font("Helvetica-Bold")
        .text(signatureTitle, signatureX, footerY + 18, {
          width: signatureBlockWidth,
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
