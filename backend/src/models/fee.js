import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Fee = sequelize.define(
  "Fee",
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
    base_amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    discount_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    payment_scheme_mode: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "FULL",
    },
    scholarship_tag: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    total_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    paid_ammount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    due_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "fees",
  },
);

export default Fee;
