import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Batch = sequelize.define(
  "Batch",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "courses", key: "id" },
    },
    trainer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "trainers", key: "id" },
    },
    batch_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    assigned_by: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "batches",
  },
);

export default Batch;
