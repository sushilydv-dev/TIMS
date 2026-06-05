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
      allowNull: false,
      references: { model: "courses", key: "id" },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    total_marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    assessment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    tableName: "assessment",
  },
);

export default Assessment;
