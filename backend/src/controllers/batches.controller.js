import { Op } from "sequelize";
import Batch from "../models/batch.js";
import Course from "../models/course.js";
import Trainer from "../models/trainer.js";
import Student from "../models/student.js";
import User from "../models/user.js";
import Enrollment from "../models/enrollment.js";
import Fee from "../models/fee.js";
import Attendance from "../models/attendance.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function formatTrainer(trainer) {
  const user = trainer?.User;
  return {
    id: trainer.id,
    name: user?.name || "Trainer",
    email: user?.email || "",
    specialization: trainer.specialization,
  };
}

function formatStudent(student) {
  const user = student?.User;
  return {
    id: student.id,
    name: user?.name || "Student",
    email: user?.email || "",
    student_code: student.student_code,
  };
}

function summarizeFees(fees = []) {
  if (!fees.length) {
    return {
      payment_status: "NONE",
      total_amount: 0,
      paid_amount: 0,
      due_amount: 0,
    };
  }

  const total_amount = fees.reduce(
    (sum, fee) => sum + Number(fee.total_amount || 0),
    0,
  );
  const paid_amount = fees.reduce(
    (sum, fee) => sum + Number(fee.paid_ammount ?? fee.paid_amount ?? 0),
    0,
  );
  const due_amount = fees.reduce(
    (sum, fee) => sum + Number(fee.due_amount || 0),
    0,
  );

  let payment_status = "PENDING";
  if (total_amount > 0 && due_amount <= 0) {
    payment_status = "PAID";
  } else if (paid_amount > 0 && due_amount > 0) {
    payment_status = "PARTIAL";
  } else if (
    fees.some((fee) => String(fee.payment_status).toUpperCase() === "OVERDUE")
  ) {
    payment_status = "OVERDUE";
  } else {
    const raw = String(fees[0]?.payment_status || "PENDING").toUpperCase();
    if (["PAID", "PARTIAL", "PENDING", "OVERDUE"].includes(raw)) {
      payment_status = raw;
    }
  }

  return {
    payment_status,
    total_amount,
    paid_amount,
    due_amount,
  };
}

function formatStudentBrowseRow(student, enrolled) {
  const base = formatStudent(student);
  const fees = summarizeFees(student.Fees || []);

  return {
    ...base,
    enrolled,
    fees,
  };
}

function formatBatch(batch) {
  const enrollments = batch.Enrollments || [];
  return {
    id: batch.id,
    batch_name: batch.batch_name,
    start_date: batch.start_date,
    end_date: batch.end_date,
    course_id: batch.course_id,
    trainer: batch.Trainer ? formatTrainer(batch.Trainer) : null,
    students: enrollments
      .map((e) => (e.Student ? formatStudent(e.Student) : null))
      .filter(Boolean),
    student_count: enrollments.length,
  };
}

const batchInclude = [
  {
    model: Trainer,
    include: [{ model: User, attributes: ["id", "name", "email"] }],
  },
  {
    model: Enrollment,
    include: [
      {
        model: Student,
        include: [{ model: User, attributes: ["id", "name", "email"] }],
      },
    ],
  },
];

export const listTrainers = asyncHandler(async (_req, res) => {
  const trainers = await Trainer.findAll({
    include: [{ model: User, attributes: ["id", "name", "email", "status"] }],
    order: [[User, "name", "ASC"]],
  });

  res.json(
    trainers
      .filter((t) => t.User?.status === "active")
      .map(formatTrainer),
  );
});

export const listStudents = asyncHandler(async (_req, res) => {
  const students = await Student.findAll({
    include: [{ model: User, attributes: ["id", "name", "email", "status"] }],
    order: [[User, "name", "ASC"]],
  });

  res.json(
    students
      .filter((s) => s.User?.status === "active")
      .map(formatStudent),
  );
});

export const browseStudents = asyncHandler(async (req, res) => {
  const offset = Math.max(0, Number.parseInt(req.query.offset, 10) || 0);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
  );
  const search = String(req.query.search || "").trim();
  const batchId = req.query.batch_id || null;
  const selectedIds = String(req.query.selected_ids || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const enrolledFromBatch = batchId
    ? (
        await Enrollment.findAll({
          where: { batch_id: batchId },
          attributes: ["student_id"],
        })
      ).map((row) => row.student_id)
    : [];

  const enrolledSet = new Set([...enrolledFromBatch, ...selectedIds]);

  const userInclude = {
    model: User,
    attributes: ["id", "name", "email", "status"],
    where: { status: "active" },
    required: true,
  };

  const where = {};
  if (search) {
    where[Op.or] = [
      { student_code: { [Op.iLike]: `%${search}%` } },
      { "$User.name$": { [Op.iLike]: `%${search}%` } },
      { "$User.email$": { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Student.findAndCountAll({
    where,
    include: [userInclude, { model: Fee, required: false }],
    order: [[User, "name", "ASC"]],
    offset,
    limit,
    distinct: true,
    subQuery: false,
  });

  res.json({
    students: rows.map((student) =>
      formatStudentBrowseRow(student, enrolledSet.has(student.id)),
    ),
    total: count,
    offset,
    limit,
  });
});

export const listCourseBatches = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findByPk(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const batches = await Batch.findAll({
    where: { course_id: courseId },
    include: batchInclude,
    order: [["start_date", "DESC"]],
  });

  res.json(batches.map(formatBatch));
});

export const listAllBatches = asyncHandler(async (req, res) => {
  const batches = await Batch.findAll({
    include: [
      ...batchInclude,
      { model: Course, attributes: ["id", "title"] },
    ],
    order: [["start_date", "DESC"]],
  });

  res.json(
    batches.map((b) => {
      const formatted = formatBatch(b);
      formatted.course_title = b.Course?.title || "";
      return formatted;
    })
  );
});

export const createBatch = asyncHandler(async (req, res) => {
  const {
    course_id,
    batch_name,
    trainer_id,
    start_date,
    end_date,
    student_ids,
  } = req.body;

  if (!course_id || !batch_name?.trim() || !trainer_id || !start_date || !end_date) {
    res.status(400);
    throw new Error("Course, batch name, trainer, and dates are required");
  }

  const course = await Course.findByPk(course_id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const trainer = await Trainer.findByPk(trainer_id);
  if (!trainer) {
    res.status(400);
    throw new Error("Trainer not found");
  }

  const batch = await Batch.create({
    course_id,
    trainer_id,
    batch_name: batch_name.trim(),
    start_date,
    end_date,
    assigned_by: req.user?.id ? String(req.user.id) : null,
  });

  const uniqueStudentIds = [
    ...new Set(
      (Array.isArray(student_ids) ? student_ids : []).filter(Boolean),
    ),
  ];

  if (uniqueStudentIds.length > 0) {
    const students = await Student.findAll({
      where: { id: uniqueStudentIds },
    });

    if (students.length !== uniqueStudentIds.length) {
      res.status(400);
      throw new Error("One or more selected students were not found");
    }

    const today = new Date().toISOString().slice(0, 10);
    await Enrollment.bulkCreate(
      students.map((student) => ({
        student_id: student.id,
        batch_id: batch.id,
        enrollment_date: today,
        status: "ACTIVE",
      })),
    );
  }

  const full = await Batch.findByPk(batch.id, { include: batchInclude });
  res.status(201).json(formatBatch(full));
});

export const getBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByPk(req.params.id, { include: batchInclude });

  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  res.json(formatBatch(batch));
});

export const updateBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByPk(req.params.id);

  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  const {
    batch_name,
    trainer_id,
    start_date,
    end_date,
    student_ids,
  } = req.body;

  if (batch_name !== undefined) {
    if (!String(batch_name).trim()) {
      res.status(400);
      throw new Error("Batch name cannot be empty");
    }
    batch.batch_name = String(batch_name).trim();
  }

  if (trainer_id !== undefined) {
    const trainer = await Trainer.findByPk(trainer_id);
    if (!trainer) {
      res.status(400);
      throw new Error("Trainer not found");
    }
    batch.trainer_id = trainer_id;
  }

  if (start_date !== undefined) batch.start_date = start_date;
  if (end_date !== undefined) batch.end_date = end_date;

  if (batch.start_date > batch.end_date) {
    res.status(400);
    throw new Error("Start date must be before end date");
  }

  await batch.save();

  if (student_ids !== undefined) {
    const uniqueStudentIds = [
      ...new Set(
        (Array.isArray(student_ids) ? student_ids : []).filter(Boolean),
      ),
    ];

    if (uniqueStudentIds.length > 0) {
      const students = await Student.findAll({
        where: { id: uniqueStudentIds },
      });

      if (students.length !== uniqueStudentIds.length) {
        res.status(400);
        throw new Error("One or more selected students were not found");
      }
    }

    const existing = await Enrollment.findAll({
      where: { batch_id: batch.id },
    });

    const existingIds = new Set(existing.map((e) => e.student_id));
    const targetIds = new Set(uniqueStudentIds);

    const toRemove = existing.filter((e) => !targetIds.has(e.student_id));
    if (toRemove.length > 0) {
      await Enrollment.destroy({
        where: { id: toRemove.map((e) => e.id) },
      });
    }

    const toAdd = uniqueStudentIds.filter((id) => !existingIds.has(id));
    if (toAdd.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      await Enrollment.bulkCreate(
        toAdd.map((student_id) => ({
          student_id,
          batch_id: batch.id,
          enrollment_date: today,
          status: "ACTIVE",
        })),
      );
    }
  }

  const full = await Batch.findByPk(batch.id, { include: batchInclude });
  res.json(formatBatch(full));
});

export const getStudentDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findByPk(id, {
    include: [
      { model: User, attributes: ["id", "name", "email", "status"] },
      { model: Fee, required: false },
      { model: Attendance, required: false },
    ],
  });

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  res.json(student);
});
