import express from "express";
import { userRoutes } from "./routes/userRoutes";
import { expenseRoutes } from "./routes/expenseRoutes";
import cors from "cors";

const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);
app.use(cors());

export default app;
