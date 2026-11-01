import { getPrisma } from "./src/prisma.js";

async function main() {
  const prisma = getPrisma();
  
  const staff = await prisma.user.findUnique({ where: { email: "it1@example.com" } });
  const staffId = staff?.id;

  const [
    unassigned,
    myAssigned,
    newTickets,
    openTickets,
    inProgress,
    waiting,
    resolved,
    closed,
    critical,
    high,
    medium,
    low
  ] = await Promise.all([
    prisma.ticket.count({ where: { ownerId: null, status: { notIn: ["Closed", "Cancelled"] } } }),
    prisma.ticket.count({ where: { ownerId: staffId, status: { notIn: ["Closed", "Cancelled"] } } }),
    prisma.ticket.count({ where: { status: "New" } }),
    prisma.ticket.count({ where: { status: "Open" } }),
    prisma.ticket.count({ where: { status: "In Progress" } }),
    prisma.ticket.count({ where: { status: "Waiting for Requester" } }),
    prisma.ticket.count({ where: { status: "Resolved" } }),
    prisma.ticket.count({ where: { status: "Closed" } }),
    prisma.ticket.count({ where: { itPriority: "Critical", status: { notIn: ["Closed", "Cancelled"] } } }),
    prisma.ticket.count({ where: { itPriority: "High", status: { notIn: ["Closed", "Cancelled"] } } }),
    prisma.ticket.count({ where: { itPriority: "Medium", status: { notIn: ["Closed", "Cancelled"] } } }),
    prisma.ticket.count({ where: { itPriority: "Low", status: { notIn: ["Closed", "Cancelled"] } } }),
  ]);

  console.log("=========================================");
  console.log("   DATABASE METRICS (IT STAFF DASHBOARD) ");
  console.log("=========================================");
  console.log(`Unassigned Tickets : ${unassigned}`);
  console.log(`My Assigned (it1)  : ${myAssigned}`);
  console.log(`New Tickets        : ${newTickets}`);
  console.log(`Open Tickets       : ${openTickets}`);
  console.log(`In Progress        : ${inProgress}`);
  console.log(`Waiting for Req    : ${waiting}`);
  console.log(`Resolved Tickets   : ${resolved}`);
  console.log(`Closed Tickets     : ${closed}`);
  console.log("-----------------------------------------");
  console.log(`Priority [Critical]: ${critical}`);
  console.log(`Priority [High]    : ${high}`);
  console.log(`Priority [Medium]  : ${medium}`);
  console.log(`Priority [Low]     : ${low}`);
  console.log("=========================================");

  await prisma.$disconnect();
}

main().catch(console.error);

