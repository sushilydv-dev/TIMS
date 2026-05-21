import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Role = sequelize.define("Role", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    role: {
        type: DataTypes.STRING(40),
        allowNull: false,
        defaultValue: "STUDENT"
    }
});

export default Role;