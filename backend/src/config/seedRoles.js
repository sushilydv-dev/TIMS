import { Op } from "sequelize";
import Role from "../models/role.js";
import User from "../models/user.js";
import { HARDCODED_ROLE_NAMES } from "./roles.js";
import bcrypt from "bcryptjs";
import { getAdminEmails } from "./adminEmails.js";

export async function seedRoles() {
  for (const role_name of HARDCODED_ROLE_NAMES) {
    const rows = await Role.findAll({
      where: { role_name },
      order: [["id", "ASC"]],
    });

    let canonical;

    if (rows.length === 0) {
      canonical = await Role.create({ role_name });
      console.log(`Created role: ${role_name}`);
      continue;
    }

    canonical = rows[0];

    if (rows.length > 1) {
      const duplicateIds = rows.slice(1).map((r) => r.id);
      await User.update(
        { role_id: canonical.id },
        { where: { role_id: { [Op.in]: duplicateIds } } },
      );
      await Role.destroy({ where: { id: { [Op.in]: duplicateIds } } });
      console.log(
        `Merged ${rows.length - 1} duplicate(s) for role ${role_name} → ${canonical.id}`,
      );
    }
  }

  const invalidRoles = await Role.findAll({
    where: {
      role_name: { [Op.notIn]: [...HARDCODED_ROLE_NAMES] },
    },
  });

  for (const row of invalidRoles) {
    const fallback = await Role.findOne({
      where: { role_name: "STUDENT" },
    });
    if (fallback) {
      await User.update(
        { role_id: fallback.id },
        { where: { role_id: row.id } },
      );
    }
    await row.destroy();
    console.log(`Removed invalid role: ${row.role_name}`);
  }

  await seedAdminUser();
}

export async function seedAdminUser() {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    console.log("No ADMIN_EMAIL configured in environment. Skipping admin seed.");
    return;
  }

  const password = process.env.Admin_PASSWORD || process.env.ADMIN_PASSWORD || "Admin@123";
  const adminRole = await Role.findOne({ where: { role_name: "ADMIN" } });
  if (!adminRole) {
    console.warn("ADMIN role not found. Cannot seed admin user.");
    return;
  }

  const salt = await bcrypt.genSalt(10);

  for (const email of adminEmails) {
    const existing = await User.findOne({ where: { email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.create({
        name: "Admin User",
        email,
        password: hashedPassword,
        role_id: adminRole.id,
        status: "active",
      });
      console.log(`Successfully seeded admin user: ${email}`);
    } else {
      // Ensure the existing user has the ADMIN role
      if (existing.role_id !== adminRole.id) {
        existing.role_id = adminRole.id;
        await existing.save();
        console.log(`Updated existing user ${email} role to ADMIN`);
      }
    }
  }
}
