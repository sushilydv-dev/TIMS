import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AssessmentResult = sequelize.define(
  "AssessmentResult",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assessment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "assessments", key: "id" },
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "students", key: "id" },
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    obtained_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_marks: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    passed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    submitted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "assessment_results",
    underscored: true,
  },
);

export default AssessmentResult;
