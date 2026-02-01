import { users, withdrawals, type User, type InsertUser, type Withdrawal, type InsertWithdrawal } from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawals(): Promise<(Withdrawal & { user: User })[]>;
  updateWithdrawalStatus(id: number, status: string): Promise<Withdrawal>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async createWithdrawal(insertWithdrawal: InsertWithdrawal): Promise<Withdrawal> {
    const [withdrawal] = await db.insert(withdrawals).values(insertWithdrawal).returning();
    return withdrawal;
  }

  async getWithdrawals(): Promise<(Withdrawal & { user: User })[]> {
    return await db.query.withdrawals.findMany({
      with: {
        user: true,
      },
      orderBy: [desc(withdrawals.createdAt)],
    });
  }

  async updateWithdrawalStatus(id: number, status: string): Promise<Withdrawal> {
    const [withdrawal] = await db.update(withdrawals)
      .set({ status })
      .where(eq(withdrawals.id, id))
      .returning();
    return withdrawal;
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user;
  }

  async getStats(): Promise<{ totalUsers: number; totalWithdrawals: number; totalBalance: number }> {
    const [userStats] = await db.select({ 
      count: sql<number>`count(*)`,
      balance: sql<number>`sum(${users.balance})`
    }).from(users);
    
    const [withdrawalStats] = await db.select({ 
      count: sql<number>`count(*)` 
    }).from(withdrawals);

    return {
      totalUsers: Number(userStats?.count || 0),
      totalBalance: Number(userStats?.balance || 0),
      totalWithdrawals: Number(withdrawalStats?.count || 0),
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
}

export const storage = new DatabaseStorage();
