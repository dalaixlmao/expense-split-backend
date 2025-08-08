const request = require('supertest');
const app = require('../dist/index').default;
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

describe('User API Endpoints', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' },
    });

    // Create a test user for authenticated endpoints
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
    await prisma.user.deleteMany({
      where: { email: 'test@example.com' },
    });

    await prisma.$disconnect();
  });

  describe('POST /api/users/signup', () => {
    it('should create a new user and return a token', async () => {
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        mobileNumber: '9876543210',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/users/signup')
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toMatch(/^Bearer /);

      // Clean up created user
      await prisma.user.deleteMany({
        where: { email: 'newuser@example.com' },
      });
    });

    it('should return 400 if user already exists', async () => {
      const response = await request(app)
        .post('/api/users/signup')
        .send({
          email: 'test@example.com', // Same as test user
          name: 'Duplicate User',
          mobileNumber: '5555555555',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('user already exists');
    });

    it('should return 400 if input validation fails', async () => {
      const response = await request(app)
        .post('/api/users/signup')
        .send({
          email: 'invalid-email',
          name: 'Invalid User',
          mobileNumber: '1234',
          password: 'short', // Too short
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/users/signin', () => {
    it('should authenticate a user and return a token', async () => {
      const response = await request(app)
        .post('/api/users/signin')
        .send({
          email: 'test@example.com',
          password: 'testpassword',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toMatch(/^Bearer /);
    });

    it('should return 400 if user does not exist', async () => {
      const response = await request(app)
        .post('/api/users/signin')
        .send({
          email: 'nonexistent@example.com',
          password: 'testpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('user does not exist');
    });

    it('should return 401 if password is incorrect', async () => {
      const response = await request(app)
        .post('/api/users/signin')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Wrong password');
    });
  });

  describe('GET /api/users/me', () => {
    it('should return the current user details', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password'); // Should not return password
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user details by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`)
        .set('Authorization', authToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testUser.id);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 if user does not exist', async () => {
      const response = await request(app)
        .get('/api/users/nonexistent-id')
        .set('Authorization', authToken);

      expect(response.status).toBe(404);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}`);

      expect(response.status).toBe(401);
    });
  });
});