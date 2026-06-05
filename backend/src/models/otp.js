import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OTP = sequelize.define("OTP", {
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: "OTPs",
  timestamps: true,
});

export default OTP;
