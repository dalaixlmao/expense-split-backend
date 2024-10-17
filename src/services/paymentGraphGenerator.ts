import { PrismaClient } from '@prisma/client';

interface User {
  id: string;
  finalBalance: number;
}

export interface PaymentNode {
  from: string;
  to: string;
  amount: number;
}

export class PaymentGraphGenerator {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async generatePaymentGraph(): Promise<PaymentNode[]> {
    const users = await this.prisma.user.findMany();
    const expenses = await this.prisma.expense.findMany({
      include: { participants: true },
    });
    const balances = this.calculateBalances(users, expenses);
    const { creditors, debtors } = this.separateCreditorDebtors(balances);
    return this.createPaymentGraph(creditors, debtors);
  }

  private calculateBalances(users: any[], expenses: any[]): { [key: string]: number } {
    const balances: { [key: string]: number } = {};
    users.forEach(user => {
      balances[user.id] = 0;
    });
    expenses.forEach(expense => {
      const totalAmount = expense.amount;
      const participantsCount = expense.participants.length;
      expense.participants.forEach((participant: any) => {
        if (participant.userId === expense.creatorId) {
          balances[participant.userId] += totalAmount - (totalAmount / participantsCount);
        } else {
          balances[participant.userId] -= totalAmount / participantsCount;
        }
      });
    });
    return balances;
  }

  private separateCreditorDebtors(balances: { [key: string]: number }): { creditors: User[], debtors: User[] } {
    const creditors: User[] = [];
    const debtors: User[] = [];
    Object.entries(balances).forEach(([id, balance]) => {
      if (balance > 0) {
        creditors.push({ id, finalBalance: balance });
      } else if (balance < 0) {
        debtors.push({ id, finalBalance: -balance });
      }
    });
    creditors.sort((a, b) => b.finalBalance - a.finalBalance);
    debtors.sort((a, b) => b.finalBalance - a.finalBalance);
    return { creditors, debtors };
  }

  private createPaymentGraph(creditors: User[], debtors: User[]): PaymentNode[] {
    const paymentGraph: PaymentNode[] = [];
    while (creditors.length > 0 && debtors.length > 0) {
      const receiver = creditors[0];
      const sender = debtors[0];
      const amountTransferred = Math.min(sender.finalBalance, receiver.finalBalance);
      paymentGraph.push({
        from: sender.id,
        to: receiver.id,
        amount: amountTransferred,
      });
      sender.finalBalance -= amountTransferred;
      receiver.finalBalance -= amountTransferred;
      
      if (sender.finalBalance === 0) {
        debtors.shift();
      }
      if (receiver.finalBalance === 0) {
        creditors.shift();
      }
      
      this.maintainHeapProperty(creditors, 0, (a, b) => b.finalBalance - a.finalBalance);
      this.maintainHeapProperty(debtors, 0, (a, b) => b.finalBalance - a.finalBalance);
    }
    return paymentGraph;
  }

  private maintainHeapProperty(heap: User[], index: number, compareFn: (a: User, b: User) => number) {
    const left = 2 * index + 1;
    const right = 2 * index + 2;
    let largest = index;

    if (left < heap.length && compareFn(heap[left], heap[largest]) > 0) {
      largest = left;
    }
    if (right < heap.length && compareFn(heap[right], heap[largest]) > 0) {
      largest = right;
    }

    if (largest !== index) {
      [heap[index], heap[largest]] = [heap[largest], heap[index]];
      this.maintainHeapProperty(heap, largest, compareFn);
    }
  }
}