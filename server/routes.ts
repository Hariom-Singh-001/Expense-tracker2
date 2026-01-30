import "dotenv/config";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertExpenseSchema } from "@shared/schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // --- EXISTING EXPENSE ROUTES ---
  app.get("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const expenses = await storage.getExpenses(userId);
    res.json(expenses);
  });

  app.post("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertExpenseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const userId = (req.user as any).id;
    const expense = await storage.createExpense(userId, parsed.data);
    res.status(201).json(expense);
  });

  // --- GEMINI AI ROUTE ---
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { message } = req.body;
      const userId = (req.user as any).id;
      
      // 1. Get Context
      const expenses = await storage.getExpenses(userId);
      const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const recentHistory = expenses.slice(0, 5).map(e => 
        `- ${e.title}: $${e.amount} on ${e.date}`
      ).join("\n");

      // 2. Setup AI
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Missing API Key in .env file");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      
      // *** THE FIX: Reverted to 'gemini-pro' ***
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        You are a smart financial assistant.
        User's Total Spending: $${total}
        Recent Transactions:
        ${recentHistory}

        User Question: "${message}"

        Answer specifically based on their data. Keep it helpful, encouraging, and under 50 words.
      `;

      // 3. Generate
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      res.json({ message: text });
    } catch (error: any) {
      console.error("Gemini Error:", error.message);
      res.status(500).json({ message: "Gemini Error: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}