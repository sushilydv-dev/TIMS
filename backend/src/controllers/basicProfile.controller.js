import Student from "../models/student.js";
import Trainer from "../models/trainer.js";
import Hr from "../models/hr.js";
import User from "../models/user.js";
import Enrollment from "../models/enrollment.js";
import Batch from "../models/batch.js";
import Course from "../models/course.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getUserRoleForClient } from "../utils/roleHelpers.js";

const isAdminOrHr = (role) =>
  role === "ADMIN" || role === "HR" || role === "HR_COORDINATOR";

const trainerCanViewStudent = async (trainerUserId, studentId) => {
  const trainer = await Trainer.findOne({ where: { user_id: trainerUserId } });
  if (!trainer) return false;

  const enrollment = await Enrollment.findOne({
    where: { student_id: studentId },
    include: [
      {
        model: Batch,
        where: { trainer_id: trainer.id },
        required: true,
      },
    ],
  });

  return !!enrollment;
};

const studentCanViewTrainer = async (studentUserId, trainerId) => {
  const student = await Student.findOne({ where: { user_id: studentUserId } });
  if (!student) return false;

  const enrollment = await Enrollment.findOne({
    where: { student_id: student.id },
    include: [
      {
        model: Batch,
        where: { trainer_id: trainerId },
        required: true,
      },
    ],
  });

  return !!enrollment;
};

const formatBasicStudent = (student) => {
  const enrollment = student.Enrollments?.[0];
  const batch = enrollment?.Batch;
  const course = batch?.Course;

  return {
    profile_type: "student",
    id: student.id,
    user_id: student.user_id,
    name: student.User?.name || "",
    email: student.User?.email || "",
    status: student.User?.status || "",
    profile_img: student.profile_img || student.User?.profile_img || "",
    student_code: student.student_code || "",
    phone: student.phone || "",
    address: student.address || "",
    college_name: student.college_name || "",
    qualification: student.qualification || "",
    joining_date: student.joining_date || null,
    course_title: course?.title || "",
    batch_name: batch?.batch_name || "",
    enrollment_status: enrollment?.status || "",
  };
};

const formatBasicTrainer = (trainer) => ({
  profile_type: "trainer",
  id: trainer.id,
  user_id: trainer.user_id,
  name: trainer.User?.name || "",
  email: trainer.User?.email || "",
  status: trainer.User?.status || "",
  profile_img: trainer.profile_img || trainer.User?.profile_img || "",
  specialization: trainer.specialization || "",
  experience_year: trainer.experience_year ?? null,
  batches: (trainer.Batches || []).map((b) => b.batch_name).filter(Boolean),
});

const formatBasicHr = (hr) => ({
  profile_type: "hr",
  id: hr.id,
  user_id: hr.user_id,
  name: hr.User?.name || "",
  email: hr.User?.email || "",
  status: hr.User?.status || "",
  profile_img: hr.profile_img || hr.User?.profile_img || "",
});

const formatBasicUser = (user, roleName) => ({
  profile_type: "user",
  id: user.id,
  user_id: user.id,
  name: user.name || "",
  email: user.email || "",
  status: user.status || "",
  profile_img: user.profile_img || "",
  role: roleName || "",
});

export const getBasicProfile = asyncHandler(async (req, res) => {
  const { type, id } = req.params;
  const viewerRole = await getUserRoleForClient(req.user);

  if (type === "student") {
    const student = await Student.findByPk(id, {
      include: [
        { model: User, attributes: ["id", "name", "email", "status", "profile_img"] },
        {
          model: Enrollment,
          required: false,
          include: [
            {
              model: Batch,
              include: [{ model: Course, attributes: ["id", "title"] }],
            },
          ],
        },
      ],
    });

    if (!student) {
      res.status(404);
      throw new Error("Student not found");
    }

    const allowed =
      isAdminOrHr(viewerRole) ||
      student.user_id === req.user.id ||
      (viewerRole === "TRAINER" && (await trainerCanViewStudent(req.user.id, student.id)));

    if (!allowed) {
      res.status(403);
      throw new Error("Access denied");
    }

    return res.json(formatBasicStudent(student));
  }

  if (type === "trainer") {
    const trainer = await Trainer.findByPk(id, {
      include: [
        { model: User, attributes: ["id", "name", "email", "status", "profile_img"] },
        { model: Batch, attributes: ["id", "batch_name"], required: false },
      ],
    });

    if (!trainer) {
      res.status(404);
      throw new Error("Trainer not found");
    }

    const allowed =
      isAdminOrHr(viewerRole) ||
      trainer.user_id === req.user.id ||
      (viewerRole === "STUDENT" && (await studentCanViewTrainer(req.user.id, trainer.id)));

    if (!allowed) {
      res.status(403);
      throw new Error("Access denied");
    }

    return res.json(formatBasicTrainer(trainer));
  }

  if (type === "hr") {
    if (!isAdminOrHr(viewerRole)) {
      res.status(403);
      throw new Error("Access denied");
    }

    const hr = await Hr.findByPk(id, {
      include: [{ model: User, attributes: ["id", "name", "email", "status", "profile_img"] }],
    });

    if (!hr) {
      res.status(404);
      throw new Error("HR profile not found");
    }

    return res.json(formatBasicHr(hr));
  }

  if (type === "user") {
    if (viewerRole !== "ADMIN") {
      res.status(403);
      throw new Error("Admin access required");
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const targetRole = await getUserRoleForClient(user);

    if (targetRole === "STUDENT") {
      const student = await Student.findOne({
        where: { user_id: user.id },
        include: [
          { model: User, attributes: ["id", "name", "email", "status", "profile_img"] },
          {
            model: Enrollment,
            required: false,
            include: [{ model: Batch, include: [{ model: Course, attributes: ["id", "title"] }] }],
          },
        ],
      });
      if (student) return res.json(formatBasicStudent(student));
    }

    if (targetRole === "TRAINER") {
      const trainer = await Trainer.findOne({
        where: { user_id: user.id },
        include: [
          { model: User, attributes: ["id", "name", "email", "status", "profile_img"] },
          { model: Batch, attributes: ["id", "batch_name"], required: false },
        ],
      });
      if (trainer) return res.json(formatBasicTrainer(trainer));
    }

    if (targetRole === "HR" || targetRole === "HR_COORDINATOR") {
      const hr = await Hr.findOne({
        where: { user_id: user.id },
        include: [{ model: User, attributes: ["id", "name", "email", "status", "profile_img"] }],
      });
      if (hr) return res.json(formatBasicHr(hr));
    }

    return res.json(formatBasicUser(user, targetRole));
  }

  res.status(400);
  throw new Error("Invalid profile type");
});
