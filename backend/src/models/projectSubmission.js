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
      type: DataTypes.STRING,
      allowNull: false,
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    submitted_at: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    marks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    feedback: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "project_submisssions",
  },
);

export default ProjectSubmission;
