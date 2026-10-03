import { getPrisma } from "../src/prisma.js";
import bcrypt from "bcrypt";

// Issue 3 — seed the four supported categories.
// The four names are: Account and Access, Hardware, Software, Network.
// Requirement: running the seed twice must NOT create duplicates.
// Hint: prisma.category.upsert({ where:{name}, update:{}, create:{name} }).
async function main() {
  const prisma = getPrisma();
  void prisma;
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
    { name: "IT Staff Three", email: "it3@example.com", isActive: true, role: "IT Staff", passwordHash, mustChangePassword: false },
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
  const emailSys = await prisma.relatedSystem.findUnique({ where: { name: "Email" } });
  const vpnSys = await prisma.relatedSystem.findUnique({ where: { name: "VPN" } });

  const reqUser = await prisma.user.findUnique({ where: { email: "jennifer@example.com" } });
  const itUser = await prisma.user.findUnique({ where: { email: "it1@example.com" } });

  if (hardwareCat && accessCat && emailSys && vpnSys && reqUser && itUser) {
    const tickets = [
      {
        ticketNumber: "TKT-2026-0001",
        summary: "Laptop battery drains quickly",
        description: "My laptop battery is draining much faster than usual even when the system is idle. This started happening after last week's Windows update.",
        status: "In Progress",
        categoryId: hardwareCat.id,
        relatedSystemId: emailSys.id,
        requesterId: reqUser.id,
        ownerId: itUser.id,
        requestedPriority: "Medium",
        itPriority: "Medium",
        requesterResolved: false
      },
      {
        ticketNumber: "TKT-2026-0002",
        summary: "Cannot connect to VPN",
        description: "I am unable to connect to the VPN using my current credentials. It says 'authentication failed'.",
        status: "New",
        categoryId: accessCat.id,
        relatedSystemId: vpnSys.id,
        requesterId: reqUser.id,
        ownerId: null, // Unassigned
        requestedPriority: "High",
        itPriority: "High",
        requesterResolved: false
      },
      {
        ticketNumber: "TKT-2026-0003",
        summary: "Need access to SharePoint",
        description: "Please grant me access to the Engineering SharePoint site for the new project.",
        status: "Resolved",
        categoryId: accessCat.id,
        relatedSystemId: emailSys.id,
        requesterId: reqUser.id,
        ownerId: itUser.id,
        requestedPriority: "Low",
        itPriority: "Low",
        requesterResolved: true
      }
    ];

    for (const ticket of tickets) {
      await prisma.ticket.upsert({
        where: { ticketNumber: ticket.ticketNumber },
        update: ticket,
        create: ticket
      });
    }
  }

  console.log("Categories, Systems, Users, and Tickets seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
