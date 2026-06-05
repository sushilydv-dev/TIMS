import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Project = sequelize.define(
  "Project",
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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deadline: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    assigned_by: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "projects",
  },
);

export default Project;
