import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import routes from "./src/routes/index.js"
import sequelize from "./src/config/db.js"
import User from "./src/models/user.js"
import OTP from "./src/models/otp.js"
import Role from "./src/models/role.js"

// Define Sequelize Associations
User.hasOne(Role, { foreignKey: 'userId', as: 'roleRelation', onDelete: 'CASCADE' });
Role.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(OTP, { foreignKey: 'email', sourceKey: 'email', onDelete: 'CASCADE' });
OTP.belongsTo(User, { foreignKey: 'email', targetKey: 'email' });

dotenv.config()
const app = express()

app.use(cors());
app.use(express.json());
app.use("/api",routes)
const PORT = process.env.PORT

sequelize.sync({ alter: true })
    .then(()=>{
        console.log("database connected successfully")
        app.listen(PORT,()=>{
            console.log(`app listening at ${PORT}`)
        })
    }).catch((error)=>{
        console.log(`server connection failed:`,error)
    })