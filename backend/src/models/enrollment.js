import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Enrollment = sequelize.define(
  "Enrollment",
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
    enrollment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "enrollments",
  },
);

export default Enrollment;
