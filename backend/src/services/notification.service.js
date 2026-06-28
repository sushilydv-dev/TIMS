import { createNotification } from "../controllers/notification.controller.js";
import User from "../models/user.js";
import Role from "../models/role.js";
import Batch from "../models/batch.js";
import Trainer from "../models/trainer.js";

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

// Create and emit notification
export const sendNotification = async (data) => {
  try {
    console.log("Creating notification with data:", data);
    const notification = await createNotification(data);
    console.log("Notification created:", notification.id);
    emitNotification(data.user_id, notification);
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
export const sendFeeReminder = async (userId, studentId, studentName, amount, dueDate) => {
  console.log(`Sending fee reminder for student ${studentName}, amount: ₹${amount}, due: ${dueDate}`);
  return sendToAdmins({
    title: "Fee Payment Due Soon",
    message: `Student ${studentName} has a fee payment of ₹${amount} due within 24 hours (Due: ${dueDate})`,
    type: "fee_reminder",
    related_user_id: userId,
    related_data: { studentName, amount, dueDate, studentId },
    action_url: `/dashboard/students?studentId=${studentId}`,
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
