import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Assessment = sequelize.define(
  "Assessment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "courses", key: "id" },
    },
    batch_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "batches", key: "id" },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    questions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    total_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    passing_marks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
  },
  {
    tableName: "assessments",
    underscored: true,
  },
);

export default Assessment;
