import express from 'express';
import { UserController } from '../controllers/userController';
import { UserService } from '../services/userService';
import { UserRepository } from '../repositories/userRepository';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post('/signup', userController.createUser.bind(userController));
router.post('/signin', userController.createUser.bind(userController));
router.get('/:id', userController.getUserDetails.bind(userController));

export { router as userRoutes };