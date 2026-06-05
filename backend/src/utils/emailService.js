import emailjs from "@emailjs/nodejs";

export async function sendTemplateEmail(templateId, templateParams) {
  if (!templateId) {
    throw new Error("Email template ID is not configured");
  }
  if (!process.env.EMAILJS_SERVICE_ID) {
    throw new Error("EMAILJS_SERVICE_ID is not configured");
  }

  await emailjs.send(
    process.env.EMAILJS_SERVICE_ID,
    templateId,
    templateParams,
    {
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      privateKey: process.env.EMAILJS_PRIVATE_KEY,
    },
  );
}
