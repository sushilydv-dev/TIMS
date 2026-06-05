import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Attendance = sequelize.define(
  "Attendance",
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
    attendance_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    marked_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "attendance",
  },
);

export default Attendance;
