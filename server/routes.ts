import type { Express } from "express";
import { createServer, type Server } from "http";
import { GoogleGenAI } from "@google/genai"; // Standard 2026 Unified SDK
import { setupAuth } from "./auth";
import { storage } from "./storage";

// FIX: Satisfy TypeScript by providing a fallback empty string
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// FIX: Teach TypeScript that our User has an 'id'
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // 1. Setup Authentication
  setupAuth(app);

  // 2. AI Processing Route
  app.post("/api/ai/process", async (req, res) => {
    try {
      const { text } = req.body;
      const result = await ai.models.generateContent({
        model: "gemini-3-flash", // Fast & Free for utility tasks
        contents: [{ role: "user", parts: [{ text: `Analyze: "${text}". Return ONLY JSON: {"amount": number, "category": "string", "merchant": "string"}` }] }],
        config: { responseMimeType: "application/json" }
      });

      // FIX: Access result.text directly (fixes 'property response does not exist')
      res.json(JSON.parse(result.text)); 
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "AI failed to process" });
    }
  });

  // 3. Keep your existing Expense database routes
  app.get("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const expenses = await storage.getExpenses(req.user!.id);
    res.json(expenses);
  });

  const httpServer = createServer(app);
  return httpServer;
}