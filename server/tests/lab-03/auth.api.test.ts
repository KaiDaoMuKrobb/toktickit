import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { getPrisma } from "../../src/prisma.js";

describe("Lab 3: Authentication APIs", () => {
  beforeAll(async () => {
    // Reset test user state
    await getPrisma().user.updateMany({
      where: { email: "newuser@example.com" },
      data: { mustChangePassword: true }
    });
  });

  afterAll(async () => {
    await getPrisma().$disconnect();
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials and return a token cookie", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@example.com",
          password: "password123"
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body.email).toBe("admin@example.com");
      expect(res.body.role).toBe("Administrator");
      
      // Check for HTTP-Only cookie
      const setCookie = res.headers["set-cookie"];
      expect(setCookie).toBeDefined();
      expect(setCookie[0]).toMatch(/token=.*; HttpOnly/);
    });

    it("should return 401 for invalid password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "admin@example.com",
          password: "wrongpassword"
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid/i);
    });

    it("should return 401 for inactive user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "inactive_req@example.com", // Seeded inactive user
          password: "password123"
        });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user data when authenticated", async () => {
      // First login
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "jennifer@example.com", password: "password123" });
      
      const cookie = loginRes.headers["set-cookie"][0].split(";")[0];

      // Then fetch /me
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookie);

      expect(meRes.status).toBe(200);
      expect(meRes.body.email).toBe("jennifer@example.com");
      expect(meRes.body.role).toBe("Requester");
      // ensure no password hash is returned
      expect(meRes.body.passwordHash).toBeUndefined();
    });

    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/change-password", () => {
    it("should change password and clear mustChangePassword flag", async () => {
      // Login as the user who must change password
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "newuser@example.com", password: "password123" });
      
      expect(loginRes.body.mustChangePassword).toBe(true);
      const oldCookie = loginRes.headers["set-cookie"][0].split(";")[0];

      // Change password
      const changeRes = await request(app)
        .post("/api/auth/change-password")
        .set("Cookie", oldCookie)
        .send({
          currentPassword: "password123",
          newPassword: "newpassword123"
        });

      expect(changeRes.status).toBe(200);
      const newCookie = changeRes.headers["set-cookie"][0].split(";")[0];

      // Verify the flag is cleared on next login
      const nextLoginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "newuser@example.com", password: "newpassword123" });
      
      expect(nextLoginRes.status).toBe(200);
      expect(nextLoginRes.body.mustChangePassword).toBe(false);

      // Reset the password back for subsequent test runs
      await request(app)
        .post("/api/auth/change-password")
        .set("Cookie", newCookie)
        .send({
          currentPassword: "newpassword123",
          newPassword: "password123"
        });
    });

    it("should reject password change with incorrect current password", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "jennifer@example.com", password: "password123" });
      
      const cookie = loginRes.headers["set-cookie"][0].split(";")[0];

      const res = await request(app)
        .post("/api/auth/change-password")
        .set("Cookie", cookie)
        .send({
          currentPassword: "wrongpassword",
          newPassword: "newpassword123"
        });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should clear the token cookie", async () => {
      const res = await request(app).post("/api/auth/logout");
      expect(res.status).toBe(200);
      expect(res.headers["set-cookie"][0]).toMatch(/token=;/);
    });
  });
});
