import { PrismaClient } from "@prisma/client";
import { PaymentNode, Expense } from "../types/index";

export class PaymentGraphGenerator {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async generatePaymentGraph(expenses: Expense[]): Promise<PaymentNode[]> {
    const balances: { [key: string]: number } = {};

    // Calculate balances for each user
    expenses.forEach((expense) => {
      const totalAmount = expense.amount;
      const participantsCount = expense.participants.length;
      expense.participants.forEach((participant) => {
        const userId = participant.userId;
        if (userId === expense.creatorId) {
          balances[userId] = (balances[userId] || 0) + totalAmount - totalAmount / participantsCount;
        } else {
          balances[userId] = (balances[userId] || 0) - totalAmount / participantsCount;
        }
      });
    });

    // Separate users into creditors and debtors
    const creditors: { userId: string; amount: number }[] = [];
    const debtors: { userId: string; amount: number }[] = [];
    Object.entries(balances).forEach(([userId, balance]) => {
      if (balance > 0) {
        creditors.push({ userId, amount: balance });
      } else if (balance < 0) {
        debtors.push({ userId, amount: -balance });
      }
    });

    // Generate payment graph
    const paymentGraph: PaymentNode[] = [];
    while (creditors.length > 0 && debtors.length > 0) {
      const creditor = creditors[0];
      const debtor = debtors[0];
      const amount = Math.min(creditor.amount, debtor.amount);

      paymentGraph.push({
        from: debtor.userId,
        to: creditor.userId,
        amount,
      });

      creditor.amount -= amount;
      debtor.amount -= amount;

      if (creditor.amount === 0) creditors.shift();
      if (debtor.amount === 0) debtors.shift();
    }

    return paymentGraph;
  }
}