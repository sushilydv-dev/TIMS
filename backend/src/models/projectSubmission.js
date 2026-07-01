import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ProjectSubmission = sequelize.define(
  "ProjectSubmission",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "projects", key: "id" },
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "students", key: "id" },
    },
    GitHub_link: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: "",
    },
    submitted_at: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
  },
  {
    tableName: "project_submisssions",
  },
);

export default ProjectSubmission;
