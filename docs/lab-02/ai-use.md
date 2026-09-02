# AI Use and Reflection

**LLM Used**: Google Gemini (Antigravity Agent)

## Selected Key Prompts

| Prompt / Request | Purpose |
| :--- | :--- |
| "Implement the planned API tests for the Ticket Creation flow and verify they fail as expected before coding." | Used Test-Driven Development (TDD) by asking the AI to write failing tests based on the `api-spec.md` to guarantee test coverage. |
| "Generate Prisma schema and migrations for the Ticket and Attachment models according to the BR-05 file constraints." | Sped up the database design process while ensuring it strictly adhered to the business rules (5MB size limit, max 5 files). |
| "Implement the Requester Ticket Detail screen with Zen Green UI styling and responsive behaviors." | Directed the AI to focus on frontend styling consistency, ensuring that the application meets the `ui-spec.md` color tokens and layout rules. |
| "Help debug the Prisma unique constraint error occurring when creating tickets with the same auto-generated ID." | Used the AI as a debugging partner to identify that deleting database records caused Ticket Number sequence collisions, leading to a more robust random-sequence solution. |
| "Write a Playwright End-to-End test to simulate a user filling out the ticket form, attaching a file, and checking the success alert." | Automated the tedious process of writing E2E test scripts for the full user journey, ensuring all Acceptance Criteria (AC-01) were met. |
| "Audit the entire codebase against `specification.md` and report any missing acceptance criteria." | Used the AI for a final code audit, which helped catch a missing requirement (AC-09: prompting for a reason before soft-deleting an attachment) before submission. |

## My Reflection

Using the AI coding agent significantly transformed my workflow for Lab 2. Instead of spending hours on boilerplate code and manual CSS styling, I was able to step into the role of a "Software Architect." By strictly defining the `specification.md` and `tests.md` first (Spec-Driven Development), I found that the AI could generate highly accurate code that required very little manual fixing.

However, I also learned that the AI is only as good as the instructions it is given. For example, the AI initially missed the exact requirement to ask for a "reason" when deleting an attachment because my prompt wasn't specific enough about AC-09. This taught me that evaluating AI output against a traceable engineering contract is crucial. Overall, the AI proved to be an invaluable pair-programming partner, allowing me to focus on system design, database architecture, and final quality assurance rather than repetitive typing.
