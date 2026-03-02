import express from "express";
import dotenv from "dotenv";
dotenv.config(); // always first

import prisma from "./lib/prisma";
import router from "./routes/router";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));