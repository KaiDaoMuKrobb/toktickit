# Lab 4 REST API Contract Specification

This document defines the complete REST API contract for Sprint 4 increments, including Actions Taken, Ticket Workflow, Dashboards, and conflict management.

## 1. Authentication & Security Context
- All endpoints require an active authenticated session via the HTTP-Only JWT cookie (`token`) established in Lab 3.
- Unauthorized requests return `401 Unauthorized` (`{ "error": "Authentication required" }`).
- Access violation returns `403 Forbidden` (`{ "error": "Access denied" }`).

---

## 2. Actions Taken Endpoints

### 2.1 List Actions Taken for a Ticket
- **Method / Path:** `GET /api/tickets/:id/actions`
- **Authorization:** 
  - `Requester`: Allowed only if the ticket is owned by the requester (`ticket.requesterId == req.user.id`).
  - `IT Staff` / `Administrator`: Allowed for any valid ticket.
- **Path Parameters:**
  - `id` (integer, required): Target Ticket ID.
- **Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "ticketId": 10,
    "actionDateTime": "2026-10-28T14:30:00.000Z",
    "description": "Replaced faulty power adapter and reconnected LAN cable.",
    "result": "System powered on successfully; link speed confirmed at 1Gbps.",
    "performedById": 2,
    "performedBy": {
      "id": 2,
      "name": "Michael IT",
      "email": "michael.it@toktickit.local",
      "role": "IT Staff"
    },
    "followUpRequired": true,
    "followUpNote": "Monitor workstation tomorrow morning for intermittent power drops.",
    "attachmentNotes": "Refer to power_meter_reading.jpg in attachments.",
    "createdAt": "2026-10-28T14:35:12.000Z",
    "updatedAt": "2026-10-28T14:35:12.000Z"
  }
]
```
- **Error Responses:**
  - `401 Unauthorized`: Not logged in.
  - `403 Forbidden`: Requester trying to view another requester's ticket actions.
  - `404 Not Found`: Ticket does not exist.

---

### 2.2 Create Action Taken
- **Method / Path:** `POST /api/tickets/:id/actions`
- **Authorization:** `IT Staff` or `Administrator` only. Requesters receive `403 Forbidden`.
- **Request Body:**
```json
{
  "actionDateTime": "2026-10-28T14:30:00.000Z",
  "description": "Cleaned optical sensor and ran diagnostic print pattern.",
  "result": "Print pattern output is sharp with no color distortion.",
  "followUpRequired": false,
  "followUpNote": null,
  "attachmentNotes": "Test print pattern filed in internal documentation."
}
```
- **Validation Rules:**
  - `description`: String, required, min 3 chars.
  - `result`: String, required, min 3 chars.
  - `actionDateTime`: ISO 8601 string, optional (defaults to server `now()`).
  - `followUpRequired`: Boolean, required.
  - `followUpNote`: String, **strictly required** if `followUpRequired == true` (must not be empty/whitespace). If `false`, can be null/omitted.
  - `performedById`: Automatically taken from `req.user.id`. Any value provided by the client is ignored.
  - Current actor must be an **active** user (`isActive == true`). If inactive, reject with `400 Bad Request`.
- **Success Response (201 Created):**
```json
{
  "id": 2,
  "ticketId": 10,
  "actionDateTime": "2026-10-28T14:30:00.000Z",
  "description": "Cleaned optical sensor and ran diagnostic print pattern.",
  "result": "Print pattern output is sharp with no color distortion.",
  "performedById": 2,
  "performedBy": {
    "id": 2,
    "name": "Michael IT",
    "email": "michael.it@toktickit.local",
    "role": "IT Staff"
  },
  "followUpRequired": false,
  "followUpNote": null,
  "attachmentNotes": "Test print pattern filed in internal documentation.",
  "createdAt": "2026-10-28T14:35:00.000Z",
  "updatedAt": "2026-10-28T14:35:00.000Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: Validation failure (missing required fields, empty follow-up note when required, or inactive staff).
  - `401 Unauthorized`: Not logged in.
  - `403 Forbidden`: Non-staff user.
  - `404 Not Found`: Ticket not found.

---

### 2.3 Update Action Taken
- **Method / Path:** `PATCH /api/tickets/:id/actions/:actionId`
- **Authorization:** `IT Staff` or `Administrator` only.
- **Request Body (partial update supported):**
```json
{
  "description": "Updated diagnostic details.",
  "result": "Resolved upon secondary boot check.",
  "followUpRequired": false,
  "followUpNote": null
}
```
- **Validation Rules:**
  - If `followUpRequired` is updated to `true`, `followUpNote` must be provided.
  - Inactive staff cannot perform updates.
- **Success Response (200 OK):** Updated `ActionTaken` object.
- **Error Responses:**
  - `400 Bad Request`: Validation failure.
  - `403 Forbidden`: Non-staff.
  - `404 Not Found`: Action or Ticket not found.

---

## 3. Ticket Status & Workflow Transition

### 3.1 Transition Ticket Status
- **Method / Path:** `PATCH /api/tickets/:id/status`
- **Authorization:** `IT Staff` or `Administrator`. Requesters receive `403 Forbidden`.
- **Request Body:**
```json
{
  "status": "In Progress",
  "expectedUpdatedAt": "2026-10-28T12:00:00.000Z"
}
```
- **Business Rules & Validation:**
  - `status`: Must be one of `New`, `Open`, `In Progress`, `Waiting for Requester`, `Resolved`, `Closed`, `Reopened`, `Cancelled`.
  - Must conform to the **Permitted State Transitions**:
    - `New` -> `Open`, `In Progress`, `Cancelled`
    - `Open` -> `In Progress`, `Waiting for Requester`, `Resolved`, `Cancelled`
    - `In Progress` -> `Open`, `Waiting for Requester`, `Resolved`, `Cancelled`
    - `Waiting for Requester` -> `In Progress`, `Open`, `Resolved`, `Cancelled`
    - `Resolved` -> `Closed`, `Reopened`
    - `Closed` -> `Reopened`
    - `Reopened` -> `In Progress`, `Open`, `Resolved`, `Cancelled`
    - `Cancelled` -> (None)
  - **Resolution Gate:** Transition to `Resolved` requires that the ticket has had actual investigation (e.g. an Action Taken logged or formal IT verification).
  - **Optimistic Concurrency Check:** If `expectedUpdatedAt` is provided, backend compares it with `ticket.updatedAt`. If mismatched, the request is rejected with `409 Conflict`.
- **Success Response (200 OK):**
```json
{
  "id": 10,
  "ticketNumber": "TKT-2026-00010",
  "status": "In Progress",
  "updatedAt": "2026-10-28T14:40:00.000Z"
}
```
- **Error Responses:**
  - `400 Bad Request`: Invalid transition (e.g., `New` -> `Closed`).
  - `403 Forbidden`: Requester role.
  - `404 Not Found`: Ticket not found.
  - `409 Conflict`: Stale update detected (`{ "error": "Conflict: Ticket was modified by another user", "currentTicket": { ... } }`).

---

## 4. Dashboard Endpoints

### 4.1 Requester Dashboard
- **Method / Path:** `GET /api/dashboards/requester`
- **Authorization:** `Requester` (or any authenticated user viewing their personal tickets).
- **Behavior:** Queries authoritative tickets where `requesterId == req.user.id`.
- **Success Response (200 OK):**
```json
{
  "metrics": {
    "open": 3,
    "inProgress": 2,
    "resolved": 5,
    "closed": 12
  },
  "recentTickets": [
    {
      "id": 12,
      "ticketNumber": "TKT-2026-00012",
      "summary": "Need new external monitor",
      "status": "In Progress",
      "updatedAt": "2026-10-28T13:20:00.000Z"
    }
  ]
}
```

---

### 4.2 IT Staff Dashboard
- **Method / Path:** `GET /api/dashboards/staff`
- **Authorization:** `IT Staff` or `Administrator`.
- **Behavior:** Calculates authoritative queue metrics:
  - `unassigned`: Tickets where `ownerId IS NULL` and status not in (`Closed`, `Cancelled`).
  - `myAssigned`: Tickets where `ownerId == req.user.id` and status not in (`Closed`, `Cancelled`).
  - `byStatus`: Count breakdown for each status (`New`, `Open`, `In Progress`, `Waiting for Requester`, `Resolved`, `Closed`).
  - `byPriority`: Count breakdown for `Critical`, `High`, `Medium`, `Low`.
  - `recentTickets`: 5 most recently updated active tickets.
- **Success Response (200 OK):**
```json
{
  "metrics": {
    "unassigned": 14,
    "myAssigned": 16,
    "new": 14,
    "open": 23,
    "inProgress": 18,
    "waitingForRequester": 7,
    "resolved": 9,
    "closed": 35
  },
  "byPriority": {
    "Critical": 4,
    "High": 12,
    "Medium": 25,
    "Low": 6
  },
  "recentTickets": [
    {
      "id": 24,
      "ticketNumber": "TKT-2026-00024",
      "summary": "Laptop battery drains quickly",
      "status": "In Progress",
      "itPriority": "High",
      "ownerName": "Michael IT",
      "updatedAt": "2026-10-28T14:15:00.000Z"
    }
  ]
}
```

---

### 4.3 Administrator Dashboard
- **Method / Path:** `GET /api/dashboards/admin`
- **Authorization:** `Administrator` only.
- **Behavior:** Reuses staff dashboard operational metrics and appends user account metrics.
- **Success Response (200 OK):**
```json
{
  "staffMetrics": {
    "unassigned": 14,
    "myAssigned": 2,
    "new": 14,
    "open": 23,
    "inProgress": 18,
    "waitingForRequester": 7,
    "resolved": 9,
    "closed": 35
  },
  "userMetrics": {
    "totalUsers": 15,
    "activeRequesters": 8,
    "activeStaff": 4,
    "activeAdmins": 2,
    "inactiveUsers": 1
  },
  "recentTickets": [ ... ]
}
```
