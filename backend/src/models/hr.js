import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Hr = sequelize.define(
  "Hr",
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
    profile_img: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
    },
  },
  {
    tableName: "hr",
  },
);

export default Hr;
