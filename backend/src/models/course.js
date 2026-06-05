import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Course = sequelize.define(
  "Course",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    duration_month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fees: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    department_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "departments", key: "id" },
    },
    /** Stores admin user id as string (legacy column is VARCHAR, not UUID FK) */
    created_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "courses",
  },
);

export default Course;
