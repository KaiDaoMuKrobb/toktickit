# Lab 3 Test Plan and Results

## 1. Test Strategy
We continue using Test-Driven Development (TDD) for unit, API, and UI component tests. E2E tests written with Playwright will verify the critical user flow. The tests below are designed to ensure role-based authorization, secure authentication, and the integrity of the IT Staff and Administrator workflows.

## 2. Planned Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
|---|---|---|---|---|---|---|
| API-01 | API | AC-01, FR-01 | Valid login | HTTP 200, HTTP-Only Cookie set, returns user data | `server/tests/lab-03/auth.api.test.ts` | Pend |
| API-02 | API | FR-01 | Invalid login | HTTP 401 Unauthorized | `server/tests/lab-03/auth.api.test.ts` | Pend |
| API-03 | API | AC-04, FR-06 | Requester requests Internal Notes | HTTP 403 Forbidden; no note data returned | `server/tests/lab-03/comments-notes.api.test.ts` | Pend |
| API-04 | API | AC-05, BR-08 | Admin self-deactivation | HTTP 400 Bad Request; validation failure | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| API-05 | API | AC-06, FR-04 | IT Staff queue retrieval | Paginated list of tickets returned | `server/tests/lab-03/staff-queue.api.test.ts` | Pend |
| API-06 | API | AC-07, FR-05 | IT Staff claims unassigned ticket | HTTP 200, owner updated, status changed to Open | `server/tests/lab-03/staff-ticket-detail.api.test.ts` | Pend |
| API-07 | API | BR-09 | Create duplicate email user | HTTP 400 Bad Request | `server/tests/lab-03/users-admin.api.test.ts` | Pass |
| UI-01 | UI | AC-02, BR-02 | First login forced password change | App renders Change Password screen, blocks other routes | `client/tests/lab-03/Login.test.tsx` | Pend |
| UI-02 | UI | AC-09, FR-03 | Requester clicks Problem Resolved | Posts a Public Comment and alerts IT Staff | `client/tests/lab-03/RequesterTicketDetail.test.tsx` | Pend |
| UI-03 | UI | FR-07 | Admin creates new user | Form submits, modal closes, user list updates | `client/tests/lab-03/UserManagement.test.tsx` | Pass |
| E2E-01 | E2E | AC-01, AC-03 | Authentication and Requester Regression | Requester logs in, creates ticket, views only own tickets | `e2e/lab-03/authentication.spec.ts` | Pend |
| E2E-02 | E2E | AC-02 | Initial password login and change | Normal app opens only after valid change | `e2e/lab-03/first-login.spec.ts` | Pend |
| E2E-03 | E2E | FR-04, FR-05 | Staff ticket flow | Staff logs in, views queue, claims ticket, posts internal note | `e2e/lab-03/staff-ticket-flow.spec.ts` | Pend |

## 3. Acceptance-Criterion Traceability
- **AC-01** (Valid login and role returned) -> API-01, E2E-01
- **AC-02** (Forced initial password change) -> UI-01, E2E-02
- **AC-03** (Ownership protection based on session) -> API-03 (inherently tested), E2E-01
- **AC-04** (Internal notes forbidden for Requesters) -> API-03
- **AC-05** (Admin self-deactivation blocked) -> API-04
- **AC-06** (IT Staff Queue data retrieval) -> API-05
- **AC-07** (Claiming an unassigned ticket) -> API-06
- **AC-08** (Internal Notes hidden from Public) -> API-03
- **AC-09** (Problem Appears Resolved action) -> UI-02
- **AC-10** (Invalid/Expired JWT token blocked) -> API-02 (implicitly tests token handling)

## 4. Security and Role Checklist
- [ ] Passwords stored using bcrypt/argon2 hashing, never plaintext.
- [ ] JWT tokens issued in secure HTTP-Only cookies.
- [ ] Unauthorized endpoints return `401 Unauthorized` or `403 Forbidden`.
- [ ] UI components strictly check role and hide forbidden navigation (hiding is not security, but UX).
- [ ] API strictly enforces role checks regardless of UI visibility.

## 5. Test Commands
- Unit/API tests: `npm run test` (in server)
- UI component tests: `npm run test` (in client)
- End-to-end tests: `npx playwright test` (in e2e)

## 6. Final Results
- *(Pending implementation)*

## 7. Known Limitations or Deferred Tests
- Tests regarding "Actions Taken" (which block resolution) are deferred to Lab 4 as per requirements.
