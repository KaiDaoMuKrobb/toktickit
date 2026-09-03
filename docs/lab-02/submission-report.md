# Lab 2 Final Submission Report

*Export this file as a PDF after replacing the bracketed placeholders with your actual screenshots/links.*

---

## Answer Part 1: Git Use with Engineering Workflow

**Commit History & Branch Merging:**
[แทรกรูป: หน้าต่าง Network หรือ Commit History ของ GitHub ที่แสดงให้เห็นว่ามี Feature branches ย่อยๆ ถูก Merge เข้า lab2-staging และสุดท้ายเข้า main]

**GitHub Project / Kanban Board:**
[แทรกรูป: GitHub Project Board ที่แสดง Issue ต่างๆ ย้ายไปอยู่ช่อง Done หมดแล้ว]

**Peer Review Documentation (`reviewer.md`):**
Link: [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/reviewer.md]

**README and .gitignore:**
- [README.md](https://github.com/KaiDaoMuKrobb/toktickit/blob/main/README.md)
- [.gitignore](https://github.com/KaiDaoMuKrobb/toktickit/blob/main/.gitignore)
[แทรกรูป: ภาพแคปหน้าจอไฟล์ README.md และ .gitignore ในโปรเจกต์ ถ้าอาจารย์อยากเห็นเนื้อหา]

**IDE Directory Structure:**
[แทรกรูป: ภาพแคปหน้าจอโครงสร้างโฟลเดอร์ฝั่งซ้ายมือ (Explorer) ใน VS Code ที่กางโฟลเดอร์ออกมาให้เห็นครบๆ]

---

## Answer Part 2: Spec DD

**Specification Document:**
Link: [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/specification.md]

**Proof of Early Creation:**
[แทรกรูป: แคปหน้าจอประวัติการ Commit ของไฟล์ specification.md หรือหน้า PR #23 เพื่อยืนยันว่าสเปคถูกเขียนเสร็จก่อนที่จะเริ่มเขียนโค้ดฟีเจอร์หลัก]

---

## Answer Part 3: Test DD and Traceability

**Test Plan Document:**
Link: [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/tests.md]

**Passing Test Output:**
[แทรกรูป: แคปหน้าจอ Terminal ของเครื่องคุณตอนที่รันคำสั่ง npm run test (ทั้งโฟลเดอร์ client, server) และ npx playwright test ที่ขึ้นแถบสีเขียวบอกว่า PASS หมด 100%]

---

## Answer Part 4: AI Use with Reflection

**AI Use Document:**
Link: [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/ai-use.md]

---

## Answer Part 5: Development Requester Select Screen

**Simulated Login Screen:**
[แทรกรูป: แคปหน้าจอหน้าเลือก User (Development Requester Selector) บนเว็บ http://localhost:5173]

---

## Answer Part 6: Working Ticket Screen: Create Mode

**Create Ticket Flow Screenshots:**
1. [แทรกรูป: แคปหน้าจอหน้า Create Ticket ที่แสดงให้เห็นว่าช่องชื่อผู้ร้องขอถูกกรอกให้ตรงกับคนที่เลือกไว้ตั้งแต่แรก]
2. [แทรกรูป: แคปหน้าต่าง Create Ticket แบบเต็มจอ Desktop ที่โหลดข้อมูล Dropdown หมวดหมู่จากฐานข้อมูลมาครบ]
3. [แทรกรูป: แคปหน้าจอตอนกดปุ่ม Submit โดยไม่กรอกข้อมูล แล้วมีตัวหนังสือ Error สีแดงขึ้นใต้ช่อง]
4. [แทรกรูป: แคปหน้าจอตอนพยายามอัปโหลดไฟล์ที่ผิดกฎ (เช่นไฟล์ .txt) แล้วระบบมีหน้าต่างเด้งฟ้องว่า Error]
5. [แทรกรูป: Safe API failure state -> ให้ลองปิดเซิร์ฟเวอร์ Backend ใน Terminal ชั่วคราว แล้วพยายามส่งตั๋ว จะต้องมี Error ขึ้นแต่ข้อมูลที่กรอกในฟอร์มต้องไม่หายไปไหน]

---

## Answer Part 7: Working My Tickets Screen

**My Tickets Functionality Screenshots:**
1. [แทรกรูป: แคปหน้าจอ My Tickets ของ User คนแรก (เช่น Jennifer) ที่มีรายการตั๋วขึ้นมา]
2. [แทรกรูป: ลองเปลี่ยนไปล็อกอินเป็น User คนอื่นที่เพิ่งสร้างใหม่หรือไม่มีตั๋ว แล้วแคปหน้าจอโชว์ว่ามองไม่เห็นตั๋วของคนแรก]
3. [แทรกรูป: แคปหน้าจอตอนกำลังพิมพ์ค้นหา (Search) หรือกด Filter หมวดหมู่ตั๋วในหน้า My Tickets]
4. [แทรกรูป: แคปหน้าจอ Empty state หรือหน้าจอกรณีค้นหาไม่เจอ (No results)]

---

## Answer Part 8: Working Ticket Screen: View Mode and Attachments

**Ticket Detail Screenshots:**
1. [แทรกรูป: แคปหน้าจอหน้า Ticket Detail โหมดดูอย่างเดียว (แก้เนื้อหาไม่ได้)]
2. [แทรกรูป: แคปหน้าจอขณะทำการอัปโหลดไฟล์แนบในหน้ารายละเอียด]
3. [แทรกรูป: แคปหน้าจอตอนกดปุ่มถังขยะลบไฟล์ แล้วมีกล่อง Prompt เด้งขึ้นมาให้พิมพ์เหตุผล (Reason)]
4. [แทรกรูป: ลองก๊อป URL ของตั๋ว User คนแรก ไปเปิดตอนเลือกล็อกอินเป็น User คนที่สอง แล้วแคปหน้าจอตอนที่ระบบเตือน 403 Forbidden หรือเข้าไม่ได้]

---

## Answer Part 9: Zen Green UI and Responsive Evidence

**UI Specification Document:**
Link: [https://github.com/KaiDaoMuKrobb/toktickit/blob/main/docs/lab-02/ui-spec.md]

**Responsive Screenshots:**
1. [แทรกรูป: แคปหน้าจอหน้าเว็บไซส์ Desktop ปกติ]
2. [แทรกรูป: แคปหน้าจอหน้าเว็บไซส์ Tablet ย่อหน้าต่างบราวเซอร์ลงมาเหลือความกว้างประมาณ 800px]
3. [แทรกรูป: แคปหน้าจอหน้าเว็บไซส์ Mobile ย่อหน้าต่างให้แคบสุด แสดงให้เห็นว่าฟอร์มเรียงซ้อนกันเป็นแนวตั้ง และไม่มีแถบเลื่อนแนวนอน]

---
*End of Report*
