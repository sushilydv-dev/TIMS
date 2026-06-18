import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Installment = sequelize.define(
  "Installment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fee_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "fees", key: "id" },
    },
    installment_label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount_due: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount_settled: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "PENDING",
    },
    razorpay_order_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpay_payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    razorpay_signature: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sequence_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "installments",
  },
);

export default Installment;
