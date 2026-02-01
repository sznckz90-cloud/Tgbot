import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupBot } from "./bot";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Start the Telegram Bot
  setupBot();

  // --- Admin API Routes ---

  app.get(api.admin.stats.path, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.admin.users.list.path, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.admin.withdrawals.list.path, async (req, res) => {
    try {
      const withdrawals = await storage.getWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/verify", async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send("Missing token");
    
    const user = await storage.getUserByVerificationToken(token as string);
    if (!user || !user.verificationExpiresAt || user.verificationExpiresAt < new Date()) {
      return res.status(400).send("Invalid or expired token");
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const ipString: string = (Array.isArray(ip) ? ip[0] : (ip as string | undefined)) || "unknown";
    await storage.updateUser(user.id, { 
      isVerified: true, 
      verificationToken: null, 
      verificationExpiresAt: null,
      ipAddress: ipString
    });

    res.send(`
      <html>
        <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <h1>✅ Verified!</h1>
          <p>You can now return to the bot.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  });

  app.patch(api.admin.withdrawals.updateStatus.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = api.admin.withdrawals.updateStatus.input.parse(req.body);
      
      const withdrawal = await storage.updateWithdrawalStatus(id, status);
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      
      res.json(withdrawal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  return httpServer;
}
