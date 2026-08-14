# Lab 1 — AI Use and Reflection  (fill this in)

**LLM/agent used:** Google Antigravity / Gemini

## Selected key prompts (6–10)
| # | Prompt (summarised) | What I did with the result |
|---|---------------------|----------------------------|
| 1 | "How to write the API health check for Issue 2?" | The AI gave me the Express route code. I learned how to return a JSON status. |
| 2 | "Help me write a frontend test for the React App using Vitest." | I learned how to use `vi.spyOn` to mock the API call and check if "Online" shows up. |
| 3 | "I don't have Postgres installed. Can I use Docker instead?" | The AI gave me the `docker run` command so my Prisma could connect to the database easily. |
| 4 | "Help me write the `seed.ts` file to add the 4 categories." | I used the `upsert` command the AI suggested so the data doesn't duplicate if I run it twice. |
| 5 | "Can you check my Issue 3 code before I push to GitHub?" | The AI helped me review my code to make sure I didn't miss any rules or leak my password. |
| 6 | "How do I fetch and show the categories on the frontend for Issue 4?" | The AI helped me call my new API and show the data as a list in React. |
| 7 | "How do I test my backend API using Supertest?" | I learned how to use `request(app).get()` to test the backend route without actually starting the server. |
| 8 | "How do I make sure I don't upload my database password to GitHub?" | The AI told me to put my password in `.env` and make sure it's ignored by Git, keeping it safe. |

## Reflection
My prompts got better when I gave the AI more specific details, like asking "how to prevent duplicates in seed". I had to correct the AI when it tried to jump to the next issue because I needed to wait for my partner to approve the PR first.
