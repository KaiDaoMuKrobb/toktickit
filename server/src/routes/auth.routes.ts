import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPrisma } from "../prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Invalid credentials or inactive account" });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  });

  return res.json(payload);
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out" });
});

router.get("/me", authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, mustChangePassword: true, isActive: true }
  });

  if (!user || !user.isActive) {
    res.clearCookie("token");
    return res.status(401).json({ message: "Account is no longer active" });
  }

  return res.json(user);
});

router.post("/change-password", authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new password are required" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "New password must be at least 8 characters" });
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!validPassword) {
    return res.status(400).json({ message: "Incorrect current password" });
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash, mustChangePassword: false }
  });

  // Re-issue token with mustChangePassword = false
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: false
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 8 * 60 * 60 * 1000
  });

  return res.json({ message: "Password updated successfully" });
});

export default router;
