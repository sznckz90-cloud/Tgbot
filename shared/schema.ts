import { pgTable, text, serial, integer, real, bigint, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique(), // stored as text to avoid bigint issues
  username: text("username"),
  firstName: text("first_name"),
  languageCode: text("language_code"),
  balance: real("balance").default(0).notNull(),
  miningLevel: integer("mining_level").default(1).notNull(),
  lastClaimTime: bigint("last_claim_time", { mode: "number" }).notNull(), // timestamp in ms
  referrerId: text("referrer_id"), // telegram_id of referrer
  referralCount: integer("referral_count").default(0).notNull(),
  isPremium: boolean("is_premium").default(false),
  status: text("status").default("active").notNull(),
  language: text("language"),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  isOnboarded: boolean("is_onboarded").default(false).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: text("verification_token"),
  verificationExpiresAt: timestamp("verification_expires_at"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'channel', 'bot'
  title: text("title").notNull(),
  description: text("description").notNull(),
  reward: real("reward").notNull(),
  link: text("link").notNull(),
  targetBotUsername: text("target_bot_username"),
  creatorId: integer("creator_id").references(() => users.id),
  maxCompletions: integer("max_completions").default(1000).notNull(),
  currentCompletions: integer("current_completions").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userTasks = pgTable("user_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  status: text("status").default("pending").notNull(), // pending, verified, completed
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: real("amount").notNull(),
  walletAddress: text("wallet_address").notNull(),
  status: text("status").default("pending").notNull(), // pending, processing, completed, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const usersRelations = relations(users, ({ many }) => ({
  withdrawals: many(withdrawals),
  userTasks: many(userTasks),
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
  userTasks: many(userTasks),
}));

export const userTasksRelations = relations(userTasks, ({ one }) => ({
  user: one(users, {
    fields: [userTasks.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [userTasks.taskId],
    references: [tasks.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
}));

// === SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertUserTaskSchema = createInsertSchema(userTasks).omit({ id: true, createdAt: true });
export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({ id: true, createdAt: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UserTask = typeof userTasks.$inferSelect;
export type InsertUserTask = z.infer<typeof insertUserTaskSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
