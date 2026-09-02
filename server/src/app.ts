import express, { Request, Response } from "express";
import cors from "cors";
import { getPrisma } from "./prisma.js";
// getPrisma() is your lazy database handle. Call it INSIDE a route when you
// need the DB (Issue 4). It is intentionally unused until then.
void getPrisma;

// The Express app is exported separately from app.listen() (see index.ts) so
// Supertest can import `app` without opening a port. Do not merge these files.
export const app = express();

app.use(cors());          // already wired: lets the Vite dev server call this API
app.use(express.json());

// ---------------------------------------------------------------------------
// Issue 2 — API health check
// Make the test in tests/lab-01/health.test.ts pass.
// It must return HTTP 200 with JSON: { status: "ok", service: "TokTickIT API" }
// ---------------------------------------------------------------------------
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok", service: "TokTickIT API" });
});

// ---------------------------------------------------------------------------
// Issue 4 — Category list
// Add:  GET /api/categories
//   -> read categories from PostgreSQL via getPrisma().category.findMany(...)
//   -> return each { id, name } in a predictable (id) order
//   -> on failure, respond 500 with a safe message (no internal details)
// TODO(Issue 4): implement the route here.
app.get("/api/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await getPrisma().category.findMany({
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});
// ---------------------------------------------------------------------------
// Lab 2 — Development Requester Context
// GET /api/requesters
// ---------------------------------------------------------------------------
app.get("/api/requesters", async (_req: Request, res: Response) => {
  try {
    const requesters = await getPrisma().requesterUser.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    });
    res.status(200).json(requesters);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Lab 2 — Ticket Creation
// POST /api/tickets
// ---------------------------------------------------------------------------
app.post("/api/tickets", async (req: Request, res: Response) => {
  try {
    const requesterIdHeader = req.headers["x-development-requester-id"];
    if (!requesterIdHeader) {
      return res.status(401).json({ error: "Missing X-Development-Requester-Id header" });
    }
    const requesterId = parseInt(requesterIdHeader as string, 10);
    
    const { summary, description, categoryId, relatedSystem } = req.body;
    
    // Validate required fields
    if (!summary || !description || !categoryId || !relatedSystem) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate lengths
    if (summary.length < 5 || summary.length > 100) {
      return res.status(400).json({ error: "Summary must be between 5-100 characters" });
    }
    if (description.length < 10 || description.length > 1000) {
      return res.status(400).json({ error: "Description must be between 10-1000 characters" });
    }

    const prisma = getPrisma();
    
    // Generate ticketNumber: TKT-YYYY-XXXXXX
    const currentYear = new Date().getFullYear();
    const count = await prisma.ticket.count({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
        }
      }
    });
    
    const sequenceNumber = String(count + 1).padStart(6, '0');
    const ticketNumber = `TKT-${currentYear}-${sequenceNumber}`;

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        summary,
        description,
        categoryId: typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId,
        relatedSystem,
        requesterId,
        status: "New"
      }
    });
    
    res.status(201).json(newTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------

export default app;
