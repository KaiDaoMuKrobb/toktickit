# Lab 3 UI Specification

## 1. Color Palette (Zen Green Theme)
Lab 3 preserves the Zen Green theme from Lab 2.
- **Primary Green**: `#006B3C` (App header, primary actions, strong emphasis)
- **Secondary Green**: `#0B7A46` (Active tabs, focus accents, links, hover states)
- **Pale Green**: `#EAF6EF` (Selected, success, subtle section emphasis)
- **Page Background**: `#F5F7F6` (Quiet near-white)
- **Surface / Cards**: White with subtle border and restrained shadow
- **Text**: Dark charcoal-green (not pure black)
- **Editable Field**: White background with clear neutral border
- **Read-only Field**: Soft gray-green or warm ivory shading
- **Error**: Dark red text and border
- **Warning**: Amber callout or badge
- **Success**: Green confirmation with readable text

**New Lab 3 Additions:**
- **Internal Note Tint**: Pale amber/yellow background (`#FFF8E1`) to distinctly separate internal notes from public comments.
- **Public Comment Tint**: Pale green background (`#EAF6EF`) to match the primary theme and denote safe public visibility.
- **Role Badges**: 
  - `Requester`: Neutral light blue (`#E3F2FD`)
  - `IT Staff`: Solid secondary green (`#0B7A46`)
  - `Administrator`: Dark slate or charcoal (`#37474F`)

## 2. Typography & Spacing
- **Font**: Inter, Roboto, or Outfit (or system-ui fallback).
- **Labels**: Appear above controls and use consistent font weight and spacing.
- **Required Fields**: Marked with a red asterisk (*).
- **Inputs**: One consistent height. Multiline description is taller and resizable only when it doesn't break layout.

## 3. Component Rules
- Validation messages appear immediately below the associated field.
- Buttons include visible text. Focus indicators must remain visible.
- Disabled controls must be visually distinct.
- Submit buttons show a busy state (disabled + visual indicator) while processing.
- **Role-based Rendering**: UI components (buttons, links, navigation tabs) that the current user is not authorized to use must be hidden completely, not just disabled.

## 4. Responsive Layout Rules
- **Desktop (>= 992px)**: Multi-column layout; content centered with sensible max-width.
- **Tablet (768-991px)**: Two-column layout where practical.
- **Mobile (< 768px)**: Fields stack vertically; buttons remain touch-friendly; no horizontal page scrolling.
- **All Sizes**: No clipped labels, overlapping messages, hidden buttons, or unreadable attachment names.

## 5. Screen Layouts

### 5.1 App Shell (Authenticated Layout)
- **Header**: TokTickIT logo. Replaces the Development Requester display with the Authenticated User's Name and Role Badge.
- **Navigation**: Role-specific tabs (e.g., "My Tickets" for Requester, "My Queue" for IT Staff, "Admin" for Administrator).
- **Actions**: "Logout" button always visible in the header dropdown.

### 5.2 Login & Password Change Screens
- **Login Screen**: Centered card. Email and password inputs. Error messages for invalid credentials or inactive accounts.
- **Change Password Screen**: Intercept screen shown immediately after login if `mustChangePassword` is true. Contains "New Password" and "Confirm Password" with validation rules.

### 5.3 IT Staff Ticket Queue
- **Elements**: Search bar (Ticket Number or Summary), Category dropdown, Status dropdown, IT Priority dropdown. Pagination controls at the bottom.
- **List/Card**: Data table on desktop, stacked cards on mobile. Includes Ticket Number, Created Date, Summary, Category, Requested Priority, IT Priority, Status, and Owner.
- **Feedback**: Loading spinner, empty list, no-results state, and failure states.

### 5.4 IT Staff Ticket Detail Screen
- **Elements**: Extends the Lab 2 read-only ticket view. 
- **Operational Fields**: Editable dropdowns for "Ticket Owner" (Claim/Reassign), "IT Priority", and "Status".
- **Communication Section**: Two distinct tabs or visual sections for "Public Comments" and "Internal Notes". Both use append-only text areas. 

### 5.5 Administrator User Management
- **Elements**: Search bar (Name/Email), Role filter. "Create New User" button.
- **List/Card**: Minimalist table showing Name, Email, Role, Status (Active/Inactive toggle), and Edit button.
- **User Modal/Form**: Form to create or edit a user. Includes fields for Name, Email, Role selection, Activation toggle, and a button/checkbox to auto-generate or set a new initial password.
