import { Request, Response, NextFunction } from "express";
import { CreateExpenseDTO, CreateUserDTO, UserSignin } from "../types/index";
import { CreateExpenseDTOSchema, CreateUserDTOSchema, UserSigninSchema } from "../types/zodSchemas";

export const userSignupValidation = async (req: Request, res: Response, next: NextFunction) => {
  const body: CreateUserDTO = req.body;
  try {
    const validate = CreateUserDTOSchema.safeParse(body);
    if (validate.success) {
      next();
    } else {
      res.status(400).json({ message: "Invalid input", errors: validate.error.errors });
    }
  } catch (error) {
    res.status(400).json({ message: "Bad input", error });
  }
};

export const userSigninValidation = async (req: Request, res: Response, next: NextFunction) => {
  const body: UserSignin = req.body;
  try {
    const validate = UserSigninSchema.safeParse(body);
    if (validate.success) {
      next();
    } else {
      res.status(400).json({ message: "Invalid input", errors: validate.error.errors });
    }
  } catch (error) {
    res.status(400).json({ message: "Bad input", error });
  }
};

export const addExpenseValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body: CreateExpenseDTO = req.body;
  try {
    const validate = CreateExpenseDTOSchema.safeParse(body);
    if (validate.success) {
      // Additional validation for percentage split
      if (body.splitMethod === 'PERCENTAGE') {
        const totalPercentage = body.participants.reduce((sum, p) => sum + (p.percentage || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          res.status(400).json({ message: "Percentage split must add up to 100%" });
        }
      }
      next();
    } else {
      res.status(400).json({ message: "Invalid input", errors: validate.error.errors });
    }
  } catch (error) {
    res.status(400).json({ message: "Bad input", error });
  }
};