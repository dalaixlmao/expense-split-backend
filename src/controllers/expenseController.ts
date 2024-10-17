import { Request, Response } from 'express';
import { ExpenseService } from '../services/expenseService';
import { CreateExpenseDTO } from '../types/index';

export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  async addExpense(req: Request, res: Response) {
    try {
      const expenseData: CreateExpenseDTO = req.body;
      const expense = await this.expenseService.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ message: 'Failed to create expense', error });
    }
  }

  async getUserExpenses(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const expenses = await this.expenseService.getUserExpenses(userId);
      res.json(expenses);
    } catch (error) {
      res.status(404).json({ message: 'Expenses not found', error });
    }
  }

  async getAllExpenses(req: Request, res: Response) {
    try {
      const expenses = await this.expenseService.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve expenses', error });
    }
  }

  async downloadBalanceSheet(req: Request, res: Response) {
    try {
      const balanceSheet = await this.expenseService.generateBalanceSheet();
      res.json(balanceSheet);
    } catch (error) {
      res.status(500).json({ message: 'Failed to generate balance sheet', error });
    }
  }
}