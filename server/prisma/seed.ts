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

  console.log("Categories, Systems, and Users seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
