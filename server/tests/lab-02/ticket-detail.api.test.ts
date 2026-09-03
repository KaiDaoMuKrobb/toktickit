import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("GET /api/tickets/:id", () => {
  let requester1Id: number;
  let requester2Id: number;
  let ticketId: number;

  beforeAll(async () => {
    const prisma = getPrisma();
    const requesters = await prisma.requesterUser.findMany({ where: { isActive: true }, take: 2 });
    if (requesters.length < 2) throw new Error("Need at least 2 active requesters for tests");
    
    requester1Id = requesters[0].id;
    requester2Id = requesters[1].id;

    const category = await prisma.category.findFirst();
    if (!category) throw new Error("No category found for test");

    // Create a ticket for requester 1
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-TEST-000001",
        summary: "Test Detail Ticket",
        description: "Test Detail Description",
        categoryId: category.id,
        relatedSystem: "System X",
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
      .set("X-Development-Requester-Id", String(requester1Id));

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", ticketId);
    expect(response.body).toHaveProperty("summary", "Test Detail Ticket");
    expect(response.body).toHaveProperty("attachments");
    expect(Array.isArray(response.body.attachments)).toBe(true);
  });

  it("should return 403 Forbidden if requested by a different requester", async () => {
    const response = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set("X-Development-Requester-Id", String(requester2Id));

    expect(response.status).toBe(403);
  });

  it("should return 404 Not Found for non-existent ticket", async () => {
    const response = await request(app)
      .get("/api/tickets/999999")
      .set("X-Development-Requester-Id", String(requester1Id));

    expect(response.status).toBe(404);
  });
});
