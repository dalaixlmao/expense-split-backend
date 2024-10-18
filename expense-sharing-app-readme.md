# Expense Sharing Application

This is a backend service for a daily expense sharing application. It allows users to add expenses and split them using different methods: equal, exact amounts, or percentages.

## Features

- User Management: Create and retrieve user details
- Expense Management: Add expenses with different split methods
- Balance Sheet: Generate and download balance sheets
- API Endpoints for all operations

## Tech Stack

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

## Diagrams

The `Diagrams/` directory contains the following visual representations of the project:

### Minimum Cash Flow Algorithm

This diagram illustrates the algorithm used for optimizing cash flow between users.

![Minimum Cash Flow Algorithm](./Diagrams/Minimum-Cash-Flow-Algorithm.jpg)

### Application Flow Diagram

This diagram shows the overall flow of the application.

![Application Flow Diagram](./Diagrams/Flow-diagram.jpg)

### Entity-Relation Diagram

This diagram depicts the database schema and relationships between entities.

![Entity-Relation Diagram](./Diagrams/Entity-Relation-Diagram.jpg)

[... rest of the content ...]

## Project Structure

```
expense-sharing-app/
│
├── src/
│   ├── controllers/
│   │   ├── expenseController.ts
│   │   └── userController.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   └── inputValidation.ts
│   ├── repositories/
│   │   ├── expenseRepository.ts
│   │   └── userRepository.ts
│   ├── routes/
│   │   ├── expenseRoutes.ts
│   │   └── userRoutes.ts
│   ├── services/
│   │   ├── expenseService.ts
│   │   ├── paymentGraphGenerator.ts
│   │   └── userService.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── zodSchemas.ts
│   ├── index.ts
│   └── server.ts
├── prisma/
│   └── schema.prisma
├── Diagrams/
│   ├── Minimum-Cash-Flow-Algorithm.jpg
│   ├── Flow-diagram.jpg
│   └── Entity-Relation-Diagram.jpg
├── package.json
├── tsconfig.json
└── README.md
```

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/dalaixlmao/expense-split-backend.git
   cd expense-split-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up your PostgreSQL database and update the `.env` file with your database URL:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/expense_sharing_db"
   ```

4. Run Prisma migrations:
   ```
   npx prisma migrate dev
   ```

5. Start the server:
   ```
   npm run dev
   ```

The server should now be running on `http://localhost:3000`.

## API Endpoints

### User Endpoints

- POST `/api/users/signup`: Create a new user
- POST `/api/users/signin`: Sign in a user
- GET `/api/users/:id`: Retrieve user details

### Expense Endpoints

- POST `/api/expenses`: Add a new expense
- GET `/api/expenses/user/:userId`: Retrieve expenses for a specific user
- GET `/api/expenses`: Retrieve all expenses
- GET `/api/expenses/balance-sheet`: Generate and download balance sheet
