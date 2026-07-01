import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "refresh_tokens",
    timestamps: true,
  }
);

RefreshToken.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(RefreshToken, { foreignKey: "user_id" });

export default RefreshToken;
