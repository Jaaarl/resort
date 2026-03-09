import express from "express";
import dotenv from "dotenv";
dotenv.config(); // always first
import cors from "cors";
import prisma from "./lib/prisma";
import router from "./routes/router";
import { errorHandler } from "./middleware/error";
import { authLimiter } from "./middleware/rateLimit";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Middleware
app.use(express.json());
app.use(authLimiter);
// Health check
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error.message,
    });
  }
});

// Routes
app.use("/api", router);

// Global Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
