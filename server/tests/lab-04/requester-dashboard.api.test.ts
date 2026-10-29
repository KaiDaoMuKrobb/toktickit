import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import jwt from "jsonwebtoken";

describe("Lab 4: Requester Dashboard API", () => {
  const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
  let jenniferToken: string;
  let davidToken: string; // Zero tickets user

  beforeAll(async () => {
    const prisma = getPrisma();
    const jennifer = await prisma.user.findUnique({ where: { email: "jennifer@example.com" } });
    const david = await prisma.user.findUnique({ where: { email: "david@example.com" } });

    jenniferToken = jwt.sign({ id: jennifer!.id, email: jennifer!.email, role: jennifer!.role }, secret);
    davidToken = jwt.sign({ id: david!.id, email: david!.email, role: david!.role }, secret);
  });

  // AC-08: Authenticated Requester receives their authoritative metrics
  it("API-09: should return accurate metrics and recent tickets for authenticated requester", async () => {
    const res = await request(app)
      .get("/api/dashboards/requester")
      .set("Cookie", `token=${jenniferToken}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics).toBeDefined();
    expect(typeof res.body.metrics.open).toBe("number");
    expect(typeof res.body.metrics.inProgress).toBe("number");
    expect(typeof res.body.metrics.resolved).toBe("number");
    expect(typeof res.body.metrics.closed).toBe("number");
    expect(Array.isArray(res.body.recentTickets)).toBe(true);

    // Verify recent tickets strictly belong to Jennifer
    const prisma = getPrisma();
    const jennifer = await prisma.user.findUnique({ where: { email: "jennifer@example.com" } });
    for (const ticket of res.body.recentTickets) {
      const dbTicket = await prisma.ticket.findUnique({ where: { id: ticket.id } });
      expect(dbTicket?.requesterId).toBe(jennifer!.id);
    }
  });

  // Empty state handling
  it("API-09b: should handle zero-state cleanly when requester has no tickets", async () => {
    const res = await request(app)
      .get("/api/dashboards/requester")
      .set("Cookie", `token=${davidToken}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics.open).toBe(0);
    expect(res.body.metrics.inProgress).toBe(0);
    expect(res.body.metrics.resolved).toBe(0);
    expect(res.body.metrics.closed).toBe(0);
    expect(res.body.recentTickets).toHaveLength(0);
  });

  // Security: Unauthenticated access blocked
  it("API-09c: should reject unauthenticated requests with 401 Unauthorized", async () => {
    const res = await request(app).get("/api/dashboards/requester");
    expect(res.status).toBe(401);
  });
});
