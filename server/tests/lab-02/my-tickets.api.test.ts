import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("GET /api/tickets", () => {
  let requester1: number;
  let requester2: number;
  let categoryId: number;
  let systemId: number;

  beforeAll(async () => {
    const prisma = getPrisma();
    
    // Setup data
    const requesters = await prisma.requesterUser.findMany({ where: { isActive: true }, take: 2 });
    requester1 = requesters[0].id;
    requester2 = requesters[1].id;

    const category = await prisma.category.findFirst();
    categoryId = category!.id;

    const system = await prisma.relatedSystem.findFirst();
    systemId = system!.id;


    // Create tickets for requester1
    await prisma.ticket.createMany({
      data: [
        { ticketNumber: "T-001", summary: "Network issue", description: "Desc", categoryId, relatedSystemId: systemId, requesterId: requester1, status: "New" },
        { ticketNumber: "T-002", summary: "Laptop broken", description: "Desc", categoryId, relatedSystemId: systemId, requesterId: requester1, status: "In Progress" },
        { ticketNumber: "T-003", summary: "Password reset", description: "Desc", categoryId, relatedSystemId: systemId, requesterId: requester1, status: "New" },
      ]
    });

    // Create tickets for requester2
    await prisma.ticket.create({
      data: { ticketNumber: "T-004", summary: "Access denied", description: "Desc", categoryId, relatedSystemId: systemId, requesterId: requester2, status: "New" }
    });
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.ticket.deleteMany({
      where: { ticketNumber: { in: ["T-001", "T-002", "T-003", "T-004"] } }
    });
    await prisma.$disconnect();
  });

  it("should return tickets belonging to the requester with pagination", async () => {
    const res = await request(app)
      .get("/api/tickets?limit=2")
      .set("X-Development-Requester-Id", String(requester1));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(3);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(2);
  });

  it("should enforce ownership protection (requester2 sees only 1 ticket)", async () => {
    const res = await request(app)
      .get("/api/tickets")
      .set("X-Development-Requester-Id", String(requester2));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].summary).toBe("Access denied");
  });

  it("should filter by search summary", async () => {
    const res = await request(app)
      .get("/api/tickets?search=network")
      .set("X-Development-Requester-Id", String(requester1));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].summary).toBe("Network issue");
  });

  it("should fail if no header is provided", async () => {
    const res = await request(app).get("/api/tickets");
    expect(res.status).toBe(401);
  });
});
