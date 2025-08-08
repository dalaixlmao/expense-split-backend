import express from "express";
import { userRoutes } from "./routes/userRoutes";
import { expenseRoutes } from "./routes/expenseRoutes";
import cors from "cors";
import { apiLimiter } from "./middlewares/rateLimit";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Apply general rate limiting to all routes
app.use(apiLimiter);

// API version prefix
const API_PREFIX = "/api";

// Routes
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/expenses`, expenseRoutes);

// Health check endpoint
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Catch-all route for 404s
app.all("*", (req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

export default app;