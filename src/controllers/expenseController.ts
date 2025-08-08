import { Request, Response } from "express";
import { ExpenseService } from "../services/expenseService";
import { CreateExpenseDTO, BalanceSheet } from "../types/index";

export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  async addExpense(req: Request, res: Response) {
    try {
      const expenseData: CreateExpenseDTO = req.body;
      const expense = await this.expenseService.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ message: "Failed to create expense", error });
    }
  }

  async getUserExpenses(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const expenses = await this.expenseService.getUserExpenses(userId);
      res.json(expenses);
    } catch (error) {
      res.status(404).json({ message: "Expenses not found", error });
    }
  }

  async getAllExpenses(req: Request, res: Response) {
    try {
      const expenses = await this.expenseService.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve expenses", error });
    }
  }

  async getExpenseById(req: Request, res: Response) {
    try {
      const expenseId = req.params.id;
      const expense = await this.expenseService.getExpenseById(expenseId);
      
      if (!expense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve expense", error });
    }
  }

  async updateExpense(req: Request, res: Response) {
    try {
      const expenseId = req.params.id;
      const userId = req.user?.id;
      const expenseData: CreateExpenseDTO = req.body;
      
      // Check if expense exists
      const existingExpense = await this.expenseService.getExpenseById(expenseId);
      if (!existingExpense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      
      // Check if user is the creator of the expense
      if (existingExpense.creatorId !== userId) {
        res.status(403).json({ message: "Not authorized to update this expense" });
        return;
      }
      
      const updatedExpense = await this.expenseService.updateExpense(expenseId, expenseData);
      res.json(updatedExpense);
    } catch (error) {
      res.status(400).json({ message: "Failed to update expense", error });
    }
  }

  async deleteExpense(req: Request, res: Response) {
    try {
      const expenseId = req.params.id;
      const userId = req.user?.id;
      
      // Check if expense exists
      const existingExpense = await this.expenseService.getExpenseById(expenseId);
      if (!existingExpense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      
      // Check if user is the creator of the expense
      if (existingExpense.creatorId !== userId) {
        res.status(403).json({ message: "Not authorized to delete this expense" });
        return;
      }
      
      await this.expenseService.deleteExpense(expenseId);
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense", error });
    }
  }

  async downloadBalanceSheet(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
      } else {
        const balanceSheet = await this.expenseService.generateBalanceSheet(userId);

        // Convert balance sheet to CSV
        const csv = this.convertBalanceSheetToCSV(balanceSheet);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=balance_sheet.csv"
        );
        res.send(csv);
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to generate balance sheet", error });
    }
  }

  private convertBalanceSheetToCSV(balanceSheet: BalanceSheet): string {
    let csv = "Description,Amount,Date,Participants\n";

    balanceSheet.individualExpenses.forEach((expense) => {
      const participants = expense.participants
        .map((p) => `${p.userId}:${p.amount}`)
        .join(";");
      csv += `${expense.description},${
        expense.amount
      },${expense.date.toISOString()},${participants}\n`;
    });

    csv += `\nTotal Owed,${balanceSheet.totalOwed}\n`;
    csv += `Total Owed to Others,${balanceSheet.totalOwedToOthers}\n`;

    csv += "\nTransactions\n";
    csv += "From,To,Amount\n";
    balanceSheet.transactions.forEach((transaction) => {
      csv += `${transaction.from},${transaction.to},${transaction.amount}\n`;
    });

    return csv;
  }
}