# Lab 4 — AI Use and Reflection

**LLM / Agent used:** Google Antigravity / Gemini 3.8 Flash (High)

---

## Selected Key Prompts (6–10)

| # | Prompt (Summarised) | What I Did with the Result |
|---|---------------------|----------------------------|
| 1 | "How do I design the Prisma schema for Actions Taken with relations to Ticket and User?" | Added the `ActionTaken` model with `@relation` to `ticketId` (cascade delete) and `performedById` to `User`. |
| 2 | "How can I make followUpNote required only when followUpRequired is true in Express?" | Added validation in Express to check if `followUpRequired` is true, then make sure `followUpNote` is not empty. |
| 3 | "How do I handle conflict when two people update the same ticket status at the same time (409 Conflict)?" | Added `expectedUpdatedAt` check against `ticket.updatedAt` to return HTTP 409 Conflict if someone already changed it. |
| 4 | "How do I write Prisma count queries to get dashboard metrics for IT Staff in one go?" | Used `Promise.all` with `prisma.ticket.count` filters to fetch all dashboard numbers efficiently. |
| 5 | "How can I make sure a Requester only sees their own tickets on their dashboard?" | Filtered the query by `req.user.id` from the auth session so users cannot see tickets from others. |
| 6 | "How do I make the Actions Taken list look like a table on desktop and cards on mobile using Bootstrap?" | Used Bootstrap classes `d-none d-md-block` for table view and `d-md-none` for mobile cards. |
| 7 | "How can I test with Vitest that the follow-up note input shows up and is required when checked?" | Wrote component tests using React Testing Library to toggle the checkbox and check that validation errors appear. |
| 8 | "How do I write simple Playwright E2E tests for ticket status updates without timing out?" | Created automated E2E tests using clear role locators to verify the full ticket flow smoothly. |

---

## My Reflection

Using AI in Lab 4 helped me work faster and avoid mistakes throughout the project. During the planning step, it helped me define clear ticket rules and plan the status transitions and conflict handling before writing code. When coding, the AI worked as a helpful pair programmer to create the Prisma models, build the Express dashboard APIs, and style the Zen Green React components for both desktop and mobile screens. It also helped write unit, API, component, and E2E tests, making sure all features from earlier labs continued to work without issues. Overall, working with AI made the development process smooth, organized, and easy to complete.
