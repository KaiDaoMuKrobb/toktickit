# Lab 2 Test Plan and Results

## 1. Test Strategy
We will use Test-Driven Development (TDD) for unit, API, and UI component tests. E2E tests will be written with Playwright to verify the critical user flow. We will write the tests first to document the expected behavior before implementation.

## 2. Planned Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
|---|---|---|---|---|---|---|
| UNIT-01 | Unit | BR-01 | Ticket Number generator | Returns TKT-YYYY-XXXXXX format | server/tests/lab-02/create-ticket.api.test.ts | Pass |
| API-01 | API | AC-01, BR-02 | Create valid ticket | 201; one saved Ticket; number returned | server/tests/lab-02/create-ticket.api.test.ts | Pass |
| API-02 | API | AC-03, FR-06 | Fetch other's ticket | 403 or 404 Error returned | server/tests/lab-02/ticket-detail.api.test.ts | Pass |
| API-03 | API | AC-06 | Download soft-removed file | 410 Gone / Error returned | server/tests/lab-02/attachments.api.test.ts | Pass |
| API-04 | API | AC-09 | Soft-remove an attachment | 200 OK, isRemoved set to true | server/tests/lab-02/attachments.api.test.ts | Pass |
| UI-01 | UI | AC-02, BR-03 | Unauthenticated access | Redirect to Requester Selection | client/tests/lab-02/MyTickets.test.tsx | Pass |
| UI-02 | UI | AC-07, BR-07 | Submit without Summary | Field message; API not called | client/tests/lab-02/CreateTicket.test.tsx | Pass |
| UI-03 | UI | AC-10, BR-12 | Search with no results | "No matching tickets" state shown | client/tests/lab-02/MyTickets.test.tsx | Pass |
| UI-04 | UI | AC-05, BR-05 | Upload oversized file | Reject file locally, show error | client/tests/lab-02/AttachmentSection.test.tsx | Pass |
| E2E-01 | E2E | AC-01, AC-04, AC-08 | Complete responsive flow | Official number, list updates | e2e/lab-02/requester-ticket-flow.spec.ts | Pass |

## 3. Acceptance-Criterion Traceability
- **AC-01** (Valid Ticket Creation) -> API-01, E2E-01
- **AC-02** (No Requester Selected) -> UI-01
- **AC-03** (Ownership Protection) -> API-02
- **AC-04** (Pagination/Filters) -> E2E-01 (MyTickets filter logic)
- **AC-05** (Oversized Attachment) -> UI-04
- **AC-06** (Download Soft-Removed) -> API-03
- **AC-07** (Missing Summary/Desc) -> UI-02
- **AC-08** (Change Requester) -> E2E-01 (Context Switching check)
- **AC-09** (Soft-Remove Attachment) -> API-04
- **AC-10** (Empty Search Results) -> UI-03

## 4. Responsive and Visual Checklist
- [x] Desktop layout uses multi-column for Create Ticket
- [x] Mobile layout stacks fields vertically
- [x] No clipped labels, overlapping messages, or horizontal scrolling on mobile
- [x] Buttons use Zen Green Primary/Secondary styling correctly
- [x] Disabled buttons visually distinct and inaccessible
- [x] Validation messages appear immediately below the field

## 5. Test Commands
- Unit/API tests: `npm run test` (in server)
- UI component tests: `npm run test` (in client)
- End-to-end tests: `npx playwright test` (in e2e)

## 6. Final Results
- All automated unit, component, API, and E2E tests pass 100%.
- Manual responsive testing across Desktop/Mobile breakpoints confirmed working.
- UI validation functions and styling correctly implemented matching Zen Green guidelines.

## 7. Known Limitations or Deferred Tests
- E2E tests currently run against mock Development Requester selection. Full authentication flow deferred to Lab 3.
