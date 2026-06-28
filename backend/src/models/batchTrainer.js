import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const BatchTrainer = sequelize.define(
  "BatchTrainer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    batch_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "batches", key: "id" },
    },
    trainer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "trainers", key: "id" },
    },
  },
  {
    tableName: "batch_trainers",
    timestamps: false,
  },
);

export default BatchTrainer;
