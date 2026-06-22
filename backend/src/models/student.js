import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Student = sequelize.define(
  "Student",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: "users", key: "id" },
    },
    student_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "0",
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    college_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
    qualification: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    profile_img: {
      type: DataTypes.TEXT,     // TEXT to support base64 avatar images
      allowNull: false,
      defaultValue: "",
    },
  },
  {
    tableName: "students",
  },
);

export default Student;
