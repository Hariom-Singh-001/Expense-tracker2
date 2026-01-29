import type { Express } from "express";
import { createServer, type Server } from "http";
import { GoogleGenAI } from "@google/genai"; // New unified 2026 SDK
import { setupAuth } from "./auth";
import { storage } from "./storage";

// FIX: Satisfy TypeScript with a fallback string
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// FIX: Extend User type so TS recognizes 'req.user.id'
declare global {
  namespace Express {
    interface User { id: number; username: string; }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app); // Restores your login logic

  // AI ROUTE: This is what your "Ask Gemini" button talks to
  app.post("/api/ai/process", async (req, res) => {
    try {
      const { text } = req.body;
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // CORRECT 2026 MODEL ID
        contents: [{ role: "user", parts: [{ text: `
          Analyze: "${text}". 
          Return ONLY JSON: {"amount": number, "category": "string", "merchant": "string"}
        `}]}],
        config: { responseMimeType: "application/json" }
      });

      // FIX: Access result.text directly (fixes 'property response does not exist')
      res.json(JSON.parse(result.text)); 
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  // Your existing database route
  app.get("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const expenses = await storage.getExpenses(req.user!.id);
    res.json(expenses);
  });

  const httpServer = createServer(app);
  return httpServer;
}