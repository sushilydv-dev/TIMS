import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CertificateSettings = sequelize.define(
  "CertificateSettings",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    attendance_threshold: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 75.00,
      allowNull: false,
    },
    allow_bypass: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    verification_domain: {
      type: DataTypes.STRING,
      defaultValue: "sushildev.in",
      allowNull: false,
    },
    certificate_template_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "certificate_settings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default CertificateSettings;
