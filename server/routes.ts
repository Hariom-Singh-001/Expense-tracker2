import type { Express } from "express";
import { createServer, type Server } from "http";
import { GoogleGenAI } from "@google/genai"; // New unified 2026 SDK
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertExpenseSchema } from "@shared/schema";
import admin from "firebase-admin"; //
import { createRequire } from "module";

// --- ES MODULE FIX: Support require for JSON files ---
const require = createRequire(import.meta.url);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require("./firebase-service-account.json")),
  });
}

// FIX: Satisfy TypeScript with a fallback string
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// FIX: Extend User type so TS recognizes 'req.user.id'
declare global {
  namespace Express {
    interface User { id: number; username: string; }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up standard login/logout routes (username/password)
  setupAuth(app);

  // --- GOOGLE LOGIN ROUTE ---
  app.post("/api/login/google", async (req, res) => {
    const { token } = req.body;

    try {
      // 1. Verify the ID token from the frontend
      const decodedToken = await admin.auth().verifyIdToken(token);
      const { email, uid } = decodedToken;

      if (!email) {
        return res.status(400).send("Email not found in Google account");
      }

      // 2. Check if user exists in your database
      let user = await storage.getUserByUsername(email);

      if (!user) {
        // 3. Create user if they don't exist
        user = await storage.createUser({
          username: email,
          password: uid, 
        });
      }

      // 4. Manually trigger Passport.js login to create a session
      req.login(user, (err) => {
        if (err) return res.status(500).send("Session creation error");
        res.json(user);
      });

    } catch (error: any) {
      console.error("Google Auth Error:", error.message);
      res.status(401).send("Invalid Google token");
    }
  });

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

      res.json(JSON.parse(result.text || "{}"));
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "AI processing failed" });
    }
  });

  // GET: Fetch all expenses for the logged-in user
  app.get("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const expenses = await storage.getExpenses(req.user.id); // Neon fetch
    res.json(expenses);
  });

  // POST: Create a new expense
  app.post("/api/expenses", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

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