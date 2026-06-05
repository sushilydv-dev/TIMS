import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CourseModule = sequelize.define(
  "CourseModule",
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
    sequence_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    learning_items: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    tableName: "course_modules",
  },
);

export default CourseModule;
