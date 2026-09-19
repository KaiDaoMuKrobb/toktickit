import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";
import jwt from "jsonwebtoken";

describe("Lab 3: Staff Ticket Queue API", () => {
  let staffToken: string;
  let requesterToken: string;

  beforeAll(async () => {
    const prisma = getPrisma();
    
    const staff = await prisma.user.create({
      data: {
        name: "Staff Queue Tester",
        email: "staffqueue@toktickit.com",
        passwordHash: "dummyhash",
        role: "IT Staff",
        isActive: true
      }
    });

    const reqUser = await prisma.user.create({
      data: {
        name: "Req Queue Tester",
        email: "reqqueue@toktickit.com",
        passwordHash: "dummyhash",
        role: "Requester",
        isActive: true
      }
    });

    const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
    staffToken = jwt.sign({ id: staff.id, email: staff.email, role: staff.role }, secret);
    requesterToken = jwt.sign({ id: reqUser.id, email: reqUser.email, role: reqUser.role }, secret);
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.user.deleteMany({
      where: { email: { contains: "queue@toktickit.com" } }
    });
  });

  it("should block Requesters from accessing queue", async () => {
    const res = await request(app)
      .get("/api/tickets/queue")
      .set("Cookie", `token=${requesterToken}`);
      
    expect(res.status).toBe(403);
  });

  it("should allow IT Staff to access queue", async () => {
    const res = await request(app)
      .get("/api/tickets/queue")
      .set("Cookie", `token=${staffToken}`);
      
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.meta).toBeDefined();
  });
});
