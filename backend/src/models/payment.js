import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Payment = sequelize.define(
  "Payment",
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
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    payment_methhod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "payment",
  },
);

export default Payment;
