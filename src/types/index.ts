import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}


export interface CreateUserDTO {
  email: string;
  name: string;
  mobileNumber: string;
}

export interface User extends CreateUserDTO {
  id: string;
}

export enum SplitMethod {
  EQUAL = 'EQUAL',
  EXACT = 'EXACT',
  PERCENTAGE = 'PERCENTAGE',
}

export interface CreateExpenseParticipantDTO {
  userId: string;
  amount?: number;
  percentage?: number;
}

export interface CreateExpenseDTO {
  amount: number;
  description: string;
  creatorId: string;
  splitMethod: SplitMethod;
  participants: CreateExpenseParticipantDTO[];
}

export interface Expense extends Omit<CreateExpenseDTO, 'participants'> {
  id: string;
  date: Date;
  participants: ExpenseParticipant[];
}

export interface ExpenseParticipant extends CreateExpenseParticipantDTO {
  id: string;
  expenseId: string;
}

export interface PaymentNode {
  from: string;
  to: string;
  amount: number;
}

export interface BalanceSheet {
  transactions: PaymentNode[];
  // Add other balance sheet properties as needed
}