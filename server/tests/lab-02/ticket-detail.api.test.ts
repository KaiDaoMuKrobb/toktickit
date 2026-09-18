import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("GET /api/tickets/:id", () => {
  let requester1Id: number;
  let requester2Id: number;
  let cookie1: string;
  let cookie2: string;
  let ticketId: number;

  beforeAll(async () => {
    const prisma = getPrisma();
    const requesters = await prisma.user.findMany({ where: { isActive: true, role: "Requester" }, take: 2 });
    if (requesters.length < 2) throw new Error("Need at least 2 active requesters for tests");
    
    requester1Id = requesters[0].id;
    requester2Id = requesters[1].id;

    const res1 = await request(app).post("/api/auth/login").send({ email: requesters[0].email, password: "password123" });
    cookie1 = res1.headers["set-cookie"][0].split(";")[0];

    const res2 = await request(app).post("/api/auth/login").send({ email: requesters[1].email, password: "password123" });
    cookie2 = res2.headers["set-cookie"][0].split(";")[0];

    const category = await prisma.category.findFirst();
    if (!category) throw new Error("No category found for test");

    const system = await prisma.relatedSystem.findFirst();
    if (!system) throw new Error("No related system found for test");

    // Create a ticket for requester 1
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-TEST-000001",
        summary: "Test Detail Ticket",
        description: "Test Detail Description",
        categoryId: category.id,
        relatedSystemId: system.id,
        requesterId: requester1Id,
        status: "New"
      }
    });
    ticketId = ticket.id;
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.ticket.delete({ where: { id: ticketId } });
    await prisma.$disconnect();
  });

  it("should return the ticket detail if requested by the owner", async () => {
    const response = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie1);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", ticketId);
    expect(response.body).toHaveProperty("summary", "Test Detail Ticket");
    expect(response.body).toHaveProperty("attachments");
    expect(Array.isArray(response.body.attachments)).toBe(true);
  });

  it("should return 403 Forbidden if requested by a different requester", async () => {
    const response = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set("Cookie", cookie2);

    expect(response.status).toBe(403);
  });

  it("should return 404 Not Found for non-existent ticket", async () => {
    const response = await request(app)
      .get("/api/tickets/999999")
      .set("Cookie", cookie1);

    expect(response.status).toBe(404);
  });
});
