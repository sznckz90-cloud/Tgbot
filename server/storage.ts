import { users, withdrawals, tasks, userTasks, type User, type InsertUser, type Withdrawal, type InsertWithdrawal, type Task, type InsertTask, type UserTask, type InsertUserTask } from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc, and, notInArray } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawals(): Promise<(Withdrawal & { user: User })[]>;
  updateWithdrawalStatus(id: number, status: string): Promise<Withdrawal>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;

  getActiveTasksForUser(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getUserTask(userId: number, taskId: number): Promise<UserTask | undefined>;
  createUserTask(userTask: InsertUserTask): Promise<UserTask>;
  updateUserTask(userId: number, taskId: number, updates: Partial<UserTask>): Promise<UserTask>;
  createTask(task: InsertTask): Promise<Task>;
  getTasksByCreator(creatorId: number): Promise<Task[]>;
  incrementTaskCompletion(taskId: number): Promise<void>;
  getPendingUserTask(userId: number): Promise<UserTask | undefined>;
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

  async getActiveTasksForUser(userId: number): Promise<Task[]> {
    const completedTasks = await db.select({ taskId: userTasks.taskId })
      .from(userTasks)
      .where(and(eq(userTasks.userId, userId), eq(userTasks.status, "completed")));
    
    const completedIds = completedTasks.map(t => t.taskId);

    if (completedIds.length === 0) {
      return await db.select().from(tasks).where(eq(tasks.isActive, true));
    }

    return await db.select().from(tasks).where(and(
      eq(tasks.isActive, true),
      notInArray(tasks.id, completedIds)
    ));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getUserTask(userId: number, taskId: number): Promise<UserTask | undefined> {
    const [ut] = await db.select().from(userTasks).where(and(
      eq(userTasks.userId, userId),
      eq(userTasks.taskId, taskId)
    ));
    return ut;
  }

  async createUserTask(userTask: InsertUserTask): Promise<UserTask> {
    const [ut] = await db.insert(userTasks).values(userTask).returning();
    return ut;
  }

  async updateUserTask(userId: number, taskId: number, updates: Partial<UserTask>): Promise<UserTask> {
    const [ut] = await db.update(userTasks)
      .set(updates)
      .where(and(eq(userTasks.userId, userId), eq(userTasks.taskId, taskId)))
      .returning();
    return ut;
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

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async getTasksByCreator(creatorId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.creatorId, creatorId)).orderBy(desc(tasks.createdAt));
  }

  async incrementTaskCompletion(taskId: number): Promise<void> {
    await db.update(tasks)
      .set({ 
        currentCompletions: sql`${tasks.currentCompletions} + 1`,
        isActive: sql`CASE WHEN ${tasks.currentCompletions} + 1 >= ${tasks.maxCompletions} THEN false ELSE ${tasks.isActive} END`
      })
      .where(eq(tasks.id, taskId));
  }

  async getPendingUserTask(userId: number): Promise<UserTask | undefined> {
    const [ut] = await db.select().from(userTasks)
      .where(and(eq(userTasks.userId, userId), eq(userTasks.status, "pending")))
      .limit(1);
    return ut;
  }
}

export const storage = new DatabaseStorage();
