# AI Use Disclosure

**Student:** Sunny
**Project:** TokTickIT (Lab 3: Authentication & User Management)
**Date:** September 19, 2026

## 1. Description of AI Usage
Throughout the development of Lab 3, I utilized an AI coding assistant (Google Antigravity) as a pair-programming partner. The AI was primarily used to:
- Translate business rules (e.g., JWT HTTP-Only cookies, forced first-login password changes) into robust TypeScript implementations.
- Refactor React components (e.g., `UserManagement.tsx`) to strictly adhere to the provided UI specifications, including precise hex color matching and minimalist design requirements.
- Diagnose and debug unexpected behavior, such as Vite proxy misconfigurations that caused API calls to fail, and routing logic issues for Role-Based Access Control in `App.tsx`.
- Assist in generating unit and UI component tests (using Vitest and React Testing Library) to ensure full coverage of the new features.

## 2. Impact on the Work
The AI significantly accelerated the debugging process, particularly for identifying configuration issues like the missing proxy in Vite. It also helped ensure that repetitive tasks (like mapping exact hex colors for role badges) were done accurately according to the `ui-spec.md`. The design decisions and architectural flow remained under my supervision.

## 3. Verification
Every piece of code generated or modified by the AI was tested locally using automated test suites (`vitest` for the backend and frontend) as well as manual browser testing. I reviewed the implementation to ensure it met all Acceptance Criteria (AC-01 through AC-10) and Business Rules specified in the Lab 3 documentation. No code was committed without a full understanding of its functionality.
