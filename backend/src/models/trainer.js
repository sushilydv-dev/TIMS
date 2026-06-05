import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Trainer = sequelize.define(
  "Trainer",
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
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    experience_year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    salary: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "trainers",
  },
);

export default Trainer;
