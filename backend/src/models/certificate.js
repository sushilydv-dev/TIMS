import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Certificate = sequelize.define(
  "Certificate",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "students", key: "id" },
    },
    certificate_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    issue_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    certificate_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "certificates",
  },
);

export default Certificate;
