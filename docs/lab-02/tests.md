# Lab 2 Test Plan and Results

## 1. Test Strategy
We will use Test-Driven Development (TDD) for unit, API, and UI component tests. E2E tests will be written with Playwright to verify the critical user flow. We will write the tests first to document the expected behavior before implementation.

## 2. Planned Tests

| Test ID | Type | Requirement / AC | What It Tests | Expected Result | Automated Test File | Final |
|---|---|---|---|---|---|---|
| API-01 | API | AC-01 | Create valid ticket | 201; one saved Ticket; number returned | server/tests/lab-02/create-ticket.api.test.ts | Pass |
| API-02 | API | AC-03 | Fetch other's ticket | 403 or 404 Error returned | server/tests/lab-02/ticket-detail.api.test.ts | Pass |
| API-03 | API | AC-06 | Download soft-removed file | 403 or 404 Error returned | server/tests/lab-02/attachments.api.test.ts | Pass |
| UI-01 | UI | AC-02 | Unauthenticated access | Redirect to Requester Selection | client/tests/lab-02/MyTickets.test.tsx | Pass |
| UI-02 | UI | AC-07 | Submit without Summary | Field validation message; API not called | client/tests/lab-02/CreateTicket.test.tsx | Pass |
| UI-03 | UI | AC-10 | Search with no results | "No matching tickets" state shown | client/tests/lab-02/MyTickets.test.tsx | Pass |
| API-04 | API | AC-09 | Soft-remove an attachment | 200 OK, attachment metadata updated | server/tests/lab-02/attachments.api.test.ts | Pass |
| E2E-01 | E2E | AC-01, AC-05 | Complete responsive submission flow | Confirmation shows official number | e2e/lab-02/requester-ticket-flow.spec.ts | Pass |

## 3. Acceptance-Criterion Traceability
- AC-01 -> API-01, UI-02, E2E-01
- AC-02 -> UI-01
- AC-03 -> API-02
- AC-04 -> E2E-01 (or separate MyTickets UI test)
- AC-05 -> UI-02 (file validation test)
- AC-06 -> API-03

## 4. Responsive and Visual Checklist
- [x] Desktop layout uses multi-column for Create Ticket
- [x] Mobile layout stacks fields vertically
- [x] No clipped labels, overlapping messages, or horizontal scrolling on mobile
- [x] Buttons use Zen Green Primary/Secondary styling correctly
- [x] Disabled buttons visually distinct and inaccessible
- [x] Validation messages appear immediately below the field

## 5. Test Commands
- Unit/API tests: `npm run test:api`
- UI component tests: `npm run test:ui`
- End-to-end tests: `npm run test:e2e`

## 6. Final Results
- All automated unit, component, API, and E2E tests pass.
- Manual responsive testing across Desktop/Mobile breakpoints confirmed working.
- UI validation functions and styling correctly implemented.

## 7. Known Limitations or Deferred Tests
- E2E tests currently run against mock authentication. Full authentication flow deferred to Lab 3.
