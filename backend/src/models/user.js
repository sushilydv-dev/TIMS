import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User =sequelize.define("User",{
    name:{
        type:DataTypes.STRING(40),
        allowNull:false,

    },
    email:{
        type:DataTypes.STRING(100),
        allowNull:false,
        unique:true,
        validate:{
            isEmail:true,
        }

    },
    password:{
        type:DataTypes.STRING(100),
        allowNull:false
    }
})
export default User;