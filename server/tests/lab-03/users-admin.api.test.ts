import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";
import jwt from "jsonwebtoken";

describe("Lab 3: Admin User Management APIs", () => {
  let adminToken: string;
  let adminId: number;
  let requesterToken: string;

  beforeAll(async () => {
    const prisma = getPrisma();
    
    // Clear previous tests
    await prisma.user.deleteMany({
      where: { email: { contains: "admintester" } }
    });
    
    // Create an Admin
    const admin = await prisma.user.create({
      data: {
        name: "Admin Tester",
        email: "admintester@toktickit.com",
        passwordHash: "dummyhash",
        role: "Administrator",
        isActive: true
      }
    });
    adminId = admin.id;

    // Create a Requester
    const reqUser = await prisma.user.create({
      data: {
        name: "Requester Tester",
        email: "reqtester@toktickit.com",
        passwordHash: "dummyhash",
        role: "Requester",
        isActive: true
      }
    });

    const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
    adminToken = jwt.sign({ id: admin.id, role: admin.role, mustChangePassword: false }, secret);
    requesterToken = jwt.sign({ id: reqUser.id, role: reqUser.role, mustChangePassword: false }, secret);
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.user.deleteMany({
      where: { email: { contains: "tester@toktickit.com" } }
    });
  });

  it("API-04: Should block Admin self-deactivation", async () => {
    const res = await request(app)
      .patch(`/api/users/${adminId}`)
      .set("Cookie", [`token=${adminToken}`])
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Cannot deactivate your own account");
  });

  it("API-07: Should prevent creating duplicate email users", async () => {
    // Create a user first
    await request(app)
      .post("/api/users")
      .set("Cookie", [`token=${adminToken}`])
      .send({
        name: "Dup Tester",
        email: "duptester@toktickit.com",
        role: "IT Staff",
        password: "password123"
      });

    // Try to create again with same email
    const res = await request(app)
      .post("/api/users")
      .set("Cookie", [`token=${adminToken}`])
      .send({
        name: "Dup Tester 2",
        email: "duptester@toktickit.com",
        role: "Requester",
        password: "password123"
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Email already in use");
  });
});
