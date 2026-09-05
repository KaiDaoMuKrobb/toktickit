# Lab 2 Final Submission Report

Author: Pattarawadee Thanapoomthakul (Student ID: 67070503435)
GitHub Username: @KaiDaoMuKrobb
Peer Reviewer: Panyakorn Lohaviboonsap (Student ID: 67070503424)
GitHub Username: @Mixkyy

---

## Answer Part 1: Git Use with Engineering Workflow

**1. Commit History & Branch Merging:**
[Insert Image Here]
*Figure 1.1: Git commit history showing feature branches merged into lab2-staging and then into main.*

**2. GitHub Project / Kanban Board:**
[Insert Image Here]
*Figure 1.2: GitHub Project Kanban board showing all sprint issues completed and moved to the "Done" column.*

**3. Peer Review Documentation (`reviewer.md`):**
Link: [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/reviewer.md](https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/reviewer.md)

[Insert Rendered Screenshot of reviewer.md Here]
*Figure 1.3: Rendered preview of reviewer.md showing reviewer identity, PR links, comments, and responses.*

**4. README and .gitignore:**
- **README.md:** [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/README.md](https://github.com/KaiDaoMuKrobb/toktickit/blob/main/README.md)
- **.gitignore:** [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/.gitignore](https://github.com/KaiDaoMuKrobb/toktickit/blob/main/.gitignore)

[Insert Image Here]
*Figure 1.4: Contents of the updated README.md and .gitignore files.*

**5. Directory Structure:**
[Insert Image Here]
*Figure 1.5: Complete project directory structure in the IDE.*

---

## Answer Part 2: Spec DD

**Specification Document:**
Link: [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/specification.md](https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/specification.md)

[Insert Rendered Screenshot of specification.md Here]
*Figure 2.1: Rendered preview of specification.md showing Requirements, Business Rules, ACs, and Definition of Done.*

**Proof of Early Creation:**
[Insert Image Here]
*Figure 2.2: Commit history and PR showing that specification.md was created before implementation began.*

---

## Answer Part 3: Test DD and Traceability

**Test Plan Document:**
Link: [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/tests.md](https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/tests.md)

[Insert Rendered Screenshot of tests.md Here]
*Figure 3.1: Rendered preview of tests.md showing the Planned Tests table and Acceptance-Criterion Traceability matrix.*

**Passing Test Output from Main:**
[Insert Image Here]
*Figure 3.2: Terminal output confirming 100% passing Unit, API, UI, and E2E tests on the main branch (clean run without warnings).*

---

## Answer Part 4: AI Use with Reflection

**AI Use Document:**
Link: [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/ai-use.md](https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/ai-use.md)

**My Reflection:**
Using the AI coding agent significantly accelerated the implementation of repetitive boilerplate and component scaffolding for Lab 2. However, I learned that the AI heavily relies on explicit, well-structured specifications (like API contracts and DB schemas) to avoid hallucinating business rules. Writing a precise `specification.md` beforehand was crucial to guide the agent effectively.

---

## Answer Part 5: Development Requester Select Screen

**Simulated Login Screen:**
[Insert Image Here]
*Figure 5.1: The Development Requester Selection screen serving as a simulated login for testing.*

---

## Answer Part 6: Working Ticket Screen: Create Mode

**Create Ticket Flow Screenshots:**

[Insert Image Here]
*Figure 6.1: The Requester field is auto-populated based on the selected Development Requester.*

[Insert Image Here]
*Figure 6.2: The Category and Related System dropdowns successfully load reference data from the database.*

[Insert Image Here]
*Figure 6.3: Field-level validation messages appear under required fields during an invalid submission.*

[Insert Image Here]
*Figure 6.4: The system successfully uploads a valid file (under 5MB) but rejects an invalid file with a size-limit error popup.*

[Insert Image Here]
*Figure 6.5: Simulating a backend API failure shows a clear error message while preserving the user's input safely.*

---

## Answer Part 7: Working My Tickets Screen

**My Tickets Functionality Screenshots:**

[Insert Image Here]
*Figure 7.1: The 'My Tickets' dashboard displays tickets owned by the currently selected Requester A.*

[Insert Image Here]
*Figure 7.2: Cross-requester access prevention: Requester B's dashboard shows no access to Requester A's tickets.*

[Insert Image Here]
*Figure 7.3: The search, filtering, and sorting functions successfully update the ticket list.*

[Insert Image Here]
*Figure 7.4: Empty state for a new user without tickets (left), and No-results state when a search yields no matches (right).*

[Insert Image Here]
*Figure 7.5: The ticket list demonstrates pagination controls when tickets exceed 10 items.*

---

## Answer Part 8: Working Ticket Screen: View Mode and Attachments

**Ticket Detail Screenshots:**

[Insert Image Here]
*Figure 8.1: The Ticket Detail page renders ticket information as read-only text and provides a download button for active attachments.*

[Insert Image Here]
*Figure 8.2: The system allows uploading additional attachments up to the limit of 5 files.*

[Insert Image Here]
*Figure 8.3: Soft-removal feature requires a reason prompt, retains the file metadata (crossed out), and blocks downloading.*

[Insert Image Here]
*Figure 8.4: Unauthorized Access Test: Simulating User B attempting to access User A's ticket via API correctly returns a 403 Forbidden response.*

---

## Answer Part 9: Zen Green UI and Responsive Evidence

**UI Specification Document:**
Link: [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/ui-spec.md](https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/ui-spec.md)

[Insert Rendered Screenshot of ui-spec.md Here]
*Figure 9.1: Rendered preview of ui-spec.md detailing the Zen Green theme colors and design tokens.*

**Responsive Screenshots:**

[Insert Image Here]
*Figure 9.2: Desktop view (≥ 1024px) utilizes a centered multi-column layout with optimal whitespace.*

[Insert Image Here]
*Figure 9.3: Tablet view (~768px) gracefully adapts the layout while maintaining usability.*

[Insert Image Here]
*Figure 9.4: Mobile view (< 480px) stacks fields vertically and keeps buttons touch-friendly without horizontal scrolling.*

**Visual Checklist Evidence:**
1. **Color Palette:** The UI applies the "Zen Green" theme (Green-White-Grey) for a clean, professional look. Semantic colors are strictly followed (e.g., Red for errors, Green for primary actions).
2. **Editable vs Read-only:** Clear distinction between states. The *Create Ticket* page uses interactive input fields, while the *Ticket Detail* page renders information as clean, read-only plain text.
3. **Validation Placement:** Red field-level error messages are placed directly below the associated input fields, ensuring users immediately identify what needs to be corrected.
4. **Button Hierarchy:** Strong visual hierarchy is established. Primary actions (e.g., Submit, Create) use solid green backgrounds, whereas secondary actions (e.g., Back, Cancel) use outline or grey styles to avoid confusion.
5. **No Clipping/Overlap:** Adequate margin and padding are applied to all cards, text, and containers. UI elements do not overlap or get cut off, regardless of the screen size.
6. **No Horizontal Overflow:** The responsive layout (Flexbox/Grid) ensures that all content scales perfectly across Desktop, Tablet, and Mobile devices without causing any horizontal scrollbars.

---
*End of Report*
