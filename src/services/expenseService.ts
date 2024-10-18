import { ExpenseRepository } from "../repositories/expenseRepository";
import { PaymentGraphGenerator } from "./paymentGraphGenerator";
import { CreateExpenseDTO, Expense, BalanceSheet} from "../types/index";
import { SplitMethod } from "@prisma/client";

export class ExpenseService {
  constructor(
    private expenseRepository: ExpenseRepository,
    private paymentGraphGenerator: PaymentGraphGenerator
  ) {}
  async createExpense(expenseData: CreateExpenseDTO): Promise<Expense> {
    let participantAmounts: { userId: string; amount: number }[] = [];

    switch (expenseData.splitMethod) {
      case SplitMethod.EQUAL:
        const equalAmount = expenseData.amount / expenseData.participants.length;
        participantAmounts = expenseData.participants.map(p => ({ userId: p.userId, amount: equalAmount }));
        break;
      case SplitMethod.EXACT:
        participantAmounts = expenseData.participants.map(p => ({ userId: p.userId, amount: p.amount || 0 }));
        break;
      case SplitMethod.PERCENTAGE:
        participantAmounts = expenseData.participants.map(p => ({ 
          userId: p.userId, 
          amount: (expenseData.amount * (p.percentage || 0)) / 100 
        }));
        break;
      default:
        throw new Error('Invalid split method');
    }
    
    const totalSplitAmount = participantAmounts.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(totalSplitAmount - expenseData.amount) > 0.01) {
      throw new Error('Split amounts do not match the total expense amount');
    }
    
    return this.expenseRepository.create({
      ...expenseData,
      participants: participantAmounts.map(p => ({ userId: p.userId, amount: p.amount }))
    });
  }

  async getUserExpenses(userId: string): Promise<Expense[]> {
    return this.expenseRepository.findByUserId(userId);
  }

  async getAllExpenses(): Promise<Expense[]> {
    return this.expenseRepository.findAll();
  }

  async generateBalanceSheet(userId: string): Promise<BalanceSheet> {
    const expenses = await this.getUserExpenses(userId);
    const paymentGraph = await this.paymentGraphGenerator.generatePaymentGraph(expenses);

    const balanceSheet: BalanceSheet = {
      individualExpenses: expenses.map(expense => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        participants: expense.participants.map(p => ({
          userId: p.userId,
          amount: p.amount || 0,
        })),
      })),
      totalOwed: paymentGraph.reduce((sum, payment) => sum + (payment.from === userId ? payment.amount : 0), 0),
      totalOwedToOthers: paymentGraph.reduce((sum, payment) => sum + (payment.to === userId ? payment.amount : 0), 0),
      transactions: paymentGraph,
    };

    return balanceSheet;
  }
}