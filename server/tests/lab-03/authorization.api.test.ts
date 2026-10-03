import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";
import jwt from "jsonwebtoken";

describe("Lab 3: Authorization API", () => {
  let adminToken: string;
  let requesterToken: string;

  beforeAll(async () => {
    const prisma = getPrisma();
    
    const admin = await prisma.user.create({
      data: {
        name: "Authz Admin",
        email: "authzadmin@toktickit.com",
        passwordHash: "dummyhash",
        role: "Administrator",
        isActive: true
      }
    });

    const reqUser = await prisma.user.create({
      data: {
        name: "Authz Requester",
        email: "authzreq@toktickit.com",
        passwordHash: "dummyhash",
        role: "Requester",
        isActive: true
      }
    });

    const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
    adminToken = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, secret);
    requesterToken = jwt.sign({ id: reqUser.id, email: reqUser.email, role: reqUser.role }, secret);
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.user.deleteMany({
      where: { email: { contains: "authz" } }
    });
  });

  it("should block unauthenticated requests with 401 Unauthorized", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("should block unauthorized role access with 403 Forbidden", async () => {
    // Requesters should not access users list
    const res = await request(app)
      .get("/api/users")
      .set("Cookie", `token=${requesterToken}`);
    expect(res.status).toBe(403);
  });

  it("should allow authorized role access", async () => {
    // Admins can access users list
    const res = await request(app)
      .get("/api/users")
      .set("Cookie", `token=${adminToken}`);
    expect(res.status).toBe(200);
  });
});
