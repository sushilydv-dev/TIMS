import User from "../models/user.js";
import Role from "../models/role.js";
import { ensureRoleProfile } from "../utils/ensureRoleProfile.js";
import { isAdminEmail } from "./adminEmails.js";

/** Backfill trainer / student / hr rows for users that only exist in users table */
export async function seedMissingRoleProfiles() {
  const users = await User.findAll({
    include: [{ model: Role, as: "role" }],
  });

  for (const user of users) {
    if (isAdminEmail(user.email)) continue;
    const roleName = user.role?.role_name;
    if (roleName) {
      await ensureRoleProfile(user, roleName);
    }
  }

  console.log("Role profile backfill completed");
}
