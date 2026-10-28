# Lab 4 Sprint Engineering Specification: TokTickIT Actions Taken, Dashboards, and Final Regression

## 1. Sprint Goal
Complete the core TokTickIT service-desk lifecycle by adding an "Actions Taken" operational record under tickets, enforcing strict Ticket status transition and resolution rules, delivering role-appropriate Dashboards for Requesters, IT Staff, and Administrators, and hardening the entire application across all sprints to guarantee zero regressions.

## 2. Stakeholder Request Interpretation
The organization now has reliable ticketing and communication channels, but IT Staff lack a formal mechanism to log and track step-by-step diagnostic and remediation efforts. 
- **Actions Taken:** Each ticket must support multiple chronologically recorded actions taken by any IT Staff member (not restricted to the ticket owner), logging what was done, the result, whether follow-up is necessary (with mandatory note), and relevant attachment pointers.
- **Workflow & Resolution:** While Requesters can indicate that their issue is resolved (as an advisory signal), only IT Staff can formally review and resolve or close the ticket according to approved transition rules.
- **Dashboards:** Requesters require a concise view of their active and recently resolved tickets, while IT Staff and Administrators need actionable operational dashboards (unassigned tickets, my tickets, status/priority breakdown, recent activity) with drill-down navigation to detailed views.
- **Hardening & Quality:** All existing capabilities from Labs 1 to 3 must continue to function seamlessly within the Zen Green design system with full accessibility and responsive support.

## 3. Scope
### Included
- **Actions Taken Domain Model & APIs:** Parent-child relationship (1 Ticket to N Actions Taken), record action timestamp, description, result, authenticated actor (`performedBy`), follow-up flag, follow-up note, and attachment notes.
- **Ticket Lifecycle & Workflow Governance:** Enforce the complete status transition matrix (`New`, `Open`, `In Progress`, `Waiting for Requester`, `Resolved`, `Closed`, `Reopened`, `Cancelled`). Enforce resolution requirements (resolution gate) and optimistic concurrency/stale-update detection.
- **Role-Appropriate Dashboards:**
  - Requester Dashboard: Total open tickets, tickets waiting for requester, recently updated, recently resolved (strictly limited to authenticated requester).
  - IT Staff Dashboard: Unassigned tickets, tickets assigned to current staff, tickets grouped by status and IT priority, recently updated tickets, and drill-down links.
  - Administrator Dashboard: Extends IT Staff dashboard with concise active/total user metrics.
- **Zen Green UI Enhancements:** Actions Taken panel on Ticket Detail (list, create modal/form, edit modal/form), role-specific dashboard views, permitted transition controls, keyboard accessibility, responsive layouts, and non-color cues.
- **Database Increment & Seed:** Idempotent migration and seed supporting legacy tickets without actions, zero-metric and non-zero-metric states, and active/inactive staff scenarios.
- **Automated Testing & Hardening:** Comprehensive unit, integration/API, component, and end-to-end (E2E) test suites covering new features and regression verification for Labs 1–3.

### Explicitly Excluded (Out of Scope)
- Automatic SLA countdown clocks, escalation triggers, and breach alerts.
- External notification services (Email, SMS, LINE, webhooks, push notifications).
- Inventory consumption, spare parts tracking, purchasing, and billing/labor-cost calculations.
- Multi-level hierarchical approval workflows and digital signatures.
- Advanced BI tools, custom ad-hoc report designers, and data warehouse exports.
- Multi-tenant tenant-isolation and enterprise cloud infrastructure operations.
- Any unapproved feature outside the Sprint 4 contract.

---

## 4. Functional Requirements
- **FR-01 Actions Taken Logging:** IT Staff and Administrators can append and update Actions Taken records for any accessible ticket.
- **FR-02 Automatic Actor Capture:** The system automatically binds the authenticated user as the `performedBy` actor for created Actions Taken without allowing spoofing.
- **FR-03 Inactive Assignee Rejection:** Creating or updating an Action Taken or assigning ownership to an inactive IT Staff member must be rejected.
- **FR-04 Requester Actions Taken Visibility:** Requesters can view all Actions Taken records on tickets they own, but cannot create, modify, or delete Actions Taken.
- **FR-05 Ticket Status Transition Rules:** The system strictly permits only authorized transitions between ticket statuses. Transition attempts outside the valid state machine must be rejected with HTTP 400.
- **FR-06 Resolution Gate:** Transitioning a ticket to `Resolved` requires formal IT Staff action and verification. A Requester's "Problem Appears Resolved" input is advisory only.
- **FR-07 Concurrency & Conflict Detection:** Status transitions and updates must check for stale data (e.g., via `updatedAt` or version match) and reject conflicting simultaneous edits with HTTP 409 Conflict.
- **FR-08 Requester Dashboard:** Requesters receive an authenticated dashboard summarizing their personal tickets: Total Open, Waiting for Requester, Recently Updated, and Recently Resolved, with clickable cards drilling down to filtered lists.
- **FR-09 IT Staff Dashboard:** IT Staff receive an operational dashboard displaying Unassigned Tickets, My Assigned Tickets, counts grouped by Status and IT Priority, and Recently Updated Tickets, with drill-down navigation.
- **FR-10 Administrator Dashboard:** Administrators receive all IT Staff metrics plus concise counts of active and total user accounts.
- **FR-11 Regression Integrity:** All features from Labs 1, 2, and 3 (Authentication, Requester My Tickets, Ticket Detail, Attachments, Public Comments, Internal Notes, IT Queue, User Management) remain fully operational.

---

## 5. Business Rules
- **BR-01 Parent Relationship:** An Action Taken record belongs to exactly one Ticket.
- **BR-02 Multi-Actor Operations:** The Ticket Owner coordinates the ticket overall, but Actions Taken may be performed and logged by any active IT Staff or Administrator.
- **BR-03 Immutable Actor Field:** `performedById` is automatically derived from the authenticated session token and cannot be overridden by user input.
- **BR-04 Follow-up Note Rule:** If `followUpRequired` is `true`, `followUpNote` must not be blank or whitespace. If `followUpRequired` is `false`, `followUpNote` is optional or empty.
- **BR-05 Attachment Notes Reference:** `attachmentNotes` stores textual guidance regarding related files or screenshot references and does not replace the binary attachment system.
- **BR-06 Requester Advisory Only:** When a Requester indicates "Problem Appears Resolved", the system records an advisory flag/comment. The Ticket status remains unchanged until an IT Staff member formally transitions it.
- **BR-07 Status Transition Matrix:**
  - `New` -> `Open`, `In Progress`, `Cancelled`
  - `Open` -> `In Progress`, `Waiting for Requester`, `Resolved`, `Cancelled`
  - `In Progress` -> `Open`, `Waiting for Requester`, `Resolved`, `Cancelled`
  - `Waiting for Requester` -> `In Progress`, `Open`, `Resolved`, `Cancelled`
  - `Resolved` -> `Closed`, `Reopened`
  - `Closed` -> `Reopened` (or terminal depending on configuration; reopening creates a new active cycle)
  - `Reopened` -> `In Progress`, `Open`, `Resolved`, `Cancelled`
  - `Cancelled` -> (Terminal)
- **BR-08 Stale Update Protection:** Any write operation on ticket workflow must verify that the client's known `updatedAt` timestamp matches the database record, preventing blind overwrites.
- **BR-09 Requester Dashboard Boundary:** A Requester can never see counts, metrics, or recent tickets belonging to other requesters.
- **BR-10 Staff Dashboard Calculations:** Unassigned tickets count all tickets where `ownerId IS NULL` and status is not `Closed` or `Cancelled`. "My Assigned" counts tickets where `ownerId == currentUserId` and status is active.
- **BR-11 Append-Only Audit Integrity:** Actions Taken logs maintain chronological ordering and preserve work history for transparency.

---

## 6. UI Specification Summary
The UI adheres strictly to the **Zen Green** design language:
- **Dashboards:** Clean metric cards (`bg-white`, border `#EAF6EF`, bold numbers, green accent pills, and accessible keyboard-focusable drill-down links).
- **Actions Taken Panel:** Located on Ticket Detail below Ticket Overview. Features:
  - Responsive table on desktop/tablet, stacked cards on mobile.
  - "Add Action Taken" button (visible only to IT Staff/Admin).
  - Modal form containing: Action Date/Time (default now), Description (required textarea), Result (required textarea), Follow-Up Required toggle, Follow-Up Note (conditionally visible/required), Attachment Notes (optional input).
  - Performed By badge showing staff name.
- **Workflow Action Bar:** Shows allowed transition buttons based on current state and role. Displays clear loading states, conflict error alerts (with refresh button), and immediate status badge updates upon success.
- **Accessibility & Safe Failure:** All forms support tab navigation, distinct focus outlines, ARIA attributes, semantic labels, non-color cues (badges with icons/text), and handle offline/server errors gracefully. See `docs/lab-04/ui-spec.md` for exact layout diagrams.

---

## 7. Data Changes
### Prisma Schema Updates
```prisma
model ActionTaken {
  id                 Int      @id @default(autoincrement())
  ticketId           Int
  ticket             Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  actionDateTime     DateTime @default(now())
  description        String
  result             String
  performedById      Int
  performedBy        User     @relation(fields: [performedById], references: [id])
  followUpRequired   Boolean  @default(false)
  followUpNote       String?
  attachmentNotes    String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@index([ticketId])
  @@index([performedById])
}
```

### Database Design Decisions
1. **Decision 1 - Normalized `ActionTaken` Child Model with Foreign Key Indexing:**
   - *Rationale:* Storing actions as a distinct relational model (`ActionTaken`) rather than a JSON column enforces schema validation, foreign key constraints (`ticketId`, `performedById`), and relational integrity. Indexing `ticketId` ensures fast queries when loading ticket detail screens, while indexing `performedById` optimizes user audit and staff dashboard queries.
2. **Decision 2 - Optimistic Concurrency via Model `updatedAt` Timestamp Verification:**
   - *Rationale:* To satisfy BR-08 (preventing concurrent overwriting between IT Staff members), the API checks the ticket's `updatedAt` against the client-submitted timestamp before status transitions. If mismatched, HTTP 409 Conflict is returned, ensuring safe distributed collaboration without table locks.

### Migration & Backfill Strategy
- Migration is non-destructive. All existing tables (`User`, `Ticket`, `Attachment`, `PublicComment`, `InternalNote`) remain intact.
- Legacy tickets without `ActionTaken` records default to empty action arrays and remain fully functional.
- Dashboard queries treat legacy tickets according to their existing status, priority, and ownership fields.

### Seed Data
- Idempotent seed script (`npm run prisma:seed` or `npm run seed`) creating:
  - Active and inactive users for Requesters, IT Staff, and Administrators.
  - Tickets with zero Actions Taken (legacy simulation), 1 Action Taken, and multiple Actions Taken by different IT Staff members.
  - Realistic distribution of statuses and priorities to produce non-zero metrics on dashboards, along with isolated accounts to demonstrate zero-state empty dashboards.

---

## 8. API Contract Summary
Full schemas and payload specifications are documented in `docs/lab-04/api-spec.md`.
- `POST /api/tickets/:id/actions`: Create new Action Taken (IT Staff / Admin).
- `PATCH /api/tickets/:id/actions/:actionId`: Update Action Taken (IT Staff / Admin).
- `GET /api/tickets/:id/actions`: List Actions Taken for a ticket (Owner Requester, IT Staff, Admin).
- `PATCH /api/tickets/:id/status`: Transition ticket status with concurrency check.
- `GET /api/dashboards/requester`: Retrieve requester metric cards and recent tickets.
- `GET /api/dashboards/staff`: Retrieve IT Staff metric cards, breakdowns, and recent queue.
- `GET /api/dashboards/admin`: Retrieve staff dashboard metrics plus system user counts.

---

## 9. Acceptance Criteria
- **AC-01:** Given a permitted IT Staff user and valid data, when an Action Taken is created, then it is saved under the correct Ticket with the authenticated user as `performedBy`.
- **AC-02:** Given an Action Taken creation request with `followUpRequired=true` and an empty `followUpNote`, then the request is rejected with HTTP 400 Bad Request.
- **AC-03:** Given an attempt to log an Action Taken by or assigned to an inactive user account, then the backend rejects the operation with HTTP 400.
- **AC-04:** Given an authenticated Requester, when viewing their owned Ticket, then they can view all Actions Taken, but action modification controls are absent and write endpoints return HTTP 403 Forbidden.
- **AC-05:** Given a Ticket in status `New`, when an IT Staff member transitions it to `In Progress`, then the status updates and an audit timestamp is refreshed.
- **AC-06:** Given an unauthorized status jump (e.g. `New` directly to `Closed`), then the backend rejects the update with HTTP 400 Bad Request.
- **AC-07:** Given a status transition request with a stale `updatedAt` timestamp, then the backend returns HTTP 409 Conflict and preserves current data.
- **AC-08:** Given an authenticated Requester, when dashboard data is retrieved, then only metrics and recent tickets owned by that Requester are returned.
- **AC-09:** Given an authenticated IT Staff member, when dashboard data is retrieved, then accurate unassigned, assigned, status, and priority metrics are returned with valid drill-down filters.
- **AC-10:** Given an authenticated Administrator, when dashboard data is retrieved, then IT metrics plus user account counts are returned.
- **AC-11:** Given the complete regression test suite covering Labs 1, 2, and 3, when executed, all tests pass with zero regressions.

---

## 10. Definition of Done (DoD)
- [ ] Schema migration applied cleanly; seed data is idempotent and realistic.
- [ ] All new endpoints implemented with strict authentication and role authorization.
- [ ] Concurrency conflict handling (409 Conflict) implemented and verified.
- [ ] UI components created and integrated with Zen Green styling.
- [ ] Responsive design verified on Desktop, Tablet, and Mobile viewports.
- [ ] Accessibility verified (tab order, visible focus, ARIA labels, non-color status cues).
- [ ] Automated Unit, API, Component, and E2E tests passing with 100% success.
- [ ] Zero console errors in production build.
- [ ] Code reviewed, approved in `reviewer.md`, and merged into `lab4-staging` and `main`.
- [ ] Final 9-part PDF report compiled with all required evidence.

---

## 11. Assumptions and Decisions
- **Assumption:** Browser sessions maintain HTTP-Only JWT authentication cookies established in Lab 3.
- **Decision:** The Requester's "Problem Appears Resolved" flag remains an advisory hint and does NOT automatically set `status = Resolved`. Formal resolution is an explicit transition performed by IT Staff to safeguard service quality.
- **Decision:** Stale updates are handled via HTTP 409 Conflict returning current server state, prompting the user interface to refresh and alert the user without destructive data loss.
