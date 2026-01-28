import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load the .env file so we can read the DATABASE_URL
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Did you forget to create the .env file?");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});