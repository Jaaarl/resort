import express from "express";
import dotenv from "dotenv";
dotenv.config();
import authRoutes from "./routes/auth";
import prisma from "./lib/prisma";



const app = express();
app.use(express.json());

app.use("/auth", authRoutes);

app.listen(3000, () => console.log("Server running on http://localhost:3000"));

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error: any) {
    res.status(500).json({ 
      status: "error", 
      database: "disconnected", 
      message: error.message,
      code: error.code,
      meta: error.meta
    });
  }
});