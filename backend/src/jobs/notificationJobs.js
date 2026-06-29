import Installment from "../models/installment.js";
import Fee from "../models/fee.js";
import Student from "../models/student.js";
import User from "../models/user.js";
import Notification from "../models/notification.js";
import Project from "../models/project.js";
import {
  sendFeeReminder,
  sendFeeMissed,
  sendStudentFeeReminder,
  sendProjectDeadlineReminderToStudents,
} from "../services/notification.service.js";
import { Op } from "sequelize";

// Check for installments due within 24 hours and send reminders
export const checkFeeReminders = async () => {
  try {
    console.log("Running checkFeeReminders job...");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    console.log(`Checking for installments due on: ${tomorrowStr}`);

    // Find installments due tomorrow that are not paid
    const dueInstallments = await Installment.findAll({
      where: {
        due_date: tomorrowStr,
        status: { [Op.ne]: "PAID" },
      },
      include: [
        {
          model: Fee,
          as: "fee",
          include: [
            {
              model: Student,
              include: [{ model: User, attributes: ["id", "name"] }],
            },
          ],
        },
      ],
    });

    console.log(`Found ${dueInstallments.length} installments due tomorrow`);

    for (const installment of dueInstallments) {
      const student = installment.fee?.Student;
      const studentName = student?.User?.name || "Unknown";
      const amount = installment.amount_due;
      const dueDate = installment.due_date;

      // Check if an admin reminder notification already exists for this installment today
      const existingReminder = await Notification.findOne({
        where: {
          type: "fee_reminder",
          related_data: {
            [Op.contains]: { installmentId: installment.id },
          },
          created_at: {
            [Op.gte]: todayStr,
          },
        },
      });

      if (!existingReminder && student) {
        await sendFeeReminder(
          student.user_id,
          student.id,
          studentName,
          amount,
          dueDate,
          installment.id,
        );
        console.log(`Fee reminder sent for student ${studentName}, amount: ₹${amount}`);
      }

      if (student) {
        await sendStudentFeeReminder(
          student.user_id,
          student.id,
          amount,
          dueDate,
          installment.id,
        );
      }

      if (existingReminder) {
        console.log(`Reminder already sent for student ${studentName} today`);
      }
    }
  } catch (error) {
    console.error("Error in checkFeeReminders:", error);
  }
};

// Check for installments that have missed their due date and send notifications
export const checkMissedFees = async () => {
  try {
    console.log("Running checkMissedFees job...");
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    console.log(`Checking for installments due on: ${yesterdayStr}`);

    // Find installments that were due yesterday and are still not paid
    const missedInstallments = await Installment.findAll({
      where: {
        due_date: yesterdayStr,
        status: { [Op.ne]: "PAID" },
      },
      include: [
        {
          model: Fee,
          as: "fee",
          include: [
            {
              model: Student,
              include: [{ model: User, attributes: ["id", "name"] }],
            },
          ],
        },
      ],
    });

    console.log(`Found ${missedInstallments.length} missed installments`);

    for (const installment of missedInstallments) {
      const student = installment.fee?.Student;
      const studentName = student?.User?.name || "Unknown";
      const amount = installment.amount_due;
      const missedDate = installment.due_date;

      // Check if a missed fee notification already exists for this installment today
      const existingMissed = await Notification.findOne({
        where: {
          type: "fee_missed",
          related_user_id: student?.user_id,
          created_at: {
            [Op.gte]: todayStr,
          },
        },
      });

      if (!existingMissed && student) {
        await sendFeeMissed(student.user_id, student.id, studentName, amount, missedDate);
        console.log(`Fee missed notification sent for student ${studentName}, amount: ₹${amount}`);
      } else if (existingMissed) {
        console.log(`Missed fee notification already sent for student ${studentName} today`);
      }
    }
  } catch (error) {
    console.error("Error in checkMissedFees:", error);
  }
};

export const checkProjectDeadlineReminders = async () => {
  try {
    console.log("Running checkProjectDeadlineReminders job...");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);

    const projects = await Project.findAll({
      where: { deadline: tomorrowStr },
    });

    console.log(`Found ${projects.length} projects with deadline on ${tomorrowStr}`);

    for (const project of projects) {
      const deadlineStart = new Date(`${project.deadline}T00:00:00`);
      const assignedAt = new Date(project.createdAt);

      if (
        Number.isNaN(deadlineStart.getTime()) ||
        Number.isNaN(assignedAt.getTime())
      ) {
        continue;
      }

      const leadTimeMs = deadlineStart.getTime() - assignedAt.getTime();
      if (leadTimeMs <= 24 * 60 * 60 * 1000) {
        continue;
      }

      await sendProjectDeadlineReminderToStudents(
        project.course_id,
        project.id,
        project.title,
        project.deadline,
      );
    }
  } catch (error) {
    console.error("Error in checkProjectDeadlineReminders:", error);
  }
};
