import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Ensure upload directories exist
const uploadDirs = {
  profile: path.join(process.cwd(), "uploads/profiles"),
  course: path.join(process.cwd(), "uploads/courses"),
  material: path.join(process.cwd(), "uploads/materials"),
  project: path.join(process.cwd(), "uploads/projects"),
  certificate: path.join(process.cwd(), "certificates"),
};

Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Save base64 data to disk and return the file path
 * @param {string} base64Data - Base64 data URL (e.g., "data:image/png;base64,...")
 * @param {string} type - Upload type: 'profile', 'course', 'material', 'project', 'certificate'
 * @returns {string} - Relative file path for database storage
 */
export const saveBase64File = (base64Data, type = "profile") => {
  if (!base64Data || typeof base64Data !== "string") {
    throw new Error("Invalid base64 data");
  }

  // Extract the base64 content (remove data URL prefix if present)
  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let base64Content = base64Data;
  let mimeType = "application/octet-stream";

  if (matches && matches.length === 3) {
    mimeType = matches[1];
    base64Content = matches[2];
  }

  // Determine file extension from MIME type
  const extension = getExtensionFromMimeType(mimeType);
  
  // Generate unique filename
  const filename = `${uuidv4()}${extension}`;
  const uploadDir = uploadDirs[type] || uploadDirs.profile;
  const filePath = path.join(uploadDir, filename);
  
  // Convert base64 to buffer and save
  const buffer = Buffer.from(base64Content, "base64");
  fs.writeFileSync(filePath, buffer);

  // Return relative path for database storage
  return `/uploads/${type}s/${filename}`;
};

/**
 * Delete a file from disk
 * @param {string} filePath - Relative file path from database
 */
export const deleteFile = (filePath) => {
  if (!filePath || typeof filePath !== "string") return;

  // Handle both absolute and relative paths
  const fullPath = filePath.startsWith("/") 
    ? path.join(process.cwd(), filePath)
    : filePath;

  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  }
};

/**
 * Get file extension from MIME type
 */
const getExtensionFromMimeType = (mimeType) => {
  const mimeToExt = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "text/plain": ".txt",
    "video/mp4": ".mp4",
    "video/mpeg": ".mpeg",
    "video/webm": ".webm",
  };

  return mimeToExt[mimeType] || ".bin";
};

/**
 * Check if a string is a base64 data URL
 */
export const isBase64DataUrl = (str) => {
  if (typeof str !== "string") return false;
  return /^data:[A-Za-z-+\/]+;base64,.+/.test(str);
};

/**
 * Handle file upload - save if base64, return as-is if already a path
 */
export const handleFileUpload = (fileData, type = "profile") => {
  if (!fileData) return "";
  
  // If it's already a file path (not base64), return as-is
  if (!isBase64DataUrl(fileData)) {
    return fileData;
  }
  
  // Save base64 to disk
  return saveBase64File(fileData, type);
};
