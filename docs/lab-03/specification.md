# Lab 3 Sprint Engineering Specification

## 1. Sprint Goal
Deliver secure authentication, role-based workflows for IT Staff to manage tickets, and a minimalist Administrator interface for user management. The temporary Lab 2 Development Requester selector will be replaced with real user login sessions.

## 2. Stakeholder Request Interpretation
The system must transition from a development mock-login to secure, password-based authentication. Users will be assigned one of three roles: Requester, IT Staff, or Administrator. 
- **Requesters** will continue to use the Lab 2 features, now protected by authenticated sessions, and gain the ability to post Public Comments and flag tickets as resolved.
- **IT Staff** will get a centralized Ticket Queue to find work, view Ticket Details, claim/reassign ownership, prioritize tickets, transition statuses, and communicate via Public Comments or Internal Notes.
- **Administrators** require a simple interface to list, create, edit, activate/deactivate, and set initial passwords for user accounts. 

All features must enforce role-based access control (RBAC) at the API level, and the UI must gracefully handle unauthorized access.

## 3. Scope
### Included
- User migration (Development Requesters to real authenticated Users)
- Password hashing, login, logout, and JWT cookie-based session management
- Mandatory first-login password change
- Server-side role-based authorization
- Requester ownership protection (Regression from Lab 2 + new features)
- IT Staff Ticket Queue with search, filter, sort, and pagination
- IT Staff Ticket operations (claim/reassign, IT priority, status workflow)
- Public Comments and Internal Notes (append-only)
- Minimalist Administrator User Management (CRUD operations, activation state, initial password generation)
- Responsive UI extensions using Zen Green design language

### Excluded
- Email invitations, password-reset emails, MFA, social login, SSO
- Self-registration / Requester-created accounts
- "Actions Taken" field (Deferred to Lab 4)
- SLA calculation, escalation rules, notification services
- Dashboards and KPI analytics beyond simple queue counts
- Multi-tenant organizations or departments
- Multiple roles per user
- User deletion (soft deactivation used instead)
- Profile-photo and extended profile management
- Account unlocking or advanced identity-management workflows
- Pagination for the Administrator user list

## 4. Functional Requirements
- **FR-01 Authentication:** Users must authenticate using their email and password. Initial passwords must be changed upon first login.
- **FR-02 Role-based Navigation:** The UI must display permitted navigation items and actions based on the authenticated user's role.
- **FR-03 Requester Ticket Access:** Requesters can only view, create, and manage tickets they own. They can post Public Comments and click "Problem Appears Resolved" to add an automated resolution comment.
- **FR-04 IT Staff Queue:** IT Staff can view a shared ticket queue that supports pagination, sorting, and filtering by category or status.
- **FR-05 IT Staff Ticket Management:** IT Staff can claim unassigned tickets, reassign tickets to other IT Staff/Admins, update IT Priority, and transition ticket statuses according to permitted workflows.
- **FR-06 Communication:** IT Staff and Admins can post Public Comments (visible to Requesters) and Internal Notes (hidden from Requesters).
- **FR-07 User Management:** Administrators can view all users, create new users with a specific role, update user details, activate/deactivate accounts, and generate new initial passwords.

## 5. Business Rules
- **BR-01** Only an active user with valid credentials may authenticate.
- **BR-02** A user marked as requiring a password change cannot enter the normal application until a new valid password is saved.
- **BR-03** The authenticated user identity, not a requesterId supplied by the client, determines ownership of Requester operations.
- **BR-04** Public Comments are visible to the Requester, IT Staff, and Administrator. Internal Notes are visible only to IT Staff and Administrator.
- **BR-05** A Requester may indicate that the problem appears resolved (via automated comment and flag), but cannot formally set the Ticket to Resolved or Closed.
- **BR-06** Passwords must be hashed using a strong algorithm (e.g., bcrypt/argon2) and must never be stored or exposed in plaintext.
- **BR-07** Authentication tokens (JWT) must be stored in HTTP-Only cookies to prevent XSS exfiltration.
- **BR-08** Administrators cannot deactivate their own account or remove the last active Administrator in the system.
- **BR-09** Email addresses must be unique across all users.
- **BR-10** Ticket Status Transitions: A Ticket starts as "New". It can move to "Open", "In Progress", "Waiting for Requester", "Resolved", "Closed", "Reopened", or "Cancelled". Only IT Staff and Admins can formally transition these statuses.
- **BR-11** Ticket Ownership: A Ticket may have zero or one primary Ticket Owner (must be an active IT Staff or Administrator).
- **BR-12** "Problem Appears Resolved" action posts a system-generated Public Comment and updates the `requesterResolved` flag to alert IT Staff.

## 6. UI Specification Summary
The application will reuse the "Zen Green" design language from Lab 2. 
New screens include: Login, Change Password, IT Staff Queue, IT Staff Ticket Detail, and User Management. 
Role-specific components will hide unauthorized actions (e.g., Requesters will not see the Internal Notes section). The UI will gracefully handle safe API failures (e.g., 401 Unauthorized, 403 Forbidden). See `docs/lab-03/ui-spec.md` for full details.

## 7. Data Changes
The Prisma schema will evolve to support authentication and IT operations.

**User Model (Replaces RequesterUser)**
- `id`, `name`, `email` (unique), `createdAt`
- `role` (String: "Requester", "IT Staff", "Administrator")
- `isActive` (Boolean)
- `passwordHash` (String)
- `mustChangePassword` (Boolean)

**Ticket Model Additions**
- `ownerId` (Nullable foreign key to User)
- `requestedPriority` (String: Low, Medium, High, Critical)
- `itPriority` (String: Low, Medium, High, Critical)
- `requesterResolved` (Boolean, default false)

**New Models**
- `PublicComment`: `id`, `content`, `createdAt`, `authorId`, `ticketId`
- `InternalNote`: `id`, `content`, `createdAt`, `authorId`, `ticketId`

**Migration & Seeds**
- Existing `RequesterUser` records will be migrated to `User` with role="Requester".
- Seed script must be idempotent and generate at least 4 active/1 inactive Requesters, 3 active/1 inactive IT Staff, and 1 active Admin.
- Seed realistic tickets with various statuses, priorities, and assigned/unassigned ownership.

## 8. API Contract
See `docs/lab-03/api-spec.md` for complete API definitions covering Authentication, User Management, Ticket Queue, Ticket Operations, and Comments/Notes.

## 9. Acceptance Criteria
- **AC-01** Given an active user with valid credentials, when the user logs in, then the backend establishes authenticated access via an HTTP-Only cookie and returns the permitted user identity and role.
- **AC-02** Given a user who must change the initial password, when login succeeds, then normal application screens remain unavailable until a valid new password is saved.
- **AC-03** Given an authenticated Requester, when the client supplies another requesterId, then the backend still applies the authenticated identity and does not return another Requester's data.
- **AC-04** Given a Requester account, when an Internal Note endpoint is requested, then the operation is rejected (403 Forbidden) without exposing note content.
- **AC-05** Given an Administrator managing users, when they attempt to deactivate their own account, then the request is rejected with a validation error.
- **AC-06** Given the IT Staff Queue, when IT Staff requests tickets, then a paginated list of all tickets is returned, sortable and filterable by status/category.
- **AC-07** Given an unassigned ticket, when an IT Staff claims it, then the ticket owner is updated to the IT Staff's ID and the status transitions to "Open" or "In Progress".
- **AC-08** Given an authenticated IT Staff member, when they post an Internal Note, then the note is saved and is not visible in the Public Comments endpoint for Requesters.
- **AC-09** Given an authenticated Requester, when they click "Problem Appears Resolved", then a Public Comment is appended and the ticket is flagged, but the ticket status remains unchanged.
- **AC-10** Given an invalid or expired JWT token, when a protected endpoint is requested, then a 401 Unauthorized response is returned.

## 10. Definition of Done
- Implementation of all approved scope.
- Satisfaction of all acceptance criteria.
- Passing and traceable automated tests (Unit, API, UI, E2E).
- Conformance to data, API, UI, validation, and responsive specs.
- Peer review and approval completed.
- Code merged to `main` and final PDF report generated.

## 11. Assumptions and Decisions
- **Assumption:** Authentication relies on JWTs stored securely in HTTP-Only, SameSite cookies. The React client will manage the UI state based on the `/api/auth/me` endpoint.
- **Decision:** The "Problem Appears Resolved" feature will be implemented by setting a `requesterResolved: true` boolean on the Ticket, alerting IT Staff visually without violating the business rule restricting Requesters from changing the core `status` field.
