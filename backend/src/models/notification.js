import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "info",
      validate: {
        isIn: [
          [
            "fee_reminder",
            "fee_missed",
            "trainer_profile_complete",
            "new_student_enrollment",
            "fee_payment",
            "appointment_request",
            "info",
            "warning",
            "success",
            "error",
            "student_assigned_to_batch",
            "project_submission",
            "trainer_assigned_to_batch",
            "project_assigned",
            "project_deadline_reminder",
          ],
        ],
      },
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    related_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    related_data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    action_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  },
);

export default Notification;
