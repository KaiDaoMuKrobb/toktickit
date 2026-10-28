# Lab 4 UI Specification: Zen Green Dashboard and Actions Taken

## 1. Visual Design Language & Color Palette (Zen Green)
Sprint 4 strictly preserves and refines the Zen Green theme established across Labs 2 and 3:

| Element | Hex Code / Style | Purpose / Context |
| :--- | :--- | :--- |
| **Primary Green** | `#006B3C` | App navigation bar, primary buttons, major headings, key emphasis |
| **Secondary Green** | `#0B7A46` | Active tabs, hover states, accent borders, secondary interactive cues |
| **Pale Green** | `#EAF6EF` | Metric card highlights, successful alerts, active card backgrounds |
| **Page Background** | `#F5F7F6` | Quiet, neutral near-white canvas for high readability |
| **Surface / Cards** | `#FFFFFF` | Clean white cards with 1px border (`#E0E5E2`) and subtle shadow |
| **Text Primary** | `#1C2826` | Deep charcoal-green text providing WCAG AAA contrast |
| **Text Muted** | `#5C6B64` | Subheadings, metadata labels, secondary hints |
| **Border Neutral** | `#D0D7D3` | Input borders, divider lines, table cell boundaries |
| **Accent Amber** | `#F59E0B` / `#FFF8E1` | In Progress / Attention status, Follow-up required badge and callout |
| **Accent Red** | `#DC2626` / `#FEE2E2` | Critical priority, Cancelled status, form validation error alerts |
| **Accent Blue** | `#2563EB` / `#EFF6FF` | Open status, Waiting for Requester, informational cues |

---

## 2. Status & Priority Visual Indicator Rules (Non-Color Cues)
To ensure accessibility and satisfy requirement 8.6, every status and priority combines color with text and icons:
- **New:** Light Gray pill + "● New"
- **Open:** Blue pill + "○ Open"
- **In Progress:** Amber pill + "⏳ In Progress"
- **Waiting for Requester:** Purple/Indigo pill + "💬 Waiting for Requester"
- **Resolved:** Green pill + "✓ Resolved"
- **Closed:** Slate pill + "🔒 Closed"
- **Cancelled:** Muted Gray/Red pill + "✕ Cancelled"

---

## 3. Screen Layouts & Components

### 3.1 IT Staff Dashboard (`/staff/dashboard`)
Serves as the operational launchpad for IT Staff and Administrators.

```
+----------------------------------------------------------------------------------+
|  TokTickIT   [Dashboard]  [Ticket Queue]  [Admin Users]             [Staff: Michael] |
+----------------------------------------------------------------------------------+
|  Welcome back, Michael!                                                          |
|  Here's what's happening with your queue today.                   [ ↻ Refresh ]  |
|                                                                                  |
|  +--------------+  +--------------+  +--------------+  +--------------+  +-----+  |
|  | New          |  | Open         |  | In Progress  |  | Waiting Req. |  | My  |  |
|  |     14       |  |     23       |  |     18       |  |      7       |  |  16 |  |
|  | View All ->  |  | View All ->  |  | View All ->  |  | View All ->  |  | ->  |  |
|  +--------------+  +--------------+  +--------------+  +--------------+  +-----+  |
|                                                                                  |
|  [ Recent Active Tickets ]                         [ Quick Actions ]             |
|  +-----------------------------------------------+  +--------------------------+  |
|  | TKT-2026-00124  Laptop battery dying  [Open]  |  |  [ + Create Ticket ]     |  |
|  | TKT-2026-00120  Printer offline       [InProg]|  |  [ 🔍 Search Tickets ]   |  |
|  | TKT-2026-00118  Outlook freezing      [Open]  |  |  [ 📋 My Assigned Queue] |  |
|  +-----------------------------------------------+  +--------------------------+  |
+----------------------------------------------------------------------------------+
```

- **Metric Cards:** 5 clean cards (New, Open, In Progress, Waiting for Requester, My Assigned). Each card contains an accessible link drilling down to the Ticket Queue pre-filtered by that criterion.
- **Recent Active Tickets:** Shows up to 5 most recently updated tickets with Ticket ID, Summary, Status badge, and Updated timestamp. Clicking any ticket navigates directly to Ticket Detail.
- **Quick Actions:** One-click shortcuts to Create Ticket, Search Queue, and My Assigned Queue.

---

### 3.2 Requester Dashboard (`/requester/dashboard`)
Provides authenticated requesters with a clear snapshot of their tickets without overwhelming them.

```
+----------------------------------------------------------------------------------+
|  TokTickIT   [Dashboard]  [My Tickets]  [Create Ticket]          [User: Jennifer]|
+----------------------------------------------------------------------------------+
|  Welcome, Jennifer!                                                              |
|  Here's the latest status of your service requests.               [ ↻ Refresh ]  |
|                                                                                  |
|  +---------------+  +---------------+  +---------------+  +---------------+      |
|  | My Open       |  | In Progress   |  | Resolved      |  | Closed        |      |
|  |       3       |  |       2       |  |       5       |  |      12       |      |
|  | View all ->   |  | View all ->   |  | View all ->   |  | View all ->   |      |
|  +---------------+  +---------------+  +---------------+  +---------------+      |
|                                                                                  |
|  [ My Recent Tickets ]                             [ Quick Actions ]             |
|  +-----------------------------------------------+  +--------------------------+  |
|  | TKT-2026-00123  Need new monitor     [InProg] |  |  [ + Create Ticket ]     |  |
|  | TKT-2026-00105  VPN disconnects      [Resolved|  |  [ 📋 View All My Tix ]  |  |
|  +-----------------------------------------------+  +--------------------------+  |
+----------------------------------------------------------------------------------+
```

- **Cards:** My Open, In Progress, Resolved, Closed (all strictly calculated from tickets where `requesterId == currentUserId`).
- **Drill-down:** Clicking "View all" redirects to `/tickets` filtered by the selected status tab.

---

### 3.3 Actions Taken Section on Ticket Detail (`/tickets/:id`)
Appears directly on the Ticket Detail page below the Ticket Overview card.

```
+----------------------------------------------------------------------------------+
|  Actions Taken                                       [ + Add Action Taken ]      |
+----------------------------------------------------------------------------------+
|  Date/Time          Description           Result      Performed By   Follow-up   |
|  ------------------------------------------------------------------------------  |
|  28/10/2026 14:30   Replaced power cable  Restored    Michael (Staff) No         |
|  28/10/2026 15:15   Tested voltage surge  Unstable    Sarah (Staff)   Yes (Note) |
|                     Attachment: logs/voltage_test.png                            |
+----------------------------------------------------------------------------------+
```

- **Role Visibility:**
  - **Requester:** Can view the list and action details in read-only mode. The "+ Add Action Taken" button and edit actions are hidden.
  - **IT Staff / Admin:** Can view, click "+ Add Action Taken", and click "Edit" on existing records.
- **Add / Edit Action Taken Modal:**
  - `Action Date/Time`: Datetime picker (defaults to current date and time).
  - `Action Description` (Required): Textarea describing diagnostic or remediation work.
  - `Result` (Required): Textarea describing outcome.
  - `Performed By`: Automatically filled with the current user's name and role badge (read-only input).
  - `Follow-Up Required?`: Toggle switch (Yes/No).
  - `Follow-up Note`: Textarea that dynamically appears and becomes **strictly required** when `Follow-Up Required` is checked.
  - `Attachment Notes`: Optional text field (e.g., "See screenshot cable_fix.jpg attached above").
- **Empty State:** When no actions exist, displays: "No actions recorded yet. IT Staff will log diagnostic steps here."

---

### 3.4 Ticket Workflow Controls & Resolution Feedback
- Located prominently on the Ticket Detail sidebar/action header for IT Staff:
  - Displays permitted transitions as buttons with clear labels (e.g. `[ Start Work (In Progress) ]`, `[ Request Info ]`, `[ Resolve Ticket ]`, `[ Cancel ]`).
  - Only permitted transitions from the current status are rendered.
  - If a Requester indicated "Problem Appears Resolved", a prominent Zen Pale Amber callout appears:
    > 💡 **Requester Feedback:** Requester indicated that the problem appears resolved. Please verify actions taken and formally resolve the ticket.
- **Concurrency & Conflict Handling Feedback:**
  - If another staff member modified the status or action simultaneously, the form displays a gentle conflict banner:
    > ⚠️ **Conflict Detected:** This ticket was modified by another user. Your changes were not applied to avoid overwriting. [Click here to reload the latest data].

---

## 4. Responsive Layout Breakpoints
- **Desktop (>= 992px):**
  - Dashboard: 4–5 metric cards in a single row (`col-lg`). Two-column layout for Recent Tickets (left 65%) and Quick Actions (right 35%).
  - Actions Taken: Full-width data table with clear column alignment and action buttons.
- **Tablet (768px – 991px):**
  - Dashboard: 2–3 metric cards per row (`col-md-4` or `col-md-6`).
  - Actions Taken: Compact table with horizontal scrolling wrapper (`table-responsive`) or semi-stacked card layout.
- **Mobile (< 768px):**
  - Dashboard: 1–2 cards per row (`col-12` or `col-6`). Recent tickets and Quick Actions stack vertically.
  - Actions Taken: Cards stack vertically for each action line. All touch targets are minimum 44px height.
  - No horizontal page overflow (`overflow-x: hidden`).

---

## 5. Accessibility & Polish Checklist
- [x] Visible focus rings (2px solid `#006B3C` with 2px offset) on all interactive elements.
- [x] Color contrast ratio >= 4.5:1 for normal text and >= 3:1 for large text / UI boundaries.
- [x] Full keyboard navigation: users can Tab through metric cards, recent tickets, table rows, and modal inputs.
- [x] ESC key closes the Action Taken modal; Enter submits form when appropriate.
- [x] Form inputs include associated `<label for="...">` and `aria-required="true"`.
- [x] Non-color status indicators: Icons and textual labels complement all color badges.
- [x] Empty states have informative illustrations/icons and friendly guidance text.
- [x] Loading spinners and skeleton screens announce state to screen readers via `aria-live="polite"`.
