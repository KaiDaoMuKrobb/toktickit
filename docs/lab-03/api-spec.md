# Lab 3 API Specification

## Common Requirements
- **Authentication**: Lab 3 uses JSON Web Tokens (JWT) stored in HTTP-Only cookies. Clients do not need to manually send headers; the browser will include the secure cookie automatically.
- **Authorization**: Endpoints explicitly define which Roles are permitted. 
- **Safe Errors**:
  - `401 Unauthorized`: Missing or invalid session cookie.
  - `403 Forbidden`: Authenticated, but lacks required role or ownership.
  - `404 Not Found`: Resource doesn't exist (or ownership protection hides it).
  - `400 Bad Request`: Validation failure.

---

## 1. Authentication Endpoints

### 1.1 Login
`POST /api/auth/login`
- **Purpose**: Authenticate user and issue JWT cookie.
- **Body**: `{ "email": "admin@example.com", "password": "password123" }`
- **Responses**:
  - `200 OK`: Sets HTTP-Only cookie `token`. Returns `{ "id": 1, "role": "Administrator", "mustChangePassword": false }`.
  - `401 Unauthorized`: Invalid credentials or inactive account.

### 1.2 Get Current User Session
`GET /api/auth/me`
- **Purpose**: Retrieve current authenticated user data on page load.
- **Responses**:
  - `200 OK`: Returns `{ "id": 1, "name": "Admin", "role": "Administrator", "mustChangePassword": false }`.
  - `401 Unauthorized`: No valid session.

### 1.3 Logout
`POST /api/auth/logout`
- **Purpose**: Clear JWT cookie.
- **Responses**: `200 OK` (clears cookie).

### 1.4 Change Initial Password
`POST /api/auth/change-password`
- **Purpose**: Allow user with `mustChangePassword=true` to set a new password.
- **Body**: `{ "currentPassword": "...", "newPassword": "..." }`
- **Responses**:
  - `200 OK`: Updates passwordHash, sets `mustChangePassword=false`.

---

## 2. Administrator Endpoints (User Management)

### 2.1 List Users
`GET /api/users`
- **Role**: `Administrator` only.
- **Query Params**: `search` (name/email), `role` (optional).
- **Response**: `200 OK` with array of users (excluding password hashes).

### 2.2 Create User
`POST /api/users`
- **Role**: `Administrator` only.
- **Body**: `{ "name": "...", "email": "...", "role": "IT Staff", "isActive": true, "password": "..." }`
- **Responses**: `201 Created` or `400 Bad Request` (e.g. duplicate email).

### 2.3 Update User
`PATCH /api/users/:id`
- **Role**: `Administrator` only.
- **Body**: `{ "name": "...", "email": "...", "role": "...", "isActive": true }`
- **Responses**: 
  - `200 OK`
  - `400 Bad Request` (e.g. preventing self-deactivation or removing last Admin).

### 2.4 Set New Initial Password
`POST /api/users/:id/reset-password`
- **Role**: `Administrator` only.
- **Body**: `{ "newPassword": "..." }`
- **Responses**: `200 OK` (Updates hash and sets `mustChangePassword=true`).

---

## 3. Ticket Endpoints (IT Staff & Requester)

### 3.1 IT Staff Ticket Queue
`GET /api/tickets/queue`
- **Role**: `IT Staff`, `Administrator`.
- **Query Params**: `search`, `category`, `status`, `ownerId`, `page`, `limit`, `sortBy`, `sortOrder`.
- **Response**: `200 OK` with paginated ticket list.

### 3.2 List Owned Tickets (Requester Regression)
`GET /api/tickets`
- **Role**: `Requester`.
- **Behavior**: Same as Lab 2, but infers ownership directly from the JWT session instead of a custom header.

### 3.3 Get Ticket Detail
`GET /api/tickets/:id`
- **Role**: Any authenticated user.
- **Behavior**: 
  - `IT Staff`/`Admin`: Can view any ticket.
  - `Requester`: Can only view if `ticket.requesterId == session.userId`. Returns `403 Forbidden` otherwise.

### 3.4 Update Ticket Operations (IT Staff)
`PATCH /api/tickets/:id`
- **Role**: `IT Staff`, `Administrator`.
- **Body**: `{ "ownerId": 2, "itPriority": "High", "status": "In Progress" }`
- **Responses**: `200 OK` or `400 Bad Request` (Invalid status transition).

---

## 4. Communication Endpoints (Comments & Notes)

### 4.1 Post Public Comment
`POST /api/tickets/:id/comments`
- **Role**: Any authenticated user (Requester must own the ticket).
- **Body**: `{ "content": "Checking on this issue.", "isResolutionIndication": false }`
- **Behavior**: If `isResolutionIndication=true`, the backend sets `requesterResolved=true` on the Ticket to alert IT Staff.

### 4.2 Post Internal Note
`POST /api/tickets/:id/notes`
- **Role**: `IT Staff`, `Administrator` only.
- **Body**: `{ "content": "Requires vendor support." }`
- **Responses**: 
  - `201 Created`
  - `403 Forbidden` if called by a Requester (does not expose note existence).

### 4.3 List Comments & Notes
`GET /api/tickets/:id/communications`
- **Role**: Any authenticated user (Requester must own the ticket).
- **Response**: 
  - `IT Staff`/`Admin`: Returns both Public Comments and Internal Notes merged and sorted by date.
  - `Requester`: Returns ONLY Public Comments. Internal Notes are scrubbed.
