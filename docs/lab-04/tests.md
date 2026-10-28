# Lab 4 Test Plan & Traceability Matrix

This document provides complete traceability from requirements and acceptance criteria (AC) to automated test suites across API, UI component, workflow, concurrency, and end-to-end (E2E) layers.

## 1. Traceability Matrix

| Test ID | Type | Req / AC | What It Tests | Expected Result | Automated Test File | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **API-01** | API | AC-01 | Create valid Action Taken by permitted IT Staff | 201 Created; record linked to ticket with authenticated user as `performedBy` | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| **API-02** | API | AC-02 | Create Action Taken with `followUpRequired=true` but missing `followUpNote` | 400 Bad Request with validation error message | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| **API-03** | API | AC-03 | Attempt to create Action Taken by inactive staff or assign to inactive staff | 400 Bad Request; operation rejected | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| **API-04** | API | AC-04 | Requester attempts to POST or PATCH Action Taken | 403 Forbidden; write prevented | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| **API-05** | API | AC-04 | Requester retrieves Actions Taken for owned ticket vs another's ticket | 200 OK for own ticket; 403 Forbidden for other requester's ticket | `server/tests/lab-04/actions-taken.api.test.ts` | Pass |
| **API-06** | API | AC-05 | IT Staff transitions ticket from `New` to `In Progress` | 200 OK; status updated to `In Progress` with timestamp refreshed | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass |
| **API-07** | API | AC-06 | Disallowed transition attempt (e.g. `New` directly to `Closed` or `Resolved`) | 400 Bad Request; transition rejected | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass |
| **API-08** | API | AC-07 | Stale status transition with mismatched `expectedUpdatedAt` | 409 Conflict; server preserves existing status | `server/tests/lab-04/ticket-workflow.api.test.ts` | Pass |
| **API-09** | API | AC-08 | Requester dashboard metrics query | 200 OK; returns counts & recent tickets strictly for authenticated requester | `server/tests/lab-04/requester-dashboard.api.test.ts` | Pass |
| **API-10** | API | AC-09 | IT Staff dashboard operational metrics query | 200 OK; returns correct unassigned, myAssigned, byStatus, and byPriority counts | `server/tests/lab-04/staff-dashboard.api.test.ts` | Pass |
| **API-11** | API | AC-10 | Administrator dashboard query | 200 OK; returns both IT Staff operational metrics and user account breakdowns | `server/tests/lab-04/staff-dashboard.api.test.ts` | Pass |
| **UI-01** | Component | AC-09 | StaffDashboard renders metric cards, recent tickets, and drill-down links | Metric cards present, non-color cues rendered, clicking card triggers filter navigation | `client/tests/lab-04/StaffDashboard.test.tsx` | Pass |
| **UI-02** | Component | AC-08 | RequesterDashboard renders personal metrics, empty states, and quick actions | Personal counts displayed, drill-down links configured, empty state handled cleanly | `client/tests/lab-04/RequesterDashboard.test.tsx` | Pass |
| **UI-03** | Component | AC-01, AC-02 | ActionsTaken list, Add Action modal, and dynamic follow-up validation | Renders action rows; validates required follow-up note dynamically; submits successfully | `client/tests/lab-04/ActionsTaken.test.tsx` | Pass |
| **UI-04** | Component | AC-05, AC-07 | TicketWorkflow transition buttons and conflict detection alert | Only permitted transitions displayed; 409 conflict renders alert banner with refresh button | `client/tests/lab-04/TicketWorkflow.test.tsx` | Pass |
| **E2E-01** | E2E | AC-01, AC-04 | End-to-end IT Staff logs multiple Actions Taken, Requester views in read-only | Staff creates actions; Requester logs in and verifies view-only access without edit buttons | `e2e/lab-04/actions-taken-flow.spec.ts` | Pass |
| **E2E-02** | E2E | AC-05, AC-06 | End-to-end full ticket status lifecycle from New to Closed | Ticket transitions properly through allowed states; invalid skips are blocked | `e2e/lab-04/ticket-resolution.spec.ts` | Pass |
| **E2E-03** | E2E | AC-08, AC-09 | End-to-end Dashboards drill-down and responsive navigation | Metric cards load authoritative data; clicking card navigates to correctly filtered queue | `e2e/lab-04/dashboards.spec.ts` | Pass |
| **REG-01** | Regression | AC-11 | Full regression of Lab 1, 2, and 3 suites | All 38 server tests and 26 client tests pass without failure or breaking changes | Multiple test files | Pass |

---

## 2. Test Execution Commands

### Backend Automated Tests
```bash
cd server
npm test
```

### Frontend Component Tests
```bash
cd client
npm test
```

### End-to-End Tests
```bash
cd e2e
npx playwright test
```
