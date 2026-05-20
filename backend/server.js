import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import routes from "./src/routes/index.js"
import sequelize from "./src/config/db.js"
import "./src/models/user.js"
import "./src/models/otp.js"

dotenv.config()
const app = express()

app.use(cors());
app.use(express.json());
app.use("/api",routes)
const PORT = process.env.PORT
sequelize.sync()
    .then(()=>{
        console.log("database connected successfully")
        app.listen(PORT,()=>{
            console.log(`app listening at ${PORT}`)
        })
    }).catch((error)=>{
        console.log(`server connection failed:`,error)
    })