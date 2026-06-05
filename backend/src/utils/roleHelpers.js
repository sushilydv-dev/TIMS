import Role from "../models/role.js";
import User from "../models/user.js";
import { isAdminEmail } from "../config/adminEmails.js";
import {
  DEFAULT_ROLE_NAME,
  normalizeRoleName,
} from "../config/roles.js";

const ROLE_TO_CLIENT = {
  ADMIN: "ADMIN",
  HR: "HR_COORDINATOR",
  HR_COORDINATOR: "HR_COORDINATOR",
  TRAINER: "TRAINER",
  STUDENT: "STUDENT",
};

export function toClientRole(roleName) {
  return ROLE_TO_CLIENT[normalizeRoleName(roleName)] ?? DEFAULT_ROLE_NAME;
}

/** Resolve role by hardcoded name only (run seedRoles on startup first) */
export async function getCanonicalRoleByName(roleName) {
  const normalized = normalizeRoleName(roleName);
  const role = await Role.findOne({ where: { role_name: normalized } });

  if (role) {
    return role;
  }

  return Role.create({ role_name: normalized });
}

/** @deprecated use getCanonicalRoleByName */
export const findOrCreateRoleByName = getCanonicalRoleByName;

export async function getUserRoleName(user) {
  if (!user?.role_id) {
    return DEFAULT_ROLE_NAME;
  }
  const role = await Role.findByPk(user.role_id);
  return role?.role_name ?? DEFAULT_ROLE_NAME;
}

export async function ensureAdminRoleAssignment(user) {
  if (!user?.id) return user;
  const adminRole = await getCanonicalRoleByName("ADMIN");
  if (user.role_id !== adminRole.id) {
    await User.update({ role_id: adminRole.id }, { where: { id: user.id } });
    user.role_id = adminRole.id;
  }
  return user;
}

export async function getUserRoleForClient(user, email) {
  const lookupEmail = (email ?? user?.email ?? "").trim();

  if (isAdminEmail(lookupEmail)) {
    await ensureAdminRoleAssignment(user);
    return "ADMIN";
  }

  const dbRole = await getUserRoleName(user);
  return toClientRole(dbRole);
}
