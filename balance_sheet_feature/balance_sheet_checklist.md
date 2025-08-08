# Test Checklist: Balance Sheet Feature

| ID | Title | Priority | Type | Automation Candidate |
|---|---|---|---|---|
| TC-001 | Verify authenticated user can access their balance sheet | Critical | Security | Yes |
| TC-002 | Verify user cannot access another user's balance sheet | Critical | Security | Yes |
| TC-003 | Verify balance sheet includes all expenses where user is a participant | High | Functional | Yes |
| TC-004 | Verify balance sheet correctly calculates totalOwed amount | High | Functional | Yes |
| TC-005 | Verify balance sheet correctly calculates totalOwedToOthers amount | High | Functional | Yes |
| TC-006 | Verify balance sheet contains correct transaction list (payment graph) | High | Functional | Yes |
| TC-007 | Verify CSV download contains all expected data fields | High | Functional | Yes |
| TC-008 | Verify CSV formatting is correct and compatible with spreadsheet applications | Medium | Usability | Yes |
| TC-009 | Verify expenses with EQUAL split method are correctly represented | High | Functional | Yes |
| TC-010 | Verify expenses with EXACT split method are correctly represented | High | Functional | Yes |
| TC-011 | Verify expenses with PERCENTAGE split method are correctly represented | High | Functional | Yes |
| TC-012 | Verify balance sheet API returns 401 when no auth token provided | Medium | Security | Yes |
| TC-013 | Verify balance sheet API returns 401 when invalid auth token provided | Medium | Security | Yes |
| TC-014 | Verify balance sheet properly handles expenses with multiple participants | Medium | Functional | Yes |
| TC-015 | Verify balance sheet optimizes transactions to minimize number of payments | Medium | Functional | Yes |
| TC-016 | Verify balance sheet calculations with very small expense amounts (e.g., $0.01) | Medium | Functional | Yes |
| TC-017 | Verify balance sheet calculations with very large expense amounts | Medium | Functional | Yes |
| TC-018 | Verify balance sheet API handles users with no expenses gracefully | Low | Functional | Yes |
| TC-019 | Verify response headers include correct Content-Type and Content-Disposition | Medium | Functional | Yes |
| TC-020 | Verify balance sheet performance with a large number of expenses (>100) | Medium | Performance | Yes |
| TC-021 | Verify CSV escape characters are handled properly for text fields | Low | Functional | Yes |
| TC-022 | Verify balance sheet handles expenses with the user as both creator and participant | Medium | Functional | Yes |
| TC-023 | Verify error handling when database connection fails | Medium | Error Handling | Yes |
| TC-024 | Verify HTTP response codes are appropriate for different scenarios | Medium | API | Yes |
| TC-025 | Verify balance sheet calculations are consistent across multiple requests | Medium | Functional | Yes |