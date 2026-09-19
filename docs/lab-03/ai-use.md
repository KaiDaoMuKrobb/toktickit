# Lab 3 — AI Use and Reflection

**LLM/agent used:** Google Antigravity / Gemini

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | "How to set up JWT authentication with HTTP-Only cookies?" | I learned how to use `cookie-parser` and set the `httpOnly` flag to prevent XSS attacks. |
| 2 | "How to protect an API route so only Administrators can access it?" | I created a reusable middleware `requireRole` that checks the user's role from the JWT payload. |
| 3 | "How to write a Prisma query to find a user and update their password?" | I used the Prisma `update` function and learned to always hash the password before saving it. |
| 4 | "How to conditionally render the Admin button in the React Navbar?" | I used the authenticated user state context to conditionally show navigation links based on role. |
| 5 | "My Playwright test keeps timing out, how do I fix it?" | The AI helped me realize I needed to run the Prisma seed script to reset the database state between test runs. |
| 6 | "How to test if a React component redirects when mustChangePassword is true?" | I learned how to use `vi.mock` to spy on the React Router `useNavigate` hook in my Vitest setup. |
| 7 | "How to add custom CSS to make the Bootstrap switch match the Zen Green theme?" | I used the `.form-switch` class and learned how to override the active background color in `index.css`. |

## Reflection
My prompts got much better when I asked the AI specific technical questions rather than broad requests. For example, asking "how to mock useNavigate" gave me exactly the Vitest configuration I needed. I also learned that when working with Playwright E2E tests, the database state must be clean, which the AI helped me solve by suggesting I run the seed script before testing. Overall, the AI accelerated my debugging process and helped me understand role-based authorization patterns in Express.
