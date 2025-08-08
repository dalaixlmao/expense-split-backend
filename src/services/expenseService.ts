import { ExpenseRepository } from "../repositories/expenseRepository";
import { PaymentGraphGenerator } from "./paymentGraphGenerator";
import { BalanceSheet, CreateExpenseDTO } from "../types";
import { Expense, ExpenseParticipant } from "@prisma/client";

export class ExpenseService {
  constructor(
    private expenseRepository: ExpenseRepository,
    private paymentGraphGenerator: PaymentGraphGenerator
  ) {}

  async createExpense(expenseData: CreateExpenseDTO): Promise<Expense & { participants: ExpenseParticipant[] }> {
    // Validate based on split method
    if (expenseData.splitMethod === 'EQUAL') {
      // Set equal amounts for all participants
      const equalAmount = expenseData.amount / expenseData.participants.length;
      expenseData.participants = expenseData.participants.map(p => ({
        ...p,
        amount: equalAmount,
        percentage: null
      }));
    } else if (expenseData.splitMethod === 'PERCENTAGE') {
      // Validate percentages sum to 100%
      const totalPercentage = expenseData.participants.reduce(
        (sum, p) => sum + (p.percentage || 0),
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error("Percentage splits must sum to 100%");
      }
      
      // Calculate amounts based on percentages
      expenseData.participants = expenseData.participants.map(p => ({
        ...p,
        amount: expenseData.amount * ((p.percentage || 0) / 100),
      }));
    } else if (expenseData.splitMethod === 'EXACT') {
      // Validate exact amounts sum to total
      const totalAmount = expenseData.participants.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
      if (Math.abs(totalAmount - expenseData.amount) > 0.01) {
        throw new Error("Exact amounts must sum to the total expense amount");
      }
    }

    return this.expenseRepository.createExpense(expenseData);
  }

  async getUserExpenses(userId: string): Promise<(Expense & { participants: ExpenseParticipant[] })[]> {
    return this.expenseRepository.getUserExpenses(userId);
  }

  async getAllExpenses(): Promise<(Expense & { participants: ExpenseParticipant[] })[]> {
    return this.expenseRepository.getAllExpenses();
  }

  async getExpenseById(id: string): Promise<(Expense & { participants: ExpenseParticipant[] }) | null> {
    return this.expenseRepository.getExpenseById(id);
  }

  async updateExpense(id: string, expenseData: CreateExpenseDTO): Promise<Expense & { participants: ExpenseParticipant[] }> {
    // Apply the same validation as in createExpense
    if (expenseData.splitMethod === 'EQUAL') {
      const equalAmount = expenseData.amount / expenseData.participants.length;
      expenseData.participants = expenseData.participants.map(p => ({
        ...p,
        amount: equalAmount,
        percentage: null
      }));
    } else if (expenseData.splitMethod === 'PERCENTAGE') {
      const totalPercentage = expenseData.participants.reduce(
        (sum, p) => sum + (p.percentage || 0),
        0
      );
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error("Percentage splits must sum to 100%");
      }
      
      expenseData.participants = expenseData.participants.map(p => ({
        ...p,
        amount: expenseData.amount * ((p.percentage || 0) / 100),
      }));
    } else if (expenseData.splitMethod === 'EXACT') {
      const totalAmount = expenseData.participants.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
      );
      if (Math.abs(totalAmount - expenseData.amount) > 0.01) {
        throw new Error("Exact amounts must sum to the total expense amount");
      }
    }

    return this.expenseRepository.updateExpense(id, expenseData);
  }

  async deleteExpense(id: string): Promise<Expense> {
    return this.expenseRepository.deleteExpense(id);
  }

  async generateBalanceSheet(userId: string): Promise<BalanceSheet> {
    // Get all expenses involving the user
    const expenses = await this.expenseRepository.getUserExpenses(userId);
    
    // Filter and process expenses to calculate what the user owes and is owed
    let totalOwed = 0;
    let totalOwedToOthers = 0;
    
    // Process each expense to determine user's share and outstanding balances
    const individualExpenses = expenses.map(expense => {
      const userParticipant = expense.participants.find(p => p.userId === userId);
      
      // If user is a participant, calculate their share
      if (userParticipant) {
        let userAmount = 0;
        
        if (expense.splitMethod === 'EQUAL') {
          userAmount = expense.amount / expense.participants.length;
        } else {
          userAmount = userParticipant.amount || 0;
        }
        
        // Update totals
        if (expense.creatorId === userId) {
          totalOwedToOthers += expense.amount - userAmount;
        } else {
          totalOwed += userAmount;
        }
      }
      
      // Return a simpler representation of the expense
      return {
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        participants: expense.participants.map(p => ({
          userId: p.userId,
          amount: p.amount || expense.amount / expense.participants.length,
        })),
      };
    });
    
    // Generate the payment graph
    const transactions = await this.paymentGraphGenerator.generatePaymentGraph(expenses.filter(e => e.creatorId === userId));
    
    return {
      individualExpenses,
      totalOwed,
      totalOwedToOthers,
      transactions,
    };
  }
}