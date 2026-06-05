import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import routes from "./src/routes/index.js"
import sequelize from "./src/config/db.js"
import "./src/models/associations.js"
import { seedRoles } from "./src/config/seedRoles.js"
import { seedDepartments } from "./src/config/seedDepartments.js"
import { seedMissingRoleProfiles } from "./src/config/seedRoleProfiles.js"
import { syncDatabase } from "./src/config/syncDatabase.js"
import { notFound, errorHandler } from "./src/middlewares/errormiddleware.js"

dotenv.config()
const app = express()

app.use(cors());
app.use(express.json());
app.use("/api", routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT

syncDatabase()
    .then(async () => {
        await seedRoles();
        await seedDepartments();
        await seedMissingRoleProfiles();
        console.log("database connected successfully");
        app.listen(PORT, () => {
            console.log(`app listening at ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(`server connection failed:`, error);
    });