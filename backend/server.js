import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { createServer } from "http"
import { Server } from "socket.io"
import routes from "./src/routes/index.js"
import sequelize from "./src/config/db.js"
import "./src/models/associations.js"
import { seedRoles } from "./src/config/seedRoles.js"
import { seedDepartments } from "./src/config/seedDepartments.js"
import { seedMissingRoleProfiles } from "./src/config/seedRoleProfiles.js"
import { syncDatabase } from "./src/config/syncDatabase.js"
import { notFound, errorHandler } from "./src/middlewares/errormiddleware.js"
import { deleteOldNotifications } from "./src/controllers/notification.controller.js"
import {
  checkFeeReminders,
  checkMissedFees,
  checkProjectDeadlineReminders,
} from "./src/jobs/notificationJobs.js"

dotenv.config()
const app = express()

// Create HTTP server and Socket.IO BEFORE CORS middleware
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.FRONTEND_URL === origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  },
})

// Make io globally accessible
global.io = io

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  socket.on("join", (userId) => {
    socket.join(userId)
    console.log(`User ${userId} joined their room`)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use("/api", routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000

syncDatabase()
    .then(async () => {
        await seedRoles();
        await seedDepartments();
        await seedMissingRoleProfiles();
        console.log("database connected successfully");
        
        // Start scheduled jobs
        // Delete old notifications (every 24 hours)
        setInterval(deleteOldNotifications, 24 * 60 * 60 * 1000);
        
        // Check for fee reminders (every hour)
        setInterval(checkFeeReminders, 60 * 60 * 1000);
        
        // Check for missed fees (every hour)
        setInterval(checkMissedFees, 60 * 60 * 1000);

        // Check for project deadline reminders (every hour)
        setInterval(checkProjectDeadlineReminders, 60 * 60 * 1000);
        
        httpServer.listen(PORT, () => {
            console.log(`app listening at ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(`server connection failed:`, error);
    });
