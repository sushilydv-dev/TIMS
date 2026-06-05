
export const HARDCODED_ROLE_NAMES = Object.freeze([
  "ADMIN",
  "TRAINER",
  "STUDENT",
  "HR",
]);

export const DEFAULT_ROLE_NAME = "STUDENT";

const ROLE_ALIASES = Object.freeze({
  SUPER_ADMIN: "ADMIN",
  HR_COORDINATOR: "HR",
});

export function normalizeRoleName(input) {
  const upper = String(input || DEFAULT_ROLE_NAME).toUpperCase().trim();
  const resolved = ROLE_ALIASES[upper] ?? upper;
  if (!HARDCODED_ROLE_NAMES.includes(resolved)) {
    return DEFAULT_ROLE_NAME;
  }
  return resolved;
}

export function isHardcodedRoleName(name) {
  return HARDCODED_ROLE_NAMES.includes(normalizeRoleName(name));
}
