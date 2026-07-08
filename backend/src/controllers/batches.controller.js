import { Op } from "sequelize";
import Batch from "../models/batch.js";
import BatchTrainer from "../models/batchTrainer.js";
import Course from "../models/course.js";
import Trainer from "../models/trainer.js";
import Student from "../models/student.js";
import User from "../models/user.js";
import Enrollment from "../models/enrollment.js";
import Fee from "../models/fee.js";
import Attendance from "../models/attendance.js";
import Installment from "../models/installment.js";
import Payment from "../models/payment.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  sendBatchAssignedToStudent,
  sendStudentAssignedToBatch,
  sendTrainerAssignedToBatch,
} from "../services/notification.service.js";

function formatTrainer(trainer) {
  const user = trainer?.User;
  return {
    id: trainer.id,
    name: user?.name || "Trainer",
    email: user?.email || "",
    status: user?.status || "inactive",
    specialization: trainer.specialization,
    experience_year: trainer.experience_year,
    salary: trainer.salary,
    profile_img: trainer.profile_img || "",
  };
}

function formatStudent(student) {
  const user = student?.User;
  return {
    id: student.id,
    name: user?.name || "Student",
    email: user?.email || "",
    status: user?.status || "inactive",
    student_code: student.student_code,
    phone: student.phone || "",
    address: student.address || "",
    college_name: student.college_name || "",
    qualification: student.qualification || "",
    joining_date: student.joining_date || "",
    profile_img: student.profile_img || "",
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
  const enrollment = student.Enrollments?.[0] || null;
  const batch = enrollment?.Batch || null;
  const course = batch?.Course || null;

  return {
    ...base,
    enrolled,
    fees,
    batch_name: batch?.batch_name || "Unassigned",
    course_title: course?.title || "Unassigned",
  };
}

function formatBatch(batch) {
  const enrollments = batch.Enrollments || [];
  const trainers = batch.trainers || [];
  return {
    id: batch.id,
    batch_name: batch.batch_name,
    start_date: batch.start_date,
    end_date: batch.end_date,
    course_id: batch.course_id,
    trainer: batch.trainer ? formatTrainer(batch.trainer) : (trainers.length > 0 ? formatTrainer(trainers[0]) : null),
    trainers: trainers.map(formatTrainer),
    students: enrollments
      .map((e) => (e.Student ? formatStudent(e.Student) : null))
      .filter(Boolean),
    student_count: enrollments.length,
  };
}

const batchInclude = [
  {
    model: Trainer,
    as: "trainer",
    include: [{ model: User, attributes: ["id", "name", "email"] }],
    required: false,
  },
  {
    model: Trainer,
    as: "trainers",
    include: [{ model: User, attributes: ["id", "name", "email"] }],
    required: false,
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

  res.json(trainers.map(formatTrainer));
});

export const listStudents = asyncHandler(async (_req, res) => {
  const students = await Student.findAll({
    include: [{ model: User, attributes: ["id", "name", "email", "status"] }],
    order: [[User, "name", "ASC"]],
  });

  res.json(students.map(formatStudent));
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
    include: [
      userInclude,
      { model: Fee, required: false },
      {
        model: Enrollment,
        required: false,
        include: [{ model: Batch, include: [{ model: Course }] }],
      },
    ],
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

  // Notify trainer about new batch assignment
  try {
    await sendTrainerAssignedToBatch(trainer.user_id, trainer.id, batch.batch_name, batch.id);
  } catch (err) {
    console.error("Error sending trainer assigned notification:", err);
  }

  const uniqueStudentIds = [
    ...new Set(
      (Array.isArray(student_ids) ? student_ids : []).filter(Boolean),
    ),
  ];

  if (uniqueStudentIds.length > 0) {
    const students = await Student.findAll({
      where: { id: uniqueStudentIds },
      include: [User],
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

    // Notify trainers about each assigned student
    try {
      for (const stud of students) {
        await sendStudentAssignedToBatch(
          stud.user_id,
          stud.id,
          stud.User?.name || "Unknown Student",
          batch.id,
          batch.batch_name
        );

        await sendBatchAssignedToStudent(
          stud.user_id,
          stud.id,
          batch.id,
          batch.batch_name,
        );
      }
    } catch (err) {
      console.error("Error sending student assigned to batch notification:", err);
    }
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
    trainer_ids,
    start_date,
    end_date,
    student_ids,
  } = req.body;

  // Retrieve old trainers to check who is newly added
  const oldTrainers = await batch.getTrainers();
  const oldTrainerIds = new Set(oldTrainers.map(t => t.id));

  if (batch_name !== undefined) {
    if (!String(batch_name).trim()) {
      res.status(400);
      throw new Error("Batch name cannot be empty");
    }
    batch.batch_name = String(batch_name).trim();
  }

  // Handle multiple trainers
  if (trainer_ids !== undefined && Array.isArray(trainer_ids)) {
    // Validate trainers exist
    const trainers = await Trainer.findAll({
      where: { id: trainer_ids },
    });

    if (trainers.length !== trainer_ids.length) {
      res.status(400);
      throw new Error("One or more trainers not found");
    }

    // Update primary trainer (first one for backward compatibility)
    if (trainers.length > 0) {
      batch.trainer_id = trainers[0].id;
    }

    // Update many-to-many relationship
    await batch.setTrainers(trainers);
  } else if (trainer_ids !== undefined && !Array.isArray(trainer_ids)) {
    // Handle single trainer_id for backward compatibility
    const trainer = await Trainer.findByPk(trainer_ids);
    if (!trainer) {
      res.status(400);
      throw new Error("Trainer not found");
    }
    batch.trainer_id = trainer_ids;
    await batch.setTrainers([trainer]);
  }

  if (start_date !== undefined) batch.start_date = start_date;
  if (end_date !== undefined) batch.end_date = end_date;

  if (batch.start_date > batch.end_date) {
    res.status(400);
    throw new Error("Start date must be before end date");
  }

  await batch.save();

  // Notify newly added trainers about batch assignment
  if (trainer_ids !== undefined) {
    try {
      const currentTrainers = await batch.getTrainers();
      const newlyAddedTrainers = currentTrainers.filter(t => !oldTrainerIds.has(t.id));
      for (const t of newlyAddedTrainers) {
        await sendTrainerAssignedToBatch(t.user_id, t.id, batch.batch_name, batch.id);
      }
    } catch (err) {
      console.error("Error sending trainer update assignment notification:", err);
    }
  }

  if (student_ids !== undefined) {
    const uniqueStudentIds = [
      ...new Set(
        (Array.isArray(student_ids) ? student_ids : []).filter(Boolean),
      ),
    ];

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
      const students = await Student.findAll({
        where: { id: toAdd },
        include: [{ model: User, attributes: ["id", "name", "email"] }],
      });

      if (students.length !== toAdd.length) {
        res.status(400);
        throw new Error("One or more selected students were not found");
      }

      // Check if students already have enrollments without a batch
      const existingEnrollmentsWithoutBatch = await Enrollment.findAll({
        where: {
          student_id: toAdd,
          batch_id: null
        }
      });

      const existingEnrollmentMap = new Map(
        existingEnrollmentsWithoutBatch.map(e => [e.student_id, e])
      );

      const today = new Date().toISOString().slice(0, 10);
      
      // Update existing enrollments without batch, or create new ones
      for (const student_id of toAdd) {
        if (existingEnrollmentMap.has(student_id)) {
          // Update existing enrollment
          const enrollment = existingEnrollmentMap.get(student_id);
          enrollment.batch_id = batch.id;
          enrollment.enrollment_date = today;
          enrollment.status = "ACTIVE";
          await enrollment.save();
        } else {
          // Create new enrollment
          await Enrollment.create({
            student_id,
            batch_id: batch.id,
            enrollment_date: today,
            status: "ACTIVE",
          });
        }
      }

      // Notify trainers about each assigned student
      try {
        for (const stud of students) {
          await sendStudentAssignedToBatch(
            stud.user_id,
            stud.id,
            stud.User?.name || "Unknown Student",
            batch.id,
            batch.batch_name
          );

          await sendBatchAssignedToStudent(
            stud.user_id,
            stud.id,
            batch.id,
            batch.batch_name,
          );
        }
      } catch (err) {
        console.error("Error sending student assigned to batch notification:", err);
      }
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
      {
        model: Fee,
        required: false,
        include: [
          { model: Installment, as: "installments" },
          { model: Payment, as: "payments" },
        ],
      },
      { model: Attendance, required: false },
      { 
        model: Enrollment, 
        include: [
          { 
            model: Batch, 
            include: [{ model: Course }] 
          }
        ] 
      },
    ],
  });

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  const fee = student.Fees?.[0];
  if (fee?.installments) {
    fee.installments.sort((a, b) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0));
  }

  res.json(student);
});

export const removeStudentFromBatch = asyncHandler(async (req, res) => {
  const { id: batchId } = req.params;
  const { studentId } = req.params;

  const batch = await Batch.findByPk(batchId);
  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  const enrollment = await Enrollment.findOne({
    where: {
      batch_id: batchId,
      student_id: studentId,
    },
  });

  if (!enrollment) {
    res.status(404);
    throw new Error("Student not enrolled in this batch");
  }

  await enrollment.destroy();

  res.json({ message: "Student removed from batch successfully" });
});

export const deleteBatch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const batch = await Batch.findByPk(id);
  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  // Safely clean up references
  await BatchTrainer.destroy({ where: { batch_id: id } });
  await Enrollment.destroy({ where: { batch_id: id } });
  await Attendance.destroy({ where: { batch_id: id } });
  
  // Dynamic imports for models not loaded at the top of batches.controller.js
  const Certificate = (await import("../models/certificate.js")).default;
  const Assessment = (await import("../models/assessment.js")).default;

  await Certificate.destroy({ where: { batch_id: id } });
  await Assessment.update({ batch_id: null }, { where: { batch_id: id } });

  await batch.destroy();

  res.json({ message: "Batch deleted successfully" });
});

