# Lab 2 UI Specification

## 1. Color Palette (Zen Green Theme)
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

## 4. Responsive Layout Rules
- **Desktop (>= 992px)**: Multi-column layout; content centered with sensible max-width.
- **Tablet (768-991px)**: Two-column layout where practical.
- **Mobile (< 768px)**: Fields stack vertically; buttons remain touch-friendly; no horizontal page scrolling.
- **All Sizes**: No clipped labels, overlapping messages, hidden buttons, or unreadable attachment names.

## 5. Screen Layouts

### 5.1 Development Requester Selection Screen
- **Elements**: TokTickIT title, explanation text, dropdown for active Requesters, "Continue" button, loading/empty/error states.
- **Style**: Centered card on page background.

### 5.2 Create Ticket Screen
- **Fields**: System-generated fields (Ticket No., Date) read-only near top. Classification fields (Category, Priority, System) grouped. Summary and Description full width. Attachments below main fields. Primary and secondary actions at bottom.
- **Feedback**: Success state clearly displays generated Ticket Number.

### 5.3 My Tickets Screen
- **Elements**: Search input, Category filter, Status filter, Pagination controls. Create Ticket button.
- **List/Card**: Table on desktop, stacked cards on mobile. Includes Ticket Number, Summary, Category, Status, Last Updated.
- **Feedback**: Loading, empty list, and failure states.

### 5.4 Requester Ticket Detail Screen
- **Elements**: Read-only display of ticket fields.
- **Attachments Section**: Ability to upload new, download existing, and soft-remove. Removed attachments show metadata but no download action.
