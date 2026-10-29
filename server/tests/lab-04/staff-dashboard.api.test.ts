import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import jwt from "jsonwebtoken";

describe("Lab 4: IT Staff and Administrator Dashboards API", () => {
  const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";
  let it1Token: string;
  let it3Token: string; // Staff with 0 assigned tickets
  let adminToken: string;
  let requesterToken: string;

  beforeAll(async () => {
    const prisma = getPrisma();
    const it1 = await prisma.user.findUnique({ where: { email: "it1@example.com" } });
    const it3 = await prisma.user.findUnique({ where: { email: "it3@example.com" } });
    const admin = await prisma.user.findUnique({ where: { email: "admin@example.com" } });
    const requester = await prisma.user.findUnique({ where: { email: "jennifer@example.com" } });

    it1Token = jwt.sign({ id: it1!.id, email: it1!.email, role: it1!.role }, secret);
    it3Token = jwt.sign({ id: it3!.id, email: it3!.email, role: it3!.role }, secret);
    adminToken = jwt.sign({ id: admin!.id, email: admin!.email, role: admin!.role }, secret);
    requesterToken = jwt.sign({ id: requester!.id, email: requester!.email, role: requester!.role }, secret);
  });

  // AC-09: IT Staff receives authoritative queue and operational metrics
  it("API-10: should return accurate queue, status, and priority metrics for IT Staff", async () => {
    const res = await request(app)
      .get("/api/dashboards/staff")
      .set("Cookie", `token=${it1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics).toBeDefined();
    expect(typeof res.body.metrics.unassigned).toBe("number");
    expect(typeof res.body.metrics.myAssigned).toBe("number");
    expect(typeof res.body.metrics.new).toBe("number");
    expect(typeof res.body.metrics.open).toBe("number");
    expect(typeof res.body.metrics.inProgress).toBe("number");
    expect(res.body.byPriority).toBeDefined();
    expect(typeof res.body.byPriority.Critical).toBe("number");
    expect(Array.isArray(res.body.recentTickets)).toBe(true);

    // Verify unassigned count against database
    const prisma = getPrisma();
    const actualUnassigned = await prisma.ticket.count({
      where: { ownerId: null, status: { notIn: ["Closed", "Cancelled"] } }
    });
    expect(res.body.metrics.unassigned).toBe(actualUnassigned);
  });

  // Zero-state check for staff with no assigned tickets
  it("API-10b: should return myAssigned = 0 for staff member with no tickets", async () => {
    const res = await request(app)
      .get("/api/dashboards/staff")
      .set("Cookie", `token=${it3Token}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics.myAssigned).toBe(0);
  });

  // AC-10: Administrator receives operational metrics plus user account breakdown
  it("API-11: should return operational and user account breakdown metrics for Administrator", async () => {
    const res = await request(app)
      .get("/api/dashboards/admin")
      .set("Cookie", `token=${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.staffMetrics).toBeDefined();
    expect(res.body.userMetrics).toBeDefined();
    expect(typeof res.body.userMetrics.totalUsers).toBe("number");
    expect(typeof res.body.userMetrics.activeRequesters).toBe("number");
    expect(typeof res.body.userMetrics.activeStaff).toBe("number");
    expect(typeof res.body.userMetrics.activeAdmins).toBe("number");
    expect(res.body.userMetrics.totalUsers).toBeGreaterThanOrEqual(10);
  });

  // Security: Requesters blocked from staff and admin dashboards
  it("API-11b: should block Requesters from accessing staff and admin dashboards with 403 Forbidden", async () => {
    const resStaff = await request(app)
      .get("/api/dashboards/staff")
      .set("Cookie", `token=${requesterToken}`);
    expect(resStaff.status).toBe(403);

    const resAdmin = await request(app)
      .get("/api/dashboards/admin")
      .set("Cookie", `token=${requesterToken}`);
    expect(resAdmin.status).toBe(403);
  });
});
