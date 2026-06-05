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
      references: { model: "assessment", key: "id" },
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "students", key: "id" },
    },
    marks_obtained: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "assessment_result",
  },
);

export default AssessmentResult;
