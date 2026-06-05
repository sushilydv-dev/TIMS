import { Op } from "sequelize";
import Trainer from "../models/trainer.js";
import Student from "../models/student.js";
import Hr from "../models/hr.js";
import Role from "../models/role.js";
import { normalizeRoleName } from "../config/roles.js";

async function resolveRoleName(user, roleNameOverride) {
  if (roleNameOverride) {
    return normalizeRoleName(roleNameOverride);
  }
  if (!user?.role_id) return null;
  const role = await Role.findByPk(user.role_id);
  return role?.role_name ? normalizeRoleName(role.role_name) : null;
}

async function generateStudentCode() {
  const year = new Date().getFullYear();
  const prefix = `STU-${year}-`;
  const count = await Student.count({
    where: {
      student_code: { [Op.like]: `${prefix}%` },
    },
  });
  return `${prefix}${String(count + 1).padStart(3, "0")}`;
}

/**
 * Creates trainer / student / hr row for a user when missing (idempotent).
 */
export async function ensureRoleProfile(user, roleNameOverride) {
  const roleName = await resolveRoleName(user, roleNameOverride);

  if (!roleName || roleName === "ADMIN") {
    return null;
  }

  switch (roleName) {
    case "TRAINER": {
      const existing = await Trainer.findOne({ where: { user_id: user.id } });
      if (existing) return existing;
      return Trainer.create({
        user_id: user.id,
        specialization: "General Training",
        experience_year: 0,
        salary: 0,
      });
    }

    case "STUDENT": {
      const existing = await Student.findOne({ where: { user_id: user.id } });
      if (existing) return existing;
      const today = new Date().toISOString().slice(0, 10);
      return Student.create({
        user_id: user.id,
        student_code: await generateStudentCode(),
        phone: "0",
        address: "To be updated",
        college_name: "To be updated",
        qualification: "To be updated",
        joining_date: today,
        profile_img: "",
      });
    }

    case "HR": {
      const existing = await Hr.findOne({ where: { user_id: user.id } });
      if (existing) return existing;
      return Hr.create({ user_id: user.id });
    }

    default:
      return null;
  }
}
