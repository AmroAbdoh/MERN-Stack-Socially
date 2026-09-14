import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/error.middleware";
import { initSocket } from "./sockets";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import postRoutes from "./routes/post.routes";
import commentRoutes from "./routes/comment.routes";
import feedRoutes from "./routes/feed.routes";
import searchRoutes from "./routes/search.routes";
import notificationRoutes from "./routes/notification.routes";
import messageRoutes from "./routes/message.routes";

dotenv.config();

const app = express();

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social Media Platform API",
      version: "1.0.0",
      description: "REST API for the social media platform backend.",
    },
  },
  apis: [path.resolve(process.cwd(), "src/routes/**/*.ts")],
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later.",
  },
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(apiLimiter);
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api/feed", feedRoutes);
app.use("/search", searchRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initSocket(server);

const startServer = async (): Promise<void> => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error: Error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
