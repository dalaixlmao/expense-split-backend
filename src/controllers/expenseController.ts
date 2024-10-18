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

  async downloadBalanceSheet(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
      } else if(userId) {
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
