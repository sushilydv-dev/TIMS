import { processAutoEligibleCertificates } from "../controllers/certificate.controller.js";

export async function runAutoCertificateGeneration() {
  try {
    await processAutoEligibleCertificates();
  } catch (error) {
    console.error("Auto certificate generation job failed:", error);
  }
}
