/*import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertExpenseSchema } from "@shared/schema";

// --- FIX: Teach TypeScript that our User has an ID ---
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
    }
  }
}
// -----------------------------------------------------

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up login/logout routes automatically
  setupAuth(app);

  // GET: Fetch all expenses for the logged-in user
  app.get("/api/expenses", async (req, res) => {
    // If user is not logged in, stop.
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Now TypeScript knows req.user.id exists!
    const expenses = await storage.getExpenses(req.user.id);
    res.json(expenses);
  });

  // POST: Create a new expense
  app.post("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Validate that the data sent is correct (title, amount, etc.)
    const parsed = insertExpenseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const expense = await storage.createExpense(req.user.id, parsed.data);
    res.status(201).json(expense);
  });

  const httpServer = createServer(app);
  return httpServer;
}
  */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Gemini 3 Flash is best for fast, cheap categorization
const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });

export async function processTransaction(rawText: string) {
  const prompt = `
    Analyze this text: "${rawText}".
    Identify the following:
    1. Amount (as a number)
    2. Category (one of: Food, Transport, Rent, Shopping, Entertainment)
    3. Merchant Name
    
    Return ONLY a JSON object:
    {"amount": 0, "category": "", "merchant": "", "date": "YYYY-MM-DD"}
  `;

  const result = await model.generateContent(prompt);
  // Using JSON.parse ensures the data is ready for your database
  return JSON.parse(result.response.text());
}