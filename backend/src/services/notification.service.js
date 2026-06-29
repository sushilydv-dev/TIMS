import { createNotification } from "../controllers/notification.controller.js";
import { Op } from "sequelize";
import User from "../models/user.js";
import Role from "../models/role.js";
import Batch from "../models/batch.js";
import Trainer from "../models/trainer.js";
import Enrollment from "../models/enrollment.js";
import Student from "../models/student.js";
import Notification from "../models/notification.js";
import ProjectSubmission from "../models/projectSubmission.js";

// Helper function to format notification for client (so it matches getNotifications structure)
const formatNotificationForClient = (n) => {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    read: n.is_read,
    relatedUserId: n.related_user_id,
    relatedUserName: null,
    relatedData: n.related_data,
    actionUrl: n.action_url,
    time: "Just now",
  };
};

// Helper function to emit notification via Socket.IO
const emitNotification = (userId, notification) => {
  if (global.io) {
    const formatted = formatNotificationForClient(notification);
    global.io.to(userId).emit("new_notification", formatted);
  }
};

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const hasNotification = async ({
  userId,
  type,
  relatedDataContains = null,
  since = null,
}) => {
  const where = {
    user_id: userId,
    type,
  };

  if (since) {
    where.created_at = { [Op.gte]: since };
  }

  if (relatedDataContains) {
    where.related_data = { [Op.contains]: relatedDataContains };
  }

  const existing = await Notification.findOne({ where });
  return Boolean(existing);
};

const createAndEmitNotification = async (data) => {
  const notification = await createNotification(data);
  emitNotification(data.user_id, notification);
  return notification;
};

const getCourseStudentRecipients = async (courseId) => {
  const enrollments = await Enrollment.findAll({
    where: {
      batch_id: { [Op.ne]: null },
    },
    include: [
      {
        model: Batch,
        attributes: ["id", "batch_name", "course_id"],
        where: { course_id: courseId },
        required: true,
      },
      {
        model: Student,
        required: true,
        include: [{ model: User, attributes: ["id", "name"] }],
      },
    ],
  });

  const recipients = new Map();

  for (const enrollment of enrollments) {
    const student = enrollment.Student;
    const user = student?.User;
    if (!student?.id || !student?.user_id || !user?.id) {
      continue;
    }

    if (!recipients.has(student.id)) {
      recipients.set(student.id, {
        studentId: student.id,
        studentUserId: student.user_id,
        studentName: user.name || "Student",
        batchId: enrollment.Batch?.id || null,
        batchName: enrollment.Batch?.batch_name || "",
      });
    }
  }

  return Array.from(recipients.values());
};

const createNotificationsForStudents = async (recipients, buildNotification) => {
  const notifications = [];

  for (const recipient of recipients) {
    const payload = buildNotification(recipient);
    if (!payload) {
      continue;
    }

    const notification = await createAndEmitNotification({
      ...payload,
      user_id: recipient.studentUserId,
    });

    notifications.push(notification);
  }

  return notifications;
};

// Create and emit notification
export const sendNotification = async (data) => {
  try {
    console.log("Creating notification with data:", data);
    const notification = await createAndEmitNotification(data);
    console.log("Notification created:", notification.id);
    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

// Send notification to all admins
export const sendToAdmins = async (data) => {
  try {
    console.log("=== SEND TO ADMINS START ===");
    console.log("Notification data:", data);
    
    const admins = await User.findAll({
      include: [
        {
          model: Role,
          as: "role",
          where: { role_name: "ADMIN" },
        },
      ],
      attributes: ["id", "name", "email"],
    });

    console.log(`Found ${admins.length} admins to send notification to`);
    
    if (admins.length === 0) {
      console.warn("No admin users found in database!");
      console.warn("Notifications will not be sent because there are no admin users");
      return [];
    }

    console.log("Admin users:", admins.map(a => ({ id: a.id, name: a.name, email: a.email })));

    const notifications = await Promise.all(
      admins.map((admin) =>
        createNotification({
          ...data,
          user_id: admin.id,
        })
      )
    );

    console.log(`Successfully created ${notifications.length} notifications`);
    
    notifications.forEach((notification) => {
      console.log(`Emitting notification to admin ${notification.user_id}`);
      emitNotification(notification.user_id, notification);
    });

    console.log(`Successfully sent ${notifications.length} notifications to admins`);
    console.log("=== SEND TO ADMINS END ===");
    return notifications;
  } catch (error) {
    console.error("Error sending notification to admins:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
};

// Fee reminder notification (24 hours before due date)
export const sendFeeReminder = async (
  userId,
  studentId,
  studentName,
  amount,
  dueDate,
  installmentId = null,
) => {
  console.log(`Sending fee reminder for student ${studentName}, amount: ₹${amount}, due: ${dueDate}`);
  return sendToAdmins({
    title: "Fee Payment Due Soon",
    message: `Student ${studentName} has a fee payment of ₹${amount} due within 24 hours (Due: ${dueDate})`,
    type: "fee_reminder",
    related_user_id: userId,
    related_data: { studentName, amount, dueDate, studentId, installmentId },
    action_url: `/dashboard/students?studentId=${studentId}`,
  });
};

export const sendStudentFeeReminder = async (
  studentUserId,
  studentId,
  amount,
  dueDate,
  installmentId,
) => {
  const alreadySent = await hasNotification({
    userId: studentUserId,
    type: "fee_reminder",
    relatedDataContains: { installmentId },
    since: startOfToday(),
  });

  if (alreadySent) {
    return null;
  }

  return sendNotification({
    title: "Fee Payment Due Soon",
    message: `Your fee payment of ₹${amount} is due within 24 hours (Due: ${dueDate}).`,
    type: "fee_reminder",
    user_id: studentUserId,
    related_user_id: studentUserId,
    related_data: { studentId, amount, dueDate, installmentId },
    action_url: "/dashboard?tab=fees",
  });
};

// Fee missed notification
export const sendFeeMissed = async (userId, studentId, studentName, amount, missedDate) => {
  return sendToAdmins({
    title: "Fee Payment Missed",
    message: `Student ${studentName} missed the fee payment deadline of ₹${amount} on ${missedDate}`,
    type: "fee_missed",
    related_user_id: userId,
    related_data: { studentName, amount, missedDate, studentId },
    action_url: `/dashboard/students?studentId=${studentId}`,
  });
};

// Trainer profile completed notification
export const sendTrainerProfileComplete = async (trainerUserId, trainerId, trainerName) => {
  console.log("=== SEND TRAINER PROFILE COMPLETE NOTIFICATION ===");
  console.log("Trainer ID:", trainerId);
  console.log("Trainer Name:", trainerName);
  
  try {
    const result = await sendToAdmins({
      title: "Trainer Profile Completed",
      message: `Trainer ${trainerName} has completed their profile setup and is ready to be assigned to a batch`,
      type: "trainer_profile_complete",
      related_user_id: trainerUserId,
      related_data: { trainerName, trainerId },
      action_url: `/dashboard/trainers?trainerId=${trainerId}`,
    });
    
    console.log("Trainer profile notification result:", result);
    console.log("=== END TRAINER PROFILE COMPLETE NOTIFICATION ===");
    return result;
  } catch (error) {
    console.error("Error in sendTrainerProfileComplete:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
};

// New student enrollment notification
export const sendNewStudentEnrollment = async (studentUserId, studentId, studentName, courseName) => {
  return sendToAdmins({
    title: "New Student Enrolled",
    message: `Student ${studentName} has enrolled in ${courseName}`,
    type: "new_student_enrollment",
    related_user_id: studentUserId,
    related_data: { studentName, courseName, studentId },
    action_url: `/dashboard/students?studentId=${studentId}`,
  });
};

// Fee payment received notification
export const sendFeePayment = async (userId, studentId, studentName, amount, paymentDate) => {
  return sendToAdmins({
    title: "Fee Payment Received",
    message: `Student ${studentName} has paid ₹${amount} on ${paymentDate}`,
    type: "fee_payment",
    related_user_id: userId,
    related_data: { studentName, amount, paymentDate, studentId },
    action_url: `/dashboard/students?studentId=${studentId}`,
  });
};

// New appointment request notification
export const sendNewAppointmentRequest = async (appointmentId, clientName, preferredDate) => {
  return sendToAdmins({
    title: "New Appointment Request",
    message: `New appointment request from ${clientName} for ${preferredDate}`,
    type: "appointment_request",
    related_user_id: null,
    related_data: { clientName, preferredDate, appointmentId },
    action_url: `/dashboard/appointment-requests`,
  });
};

// Helper to notify all trainers assigned to a batch (both primary and co-trainers)
const notifyTrainersOfBatch = async (batchId, notificationData) => {
  try {
    const batch = await Batch.findByPk(batchId, {
      include: [
        {
          model: Trainer,
          as: "trainer",
          include: [{ model: User, attributes: ["id"] }]
        },
        {
          model: Trainer,
          as: "trainers",
          include: [{ model: User, attributes: ["id"] }]
        }
      ]
    });

    if (!batch) {
      console.log(`notifyTrainersOfBatch: Batch ${batchId} not found`);
      return;
    }

    const userIds = new Set();
    if (batch.trainer && batch.trainer.User) {
      userIds.add(batch.trainer.User.id);
    }
    if (Array.isArray(batch.trainers)) {
      batch.trainers.forEach(t => {
        if (t.User) userIds.add(t.User.id);
      });
    }

    console.log(`notifyTrainersOfBatch: Found ${userIds.size} trainers for batch ${batch.batch_name || batchId}`);

    const promises = Array.from(userIds).map(async (userId) => {
      const notification = await createNotification({
        ...notificationData,
        user_id: userId,
      });
      emitNotification(userId, notification);
    });

    await Promise.all(promises);
  } catch (error) {
    console.error("Error in notifyTrainersOfBatch:", error);
  }
};

// Notify trainers when a new student is assigned to their batch
export const sendStudentAssignedToBatch = async (studentUserId, studentId, studentName, batchId, batchName) => {
  console.log(`=== SEND STUDENT ASSIGNED TO BATCH NOTIFICATION ===`);
  await notifyTrainersOfBatch(batchId, {
    title: "New Student Assigned to Batch",
    message: `Student ${studentName} has been assigned to your batch: ${batchName}`,
    type: "student_assigned_to_batch",
    related_user_id: studentUserId,
    related_data: { studentName, studentId, batchId, batchName },
    action_url: `/dashboard/trainer/batches/${batchId}`
  });
};

export const sendBatchAssignedToStudent = async (
  studentUserId,
  studentId,
  batchId,
  batchName,
) => {
  return sendNotification({
    title: "Assigned to New Batch",
    message: `You have been assigned to batch: ${batchName}`,
    type: "student_assigned_to_batch",
    user_id: studentUserId,
    related_user_id: studentUserId,
    related_data: { studentId, batchId, batchName },
    action_url: "/dashboard",
  });
};

// Notify trainers when a student submits a project
export const sendProjectSubmitted = async (studentUserId, studentId, studentName, projectId, projectTitle, batchId, batchName) => {
  console.log(`=== SEND PROJECT SUBMISSION NOTIFICATION ===`);
  await notifyTrainersOfBatch(batchId, {
    title: "Project Submitted",
    message: `${studentName} has submitted project: ${projectTitle}`,
    type: "project_submission",
    related_user_id: studentUserId,
    related_data: { studentName, studentId, projectId, projectTitle, batchId, batchName },
    action_url: `/dashboard/trainer/batches/${batchId}`
  });
};

export const sendProjectAssignedToStudents = async (
  courseId,
  projectId,
  projectTitle,
  deadline,
  assignedByName = "Trainer",
) => {
  const recipients = await getCourseStudentRecipients(courseId);

  return createNotificationsForStudents(recipients, (recipient) => ({
    title: "New Project Assigned",
    message: `${assignedByName} assigned a new project: ${projectTitle}${deadline ? ` (Due: ${deadline})` : ""}`,
    type: "project_assigned",
    related_user_id: null,
    related_data: {
      projectId,
      projectTitle,
      deadline,
      courseId,
      batchId: recipient.batchId,
      batchName: recipient.batchName,
    },
    action_url: "/dashboard/student/projects",
  }));
};

export const sendProjectDeadlineReminderToStudents = async (
  courseId,
  projectId,
  projectTitle,
  deadline,
) => {
  const recipients = await getCourseStudentRecipients(courseId);
  if (!recipients.length) {
    return [];
  }

  const existingSubmissions = await ProjectSubmission.findAll({
    where: {
      project_id: projectId,
      student_id: recipients.map((recipient) => recipient.studentId),
    },
    attributes: ["student_id"],
  });

  const submittedStudentIds = new Set(
    existingSubmissions.map((submission) => submission.student_id),
  );

  const created = [];

  for (const recipient of recipients) {
    if (submittedStudentIds.has(recipient.studentId)) {
      continue;
    }

    const alreadySent = await hasNotification({
      userId: recipient.studentUserId,
      type: "project_deadline_reminder",
      relatedDataContains: { projectId },
      since: startOfToday(),
    });

    if (alreadySent) {
      continue;
    }

    const notification = await createAndEmitNotification({
      title: "Project Deadline Tomorrow",
      message: `Your project "${projectTitle}" is due within 24 hours (Due: ${deadline}).`,
      type: "project_deadline_reminder",
      user_id: recipient.studentUserId,
      related_user_id: recipient.studentUserId,
      related_data: {
        projectId,
        projectTitle,
        deadline,
        courseId,
        studentId: recipient.studentId,
      },
      action_url: "/dashboard/student/projects",
    });

    created.push(notification);
  }

  return created;
};

// Notify a trainer when they are assigned to a batch
export const sendTrainerAssignedToBatch = async (trainerUserId, trainerId, batchName, batchId) => {
  console.log(`=== SEND TRAINER ASSIGNED TO BATCH NOTIFICATION ===`);
  try {
    const notification = await createNotification({
      title: "Assigned to New Batch",
      message: `You have been assigned to batch: ${batchName}`,
      type: "trainer_assigned_to_batch",
      user_id: trainerUserId,
      related_user_id: trainerUserId,
      related_data: { trainerId, batchId, batchName },
      action_url: `/dashboard/trainer/batches/${batchId}`
    });
    emitNotification(trainerUserId, notification);
  } catch (error) {
    console.error("Error sending trainer assigned to batch notification:", error);
  }
};
