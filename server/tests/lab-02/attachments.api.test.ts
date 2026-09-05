import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";
import path from "path";
import fs from "fs";

describe("Attachments API", () => {
  let requester1: number;
  let requester2: number;
  let ticket1Id: number;
  let uploadDir: string;

  beforeAll(async () => {
    const prisma = getPrisma();
    
    // Setup data
    const requesters = await prisma.requesterUser.findMany({ where: { isActive: true }, take: 2 });
    requester1 = requesters[0].id;
    requester2 = requesters[1].id;

    const category = await prisma.category.findFirst();
    const system = await prisma.relatedSystem.findFirst();

    // Create a ticket for requester1
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: "T-ATT-001",
        summary: "Test Attachments",
        description: "Testing attachments API",
        categoryId: category!.id,
        relatedSystemId: system!.id,
        requesterId: requester1,
        status: "New"
      }
    });
    ticket1Id = ticket.id;

    uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  });

  afterAll(async () => {
    const prisma = getPrisma();
    await prisma.attachment.deleteMany({ where: { ticketId: ticket1Id } });
    await prisma.ticket.delete({ where: { id: ticket1Id } });
    await prisma.$disconnect();
  });

  it("should upload an attachment successfully", async () => {
    const filePath = path.join(__dirname, "test.png");
    fs.writeFileSync(filePath, "dummy image data");

    const res = await request(app)
      .post(`/api/tickets/${ticket1Id}/attachments`)
      .set("X-Development-Requester-Id", String(requester1))
      .attach("file", filePath);

    fs.unlinkSync(filePath);

    expect(res.status).toBe(201);
    expect(res.body.originalName).toBe("test.png");
    expect(res.body.mimeType).toBe("image/png");
    expect(res.body.isRemoved).toBe(false);
  });

  it("should enforce ownership on upload (requester2 cannot upload to ticket1)", async () => {
    const filePath = path.join(__dirname, "test2.png");
    fs.writeFileSync(filePath, "dummy image data");

    const res = await request(app)
      .post(`/api/tickets/${ticket1Id}/attachments`)
      .set("X-Development-Requester-Id", String(requester2))
      .attach("file", filePath);

    fs.unlinkSync(filePath);

    expect(res.status).toBe(403);
  });

  it("should reject invalid file types", async () => {
    const filePath = path.join(__dirname, "test.txt");
    fs.writeFileSync(filePath, "dummy text data");

    const res = await request(app)
      .post(`/api/tickets/${ticket1Id}/attachments`)
      .set("X-Development-Requester-Id", String(requester1))
      .attach("file", filePath);

    fs.unlinkSync(filePath);

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid file type");
  });

  it("should soft-remove an attachment", async () => {
    // 1. Upload a file first
    const filePath = path.join(__dirname, "test_remove.png");
    fs.writeFileSync(filePath, "dummy image data");

    const uploadRes = await request(app)
      .post(`/api/tickets/${ticket1Id}/attachments`)
      .set("X-Development-Requester-Id", String(requester1))
      .attach("file", filePath);

    fs.unlinkSync(filePath);
    const attachmentId = uploadRes.body.id;

    // 2. Soft-remove it
    const deleteRes = await request(app)
      .delete(`/api/tickets/${ticket1Id}/attachments/${attachmentId}`)
      .set("X-Development-Requester-Id", String(requester1));

    expect(deleteRes.status).toBe(200);

    // 3. Try to download it (should be 410 Gone)
    const downloadRes = await request(app)
      .get(`/api/attachments/${attachmentId}/download`)
      .set("X-Development-Requester-Id", String(requester1));

    expect(downloadRes.status).toBe(410);
  });
});
