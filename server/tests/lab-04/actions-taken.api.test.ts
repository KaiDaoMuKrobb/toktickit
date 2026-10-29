import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import jwt from "jsonwebtoken";

describe("Lab 4: Actions Taken REST API", () => {
  const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
  let it1Token: string;
  let it2Token: string;
  let inactiveStaffToken: string;
  let requester1Token: string;
  let requester2Token: string;
  let testTicketId: number;
  let otherTicketId: number;
  let createdActionId: number;

  beforeAll(async () => {
    const prisma = getPrisma();

    // Find users from seed
    const it1 = await prisma.user.findUnique({ where: { email: "it1@example.com" } });
    const it2 = await prisma.user.findUnique({ where: { email: "it2@example.com" } });
    const inactiveIt = await prisma.user.findUnique({ where: { email: "inactive_it@example.com" } });
    const req1 = await prisma.user.findUnique({ where: { email: "jennifer@example.com" } });
    const req2 = await prisma.user.findUnique({ where: { email: "michael@example.com" } });

    it1Token = jwt.sign({ id: it1!.id, email: it1!.email, role: it1!.role }, secret);
    it2Token = jwt.sign({ id: it2!.id, email: it2!.email, role: it2!.role }, secret);
    inactiveStaffToken = jwt.sign({ id: inactiveIt!.id, email: inactiveIt!.email, role: inactiveIt!.role }, secret);
    requester1Token = jwt.sign({ id: req1!.id, email: req1!.email, role: req1!.role }, secret);
    requester2Token = jwt.sign({ id: req2!.id, email: req2!.email, role: req2!.role }, secret);

    const cat = await prisma.category.findFirst();
    const sys = await prisma.relatedSystem.findFirst();

    // Create a dedicated test ticket for req1
    const t1 = await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-TEST-ACT-1",
        summary: "Test ticket for actions taken",
        description: "Testing actions taken APIs",
        categoryId: cat!.id,
        relatedSystemId: sys!.id,
        requesterId: req1!.id,
        ownerId: it1!.id,
        status: "Open"
      }
    });
    testTicketId = t1.id;

    // Create a ticket for req2
    const t2 = await prisma.ticket.create({
      data: {
        ticketNumber: "TKT-TEST-ACT-2",
        summary: "Other requester ticket",
        description: "Testing authorization boundaries",
        categoryId: cat!.id,
        relatedSystemId: sys!.id,
        requesterId: req2!.id,
        ownerId: it1!.id,
        status: "Open"
      }
    });
    otherTicketId = t2.id;
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.ticket.deleteMany({
      where: { ticketNumber: { in: ["TKT-TEST-ACT-1", "TKT-TEST-ACT-2"] } }
    });
  });

  // AC-01: IT Staff creates valid Action Taken
  it("API-01: should create an Action Taken by permitted IT Staff and auto-capture actor", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", `token=${it1Token}`)
      .send({
        description: "Diagnosed motherboard and replaced power cable",
        result: "System booted properly with no POST error beeps",
        followUpRequired: false,
        followUpNote: null,
        attachmentNotes: "Check voltage_reading.png"
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.ticketId).toBe(testTicketId);
    expect(res.body.performedBy.email).toBe("it1@example.com");
    expect(res.body.description).toBe("Diagnosed motherboard and replaced power cable");
    createdActionId = res.body.id;
  });

  // BR-02: Action Taken by a different IT Staff member than the Ticket Owner
  it("API-01b: should allow a different IT Staff member to record an action on the ticket", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", `token=${it2Token}`)
      .send({
        description: "Secondary staff member conducted 24h stability burn-in test",
        result: "All thermal and memory benchmarks passed without kernel panic",
        followUpRequired: true,
        followUpNote: "Notify requester for workstation collection tomorrow morning"
      });

    expect(res.status).toBe(201);
    expect(res.body.performedBy.email).toBe("it2@example.com");
    expect(res.body.followUpRequired).toBe(true);
    expect(res.body.followUpNote).toContain("Notify requester");
  });

  // AC-02: Validation requires follow-up note when followUpRequired is true
  it("API-02: should reject Action Taken creation when followUpRequired is true but followUpNote is missing", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", `token=${it1Token}`)
      .send({
        description: "Ordered replacement hard drive",
        result: "Pending vendor shipping confirmation",
        followUpRequired: true,
        followUpNote: "   " // empty/whitespace
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/follow-up note is required/i);
  });

  // AC-03: Inactive staff accounts cannot record actions taken
  it("API-03: should reject Action Taken attempt by an inactive IT Staff member", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", `token=${inactiveStaffToken}`)
      .send({
        description: "Unauthorized action by inactive staff",
        result: "Should not be logged",
        followUpRequired: false
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/inactive/i);
  });

  // AC-04: Requesters cannot write Actions Taken
  it("API-04: should return 403 Forbidden when a Requester attempts to create an Action Taken", async () => {
    const res = await request(app)
      .post(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", `token=${requester1Token}`)
      .send({
        description: "Requester trying to add an action",
        result: "Must be blocked",
        followUpRequired: false
      });

    expect(res.status).toBe(403);
  });

  // AC-04: Requesters can view their owned ticket actions, but blocked from others
  it("API-05: should allow Requester to view actions on owned ticket, but block from another user's ticket", async () => {
    // Owned ticket -> 200 OK
    const resOwned = await request(app)
      .get(`/api/tickets/${testTicketId}/actions`)
      .set("Cookie", `token=${requester1Token}`);

    expect(resOwned.status).toBe(200);
    expect(Array.isArray(resOwned.body)).toBe(true);
    expect(resOwned.body.length).toBeGreaterThanOrEqual(2);

    // Other user's ticket -> 403 Forbidden
    const resOther = await request(app)
      .get(`/api/tickets/${otherTicketId}/actions`)
      .set("Cookie", `token=${requester1Token}`);

    expect(resOther.status).toBe(403);
  });

  // Update Action Taken
  it("API-05b: should allow IT Staff to update an existing Action Taken record", async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/actions/${createdActionId}`)
      .set("Cookie", `token=${it1Token}`)
      .send({
        result: "Updated result: System tested and voltage confirmed stable at 12V",
        attachmentNotes: "Updated attachment note with multimeter reading"
      });

    expect(res.status).toBe(200);
    expect(res.body.result).toContain("voltage confirmed stable");
  });
});
