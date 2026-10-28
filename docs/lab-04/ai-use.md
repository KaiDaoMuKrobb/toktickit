# Lab 4 — AI Use and Reflection

**LLM / Agent used:** Google Antigravity / Gemini 3.8 Flash (High)

---

## Selected Key Prompts (6–10)

| # | Prompt (Summarised) | What I Did with the Result |
|---|---------------------|----------------------------|
| 1 | "How should I design the Prisma relational schema for Ticket to Actions Taken to support multiple IT Staff contributors and preserve cascade deletion?" | Implemented a dedicated `ActionTaken` model in Prisma with `@relation` referencing `ticketId` (`onDelete: Cascade`) and `performedById` linking to `User`. |
| 2 | "How do I enforce conditional validation in Express for Actions Taken where followUpNote is strictly required only if followUpRequired is true?" | Created a validation guard in the Express controller that checks `if (followUpRequired && (!followUpNote || !followUpNote.trim()))` and returns HTTP 400 Bad Request. |
| 3 | "How can I implement optimistic concurrency control in Express with Prisma to detect concurrent or stale ticket status updates?" | Added an `expectedUpdatedAt` timestamp check against `ticket.updatedAt`. If mismatched, the server returns HTTP 409 Conflict with the current ticket state to prevent overwrite. |
| 4 | "What is the most efficient Prisma aggregation query to compute operational dashboard metrics (unassigned, assigned to me, counts by status and priority) in a single round-trip?" | Used `prisma.ticket.groupBy` and `prisma.ticket.count` with compound `where` filters inside a `Promise.all` block to return authoritative dashboard cards without fetching unnecessary records. |
| 5 | "How should the Requester dashboard ensure strict data boundary so requesters never see other users' metrics or recent tickets?" | Bound the dashboard query strictly to `req.user.id` obtained from the verified JWT cookie payload (`where: { requesterId: req.user.id }`), ignoring any client-supplied parameters. |
| 6 | "How to build a responsive Actions Taken UI in React Bootstrap that displays as a structured data table on desktop and readable stacked cards on mobile?" | Used Bootstrap's `d-none d-md-table` and `d-md-none` utility classes along with `table-responsive` to seamlessly toggle between table view on desktop/tablet and clean cards on mobile devices. |
| 7 | "How to write Vitest component tests to verify that the Add Action modal dynamically requires follow-up notes when the checkbox is toggled?" | Used `@testing-library/react` and `userEvent` to simulate checking the follow-up toggle and asserting that the follow-up note input becomes visible and triggers validation if submitted empty. |
| 8 | "How to ensure Playwright E2E tests for ticket status transitions run against predictable data without timing out?" | Created an automated database re-seeding step before running E2E suites and used explicit Playwright locators (`getByRole('button', { name: ... })`) to ensure stable execution. |

---

## My Reflection

### Specification Agent
Using the AI as a specification agent helped formalize requirements before writing any code. Translating the stakeholder requirements into numbered Business Rules (such as separating ticket coordination from operational action taking, and ensuring the Requester's resolution input is treated strictly as advisory) prevented ambiguity. The AI also assisted in defining a clean status transition matrix and optimistic concurrency contract (409 Conflict) upfront, which saved hours of refactoring during the backend implementation.

### Coding Agent
In the coding phase, the AI served as a rapid pair programmer. It was especially effective at generating Prisma schema migrations without breaking legacy data, scaffolding type-safe Express endpoints with robust error handling, and implementing accessible React components following the Zen Green theme. Pairing with the AI on writing automated tests (Unit, API, Component, and E2E) ensured comprehensive test coverage and verified that zero regressions occurred in earlier features from Labs 1 to 3. Overall, applying Spec-Driven Development (Spec DD) and Test-Driven Development (Test DD) with AI guidance led to a well-structured, production-grade service desk application.
