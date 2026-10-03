import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("GET /api/tickets", () => {
  let requester1: number;
  let requester2: number;
  let cookie1: string;
  let cookie2: string;
  let categoryId: number;
  let systemId: number;

  beforeAll(async () => {
    const prisma = getPrisma();
    
    // Setup data
    const requesters = await prisma.user.findMany({ where: { isActive: true, role: "Requester" }, take: 2 });
    requester1 = requesters[0].id;
    requester2 = requesters[1].id;

    const res1 = await request(app).post("/api/auth/login").send({ email: requesters[0].email, password: "password123" });
    cookie1 = res1.headers["set-cookie"][0].split(";")[0];

    const res2 = await request(app).post("/api/auth/login").send({ email: requesters[1].email, password: "password123" });
    cookie2 = res2.headers["set-cookie"][0].split(";")[0];

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
      .set("Cookie", cookie1);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(3);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.limit).toBe(2);
  });

  it("should enforce ownership protection (requester2 sees only 1 ticket)", async () => {
    const res = await request(app)
      .get("/api/tickets")
      .set("Cookie", cookie2);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].summary).toBe("Access denied");
  });

  it("should filter by search summary", async () => {
    const res = await request(app)
      .get("/api/tickets?search=network")
      .set("Cookie", cookie1);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].summary).toBe("Network issue");
  });

  it("should fail if no header is provided", async () => {
    const res = await request(app).get("/api/tickets");
    expect(res.status).toBe(401);
  });
});
