import { z } from "zod";
import { SplitMethod } from "@prisma/client";

const UserSigninSchema =z.object({
    email: z.string().email(),
    password: z.string().min(8)
  });


const CreateUserDTOSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  mobileNumber: z.string(),
  password: z.string().min(8),
});

const UserSchema = CreateUserDTOSchema.extend({
  id: z.string(),
});

const CreateExpenseParticipantDTOSchema = z.object({
  userId: z.string(),
  amount: z.number().nullable().optional(),
  percentage: z.number().nullable().optional(),
});

const CreateExpenseDTOSchema = z.object({
  amount: z.number(),
  description: z.string(),
  creatorId: z.string(),
  splitMethod: z.nativeEnum(SplitMethod),
  participants: z.array(CreateExpenseParticipantDTOSchema),
});

// Expense Schema
const ExpenseSchema = CreateExpenseDTOSchema.omit({
  participants: true,
}).extend({
  id: z.string(),
  date: z.date(),
  participants: z.array(
    z.object({
      id: z.string(),
      expenseId: z.string(),
      userId: z.string(),
      amount: z.number().nullable().optional(),
      percentage: z.number().nullable().optional(),
    })
  ),
});

const ExpenseParticipantSchema = CreateExpenseParticipantDTOSchema.extend({
  id: z.string(),
  expenseId: z.string(),
});

const PaymentNodeSchema = z.object({
  from: z.string(),
  to: z.string(),
  amount: z.number(),
});

const BalanceSheetSchema = z.object({
  transactions: z.array(PaymentNodeSchema),
});

export {
    UserSigninSchema,
  CreateUserDTOSchema,
  UserSchema,
  CreateExpenseParticipantDTOSchema,
  CreateExpenseDTOSchema,
  ExpenseSchema,
  ExpenseParticipantSchema,
  PaymentNodeSchema,
  BalanceSheetSchema,
};
