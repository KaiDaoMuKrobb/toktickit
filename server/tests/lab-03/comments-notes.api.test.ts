import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app";
import { getPrisma } from "../../src/prisma";
import jwt from "jsonwebtoken";

describe("Lab 3: Comments and Notes API", () => {
  let staffToken: string;
  let requesterToken: string;
  let ticketId: number;

  beforeAll(async () => {
    const prisma = getPrisma();
    
    const staff = await prisma.user.create({
      data: {
        name: "Staff Comment Tester",
        email: "staffcomment@toktickit.com",
        passwordHash: "dummyhash",
        role: "IT Staff",
        isActive: true
      }
    });

    const reqUser = await prisma.user.create({
      data: {
        name: "Req Comment Tester",
        email: "reqcomment@toktickit.com",
        passwordHash: "dummyhash",
        role: "Requester",
        isActive: true
      }
    });

    const category = await prisma.category.findFirst();
    const system = await prisma.relatedSystem.findFirst();

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-TEST-COMMENT",
        summary: "Test Comment",
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
    await prisma.publicComment.deleteMany({ where: { ticketId } });
    await prisma.internalNote.deleteMany({ where: { ticketId } });
    await prisma.ticket.deleteMany({ where: { ticketNumber: "TKT-TEST-COMMENT" } });
    await prisma.user.deleteMany({
      where: { email: { contains: "comment@toktickit.com" } }
    });
  });

  it("should allow Requester to post a public comment", async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set("Cookie", `token=${requesterToken}`)
      .send({ content: "This is a public comment from requester" });
      
    expect(res.status).toBe(201);
    expect(res.body.content).toBe("This is a public comment from requester");
  });

  it("should allow IT Staff to post an internal note", async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/notes`)
      .set("Cookie", `token=${staffToken}`)
      .send({ content: "This is a secret note" });
      
    expect(res.status).toBe(201);
    expect(res.body.content).toBe("This is a secret note");
  });

  it("should block Requester from posting an internal note", async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/notes`)
      .set("Cookie", `token=${requesterToken}`)
      .send({ content: "Try to hack a note" });
      
    expect(res.status).toBe(403);
  });
});
