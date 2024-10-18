import express from 'express';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository';
import { userSigninValidation, userSignupValidation } from '../middlewares/inputValidation';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post('/signup', userSignupValidation, userController.signUp.bind(userController));
router.post('/signin', userSigninValidation, userController.signIn.bind(userController));
router.get('/:id', userController.getUserDetails.bind(userController));

export { router as userRoutes };