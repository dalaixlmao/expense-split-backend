const request = require('supertest');
const app = require('../dist/index').default;
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

describe('Expense API Endpoints', () => {
  let authToken;
  let testUser;
  let testExpense;

  beforeAll(async () => {
    // Clean up test data and create a test user
    await prisma.expenseParticipant.deleteMany({
      where: { userId: { contains: 'test' } },
    });
    await prisma.expense.deleteMany({
      where: { creatorId: { contains: 'test' } },
    });
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' },
    });

    const hashedPassword = await bcrypt.hash('testpassword', 10);
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        mobileNumber: '1234567890',
        password: hashedPassword,
      },
    });

    // Generate token for authenticated requests
    const token = jwt.sign({ userId: testUser.id }, process.env.JWT_SECRET || 'test-secret');
    authToken = `Bearer ${token}`;
  });

  afterAll(async () => {
    // Clean up test data
    if (testExpense) {
      await prisma.expenseParticipant.deleteMany({
        where: { expenseId: testExpense.id },
      });
      await prisma.expense.deleteMany({
        where: { id: testExpense.id },
      });
    }
    
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' },
    });
    
    await prisma.$disconnect();
  });

  describe('POST /api/expenses', () => {
    it('should create a new expense with equal split', async () => {
      const expenseData = {
        amount: 100,
        description: 'Test Expense',
        creatorId: testUser.id,
        splitMethod: 'EQUAL',
        participants: [
          { userId: testUser.id }
        ],
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', authToken)
        .send(expenseData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.amount).toBe(100);
      expect(response.body.description).toBe('Test Expense');

      // Store for cleanup
      testExpense = response.body;
    });

    it('should return 400 if expense data is invalid', async () => {
      const invalidData = {
        // Missing required fields
        description: 'Invalid Test',
      };

      const response = await request(app)
        .post('/api/expenses')
        .set('Authorization', authToken)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 if not authenticated', async () => {
      const expenseData = {
        amount: 100,
        description: 'Test Expense',
        creatorId: testUser.id,
        splitMethod: 'EQUAL',
        participants: [
          { userId: testUser.id }
        ],
      };

      const response = await request(app)
        .post('/api/expenses')
        .send(expenseData);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/expenses', () => {
    it('should return all expenses', async () => {
      const response = await request(app)
        .get('/api/expenses')
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/expenses');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/expenses/:id', () => {
    it('should return a specific expense by ID', async () => {
      if (!testExpense) {
        throw new Error('Test expense was not created successfully');
      }

      const response = await request(app)
        .get(`/api/expenses/${testExpense.id}`)
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testExpense.id);
      expect(response.body).toHaveProperty('description', testExpense.description);
    });

    it('should return 404 if expense does not exist', async () => {
      const response = await request(app)
        .get('/api/expenses/nonexistent-id')
        .set('Authorization', authToken);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('should update an existing expense', async () => {
      if (!testExpense) {
        throw new Error('Test expense was not created successfully');
      }

      const updatedData = {
        amount: 150,
        description: 'Updated Test Expense',
        creatorId: testUser.id,
        splitMethod: 'EQUAL',
        participants: [
          { userId: testUser.id }
        ],
      };

      const response = await request(app)
        .put(`/api/expenses/${testExpense.id}`)
        .set('Authorization', authToken)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('amount', 150);
      expect(response.body).toHaveProperty('description', 'Updated Test Expense');
    });

    it('should return 403 if user is not the creator', async () => {
      // This would require creating another test user and trying to update
      // We'll mock this by manipulating the creator ID
      const originalCreatorId = testExpense.creatorId;
      
      try {
        // Update expense creator temporarily
        await prisma.expense.update({
          where: { id: testExpense.id },
          data: { creatorId: 'another-user-id' },
        });
        
        const response = await request(app)
          .put(`/api/expenses/${testExpense.id}`)
          .set('Authorization', authToken)
          .send({
            amount: 200,
            description: 'Unauthorized update',
            creatorId: testUser.id,
            splitMethod: 'EQUAL',
            participants: [{ userId: testUser.id }],
          });

        expect(response.status).toBe(403);
      } finally {
        // Restore original creator
        await prisma.expense.update({
          where: { id: testExpense.id },
          data: { creatorId: originalCreatorId },
        });
      }
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should delete an expense', async () => {
      if (!testExpense) {
        throw new Error('Test expense was not created successfully');
      }

      const response = await request(app)
        .delete(`/api/expenses/${testExpense.id}`)
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Expense deleted successfully');

      // Verify it's deleted
      const getResponse = await request(app)
        .get(`/api/expenses/${testExpense.id}`)
        .set('Authorization', authToken);

      expect(getResponse.status).toBe(404);
    });
  });
});