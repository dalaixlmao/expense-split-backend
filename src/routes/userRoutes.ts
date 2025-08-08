import express from 'express';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository';
import { userSigninValidation, userSignupValidation } from '../middlewares/inputValidation';
import { authLimiter } from '../middlewares/rateLimit';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// Apply rate limiting to authentication routes
router.post('/signup', authLimiter, userSignupValidation, userController.signUp.bind(userController));
router.post('/signin', authLimiter, userSigninValidation, userController.signIn.bind(userController));

// Protected routes
router.get('/me', protect, userController.getCurrentUser.bind(userController));
router.get('/:id', protect, userController.getUserDetails.bind(userController));

export { router as userRoutes };