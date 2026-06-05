import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import User from "../models/user.js";
import Role from "../models/role.js";
import InviteToken from "../models/inviteToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendTemplateEmail } from "../utils/emailService.js";
import {
  getCanonicalRoleByName,
  getUserRoleForClient,
  toClientRole,
} from "../utils/roleHelpers.js";
import { normalizeRoleName } from "../config/roles.js";
import { isAdminEmail } from "../config/adminEmails.js";
import { ensureRoleProfile } from "../utils/ensureRoleProfile.js";

const INVITE_ROLES = ["TRAINER", "HR", "STUDENT"];

function displayRoleName(roleName) {
  const normalized = normalizeRoleName(roleName);
  const labels = {
    TRAINER: "Trainer",
    HR: "HR Coordinator",
    STUDENT: "Student",
  };
  return labels[normalized] ?? normalized;
}

function nameFromEmail(email) {
  const local = email.split("@")[0] || "User";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildActivationLink(token) {
  const base = (process.env.FRONTEND_URL || "http://localhost:5173").replace(
    /\/$/,
    "",
  );
  return `${base}/activate-account?token=${encodeURIComponent(token)}`;
}

const DEFAULT_PAGE_SIZE = 10;

function parsePaginationQuery(query) {
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE, 1),
    100,
  );
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const offset =
    query.offset !== undefined
      ? Math.max(parseInt(query.offset, 10) || 0, 0)
      : (page - 1) * limit;

  return { limit, offset, page: Math.floor(offset / limit) + 1 };
}

function buildUserSearchWhere(search) {
  const term = String(search || "").trim();
  if (!term) return {};

  const pattern = `%${term}%`;
  return {
    [Op.or]: [
      { name: { [Op.iLike]: pattern } },
      { email: { [Op.iLike]: pattern } },
    ],
  };
}

export const listUsers = asyncHandler(async (req, res) => {
  const { limit, offset, page } = parsePaginationQuery(req.query);
  const search = req.query.search || req.query.q || "";
  const where = buildUserSearchWhere(search);

  const { count, rows: users } = await User.findAndCountAll({
    where,
    attributes: { exclude: ["password"] },
    include: [{ model: Role, as: "role", attributes: ["role_name"] }],
    order: [["name", "ASC"]],
    limit,
    offset,
    distinct: true,
  });

  const mappedUsers = await Promise.all(
    users.map(async (u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      role: await getUserRoleForClient(u),
    })),
  );

  const [totalUsers, activeCount, inactiveCount, suspendedCount] =
    await Promise.all([
      User.count(),
      User.count({ where: { status: "active" } }),
      User.count({ where: { status: "inactive" } }),
      User.count({ where: { status: "suspended" } }),
    ]);

  const totalPages = Math.max(Math.ceil(count / limit), 1);

  res.json({
    users: mappedUsers,
    pagination: {
      total: count,
      limit,
      offset,
      page,
      totalPages,
      hasNextPage: offset + limit < count,
      hasPrevPage: offset > 0,
    },
    stats: {
      total: totalUsers,
      active: activeCount,
      inactive: inactiveCount,
      suspended: suspendedCount,
    },
  });
});

export const inviteUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email?.trim() || !password || !role) {
    res.status(400);
    throw new Error("Email, password, and role are required");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = normalizeRoleName(role);

  if (!INVITE_ROLES.includes(normalizedRole)) {
    res.status(400);
    throw new Error("Role must be Trainer, HR, or Student");
  }

  if (isAdminEmail(normalizedEmail)) {
    res.status(400);
    throw new Error("Use ADMIN_EMAIL configuration for admin accounts");
  }

  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const roleRecord = await getCanonicalRoleByName(normalizedRole);
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const displayName = nameFromEmail(normalizedEmail);

  const user = await User.create({
    name: displayName,
    email: normalizedEmail,
    password: hashedPassword,
    role_id: roleRecord.id,
    status: "inactive",
  });

  await ensureRoleProfile(user, normalizedRole);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await InviteToken.destroy({ where: { user_id: user.id } });
  await InviteToken.create({
    token: rawToken,
    user_id: user.id,
    expiresAt,
  });

  const activationLink = buildActivationLink(rawToken);
  const clientRole = toClientRole(normalizedRole);

  await sendTemplateEmail(process.env.AUTH_TRAINER_HR_INVITE, {
    to_email: normalizedEmail,
    email: normalizedEmail,
    name: displayName,
    role: displayRoleName(normalizedRole),
    activationLink,
    activation_link: activationLink,
  });

  res.status(201).json({
    message: "Invitation sent successfully",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      role: clientRole,
    },
  });
});

const ALLOWED_STATUSES = ["active", "inactive", "suspended"];

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Status must be active, inactive, or suspended");
  }

  const target = await User.findByPk(id);

  if (!target) {
    res.status(404);
    throw new Error("User not found");
  }

  if (target.id === req.user.id) {
    res.status(400);
    throw new Error("You cannot change your own account status");
  }

  if (status === "suspended" && isAdminEmail(target.email)) {
    res.status(400);
    throw new Error("Administrator accounts cannot be deactivated");
  }

  target.status = status;
  await target.save();

  if (status === "suspended") {
    await InviteToken.destroy({ where: { user_id: target.id } });
  }

  res.json({
    message:
      status === "suspended"
        ? "User deactivated successfully"
        : "User status updated successfully",
    user: {
      id: target.id,
      name: target.name,
      email: target.email,
      status: target.status,
      role: await getUserRoleForClient(target),
    },
  });
});
