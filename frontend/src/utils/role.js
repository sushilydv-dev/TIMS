export function normalizeRole(role) {
  if (!role) return "";
  const upper = String(role).toUpperCase();
  if (upper === "SUPER_ADMIN") return "ADMIN";
  const map = {
    ADMIN: "ADMIN",
    HR: "HR_COORDINATOR",
    HR_COORDINATOR: "HR_COORDINATOR",
    TRAINER: "TRAINER",
    STUDENT: "STUDENT",
  };
  return map[upper] ?? upper;
}
