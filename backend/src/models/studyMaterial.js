import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StudyMaterial = sequelize.define(
  "StudyMaterial",
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
    file_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    material_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uploaded_by: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "study_material",
  },
);

export default StudyMaterial;
