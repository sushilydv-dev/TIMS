import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Op, literal, fn, col } from "sequelize";
import User from "../models/user.js";
import Role from "../models/role.js";
import InviteToken from "../models/inviteToken.js";
import Trainer from "../models/trainer.js";
import Hr from "../models/hr.js";
import Batch from "../models/batch.js";
import Course from "../models/course.js";
import Department from "../models/department.js";
import Payment from "../models/payment.js";
import Enrollment from "../models/enrollment.js";
import Student from "../models/student.js";
import sequelize from "../config/db.js";
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

export const listTrainersBrowse = asyncHandler(async (req, res) => {
  const { search, page, limit, offset } = req.query;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const offsetNum =
    offset !== undefined
      ? Math.max(0, parseInt(offset, 10) || 0)
      : (pageNum - 1) * limitNum;

  const term = String(search || "").trim();
  const userWhere = {};
  if (term) {
    userWhere[Op.or] = [
      { name: { [Op.iLike]: `%${term}%` } },
      { email: { [Op.iLike]: `%${term}%` } },
    ];
  }

  const { count, rows: trainers } = await Trainer.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ["id", "name", "email", "status"],
        where: Object.keys(userWhere).length ? userWhere : undefined,
        required: true,
      },
      {
        model: Batch,
        attributes: ["id", "batch_name"],
        required: false,
      },
    ],
    order: [[literal('"User.name"'), "ASC"]],
    limit: limitNum,
    offset: offsetNum,
    distinct: true,
  });

  // Compute stats from the full unfiltered set for accuracy
  const allTrainers = await Trainer.findAll({
    include: [
      {
        model: User,
        attributes: ["status"],
        required: true,
      },
    ],
  });

  const totalActive = allTrainers.filter((t) => t.User?.status === "active").length;
  const avgExp =
    allTrainers.length > 0
      ? Math.round(
          allTrainers.reduce((sum, t) => sum + (Number(t.experience_year) || 0), 0) /
            allTrainers.length,
        )
      : 0;

  const totalPages = Math.max(Math.ceil(count / limitNum), 1);

  res.json({
    trainers: trainers.map((t) => ({
      id: t.id,
      specialization: t.specialization,
      experience_year: t.experience_year,
      salary: t.salary,
      profile_img: t.profile_img || "",
      User: t.User,
      Batches: t.Batches || [],
    })),
    total: count,
    totalPages,
    page: pageNum,
    limit: limitNum,
    stats: {
      totalCount: allTrainers.length,
      activeCount: totalActive,
      avgExp,
    },
  });
});

export const updateTrainerProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    status,
    specialization,
    experience_year,
    salary,
    profile_img,
    batch_ids,
  } = req.body;

  const trainer = await Trainer.findByPk(id, {
    include: [{ model: User }],
  });

  if (!trainer) {
    res.status(404);
    throw new Error("Trainer not found");
  }

  const user = trainer.User;
  if (!user) {
    res.status(404);
    throw new Error("Associated User not found");
  }

  if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const existing = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      res.status(400);
      throw new Error("Email is already taken by another user");
    }
  }

  await sequelize.transaction(async (t) => {
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (status !== undefined) {
      if (user.id === req.user.id) {
        res.status(400);
        throw new Error("You cannot change your own status");
      }
      user.status = status;
    }
    await user.save({ transaction: t });

    if (specialization !== undefined) trainer.specialization = specialization;
    if (experience_year !== undefined) trainer.experience_year = parseInt(experience_year, 10) || 0;
    if (salary !== undefined) trainer.salary = parseInt(salary, 10) || 0;
    if (profile_img !== undefined) trainer.profile_img = profile_img;
    await trainer.save({ transaction: t });

    if (batch_ids !== undefined) {
      const cleanBatchIds = Array.isArray(batch_ids) ? batch_ids.filter(Boolean) : [];

      // Only assign batches to this trainer — never null out trainer_id
      // (trainer_id is NOT NULL; unassigning a batch must be done via batch management)
      if (cleanBatchIds.length > 0) {
        await Batch.update(
          { trainer_id: trainer.id },
          {
            where: { id: { [Op.in]: cleanBatchIds } },
            transaction: t,
          }
        );
      }
    }
  });

  const updatedTrainer = await Trainer.findByPk(trainer.id, {
    include: [{ model: User }, { model: Batch, attributes: ["id", "batch_name"] }],
  });

  res.json({
    message: "Trainer profile updated successfully",
    trainer: {
      id: updatedTrainer.id,
      specialization: updatedTrainer.specialization,
      experience_year: updatedTrainer.experience_year,
      salary: updatedTrainer.salary,
      profile_img: updatedTrainer.profile_img || "",
      User: updatedTrainer.User,
      Batches: updatedTrainer.Batches || [],
    },
  });
});

export const listHrDetailed = asyncHandler(async (req, res) => {
  const { search, page, limit, offset } = req.query;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const offsetNum = offset !== undefined ? Math.max(0, parseInt(offset, 10) || 0) : (pageNum - 1) * limitNum;

  const term = String(search || "").trim();
  const userWhere = {};
  if (term) {
    userWhere[Op.or] = [
      { name: { [Op.iLike]: `%${term}%` } },
      { email: { [Op.iLike]: `%${term}%` } },
    ];
  }

  const { count, rows: hrList } = await Hr.findAndCountAll({
    include: [
      {
        model: User,
        attributes: ["id", "name", "email", "status"],
        where: Object.keys(userWhere).length ? userWhere : undefined,
        required: true,
      },
    ],
    order: [[literal('"User.name"'), "ASC"]],
    limit: limitNum,
    offset: offsetNum,
    distinct: true,
  });

  const totalPages = Math.max(Math.ceil(count / limitNum), 1);

  res.json({
    hrList: hrList.map((h) => ({
      id: h.id,
      profile_img: h.profile_img || "",
      User: h.User,
    })),
    total: count,
    totalPages,
    page: pageNum,
    limit: limitNum,
  });
});

export const updateHrProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, status, profile_img } = req.body;

  const hr = await Hr.findByPk(id, {
    include: [{ model: User }],
  });

  if (!hr) {
    res.status(404);
    throw new Error("HR Coordinator not found");
  }

  const user = hr.User;
  if (!user) {
    res.status(404);
    throw new Error("Associated User not found");
  }

  if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const existing = await User.findOne({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      res.status(400);
      throw new Error("Email is already taken by another user");
    }
  }

  await sequelize.transaction(async (t) => {
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email.trim().toLowerCase();
    if (status !== undefined) {
      if (user.id === req.user.id) {
        res.status(400);
        throw new Error("You cannot change your own status");
      }
      user.status = status;
    }
    await user.save({ transaction: t });

    if (profile_img !== undefined) hr.profile_img = profile_img;
    await hr.save({ transaction: t });
  });

  const updatedHr = await Hr.findByPk(hr.id, {
    include: [{ model: User }],
  });

  res.json({
    message: "HR Coordinator profile updated successfully",
    hr: {
      id: updatedHr.id,
      profile_img: updatedHr.profile_img || "",
      User: updatedHr.User,
    },
  });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Total active users
  const totalActiveUsers = await User.count({
    where: { status: "active" }
  });

  // Total courses offered
  const totalCourses = await Course.count();

  // Total departments
  const totalDepartments = await Department.count();

  // Month to date revenue
  const mtdRevenue = await Payment.sum('amount', {
    where: {
      status: 'SUCCESS',
      [Op.and]: [
        sequelize.where(fn('EXTRACT', literal('YEAR FROM payment_date')), currentYear),
        sequelize.where(fn('EXTRACT', literal('MONTH FROM payment_date')), currentMonth)
      ]
    }
  }) || 0;

  // Monthly enrollment data for line chart (last 12 months)
  const monthlyEnrollments = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(currentYear, currentMonth - i - 1, 1);
    const monthYear = monthDate.getFullYear();
    const monthNum = monthDate.getMonth() + 1;
    
    const count = await Enrollment.count({
      where: {
        [Op.and]: [
          sequelize.where(
            fn('EXTRACT', literal('YEAR FROM enrollment_date')),
            monthYear
          ),
          sequelize.where(
            fn('EXTRACT', literal('MONTH FROM enrollment_date')),
            monthNum
          )
        ]
      },
      include: [{
        model: Student,
        required: true,
        include: [{
          model: User,
          where: { status: 'active' },
          required: true
        }]
      }]
    });

    monthlyEnrollments.push({
      month: monthDate.toLocaleString('default', { month: 'short' }),
      year: monthYear,
      monthNum,
      count: count || 0
    });
  }

  // Revenue data for different time periods
  const yearlyRevenue = [];
  for (let i = 4; i >= 0; i--) {
    const year = currentYear - i;
    const revenue = await Payment.sum('amount', {
      where: {
        status: 'SUCCESS',
        [Op.and]: [
          sequelize.where(fn('EXTRACT', literal('YEAR FROM payment_date')), year)
        ]
      }
    }) || 0;

    yearlyRevenue.push({
      year: year.toString(),
      revenue: revenue || 0
    });
  }

  const quarterlyRevenue = [];
  for (let i = 7; i >= 0; i--) {
    const quarterDate = new Date(currentYear, currentMonth - (i * 3), 1);
    const quarterYear = quarterDate.getFullYear();
    const quarterMonth = quarterDate.getMonth() + 1;
    const quarter = Math.ceil(quarterMonth / 3);
    
    const revenue = await Payment.sum('amount', {
      where: {
        status: 'SUCCESS',
        [Op.and]: [
          sequelize.where(fn('EXTRACT', literal('YEAR FROM payment_date')), quarterYear),
          sequelize.where(fn('EXTRACT', literal('QUARTER FROM payment_date')), quarter)
        ]
      }
    }) || 0;

    quarterlyRevenue.push({
      label: `Q${quarter} ${quarterYear}`,
      year: quarterYear,
      quarter,
      revenue: revenue || 0
    });
  }

  const monthlyRevenue = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(currentYear, currentMonth - i - 1, 1);
    const monthYear = monthDate.getFullYear();
    const monthNum = monthDate.getMonth() + 1;
    
    const revenue = await Payment.sum('amount', {
      where: {
        status: 'SUCCESS',
        [Op.and]: [
          sequelize.where(fn('EXTRACT', literal('YEAR FROM payment_date')), monthYear),
          sequelize.where(fn('EXTRACT', literal('MONTH FROM payment_date')), monthNum)
        ]
      }
    }) || 0;

    monthlyRevenue.push({
      month: monthDate.toLocaleString('default', { month: 'short' }),
      year: monthYear,
      revenue: revenue || 0
    });
  }

  // Students by department for donut chart
  const departments = await Department.findAll({
    include: [{
      model: Course,
      include: [{
        model: Batch,
        include: [{
          model: Enrollment,
          where: { status: { [Op.in]: ['ACTIVE', 'active'] } },
          required: true,
          include: [{
            model: Student,
            required: true,
            include: [{
              model: User,
              where: { status: 'active' },
              required: true
            }]
          }]
        }]
      }]
    }]
  });

  const departmentStats = departments.map(dept => {
    let studentCount = 0;
    dept.Courses.forEach(course => {
      course.Batches.forEach(batch => {
        studentCount += batch.Enrollments.length;
      });
    });

    return {
      name: dept.name,
      count: studentCount
    };
  }).filter(d => d.count > 0);

  // Course popularity (active student counts per course)
  const courses = await Course.findAll({
    include: [{
      model: Batch,
      include: [{
        model: Enrollment,
        where: { status: { [Op.in]: ['ACTIVE', 'active'] } },
        required: true
      }]
    }]
  });

  const courseStats = courses.map(course => {
    let count = 0;
    course.Batches.forEach(batch => {
      count += batch.Enrollments.length;
    });
    return {
      name: course.title,
      count
    };
  }).filter(c => c.count > 0);

  // User Role Distribution
  const rolesList = await Role.findAll({
    include: [{
      model: User,
      where: { status: 'active' },
      required: false
    }]
  });
  const roleStats = rolesList.map(r => ({
    name: r.role_name,
    count: r.Users ? r.Users.length : 0
  })).filter(r => r.count > 0);

  res.json({
    stats: {
      totalActiveUsers,
      totalCourses,
      totalDepartments,
      mtdRevenue
    },
    charts: {
      monthlyEnrollments,
      yearlyRevenue,
      quarterlyRevenue,
      monthlyRevenue,
      departmentStats,
      courseStats,
      roleStats
    }
  });
});

