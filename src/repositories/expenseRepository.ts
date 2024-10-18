import { PrismaClient } from "@prisma/client";
import { CreateExpenseDTO, Expense } from "../types/index";


export class ExpenseRepository {
  constructor(private prisma: PrismaClient) {}

  async create(expenseData: CreateExpenseDTO): Promise<Expense> {
    const expense = this.prisma.expense.create({
      data: {
        ...expenseData,
        participants: {
          create: expenseData.participants,
        },
      },
      include: {
        participants: true,
      },
    });
    return expense;
  }
  
  async findByUserId(userId: string): Promise<Expense[]> {
    const a = this.prisma.expense.findMany({
      where: {
        OR: [{ creatorId: userId }, { participants: { some: { userId } } }],
      },
      include: {
        participants: true,
      },
    });
    return a;
  }

  async findAll(): Promise<Expense[]> {
    return this.prisma.expense.findMany({
      include: {
        participants: true,
      },
    });
  }
}
