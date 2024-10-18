import { Request } from "express";
import { SplitMethod } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    user?: User;
  }
}


// DTO = Data transfer objects

export interface UserSignin {
  email: string;
  password: string;
}

export interface CreateUserDTO {
  email: string;
  name: string;
  mobileNumber: string;
  password: string;
}

export interface User extends CreateUserDTO {
  id: string;
}

export interface CreateExpenseParticipantDTO {
  userId: string;
  amount?: number | null;
  percentage?: number | null;
}

export interface CreateExpenseDTO {
  amount: number;
  description: string;
  creatorId: string;
  splitMethod: SplitMethod;
  participants: CreateExpenseParticipantDTO[];
}

export interface Expense extends Omit<CreateExpenseDTO, "participants"> {
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
  individualExpenses: {
    id: string;
    description: string;
    amount: number;
    date: Date;
    participants: {
      userId: string;
      amount: number;
    }[];
  }[];
  totalOwed: number;
  totalOwedToOthers: number;
  transactions: PaymentNode[];
}