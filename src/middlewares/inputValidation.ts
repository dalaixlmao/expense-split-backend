import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Expense, CreateExpenseDTO } from "../types";
import z from "zod";
import { toZod } from "tozod";
import { CreateExpenseDTOSchema } from "../types/zodSchemas";

const prisma = new PrismaClient();

// CreateExpenseDTO

const validate = (schema: any, body: any) => {
  const success = schema.parse(body);
  return success.success;
};

export const addExpenseVlidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body: CreateExpenseDTO = req.body;
  try {
    const validate = CreateExpenseDTOSchema.safeParse(body);
    if (validate.success) {
      next();
    } else {
      res
        .status(400)
        .json({ message: "Bad input request, can't create Expense." });
    }
  } catch (e) {
    res
      .status(400)
      .json({ message: "Bad input request, can't create Expense." });
  }
};

export const getUserExpenses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body: CreateExpenseDTO = req.body;
  try {
    const validate = CreateExpenseDTOSchema.safeParse(body);
    if (validate.success) {
      next();
    } else {
      res
        .status(400)
        .json({ message: "Bad input request, can't create Expense." });
    }
  } catch (e) {
    res
      .status(400)
      .json({ message: "Bad input request, can't create Expense." });
  }
};



// router.post('/', expenseController.addExpense.bind(expenseController));
// router.get('/user/:userId', expenseController.getUserExpenses.bind(expenseController));
// router.get('/', expenseController.getAllExpenses.bind(expenseController));
// router.get('/balance-sheet', expenseController.downloadBalanceSheet.bind(expenseController));
