import { users, expenses, type User, type InsertUser, type Expense, type InsertExpense } from "../shared/schema";
import { db, pool } from "./db";
import { eq, desc } from "drizzle-orm";
import session from "express-session";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// @ts-ignore
const connectPg = require("connect-pg-simple")(session);
const PostgresSessionStore = connectPg;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // New functions for Expenses
  createExpense(userId: number, expense: InsertExpense): Promise<Expense>;
  getExpenses(userId: number): Promise<Expense[]>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // --- NEW: Save an expense ---
  async createExpense(userId: number, expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db
      .insert(expenses)
      .values({ ...expense, userId })
      .returning();
    return newExpense;
  }

  // --- NEW: Get all expenses for a user ---
  async getExpenses(userId: number): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date)); // Show newest first
  }
}

export const storage = new DatabaseStorage();