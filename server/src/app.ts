import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import cookieParser from "cookie-parser";
import { getPrisma } from "./prisma.js";
import authRoutes from "./routes/auth.routes.js";
import { authenticate, requireRole } from "./middleware/auth.js";
import bcrypt from "bcryptjs";

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
app.use(cookieParser());

app.use("/api/auth", authRoutes);

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
// Lab 2 — Related Systems
// GET /api/systems
// ---------------------------------------------------------------------------
app.get("/api/systems", async (_req: Request, res: Response) => {
  try {
    const systems = await getPrisma().relatedSystem.findMany({
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });
    res.status(200).json(systems);
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
    const requesters = await getPrisma().user.findMany({
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
app.post("/api/tickets", authenticate, requireRole(["Requester"]), async (req: Request, res: Response) => {
  try {
    const requesterId = req.user!.id;
    
    const { summary, description, categoryId, relatedSystemId } = req.body;
    
    // Validate required fields
    if (!summary || !description || !categoryId || !relatedSystemId) {
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
        relatedSystemId: typeof relatedSystemId === 'string' ? parseInt(relatedSystemId, 10) : relatedSystemId,
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
app.get("/api/tickets", authenticate, requireRole(["Requester"]), async (req: Request, res: Response) => {
  try {
    const requesterId = req.user!.id;

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

// 1. Get Ticket Detail
app.get("/api/tickets/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        category: { select: { id: true, name: true } },
        relatedSystem: { select: { id: true, name: true } },
        attachments: {
          select: { id: true, originalName: true, mimeType: true, size: true, isRemoved: true, createdAt: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (req.user!.role === "Requester") {
      if (ticket.requesterId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });
    }

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
app.post("/api/tickets/:id/attachments", authenticate, requireRole(["Requester"]), (req: Request, res: Response, next) => {
  upload.single("file")(req, res, function (err) {
    if (err) {
      // Handle multer errors (e.g. file size, invalid type)
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const requesterId = req.user!.id;

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
app.get("/api/attachments/:id/download", authenticate, async (req: Request, res: Response) => {
  try {
    const attachmentId = parseInt(req.params.id, 10);
    const prisma = getPrisma();

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { ticket: { select: { requesterId: true } } }
    });

    if (!attachment) return res.status(404).json({ error: "Attachment not found" });
    
    if (req.user!.role === "Requester") {
      if (attachment.ticket.requesterId !== req.user!.id) return res.status(403).json({ error: "Forbidden" });
    }
    
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
app.delete("/api/tickets/:ticketId/attachments/:attachmentId", authenticate, requireRole(["Requester"]), async (req: Request, res: Response) => {
  try {
    const requesterId = req.user!.id;

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
// Lab 3 - IT Staff Ticket Operations (Issue 35)
// ---------------------------------------------------------------------------

app.patch("/api/tickets/:id", authenticate, requireRole(["IT Staff", "Administrator"]), async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { ownerId, itPriority, status } = req.body;
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    const validStatuses = ["New", "Open", "In Progress", "Waiting for Requester", "Resolved", "Closed", "Reopened", "Cancelled"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        ownerId: ownerId !== undefined ? ownerId : undefined,
        itPriority: itPriority !== undefined ? itPriority : undefined,
        status: status !== undefined ? status : undefined,
      }
    });

    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/tickets/:id/comments", authenticate, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { content, isResolutionIndication } = req.body;
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (req.user!.role === "Requester" && ticket.requesterId !== req.user!.id) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    if (!content) return res.status(400).json({ error: "Content is required" });

    const comment = await prisma.publicComment.create({
      data: {
        content,
        authorId: req.user!.id,
        ticketId
      },
      include: { author: { select: { name: true, role: true } } }
    });

    if (isResolutionIndication && req.user!.role === "Requester") {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { requesterResolved: true }
      });
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/tickets/:id/notes", authenticate, requireRole(["IT Staff", "Administrator"]), async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const { content } = req.body;
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (!content) return res.status(400).json({ error: "Content is required" });

    const note = await prisma.internalNote.create({
      data: {
        content,
        authorId: req.user!.id,
        ticketId
      },
      include: { author: { select: { name: true, role: true } } }
    });

    res.status(201).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/tickets/:id/communications", authenticate, async (req: Request, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const prisma = getPrisma();

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (req.user!.role === "Requester" && ticket.requesterId !== req.user!.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const comments = await prisma.publicComment.findMany({
      where: { ticketId },
      include: { author: { select: { name: true, role: true } } }
    });

    let communications: any[] = comments.map(c => ({ ...c, type: 'public_comment' }));

    if (req.user!.role === "IT Staff" || req.user!.role === "Administrator") {
      const notes = await prisma.internalNote.findMany({
        where: { ticketId },
        include: { author: { select: { name: true, role: true } } }
      });
      const notesMapped = notes.map(n => ({ ...n, type: 'internal_note' }));
      communications = [...communications, ...notesMapped];
    }

    communications.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.status(200).json(communications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ---------------------------------------------------------------------------
// Administrator Endpoints (User Management)
// ---------------------------------------------------------------------------

app.get("/api/users", authenticate, requireRole(["Administrator"]), async (req: Request, res: Response) => {
  try {
    const { search, role } = req.query;
    const prisma = getPrisma();

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } }
      ];
    }
    if (role) {
      where.role = role as string;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true
      },
      orderBy: { id: "asc" }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/users", authenticate, requireRole(["Administrator"]), async (req: Request, res: Response) => {
  try {
    const { name, email, role, isActive, password } = req.body;
    const prisma = getPrisma();

    if (!name || !email || !role || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["Requester", "IT Staff", "Administrator"].includes(role)) {
      return res.status(400).json({ error: "Invalid role value" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        isActive: isActive !== undefined ? isActive : true,
        passwordHash: hashedPassword,
        mustChangePassword: true // usually true for newly created admin accounts
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/api/users/:id", authenticate, requireRole(["Administrator"]), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { name, email, role, isActive } = req.body;
    const prisma = getPrisma();

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    if (role && !["Requester", "IT Staff", "Administrator"].includes(role)) {
      return res.status(400).json({ error: "Invalid role value" });
    }

    // BR-08: Admin cannot deactivate their own account
    if (isActive === false && userId === req.user!.id) {
      return res.status(400).json({ error: "Cannot deactivate your own account" });
    }

    // Check if changing email to one that already exists
    if (email && email !== targetUser.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    // BR-08: Prevent removing the last active Administrator
    if (targetUser.role === "Administrator" && targetUser.isActive) {
      const isDeactivating = isActive === false;
      const isChangingRole = role && role !== "Administrator";
      
      if (isDeactivating || isChangingRole) {
        const activeAdminsCount = await prisma.user.count({
          where: { role: "Administrator", isActive: true }
        });
        if (activeAdminsCount <= 1) {
          return res.status(400).json({ error: "Cannot remove or deactivate the last active Administrator" });
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/users/:id/reset-password", authenticate, requireRole(["Administrator"]), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const { newPassword } = req.body;
    const prisma = getPrisma();

    if (!newPassword) return res.status(400).json({ error: "newPassword is required" });

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        mustChangePassword: true
      }
    });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default app;
