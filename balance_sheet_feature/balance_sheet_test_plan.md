# Test Plan: Balance Sheet Feature

## Objectives
- Validate the accuracy of balance sheet generation for expense tracking
- Ensure that expense transactions are properly calculated and represented in the balance sheet
- Verify the CSV download functionality meets all requirements and security standards

## Scope
- Balance Sheet API endpoint (/api/expenses/balance-sheet)
- Authentication and authorization for accessing balance sheets
- Balance sheet data calculations and algorithm accuracy
- CSV file generation and download functionality
- Integration with expense tracking system

## Out of Scope
- Testing of expense creation functionality (covered by separate test plan)
- User management functionality (covered by separate test plan)
- Performance testing of large datasets (will be covered in a separate performance test plan)

## Test Approach

- **Functional Testing**: Focus on balance sheet calculations and data accuracy. Test various scenarios with different split methods (EQUAL, EXACT, PERCENTAGE) to ensure calculations are correct. Verify that all expenses are properly included in the balance sheet and that transactions represent the optimal payment graph.

- **Integration Testing**: Test integration between the expense service, payment graph generator, and balance sheet download functionality. Verify that the flow works end-to-end from authentication to CSV download.

- **Security Testing**: Verify that users can only access their own balance sheets. Test with valid and invalid tokens, and ensure proper error handling when unauthorized access is attempted.

- **Usability Testing**: Verify that the downloaded CSV is correctly formatted, contains all required data, and can be opened in common spreadsheet applications.

- **Error Handling Testing**: Test various error conditions such as missing user IDs, invalid authentication tokens, and internal service failures.

## Test Environment Requirements

- **System**: Any modern OS capable of running Node.js (Windows, macOS, or Linux)
- **Software**:
  - Node.js v16 or higher
  - PostgreSQL database (latest stable version)
  - Postman or similar API testing tool for API validation
  - Microsoft Excel or equivalent for CSV validation
- **Test Data**:
  - Multiple test users with various relationships (debtors and creditors)
  - Expenses with different split methods (EQUAL, EXACT, PERCENTAGE)
  - Complex expense scenarios with multiple participants
  - Edge cases (very small and very large expense amounts)

## Risk Assessment

1. **Calculation Accuracy**: The payment graph optimization algorithm might have edge cases that lead to incorrect settlements.
   - Mitigation: Comprehensive testing with complex expense scenarios and manual verification of results.

2. **Data Integrity**: Balance sheet might not include all relevant expenses or participants.
   - Mitigation: Test with various expense combinations and verify all expected data is included.

3. **Authentication Issues**: Token validation might fail, preventing users from accessing their balance sheets.
   - Mitigation: Thorough testing of the authentication flow and error handling.

4. **CSV Format Issues**: Generated CSV may not be properly formatted or readable by spreadsheet applications.
   - Mitigation: Test CSV downloads with different spreadsheet applications.

5. **Performance with Large Datasets**: The payment graph generation might become slow with a large number of expenses.
   - Mitigation: Include basic performance checks in functional tests and flag for dedicated performance testing if needed.

## Test Exit Criteria

- 100% of Critical/High priority test cases passed
- No open Critical or High severity bugs
- Balance sheet calculations verified and validated for accuracy across all split methods
- CSV download functionality working correctly across supported browsers
- Authentication and authorization checks properly enforced
- All error handling works as expected with proper error messages