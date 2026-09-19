import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";
import jwt from "jsonwebtoken";

describe("Lab 3: Staff Ticket Detail API", () => {
  let staffToken: string;
  let requesterToken: string;
  let ticketId: number;

  beforeAll(async () => {
    const prisma = getPrisma();
    
    const staff = await prisma.user.create({
      data: {
        name: "Staff Detail Tester",
        email: "staffdetail@toktickit.com",
        passwordHash: "dummyhash",
        role: "IT Staff",
        isActive: true
      }
    });

    const reqUser = await prisma.user.create({
      data: {
        name: "Req Detail Tester",
        email: "reqdetail@toktickit.com",
        passwordHash: "dummyhash",
        role: "Requester",
        isActive: true
      }
    });

    const category = await prisma.category.findFirst();
    const system = await prisma.relatedSystem.findFirst();

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-TEST-DETAIL",
        summary: "Test Detail",
        description: "Desc",
        categoryId: category!.id,
        relatedSystemId: system!.id,
        requesterId: reqUser.id
      }
    });
    ticketId = ticket.id;

    const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
    staffToken = jwt.sign({ id: staff.id, email: staff.email, role: staff.role }, secret);
    requesterToken = jwt.sign({ id: reqUser.id, email: reqUser.email, role: reqUser.role }, secret);
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.ticket.deleteMany({ where: { ticketNumber: "TKT-TEST-DETAIL" } });
    await prisma.user.deleteMany({
      where: { email: { contains: "detail@toktickit.com" } }
    });
  });

  it("should allow IT Staff to update ticket status and owner", async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .set("Cookie", `token=${staffToken}`)
      .send({ status: "In Progress", itPriority: "High" });
      
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("In Progress");
    expect(res.body.itPriority).toBe("High");
  });

  it("should block Requester from updating ticket status", async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}`)
      .set("Cookie", `token=${requesterToken}`)
      .send({ status: "Closed" });
      
    expect(res.status).toBe(403);
  });
});
