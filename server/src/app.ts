import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getPrisma } from "./prisma.js";

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    // Sanitize filename (BR-13)
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + sanitized);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit (BR-05)
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.'));
    }
  }
});
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
    const sequenceNumber = Math.floor(100000 + Math.random() * 900000).toString();
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
// Lab 2 — My Tickets List
// GET /api/tickets
// ---------------------------------------------------------------------------
app.get("/api/tickets", async (req: Request, res: Response) => {
  try {
    const requesterIdHeader = req.headers["x-development-requester-id"];
    if (!requesterIdHeader) {
      return res.status(401).json({ error: "Missing X-Development-Requester-Id header" });
    }
    const requesterId = parseInt(requesterIdHeader as string, 10);

    const { search, category, status, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build the Prisma 'where' clause
    const where: any = { requesterId };

    if (search) {
      where.summary = { contains: search as string, mode: "insensitive" };
    }
    if (category) {
      where.categoryId = parseInt(category as string, 10);
    }
    if (status) {
      where.status = status as string;
    }

    const prisma = getPrisma();

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: "desc" },
        include: {
          category: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.ticket.count({ where })
    ]);

    // Map 'status' to 'currentStatus' for the API response
    const formattedTickets = tickets.map(t => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      summary: t.summary,
      category: t.category,
      currentStatus: t.status,
      updatedAt: t.updatedAt
    }));

    res.status(200).json({
      data: formattedTickets,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Lab 2 — Ticket Detail and Attachments (Issue 21)
// ---------------------------------------------------------------------------

// Helper function to verify requester
const getRequesterId = (req: Request, res: Response) => {
  const requesterIdHeader = req.headers["x-development-requester-id"];
  if (!requesterIdHeader) {
    res.status(401).json({ error: "Missing X-Development-Requester-Id header" });
    return null;
  }
  return parseInt(requesterIdHeader as string, 10);
};

// 1. Get Ticket Detail
app.get("/api/tickets/:id", async (req: Request, res: Response) => {
  try {
    const requesterId = getRequesterId(req, res);
    if (!requesterId) return;

    const ticketId = parseInt(req.params.id, 10);
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: { select: { id: true, name: true } },
        attachments: {
          select: { id: true, originalName: true, mimeType: true, size: true, isRemoved: true, createdAt: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.requesterId !== requesterId) return res.status(403).json({ error: "Forbidden" });

    res.status(200).json({
      ...ticket,
      currentStatus: ticket.status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. Upload Attachment
app.post("/api/tickets/:id/attachments", (req: Request, res: Response, next) => {
  upload.single("file")(req, res, function (err) {
    if (err) {
      // Handle multer errors (e.g. file size, invalid type)
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const requesterId = getRequesterId(req, res);
    if (!requesterId) return;

    const ticketId = parseInt(req.params.id, 10);
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const prisma = getPrisma();

    // Verify ticket ownership and existence
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { _count: { select: { attachments: { where: { isRemoved: false } } } } }
    });

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    if (ticket.requesterId !== requesterId) return res.status(403).json({ error: "Forbidden" });

    // Enforce max 5 active attachments
    if (ticket._count.attachments >= 5) {
      return res.status(400).json({ error: "Maximum of 5 active attachments allowed" });
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        ticketId
      }
    });

    res.status(201).json(attachment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. Download Attachment
app.get("/api/attachments/:id/download", async (req: Request, res: Response) => {
  try {
    const requesterId = getRequesterId(req, res);
    if (!requesterId) return;

    const attachmentId = parseInt(req.params.id, 10);
    const prisma = getPrisma();

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: { select: { requesterId: true } } }
    });

    if (!attachment) return res.status(404).json({ error: "Attachment not found" });
    if (attachment.ticket.requesterId !== requesterId) return res.status(403).json({ error: "Forbidden" });
    if (attachment.isRemoved) return res.status(410).json({ error: "Attachment has been removed" });

    const filePath = path.join(uploadDir, attachment.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found on disk" });
    }

    res.download(filePath, attachment.originalName);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. Soft-remove Attachment
app.delete("/api/tickets/:ticketId/attachments/:attachmentId", async (req: Request, res: Response) => {
  try {
    const requesterId = getRequesterId(req, res);
    if (!requesterId) return;

    const ticketId = parseInt(req.params.ticketId, 10);
    const attachmentId = parseInt(req.params.attachmentId, 10);
    const prisma = getPrisma();

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: { select: { requesterId: true, id: true } } }
    });

    if (!attachment) return res.status(404).json({ error: "Attachment not found" });
    if (attachment.ticket.id !== ticketId) return res.status(404).json({ error: "Attachment does not belong to this ticket" });
    if (attachment.ticket.requesterId !== requesterId) return res.status(403).json({ error: "Forbidden" });
    if (attachment.isRemoved) return res.status(400).json({ error: "Attachment is already removed" });

    // In a real system, we might log the req.body.reason

    await prisma.attachment.update({
      where: { id: attachmentId },
      data: { isRemoved: true }
    });

    res.status(200).json({ message: "Attachment removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------

export default app;
