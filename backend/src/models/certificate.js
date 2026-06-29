import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Certificate = sequelize.define(
  "Certificate",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "students", key: "id" },
    },
    batch_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "batches", key: "id" },
    },
    certificate_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    verification_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    certificate_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "issued", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
    attendance_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    bypass_approved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    approved_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "certificates",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Certificate;
