import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Syllabus = sequelize.define(
  "Syllabus",
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
    topic_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sequence_order: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "syllabus",
  },
);

export default Syllabus;
