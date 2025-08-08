# Detailed Test Cases: Balance Sheet Feature

---
**Test Case ID**: TC-001
**Test Case Title**: Verify authenticated user can access their balance sheet
**Priority**: Critical
**Type**: Security
**Preconditions**:
- User exists in the system with valid credentials
- User has at least one expense where they are a participant
**Tags**: #authentication #access-control #smoke
**Test Data Requirements**: Valid user credentials and JWT token
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Authenticate user and obtain valid JWT token | `email: user@example.com`, `password: password123` | Authentication succeeds and returns a valid JWT token |
| 2. Send GET request to `/api/expenses/balance-sheet` with the token in Authorization header | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Verify response contains balance sheet data | None | Response body contains CSV data with expected headers and at least one expense row |
---

---
**Test Case ID**: TC-002
**Test Case Title**: Verify user cannot access another user's balance sheet
**Priority**: Critical
**Type**: Security
**Preconditions**:
- Two users exist in the system (User A and User B)
- Both users have expenses in the system
**Tags**: #authentication #access-control #security
**Test Data Requirements**: Valid credentials for both users
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Authenticate as User A and obtain valid JWT token | `email: userA@example.com`, `password: passwordA` | Authentication succeeds and returns a valid JWT token for User A |
| 2. Attempt to access User B's balance sheet by manipulating the request | `Authorization: Bearer {User A token}`, Request parameter manipulation to target User B | Response status code is 401 or 403 with appropriate error message |
| 3. Verify no data for User B is accessible | None | No User B data is revealed in the response |
---

---
**Test Case ID**: TC-003
**Test Case Title**: Verify balance sheet includes all expenses where user is a participant
**Priority**: High
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
- User is a participant in multiple expenses with different split methods
**Tags**: #functional #data-integrity #regression
**Test Data Requirements**: User with at least 3 expenses (one of each split type)
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Create multiple expenses where the user is a participant | Three expenses with the user as participant | All expenses are successfully created |
| 2. Authenticate and download the user's balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Verify that all expenses where the user is a participant are included | None | All expenses are listed in the individualExpenses section of the balance sheet |
| 4. Verify each expense contains correct amount, description and date | None | Each expense's amount, description, and date match the created expenses |
---

---
**Test Case ID**: TC-004
**Test Case Title**: Verify balance sheet correctly calculates totalOwed amount
**Priority**: High
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
- User has created expenses that others owe money for
**Tags**: #functional #calculation #regression
**Test Data Requirements**: User with expenses where others owe them money
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Set up specific expense scenarios where others owe money to the test user | Expense where test user paid and others owe shares | Expenses are successfully created |
| 2. Calculate the expected totalOwed amount manually | None | A calculated expected value is determined |
| 3. Authenticate and download the user's balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 4. Extract the totalOwed value from the balance sheet | None | The totalOwed value matches the manually calculated expected value |
---

---
**Test Case ID**: TC-005
**Test Case Title**: Verify balance sheet correctly calculates totalOwedToOthers amount
**Priority**: High
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
- User participates in expenses created by others where they owe money
**Tags**: #functional #calculation #regression
**Test Data Requirements**: User with expenses where they owe money to others
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Set up specific expense scenarios where the test user owes money to others | Expense where others paid and test user owes shares | Expenses are successfully created |
| 2. Calculate the expected totalOwedToOthers amount manually | None | A calculated expected value is determined |
| 3. Authenticate and download the user's balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 4. Extract the totalOwedToOthers value from the balance sheet | None | The totalOwedToOthers value matches the manually calculated expected value |
---

---
**Test Case ID**: TC-006
**Test Case Title**: Verify balance sheet contains correct transaction list (payment graph)
**Priority**: High
**Type**: Functional
**Preconditions**:
- Multiple users exist in the system
- Complex expense scenarios with various users owing money to each other
**Tags**: #functional #algorithm #regression
**Test Data Requirements**: At least 4 users with interlocking expenses
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Create a complex scenario with multiple users and expenses | 4 users, 5+ expenses with different split methods | Expenses are successfully created |
| 2. Authenticate as one user and download their balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Extract the transactions list from the balance sheet | None | The transactions list shows a simplified set of payment instructions |
| 4. Verify that each transaction has valid "from", "to", and "amount" values | None | All transactions have valid data with appropriate users and positive amounts |
| 5. Manually verify that the payment graph is optimized | None | The number of transactions is minimized compared to naive approach |
---

---
**Test Case ID**: TC-007
**Test Case Title**: Verify CSV download contains all expected data fields
**Priority**: High
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
- User has expenses in the system
**Tags**: #functional #export #regression
**Test Data Requirements**: User with multiple expenses
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Authenticate user and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 2. Verify the CSV structure contains headers for expenses | None | CSV has headers: "Description,Amount,Date,Participants" |
| 3. Verify the CSV contains entries for individual expenses | None | Each expense has a row with all required fields |
| 4. Verify the CSV contains summary fields | None | CSV includes summary rows for "Total Owed" and "Total Owed to Others" |
| 5. Verify the CSV contains transaction section | None | CSV has a "Transactions" section with "From,To,Amount" headers |
| 6. Verify all transactions are listed | None | All required transactions from payment graph are included |
---

---
**Test Case ID**: TC-009
**Test Case Title**: Verify expenses with EQUAL split method are correctly represented
**Priority**: High
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
- Expense with EQUAL split method exists in the system
**Tags**: #functional #split-method #regression
**Test Data Requirements**: Expense with EQUAL split among multiple participants
**Parameters**: `expenseAmount`, `participantsCount`

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Create an expense with EQUAL split method | `expenseAmount: 100`, `description: "Dinner"`, `splitMethod: EQUAL`, `participantsCount: 4` | Expense is successfully created |
| 2. Authenticate as the creator and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Verify the expense appears in the balance sheet | None | Expense with description "Dinner" and amount 100 is listed |
| 4. Verify each participant has equal share amount | None | Each participant's amount is 25 (100/4) |
| 5. Verify the balance calculations include this expense correctly | None | The creator's totalOwed includes 75 (100 - 25) from this expense |
---

---
**Test Case ID**: TC-010
**Test Case Title**: Verify expenses with EXACT split method are correctly represented
**Priority**: High
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
- Expense with EXACT split method exists in the system
**Tags**: #functional #split-method #regression
**Test Data Requirements**: Expense with EXACT split amounts
**Parameters**: `expenseAmount`, `participantAmounts`

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Create an expense with EXACT split method | `expenseAmount: 100`, `description: "Grocery"`, `splitMethod: EXACT`, `participantAmounts: [20, 30, 50]` | Expense is successfully created |
| 2. Authenticate as the creator and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Verify the expense appears in the balance sheet | None | Expense with description "Grocery" and amount 100 is listed |
| 4. Verify each participant has correct exact amount | None | Participants have amounts 20, 30, and 50 respectively |
| 5. Verify the balance calculations include this expense correctly | None | The creator's totalOwed is calculated correctly based on their share |
---

---
**Test Case ID**: TC-011
**Test Case Title**: Verify expenses with PERCENTAGE split method are correctly represented
**Priority**: High
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
- Expense with PERCENTAGE split method exists in the system
**Tags**: #functional #split-method #regression
**Test Data Requirements**: Expense with PERCENTAGE split amounts
**Parameters**: `expenseAmount`, `participantPercentages`

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Create an expense with PERCENTAGE split method | `expenseAmount: 100`, `description: "Trip"`, `splitMethod: PERCENTAGE`, `participantPercentages: [25, 25, 50]` | Expense is successfully created |
| 2. Authenticate as the creator and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Verify the expense appears in the balance sheet | None | Expense with description "Trip" and amount 100 is listed |
| 4. Verify each participant has correct calculated amount | None | Participants have amounts 25, 25, and 50 respectively |
| 5. Verify the balance calculations include this expense correctly | None | The creator's totalOwed is calculated correctly based on their percentage share |
---

---
**Test Case ID**: TC-012
**Test Case Title**: Verify balance sheet API returns 401 when no auth token provided
**Priority**: Medium
**Type**: Security
**Preconditions**:
- API endpoint for balance sheet is available
**Tags**: #security #authentication #negative
**Test Data Requirements**: None
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Send GET request to `/api/expenses/balance-sheet` without auth token | No Authorization header | Response status code is 401 |
| 2. Verify response contains appropriate error message | None | Response body contains message about missing authentication |
---

---
**Test Case ID**: TC-013
**Test Case Title**: Verify balance sheet API returns 401 when invalid auth token provided
**Priority**: Medium
**Type**: Security
**Preconditions**:
- API endpoint for balance sheet is available
**Tags**: #security #authentication #negative
**Test Data Requirements**: Invalid JWT token
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Send GET request to `/api/expenses/balance-sheet` with invalid token | `Authorization: Bearer invalid_token` | Response status code is 401 |
| 2. Verify response contains appropriate error message | None | Response body contains message about invalid token |
---

---
**Test Case ID**: TC-014
**Test Case Title**: Verify balance sheet properly handles expenses with multiple participants
**Priority**: Medium
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
- Complex expense with many participants exists
**Tags**: #functional #edge-case #regression
**Test Data Requirements**: Expense with large number of participants (10+)
**Parameters**: `participantCount`

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Create an expense with many participants | `expenseAmount: 1000`, `description: "Group Event"`, `splitMethod: EQUAL`, `participantCount: 10` | Expense is successfully created |
| 2. Authenticate as the creator and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Verify the expense appears in the balance sheet | None | Expense with description "Group Event" and amount 1000 is listed |
| 4. Verify all participants are included | None | All 10 participants are listed with their shares |
| 5. Verify the balance calculations are correct | None | The creator's totalOwed reflects the 9 shares owed to them (900) |
---

---
**Test Case ID**: TC-015
**Test Case Title**: Verify balance sheet optimizes transactions to minimize number of payments
**Priority**: Medium
**Type**: Functional
**Preconditions**:
- Multiple users exist with circular debts
**Tags**: #functional #algorithm #optimization
**Test Data Requirements**: Complex scenario with circular debts
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Create circular debt scenario (A owes B, B owes C, C owes A) | Three users with circular expenses | Expenses are successfully created |
| 2. Authenticate as one user and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Extract the transactions from the balance sheet | None | The transactions list shows optimized payments |
| 4. Verify that the number of transactions is less than the naive approach | None | Number of transactions is minimized (should resolve with fewer than 3 transactions) |
---

---
**Test Case ID**: TC-016
**Test Case Title**: Verify balance sheet calculations with very small expense amounts
**Priority**: Medium
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
**Tags**: #functional #edge-case #precision
**Test Data Requirements**: Expenses with very small amounts
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Create an expense with a very small amount | `expenseAmount: 0.01`, `description: "Small expense"`, `splitMethod: EQUAL`, `participantsCount: 3` | Expense is successfully created |
| 2. Authenticate as creator and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Verify the expense appears in the balance sheet | None | Expense with description "Small expense" and amount 0.01 is listed |
| 4. Verify the shares are calculated correctly | None | Each share is approximately 0.003, with rounding as appropriate |
| 5. Verify the totalOwed calculation includes this small amount | None | The totalOwed value includes the creator's share of this small expense |
---

---
**Test Case ID**: TC-017
**Test Case Title**: Verify balance sheet calculations with very large expense amounts
**Priority**: Medium
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
**Tags**: #functional #edge-case #precision
**Test Data Requirements**: Expenses with very large amounts
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Create an expense with a very large amount | `expenseAmount: 1000000`, `description: "Large expense"`, `splitMethod: EQUAL`, `participantsCount: 4` | Expense is successfully created |
| 2. Authenticate as creator and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Verify the expense appears in the balance sheet | None | Expense with description "Large expense" and amount 1000000 is listed |
| 4. Verify the shares are calculated correctly | None | Each share is 250000 |
| 5. Verify the totalOwed calculation includes this large amount | None | The totalOwed value includes the creator's share of this large expense |
---

---
**Test Case ID**: TC-018
**Test Case Title**: Verify balance sheet API handles users with no expenses gracefully
**Priority**: Low
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
- User has no expenses
**Tags**: #functional #edge-case
**Test Data Requirements**: User with no expenses
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Create a new user with no expenses | `email: newuser@example.com`, `name: "New User"`, `password: "password123"` | User is successfully created |
| 2. Authenticate as the new user and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Verify the balance sheet shows empty or zero values | None | Balance sheet shows empty individualExpenses array, zero totalOwed and totalOwedToOthers, and empty transactions |
---

---
**Test Case ID**: TC-019
**Test Case Title**: Verify response headers include correct Content-Type and Content-Disposition
**Priority**: Medium
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
**Tags**: #functional #download
**Test Data Requirements**: User with expenses
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Authenticate user and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 2. Check the Content-Type header | None | Content-Type header is "text/csv" |
| 3. Check the Content-Disposition header | None | Content-Disposition header is "attachment; filename=balance_sheet.csv" |
---

---
**Test Case ID**: TC-022
**Test Case Title**: Verify balance sheet handles expenses with the user as both creator and participant
**Priority**: Medium
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
**Tags**: #functional #edge-case
**Test Data Requirements**: User as both creator and participant in expenses
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Create an expense where user is both creator and participant | `expenseAmount: 100`, `description: "Self-included"`, `splitMethod: EQUAL`, include creator in participants | Expense is successfully created |
| 2. Authenticate as the creator and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 |
| 3. Verify the expense appears in the balance sheet | None | Expense with description "Self-included" and amount 100 is listed |
| 4. Verify the user's share is correctly deducted from what others owe | None | The creator's totalOwed only includes shares from other participants, not their own share |
---

---
**Test Case ID**: TC-024
**Test Case Title**: Verify HTTP response codes are appropriate for different scenarios
**Priority**: Medium
**Type**: API
**Preconditions**:
- API endpoint for balance sheet is available
**Tags**: #api #error-handling
**Test Data Requirements**: Various request scenarios
**Parameters**: `scenarioType`

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Send request with valid authentication | `scenarioType: "valid"`, `Authorization: Bearer valid_token` | Response status code is 200 |
| 2. Send request with no authentication | `scenarioType: "no_auth"`, No Authorization header | Response status code is 401 |
| 3. Send request with invalid authentication | `scenarioType: "invalid_auth"`, `Authorization: Bearer invalid_token` | Response status code is 401 |
| 4. Send request with valid auth but server error | `scenarioType: "server_error"`, simulate DB error | Response status code is 500 |
---

---
**Test Case ID**: TC-025
**Test Case Title**: Verify balance sheet calculations are consistent across multiple requests
**Priority**: Medium
**Type**: Functional
**Preconditions**:
- User exists in the system with valid credentials
- User has expenses in the system
**Tags**: #functional #consistency
**Test Data Requirements**: User with expenses
**Parameters**: None

| Test Steps | Test Data | Expected Result |
|------------|-----------|-----------------|
| 1. Authenticate user and download balance sheet | `Authorization: Bearer {token}` | Response status code is 200 and balance sheet data received |
| 2. Record the totalOwed and totalOwedToOthers values | None | Values are recorded |
| 3. Download the balance sheet again | `Authorization: Bearer {token}` | Response status code is 200 |
| 4. Compare the new totalOwed and totalOwedToOthers with previous values | None | Values are identical in both responses |
---