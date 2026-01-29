import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertExpenseSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // 1. Setup Authentication routes first
  setupAuth(app);

  // 2. GET: List all expenses (This was working)
  app.get("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Use the ID from the logged-in user
    const userId = (req.user as any).id;
    const expenses = await storage.getExpenses(userId);
    res.json(expenses);
  });

  // 3. POST: Save a new expense (This was MISSING or Broken)
  app.post("/api/expenses", async (req, res) => {
    // A. Check if user is logged in
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // B. Validate the data coming from the frontend
    const parsed = insertExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    // C. Save to database using the logged-in user's ID
    const userId = (req.user as any).id;
    const expense = await storage.createExpense(userId, parsed.data);
    
    // D. Send back the saved item as JSON (Status 201 = Created)
    res.status(201).json(expense);
  });

  const httpServer = createServer(app);
  return httpServer;
}