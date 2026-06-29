import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateCertificatePDF = async (student, course, certificateNo, verificationCode, issueDate, templatePath) => {
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

      // Background color
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");

      // Add certificate border
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(3)
        .strokeColor("#fc362d")
        .stroke();

      // Inner border
      doc
        .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(1)
        .strokeColor("#fc362d")
        .stroke();

      // Header section
      doc.fontSize(24).fillColor("#0c0407").font("Helvetica-Bold");
      doc.text("CERTIFICATE OF COMPLETION", {
        align: "center",
        width: doc.page.width - 120,
      });

      doc.moveDown(0.5);

      // Subtitle
      doc.fontSize(14).fillColor("#636363").font("Helvetica");
      doc.text("This is to certify that", {
        align: "center",
        width: doc.page.width - 120,
      });

      doc.moveDown(1);

      // Student name
      doc.fontSize(36).fillColor("#0c0407").font("Helvetica-Bold");
      doc.text(student.User.name, {
        align: "center",
        width: doc.page.width - 120,
      });

      doc.moveDown(0.5);

      // Course completion text
      doc.fontSize(14).fillColor("#636363").font("Helvetica");
      doc.text("has successfully completed the course", {
        align: "center",
        width: doc.page.width - 120,
      });

      doc.moveDown(0.5);

      // Course name
      doc.fontSize(28).fillColor("#fc362d").font("Helvetica-Bold");
      doc.text(course.title, {
        align: "center",
        width: doc.page.width - 120,
      });

      doc.moveDown(1.5);

      // Details section
      doc.fontSize(12).fillColor("#636363").font("Helvetica");

      const details = [
        `Certificate No: ${certificateNo}`,
        `Issue Date: ${new Date(issueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
      ];

      details.forEach((detail) => {
        doc.text(detail, {
          align: "center",
          width: doc.page.width - 120,
        });
        doc.moveDown(0.3);
      });

      // Verification section
      doc.moveDown(1);
      doc.fontSize(10).fillColor("#94a3b8").font("Helvetica");
      doc.text("Verify this certificate at:", {
        align: "center",
        width: doc.page.width - 120,
      });

      doc.fontSize(11).fillColor("#fc362d").font("Helvetica-Bold");
      doc.text(`https://sushildev.in/verify/${verificationCode}`, {
        align: "center",
        width: doc.page.width - 120,
      });

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).fillColor("#94a3b8").font("Helvetica");
      doc.text("Issued by L Institute", {
        align: "center",
        width: doc.page.width - 120,
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
