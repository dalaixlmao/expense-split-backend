import { ExpenseRepository } from '../repositories/expenseRepository';
import { PaymentGraphGenerator } from './paymentGraphGenerator';
import { CreateExpenseDTO, Expense, BalanceSheet } from '../types/index';

export class ExpenseService {
  constructor(
    private expenseRepository: ExpenseRepository,
    private paymentGraphGenerator: PaymentGraphGenerator
  ) {}

  async createExpense(expenseData: CreateExpenseDTO): Promise<Expense> {
    // Add any business logic or validation here
    return this.expenseRepository.create(expenseData);
  }

  async getUserExpenses(userId: string): Promise<Expense[]> {
    return this.expenseRepository.findByUserId(userId);
  }

  async getAllExpenses(): Promise<Expense[]> {
    return this.expenseRepository.findAll();
  }

  async generateBalanceSheet(): Promise<BalanceSheet> {
    const expenses = await this.getAllExpenses();
    const paymentGraph = await this.paymentGraphGenerator.generatePaymentGraph();
    
    // Calculate total spent, owed, and net balance for each user
    // This is a simplified version and should be expanded based on your exact requirements
    const balanceSheet: BalanceSheet = {
      // Implement balance sheet calculation logic here
      transactions: paymentGraph
    };

    return balanceSheet;
  }
}