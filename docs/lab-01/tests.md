# Lab 1 — Test Plan and Evidence  (fill this in)

All test files live under server/tests/lab-01/ and client/tests/lab-01/.

| # | Tool | Test | Result |
|---|------|------|--------|
| 1 | Supertest | GET /api/health returns 200, status=ok | Pass |
| 2 | Supertest | GET /api/categories returns 4 seeded categories in id order | Pass |
| 3 | Vitest | Heading renders | Pass |
| 4 | Vitest | Success state shows Online + category list | Pass |
| 5 | Vitest | Error state shows Offline + message | Pass |

Paste your passing terminal output / screenshot below.

**Server Tests Output:**
```text
> toktickit-server@1.0.0 test
> vitest run

 RUN  v2.1.9 C:/Users/Sunny/toktickit/server

 ✓ tests/lab-01/health.test.ts (1 test)
 ✓ tests/lab-01/categories.test.ts (1 test)
   ✓ GET /api/categories > returns the four seeded categories in id order

 Test Files  2 passed (2)
      Tests  2 passed (2)
```

**Client Tests Output:**
```text
> toktickit-client@1.0.0 test
> vitest run

 RUN  v2.1.9 C:/Users/Sunny/toktickit/client

 ✓ tests/lab-01/App.test.tsx (3 tests)
   ✓ renders the TokTickIT heading
   ✓ shows the online state and fetches categories successfully
   ✓ shows the offline state and displays an error message

 Test Files  1 passed (1)
      Tests  3 passed (3)
```
