# Lab 2 API Specification

## Common Requirements
- **Authentication/Context**: Lab 2 uses a mock identity. The client must send a header (e.g., `X-Development-Requester-Id`) to indicate the selected Requester context for tickets and attachments APIs.

## 1. Reference Data Endpoints

### 1.1 List Active Development Requesters
`GET /api/requesters`
- **Purpose**: Retrieve active seeded requesters for the Selection screen.
- **Response**: 200 OK
```json
[
  { "id": 1, "name": "Jennifer Anderson", "email": "jennifer@example.com" },
  { "id": 2, "name": "Michael Brown", "email": "michael@example.com" }
]
```

### 1.2 List Ticket Categories
`GET /api/categories`
- **Response**: 200 OK

### 1.3 List Related Systems
`GET /api/systems`
- **Response**: 200 OK

## 2. Ticket Endpoints

### 2.1 Create Ticket
`POST /api/tickets`
- **Headers**: `X-Development-Requester-Id`
- **Request Body**:
```json
{
  "summary": "Laptop battery drains quickly",
  "description": "Draining even when idle.",
  "categoryId": 2,
  "relatedSystemId": 5,
  "requestedPriority": "MEDIUM"
}
```
- **Responses**:
  - `201 Created`: Returns created ticket with generated `ticketNumber` and `id`.
  - `400 Bad Request`: Validation failure (missing required fields, etc.).
  - `401/403 Unauthorized`: Missing or invalid Requester context.

### 2.2 List Owned Tickets
`GET /api/tickets`
- **Headers**: `X-Development-Requester-Id`
- **Query Params**:
  - `search` (string, optional)
  - `category` (number, optional)
  - `status` (string, optional)
  - `page` (number, default 1)
  - `limit` (number, default 10)
- **Response**: 200 OK
```json
{
  "data": [
    {
      "id": 1,
      "ticketNumber": "TKT-2025-001234",
      "summary": "Laptop battery drains quickly",
      "category": { "id": 2, "name": "Hardware" },
      "currentStatus": "New",
      "updatedAt": "2025-05-12T09:14:00Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### 2.3 Get Ticket Detail
`GET /api/tickets/:id`
- **Headers**: `X-Development-Requester-Id`
- **Responses**:
  - `200 OK`: Returns ticket details including attachments array.
  - `404 Not Found`: Ticket doesn't exist.
  - `403 Forbidden`: Ticket belongs to a different requester.

## 3. Attachment Endpoints

### 3.1 Upload Attachment
`POST /api/tickets/:id/attachments`
- **Headers**: `X-Development-Requester-Id`
- **Request Body**: `multipart/form-data` with `file` field.
- **Responses**:
  - `201 Created`: Attachment metadata saved.
  - `400 Bad Request`: File over 5MB, invalid type, or max 5 limit reached.
  - `403 Forbidden`: Not ticket owner.

### 3.2 Download Attachment
`GET /api/attachments/:id/download`
- **Headers**: `X-Development-Requester-Id`
- **Responses**:
  - `200 OK`: File stream.
  - `404 Not Found`: Attachment doesn't exist.
  - `410 Gone`: Attachment is soft-removed.
  - `403 Forbidden`: Not ticket owner.

### 3.3 Soft-Remove Attachment
`DELETE /api/tickets/:ticketId/attachments/:attachmentId`
- **Headers**: `X-Development-Requester-Id`
- **Request Body**:
```json
{ "reason": "Wrong file uploaded" }
```
- **Responses**:
  - `200 OK`: Successfully soft-removed.
  - `403 Forbidden`: Not ticket owner.
  - `404 Not Found`: File not found.
