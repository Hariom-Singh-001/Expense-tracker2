import "dotenv/config";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertExpenseSchema } from "@shared/schema";

// --- SMART MODEL SELECTOR ---
// This function asks Google what models are available to YOU.
async function getSmartModel(apiKey: string): Promise<string> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();
    
    if (!data.models) {
      console.warn("Could not list models. Defaulting to gemini-1.5-flash");
      return "gemini-1.5-flash";
    }

    // Look for valid models in your list
    const validModels = data.models.map((m: any) => m.name.replace("models/", ""));
    console.log("Your Available Models:", validModels.join(", "));

    // Priority List: Try to find the best one
    if (validModels.includes("gemini-1.5-flash")) return "gemini-1.5-flash";
    if (validModels.includes("gemini-1.5-pro")) return "gemini-1.5-pro";
    if (validModels.includes("gemini-pro")) return "gemini-pro";
    if (validModels.includes("gemini-1.0-pro")) return "gemini-1.0-pro";

    // If none of our favorites exist, just take the first one that supports generating text
    const fallback = validModels.find((m: string) => m.includes("gemini"));
    return fallback || "gemini-1.5-flash";
  } catch (error) {
    console.error("Model Auto-Detect Failed:", error);
    return "gemini-1.5-flash"; // Fallback
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // --- STANDARD EXPENSE ROUTES ---
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

  // --- SMART AI ROUTE ---
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    try {
      const { message } = req.body;
      const userId = (req.user as any).id;

      // 1. Context Data
      const expenses = await storage.getExpenses(userId);
      const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const recent = expenses.slice(0, 5).map(e => `${e.title}: $${e.amount}`).join(", ");

      // 2. Check API Key
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ message: "API Key is missing." });

      // 3. AUTO-DETECT MODEL
      const modelName = await getSmartModel(apiKey);
      console.log(`Using Model: ${modelName}`);

      // 4. CALL GOOGLE
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a financial assistant. User Total Spent: $${total}. Recent: ${recent}. User asks: "${message}". Reply in 1 short sentence.`
              }]
            }]
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Google API Error:", JSON.stringify(data, null, 2));
        throw new Error(data.error?.message || "Google API Refused Connection");
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate an answer.";
      res.json({ message: text });

    } catch (error: any) {
      console.error("Server Error:", error.message);
      res.status(500).json({ message: `Error: ${error.message}` });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}