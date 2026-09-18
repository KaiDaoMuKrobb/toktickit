import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("POST /api/tickets", () => {
  let requesterId: number;
  let authCookie: string;
  let categoryId: number;
  let systemId: number;

  beforeAll(async () => {
    // Get valid requester and category from db
    const prisma = getPrisma();
    const requester = await prisma.user.findFirst({ where: { isActive: true, role: "Requester" } });
    if (!requester) throw new Error("No active requester found for test");
    requesterId = requester.id;

    const loginRes = await request(app).post("/api/auth/login").send({
      email: requester.email,
      password: "password123"
    });
    authCookie = loginRes.headers["set-cookie"][0].split(";")[0];

    const category = await prisma.category.findFirst();
    if (!category) throw new Error("No category found for test");
    categoryId = category.id;

    const system = await prisma.relatedSystem.findFirst();
    if (!system) throw new Error("No related system found for test");
    systemId = system.id;
  });

  afterAll(async () => {
    await getPrisma().$disconnect();
  });

  it("should create a new ticket with valid data", async () => {
    const payload = {
      summary: "Cannot access email",
      description: "My email account has been locked out.",
      categoryId,
      relatedSystemId: systemId
    };

    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", authCookie)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("ticketNumber");
    expect(response.body.ticketNumber).toMatch(/^TKT-\d{4}-\d{6}$/);
    expect(response.body.status).toBe("New");
    expect(response.body.summary).toBe(payload.summary);
  });

  it("should fail if authentication cookie is missing", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .send({
        summary: "Test",
        description: "Test desc",
        categoryId,
        relatedSystemId: systemId
      });

    expect(response.status).toBe(401);
  });

  it("should fail if required fields are missing", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", authCookie)
      .send({ summary: "Test" }); // missing desc, category, system

    expect(response.status).toBe(400);
  });

  it("should validate field lengths", async () => {
    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", authCookie)
      .send({
        summary: "Ab", // too short (must be 5-100)
        description: "Too short", // too short (must be 10-1000)
        categoryId,
        relatedSystemId: systemId
      });

    expect(response.status).toBe(400);
  });
});
