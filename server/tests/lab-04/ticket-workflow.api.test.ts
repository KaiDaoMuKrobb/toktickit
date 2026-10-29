import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import jwt from "jsonwebtoken";

describe("Lab 4: Ticket Workflow & Status Transition Matrix API", () => {
  const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
  let it1Token: string;
  let requesterToken: string;
  let ticketId: number;

  beforeAll(async () => {
    const prisma = getPrisma();

    const it1 = await prisma.user.findUnique({ where: { email: "it1@example.com" } });
    const req1 = await prisma.user.findUnique({ where: { email: "jennifer@example.com" } });

    it1Token = jwt.sign({ id: it1!.id, email: it1!.email, role: it1!.role }, secret);
    requesterToken = jwt.sign({ id: req1!.id, email: req1!.email, role: req1!.role }, secret);

    const cat = await prisma.category.findFirst();
    const sys = await prisma.relatedSystem.findFirst();

    // Clean up if previous run aborted
    await prisma.publicComment.deleteMany({
      where: { ticket: { ticketNumber: "TKT-TEST-WORKFLOW-1" } }
    });
    await prisma.ticket.deleteMany({
      where: { ticketNumber: { in: ["TKT-TEST-WORKFLOW-1"] } }
    });

    // Create a fresh ticket in "New" status
    const t = await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-TEST-WORKFLOW-1",
        summary: "Status transition test ticket",
        description: "Testing strict state machine transitions",
        categoryId: cat!.id,
        relatedSystemId: sys!.id,
        requesterId: req1!.id,
        status: "New"
      }
    });
    ticketId = t.id;
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.publicComment.deleteMany({
      where: { ticket: { ticketNumber: "TKT-TEST-WORKFLOW-1" } }
    });
    await prisma.ticket.deleteMany({
      where: { ticketNumber: { in: ["TKT-TEST-WORKFLOW-1"] } }
    });
  });

  // AC-05: Valid transitions
  it("API-06: should allow permitted transition from New to In Progress", async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set("Cookie", `token=${it1Token}`)
      .send({ status: "In Progress" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("In Progress");
  });

  // AC-06: Disallowed transition outside matrix
  it("API-07: should reject invalid transition (In Progress directly to Closed)", async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set("Cookie", `token=${it1Token}`)
      .send({ status: "Closed" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid status transition/i);
  });

  // AC-07: Optimistic concurrency / Stale-update conflict handling (409 Conflict)
  it("API-08: should return 409 Conflict when expectedUpdatedAt does not match server state", async () => {
    const staleDate = new Date("2020-01-01T00:00:00Z").toISOString();

    const res = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set("Cookie", `token=${it1Token}`)
      .send({
        status: "Waiting for Requester",
        expectedUpdatedAt: staleDate
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/conflict/i);
    expect(res.body.currentTicket).toBeDefined();
  });

  // Role Restriction: Requesters cannot transition status directly
  it("API-08b: should return 403 Forbidden when Requester attempts to transition status", async () => {
    const res = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set("Cookie", `token=${requesterToken}`)
      .send({ status: "Resolved" });

    expect(res.status).toBe(403);
  });

  // BR-06: Requester resolution indication is advisory and does not change status
  it("API-08c: Requester resolution comment sets advisory flag without changing status", async () => {
    const resComment = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set("Cookie", `token=${requesterToken}`)
      .send({
        content: "I restarted my router and the problem appears resolved.",
        isResolutionIndication: true
      });

    expect(resComment.status).toBe(201);

    // Verify ticket status is still "In Progress"
    const prisma = getPrisma();
    const currentTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    expect(currentTicket?.status).toBe("In Progress");
    expect(currentTicket?.requesterResolved).toBe(true);
  });

  // Valid full cycle to Resolved and Closed
  it("API-08d: should transition through In Progress -> Resolved -> Closed", async () => {
    // 1. Transition to Resolved
    const resResolved = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set("Cookie", `token=${it1Token}`)
      .send({ status: "Resolved" });
    expect(resResolved.status).toBe(200);
    expect(resResolved.body.status).toBe("Resolved");

    // 2. Transition from Resolved to Closed
    const resClosed = await request(app)
      .patch(`/api/tickets/${ticketId}/status`)
      .set("Cookie", `token=${it1Token}`)
      .send({ status: "Closed" });
    expect(resClosed.status).toBe(200);
    expect(resClosed.body.status).toBe("Closed");
  });
});
