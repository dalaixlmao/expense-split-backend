import express from 'express';
import { ExpenseController } from '../controllers/expenseController';
import { ExpenseService } from '../services/expenseService';
import { ExpenseRepository } from '../repositories/expenseRepository';
import { PaymentGraphGenerator } from '../services/paymentGraphGenerator';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const expenseRepository = new ExpenseRepository(prisma);
const paymentGraphGenerator = new PaymentGraphGenerator(prisma);
const expenseService = new ExpenseService(expenseRepository, paymentGraphGenerator);
const expenseController = new ExpenseController(expenseService);

router.post('/', expenseController.addExpense.bind(expenseController));
router.get('/user/:userId', expenseController.getUserExpenses.bind(expenseController));
router.get('/', expenseController.getAllExpenses.bind(expenseController));
router.get('/balance-sheet', expenseController.downloadBalanceSheet.bind(expenseController));

export { router as expenseRoutes };