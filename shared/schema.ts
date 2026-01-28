import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- USERS TABLE ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// --- EXPENSES TABLE ---
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  amount: integer("amount").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

// --- FIX: Flexible Validation ---
export const insertExpenseSchema = createInsertSchema(expenses, {
  // Allow any positive number (integers or decimals)
  amount: z.coerce.number().positive("Amount must be positive"),
  // Make date completely optional (DB will set it to NOW if missing)
  date: z.coerce.date().optional(),
}).pick({
  title: true,
  amount: true,
  date: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;