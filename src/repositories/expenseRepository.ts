import { PrismaClient, Expense, ExpenseParticipant, SplitMethod } from "@prisma/client";
import { CreateExpenseDTO } from "../types";

export class ExpenseRepository {
  constructor(private prisma: PrismaClient) {}

  async createExpense(expenseData: CreateExpenseDTO): Promise<Expense & { participants: ExpenseParticipant[] }> {
    return this.prisma.expense.create({
      data: {
        amount: expenseData.amount,
        description: expenseData.description,
        splitMethod: expenseData.splitMethod,
        creatorId: expenseData.creatorId,
        participants: {
          createMany: {
            data: expenseData.participants.map((participant) => ({
              userId: participant.userId,
              amount: participant.amount || null,
              percentage: participant.percentage || null,
            })),
          },
        },
      },
      include: {
        participants: true,
      },
    });
  }

  async getUserExpenses(userId: string): Promise<(Expense & { participants: ExpenseParticipant[] })[]> {
    return this.prisma.expense.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { participants: { some: { userId } } },
        ],
      },
      include: {
        participants: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getAllExpenses(): Promise<(Expense & { participants: ExpenseParticipant[] })[]> {
    return this.prisma.expense.findMany({
      include: {
        participants: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async getExpenseById(id: string): Promise<(Expense & { participants: ExpenseParticipant[] }) | null> {
    return this.prisma.expense.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    });
  }

  async updateExpense(id: string, expenseData: CreateExpenseDTO): Promise<Expense & { participants: ExpenseParticipant[] }> {
    // First delete existing participants
    await this.prisma.expenseParticipant.deleteMany({
      where: { expenseId: id },
    });

    // Then update expense and create new participants
    return this.prisma.expense.update({
      where: { id },
      data: {
        amount: expenseData.amount,
        description: expenseData.description,
        splitMethod: expenseData.splitMethod,
        participants: {
          createMany: {
            data: expenseData.participants.map((participant) => ({
              userId: participant.userId,
              amount: participant.amount || null,
              percentage: participant.percentage || null,
            })),
          },
        },
      },
      include: {
        participants: true,
      },
    });
  }

  async deleteExpense(id: string): Promise<Expense> {
    // First delete related participants
    await this.prisma.expenseParticipant.deleteMany({
      where: { expenseId: id },
    });

    // Then delete the expense
    return this.prisma.expense.delete({
      where: { id },
    });
  }
}