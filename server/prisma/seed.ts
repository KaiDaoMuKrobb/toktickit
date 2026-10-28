import { getPrisma } from "../src/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  const prisma = getPrisma();

  const categories = [
    "Account and Access",
    "Hardware",
    "Software",
    "Network",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const systems = [
    "Email",
    "VPN",
    "SAP",
    "HR Portal",
    "ERP"
  ];

  for (const name of systems) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const passwordHash = await bcrypt.hash("password123", 10);

  const users = [
    // Requesters
    { name: "Jennifer Anderson", email: "jennifer@example.com", isActive: true, role: "Requester", passwordHash, mustChangePassword: false },
    { name: "Michael Brown", email: "michael@example.com", isActive: true, role: "Requester", passwordHash, mustChangePassword: false },
    { name: "Sarah Johnson", email: "sarah@example.com", isActive: true, role: "Requester", passwordHash, mustChangePassword: false },
    { name: "David Lee", email: "david@example.com", isActive: true, role: "Requester", passwordHash, mustChangePassword: false },
    { name: "Inactive Requester", email: "inactive_req@example.com", isActive: false, role: "Requester", passwordHash, mustChangePassword: false },
    // IT Staff
    { name: "IT Staff One", email: "it1@example.com", isActive: true, role: "IT Staff", passwordHash, mustChangePassword: false },
    { name: "IT Staff Two", email: "it2@example.com", isActive: true, role: "IT Staff", passwordHash, mustChangePassword: false },
    { name: "IT Staff Three", email: "it3@example.com", isActive: true, role: "IT Staff", passwordHash, mustChangePassword: false }, // zero metrics demo
    { name: "Inactive IT", email: "inactive_it@example.com", isActive: false, role: "IT Staff", passwordHash, mustChangePassword: false },
    // Administrators
    { name: "Admin Boss", email: "admin@example.com", isActive: true, role: "Administrator", passwordHash, mustChangePassword: false },
    // Test First-Login User
    { name: "New User", email: "newuser@example.com", isActive: true, role: "Requester", passwordHash, mustChangePassword: true },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user
    });
  }

  // Fetch IDs for references
  const hardwareCat = await prisma.category.findUnique({ where: { name: "Hardware" } });
  const accessCat = await prisma.category.findUnique({ where: { name: "Account and Access" } });
  const softwareCat = await prisma.category.findUnique({ where: { name: "Software" } });
  const networkCat = await prisma.category.findUnique({ where: { name: "Network" } });

  const emailSys = await prisma.relatedSystem.findUnique({ where: { name: "Email" } });
  const vpnSys = await prisma.relatedSystem.findUnique({ where: { name: "VPN" } });
  const sapSys = await prisma.relatedSystem.findUnique({ where: { name: "SAP" } });

  const jennifer = await prisma.user.findUnique({ where: { email: "jennifer@example.com" } });
  const michael = await prisma.user.findUnique({ where: { email: "michael@example.com" } });
  const sarah = await prisma.user.findUnique({ where: { email: "sarah@example.com" } });
  const it1 = await prisma.user.findUnique({ where: { email: "it1@example.com" } });
  const it2 = await prisma.user.findUnique({ where: { email: "it2@example.com" } });

  if (hardwareCat && accessCat && softwareCat && networkCat && emailSys && vpnSys && sapSys && jennifer && michael && sarah && it1 && it2) {
    const tickets = [
      {
        ticketNumber: "TKT-2026-0001",
        summary: "Laptop battery drains quickly",
        description: "My laptop battery is draining much faster than usual even when the system is idle. This started happening after last week's Windows update.",
        status: "In Progress",
        categoryId: hardwareCat.id,
        relatedSystemId: emailSys.id,
        requesterId: jennifer.id,
        ownerId: it1.id,
        requestedPriority: "Medium",
        itPriority: "High",
        requesterResolved: false
      },
      {
        ticketNumber: "TKT-2026-0002",
        summary: "Cannot connect to VPN",
        description: "I am unable to connect to the VPN using my current credentials. It says 'authentication failed'.",
        status: "New",
        categoryId: accessCat.id,
        relatedSystemId: vpnSys.id,
        requesterId: jennifer.id,
        ownerId: null, // Unassigned
        requestedPriority: "High",
        itPriority: "Critical",
        requesterResolved: false
      },
      {
        ticketNumber: "TKT-2026-0003",
        summary: "Need access to SharePoint",
        description: "Please grant me access to the Engineering SharePoint site for the new project.",
        status: "Resolved",
        categoryId: accessCat.id,
        relatedSystemId: emailSys.id,
        requesterId: jennifer.id,
        ownerId: it1.id,
        requestedPriority: "Low",
        itPriority: "Low",
        requesterResolved: true
      },
      {
        ticketNumber: "TKT-2026-0004",
        summary: "SAP client crashes on launch",
        description: "Whenever I click on SAP GUI, it crashes with error code 0xC0000005.",
        status: "Waiting for Requester",
        categoryId: softwareCat.id,
        relatedSystemId: sapSys.id,
        requesterId: jennifer.id,
        ownerId: it2.id,
        requestedPriority: "High",
        itPriority: "High",
        requesterResolved: false
      },
      {
        ticketNumber: "TKT-2026-0005",
        summary: "Monitor flickering on desk 4B",
        description: "External monitor flickers constantly when plugged into HDMI port.",
        status: "Closed",
        categoryId: hardwareCat.id,
        relatedSystemId: emailSys.id,
        requesterId: jennifer.id,
        ownerId: it1.id,
        requestedPriority: "Medium",
        itPriority: "Medium",
        requesterResolved: true
      },
      {
        ticketNumber: "TKT-2026-0006",
        summary: "Network printer paper jam",
        description: "Floor 3 printer has a recurring paper jam in tray 2.",
        status: "Open",
        categoryId: networkCat.id,
        relatedSystemId: emailSys.id,
        requesterId: sarah.id,
        ownerId: null, // Unassigned
        requestedPriority: "Medium",
        itPriority: "Medium",
        requesterResolved: false
      }
    ];

    for (const ticket of tickets) {
      const createdTicket = await prisma.ticket.upsert({
        where: { ticketNumber: ticket.ticketNumber },
        update: ticket,
        create: ticket
      });

      // Seed Actions Taken idempotently
      if (ticket.ticketNumber === "TKT-2026-0001") {
        const existingActions = await prisma.actionTaken.findMany({ where: { ticketId: createdTicket.id } });
        if (existingActions.length === 0) {
          await prisma.actionTaken.create({
            data: {
              ticketId: createdTicket.id,
              actionDateTime: new Date("2026-10-28T09:15:00Z"),
              description: "Ran hardware battery diagnostics and inspected physical cell health.",
              result: "Cycle count is 860; cell health degraded to 58%.",
              performedById: it1.id,
              followUpRequired: true,
              followUpNote: "Order OEM replacement battery from vendor inventory.",
              attachmentNotes: "Diagnostic log attached in battery_diag.txt"
            }
          });
          await prisma.actionTaken.create({
            data: {
              ticketId: createdTicket.id,
              actionDateTime: new Date("2026-10-28T14:30:00Z"),
              description: "Installed new OEM battery pack and performed full calibration cycle.",
              result: "Battery recognized successfully; charge holds for 8.5 hours.",
              performedById: it2.id, // Different IT Staff member taking action! (BR-02)
              followUpRequired: false,
              followUpNote: null,
              attachmentNotes: null
            }
          });
        }
      } else if (ticket.ticketNumber === "TKT-2026-0003") {
        const existingActions = await prisma.actionTaken.findMany({ where: { ticketId: createdTicket.id } });
        if (existingActions.length === 0) {
          await prisma.actionTaken.create({
            data: {
              ticketId: createdTicket.id,
              actionDateTime: new Date("2026-10-28T10:00:00Z"),
              description: "Added user account to Engineering SharePoint security group.",
              result: "Permissions propagated and confirmed via test access.",
              performedById: it1.id,
              followUpRequired: false,
              followUpNote: null,
              attachmentNotes: null
            }
          });
        }
      } else if (ticket.ticketNumber === "TKT-2026-0004") {
        const existingActions = await prisma.actionTaken.findMany({ where: { ticketId: createdTicket.id } });
        if (existingActions.length === 0) {
          await prisma.actionTaken.create({
            data: {
              ticketId: createdTicket.id,
              actionDateTime: new Date("2026-10-28T11:00:00Z"),
              description: "Cleared SAP GUI cache and reinstalled SAP patch 770.",
              result: "Crash reproduced on user profile; requested user test with fresh Windows profile.",
              performedById: it2.id,
              followUpRequired: true,
              followUpNote: "Awaiting user confirmation after testing on secondary profile.",
              attachmentNotes: null
            }
          });
        }
      }
      // TKT-2026-0002 has 0 Actions Taken (demonstrates zero actions taken on ticket)
    }
  }

  console.log("Categories, Systems, Users, Tickets, and Actions Taken seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
