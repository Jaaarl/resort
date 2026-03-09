import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../lib/prisma";
import { authenticate, AuthRequest } from "../../middleware/auth";
import { Role } from "../../generated/prisma/enums";
import { authLimiter } from "../../middleware/rateLimit";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: role && Object.values(Role).includes(role) ? role : Role.STAFF,
      },
    });
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      // Unique constraint failed
      res.status(400).json({ error: "Email already exists" });
    } else {
      res.status(500).json({ error: "Server error", details: error.message });
    }
  }
});

// Login
router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    },
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // password excluded
    },
  });
  res.json(user);
});

export default router;
