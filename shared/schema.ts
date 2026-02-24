import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("member"), // 'admin' | 'member'
  isActive: boolean("is_active").notNull().default(true),
});

// Manual schema definition to avoid drizzle-zod type issues
export const insertUserSchema = z.object({
  name: z.string(),
  email: z.string(),
  role: z.string().default("member"),
  isActive: z.boolean().default(true),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
