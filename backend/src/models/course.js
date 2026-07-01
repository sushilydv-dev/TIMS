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
    /** File path for the course thumbnail image */
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    /** YouTube embed URL or direct video URL for the course demo */
    demo_video_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    /** JSON array of outcome/skill bullet-point strings */
    outcomes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    tableName: "courses",
  },
);

export default Course;
