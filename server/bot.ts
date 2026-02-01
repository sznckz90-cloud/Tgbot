import TelegramBot from "node-telegram-bot-api";
import { storage } from "./storage";

// Constants
const MINING_SPEEDS: Record<number, number> = {
  1: 0.0000025,
  2: 0.0000075,
  3: 0.0000175,
  4: 0.0000375,
  5: 0.0000775,
  6: 0.0001375,
  7: 0.0002175,
  8: 0.0003175,
  9: 0.0005175,
  10: 0.0008175,
  11: 0.0012175,
  12: 0.0017175,
  13: 0.0027175,
};

const UPGRADE_COSTS: Record<number, number> = {
  1: 0.5,
  2: 1,
  3: 2,
  4: 4,
  5: 8,
  6: 12,
  7: 16,
  8: 20,
  9: 40,
  10: 60,
  11: 80,
  12: 100,
  13: 200,
};

const REFERRAL_REWARD = 0.008;

let bot: TelegramBot | null = null;

export function setupBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not set. Bot will not start.");
    return;
  }

  // Create a bot that uses 'polling' to fetch new updates
  // In production, we should probably use webhooks, but polling is fine for this simulated environment
  try {
    bot = new TelegramBot(token, { polling: true });
    console.log("Telegram bot started successfully!");
  } catch (error) {
    console.error("Failed to start Telegram bot:", error);
    return;
  }

  if (!bot) return;

  // --- Helpers ---
  async function getUserOrRegister(msg: TelegramBot.Message, referrerId?: string) {
    const telegramId = msg.from?.id.toString();
    if (!telegramId) return null;

    let user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      user = await storage.createUser({
        telegramId,
        username: msg.from?.username || null,
        firstName: msg.from?.first_name || null,
        languageCode: msg.from?.language_code || null,
        lastClaimTime: Date.now(),
        referrerId: referrerId || null,
        referralCount: 0,
        balance: 0,
        miningLevel: 1,
        isPremium: false,
        status: "active"
      });

      // Handle referral reward if applicable
      if (referrerId && referrerId !== telegramId) {
        const referrer = await storage.getUserByTelegramId(referrerId);
        if (referrer) {
           // Update referrer stats
           await storage.updateUser(referrer.id, {
             referralCount: (referrer.referralCount || 0) + 1,
             balance: (referrer.balance || 0) + REFERRAL_REWARD
           });
           
           // Notify referrer
           bot?.sendMessage(referrer.telegramId, `👥 New referral! You earned ${REFERRAL_REWARD} TON.`);
        }
      }
    }
    return user;
  }

  function getMiningRate(level: number) {
    return MINING_SPEEDS[level] || MINING_SPEEDS[1];
  }

  // --- Keyboards ---
  const languageKeyboard = {
    reply_markup: {
      keyboard: [
        [{ text: "🇷🇺 Русский" }, { text: "🇬🇧 English" }],
        [{ text: "🇪🇸 Español" }, { text: "🇵🇹 Português" }],
        [{ text: "🇫🇷 Français" }, { text: "🇾🇪 العربية" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    }
  };

  const verificationKeyboard = (token: string) => {
    const domain = process.env.REPLIT_DEV_DOMAIN;
    return {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🛡️ I am not a bot", url: `https://${domain}/verify?token=${token}` }]
        ]
      }
    };
  };

  const subscribeKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🚀 Subscribe", url: "https://t.me/your_channel_link" },
          { text: "✅ I'm subscribed", callback_data: "check_subscription" }
        ]
      ]
    }
  };

  const mainMenuKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "♻️ Refresh", callback_data: "refresh" }],
        [{ text: "🚀 Upgrade", callback_data: "upgrade" }, { text: "🎁 Promo", callback_data: "promo" }],
        [{ text: "👥 Partners", callback_data: "partners" }, { text: "👤 Account", callback_data: "account" }],
        [{ text: "💸 Earnings", callback_data: "earnings" }, { text: "🏦 Withdraw", callback_data: "withdraw" }],
        [{ text: "ℹ️ Info", callback_data: "info" }]
      ]
    }
  };

  const backButton = {
    reply_markup: {
      inline_keyboard: [[{ text: "↩️ Back", callback_data: "back_to_menu" }]]
    }
  };

  // --- Commands ---
  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const referralCode = match?.[1];
    
    const userResult = await storage.getUserByTelegramId(msg.from?.id.toString() || "");
    let user = userResult;
    
    if (!user) {
      const newUser = await getUserOrRegister(msg, referralCode);
      if (!newUser) return;
      user = newUser;
      
      return bot?.sendMessage(chatId, "Select language / Выберите язык", languageKeyboard);
    }

    if (!user.isOnboarded) {
      if (!user.language) {
        return bot?.sendMessage(chatId, "Select language / Выберите язык", languageKeyboard);
      }
      if (!user.isVerified) {
        const token = Math.random().toString(36).substring(2, 15);
        await storage.updateUser(user.id, { 
          verificationToken: token,
          verificationExpiresAt: new Date(Date.now() + 3 * 60 * 1000)
        });
        return bot?.sendMessage(chatId, "👽 To continue, you need to confirm that you are not a bot", verificationKeyboard(token));
      }
      return bot?.sendMessage(chatId, "😉 Make sure you subscribe to our channel before you get started", subscribeKeyboard);
    }
    
    // Calculate mined TON immediately for current display
    const now = Date.now();
    const lastClaim = user.lastClaimTime;
    const diffSeconds = (now - lastClaim) / 1000;
    const miningRatePer5Sec = getMiningRate(user.miningLevel);
    const miningRatePerSec = miningRatePer5Sec / 5;
    const minedAmount = diffSeconds * miningRatePerSec;
    const currentBalance = user.balance + minedAmount;
    
    const welcomeText = `
🪪 *Dashboard*

💰 Balance: ${currentBalance.toFixed(8)} TON
⛏️ Mining Speed: ${miningRatePer5Sec} TON / 5 seconds

TON — Mining without limits
`;
    bot?.sendMessage(chatId, welcomeText, { parse_mode: "Markdown", ...mainMenuKeyboard });
  });

  bot.on("message", async (msg) => {
    if (msg.text && ["🇷🇺 Русский", "🇬🇧 English", "🇪🇸 Español", "🇵🇹 Português", "🇫🇷 Français", "🇾🇪 العربية"].includes(msg.text)) {
      const telegramId = msg.from?.id.toString();
      if (!telegramId) return;
      const user = await storage.getUserByTelegramId(telegramId);
      if (user && !user.language) {
        const langMap: Record<string, string> = {
          "🇷🇺 Русский": "ru", "🇬🇧 English": "en", "🇪🇸 Español": "es",
          "🇵🇹 Português": "pt", "🇫🇷 Français": "fr", "🇾🇪 العربية": "ar"
        };
        await storage.updateUser(user.id, { language: langMap[msg.text] });
        
        const token = Math.random().toString(36).substring(2, 15);
        await storage.updateUser(user.id, { 
          verificationToken: token,
          verificationExpiresAt: new Date(Date.now() + 3 * 60 * 1000)
        });
        bot?.sendMessage(msg.chat.id, "👽 To continue, you need to confirm that you are not a bot", {
          ...verificationKeyboard(token),
          reply_markup: { ...verificationKeyboard(token).reply_markup, remove_keyboard: true }
        } as any);
      }
    }
  });

  // --- Callback Queries ---
  bot.on("callback_query", async (query) => {
    if (!query.message || !query.data) return;
    const chatId = query.message.chat.id;
    const telegramId = query.from.id.toString();
    const messageId = query.message.message_id;

    if (query.data === "check_subscription") {
      try {
        // In a real bot, we would use getChatMember
        // const member = await bot?.getChatMember("@your_channel_username", query.from.id);
        // const isSubscribed = ["member", "administrator", "creator"].includes(member.status);
        
        const isSubscribed = true; // Simulated for now
        
        if (isSubscribed) {
          const user = await storage.getUserByTelegramId(telegramId);
          if (user) {
            await storage.updateUser(user.id, { isOnboarded: true });
            await bot?.sendMessage(chatId, "🏂 Let's go?");
            // Trigger main menu
            const now = Date.now();
            const welcomeText = `
🪪 *Dashboard*

💰 Balance: ${user.balance.toFixed(8)} TON
⛏️ Mining Speed: ${getMiningRate(user.miningLevel)} TON / 5 seconds

TON — Mining without limits
`;
            bot?.sendMessage(chatId, welcomeText, { parse_mode: "Markdown", ...mainMenuKeyboard });
          }
        } else {
          bot?.answerCallbackQuery(query.id, { text: "❌ You are not subscribed yet!", show_alert: true });
        }
      } catch (e) {
        bot?.answerCallbackQuery(query.id, { text: "❌ Error checking subscription.", show_alert: true });
      }
      return;
    }

    // Acknowledge callback immediately to stop loading animation
    bot?.answerCallbackQuery(query.id);

    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      bot?.sendMessage(chatId, "⚠️ User not found. Please type /start");
      return;
    }

    if (query.data === "back_to_menu" || query.data === "refresh") {
      // Calculate mined TON
      const now = Date.now();
      const lastClaim = user.lastClaimTime;
      const diffSeconds = (now - lastClaim) / 1000;
      const miningRatePer5Sec = getMiningRate(user.miningLevel);
      const miningRatePerSec = miningRatePer5Sec / 5;
      
      const minedAmount = diffSeconds * miningRatePerSec;
      
      // Update user
      const newBalance = user.balance + minedAmount;
      await storage.updateUser(user.id, {
        balance: newBalance,
        lastClaimTime: now
      });

      const text = `
🪪 *Dashboard*

💰 Balance: ${newBalance.toFixed(8)} TON
⛏️ Mining Speed: ${getMiningRate(user.miningLevel)} TON / 5 seconds

TON — Mining without limits
`;
      
      try {
        await bot?.editMessageText(text, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: mainMenuKeyboard.reply_markup
        });
      } catch (e) {
        // Message might not have changed, ignore "message is not modified" error
      }
      
    } else if (query.data === "upgrade") {
      const currentLevel = user.miningLevel;
      const nextLevel = currentLevel + 1;
      const cost = UPGRADE_COSTS[currentLevel]; // Cost to move FROM current TO next
      
      if (!cost) {
        bot?.sendMessage(chatId, "🚀 Max level reached!");
        return;
      }

      const text = `
🚀 *Upgrade Mining Speed*

Current Level: ${currentLevel}
Speed: ${MINING_SPEEDS[currentLevel]} TON / 5s

Next Level: ${nextLevel}
Speed: ${MINING_SPEEDS[nextLevel]} TON / 5s
Cost: ${cost} TON

💰 Your Balance: ${user.balance.toFixed(4)} TON
`;
      
      const upgradeKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: `Buy Level ${nextLevel} (${cost} TON)`, callback_data: `buy_level_${nextLevel}` }],
            [{ text: "↩️ Back", callback_data: "back_to_menu" }]
          ]
        }
      };

      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: upgradeKeyboard.reply_markup
      });

    } else if (query.data.startsWith("buy_level_")) {
      const targetLevel = parseInt(query.data.split("_")[2]);
      const currentLevel = user.miningLevel;
      
      // Validation
      if (targetLevel !== currentLevel + 1) {
        bot?.sendMessage(chatId, "⚠️ You can only upgrade one level at a time.");
        return;
      }
      
      const cost = UPGRADE_COSTS[currentLevel];
      
      if (user.balance < cost) {
        bot?.answerCallbackQuery(query.id, { text: "❌ Insufficient funds!", show_alert: true });
        return;
      }

      // Process Upgrade
      await storage.updateUser(user.id, {
        balance: user.balance - cost,
        miningLevel: targetLevel
      });
      
      bot?.answerCallbackQuery(query.id, { text: "✅ Upgrade successful!", show_alert: true });
      
      // Go back to menu logic (simulate refresh)
      // trigger a refresh view manually
      const updatedUser = await storage.getUser(user.id); // refetch
      if (!updatedUser) return;

      const text = `
🪪 *Dashboard*

💰 Balance: ${updatedUser.balance.toFixed(8)} TON
⛏️ Mining Speed: ${getMiningRate(updatedUser.miningLevel)} TON / 5 seconds

TON — Mining without limits
`;
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: mainMenuKeyboard.reply_markup
      });

    } else if (query.data === "partners") {
      const botUsername = (await bot?.getMe())?.username;
      const referralLink = `https://t.me/${botUsername}?start=${telegramId}`;
      
      const text = `
👥 *Partners Program*

Invite friends and earn TON!
• Earn *${REFERRAL_REWARD} TON* for each active referral
• Get +10% mining speed (coming soon)

🔗 *Your Referral Link:*
\`${referralLink}\`

Total Referrals: ${user.referralCount}
`;
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: backButton.reply_markup
      });

    } else if (query.data === "info") {
      const text = `
ℹ️ *Information*

🤖 *What is this bot?*
This is a TON cloud mining simulator. You can mine TON coins, upgrade your mining rig, and withdraw real rewards.

⚙️ *How it works?*
1. Press "Refresh" to collect mined TON.
2. Use "Upgrade" to increase your speed.
3. Invite friends to earn faster.
4. Withdraw earnings to your wallet.

⚠️ *Note:* This is a simulation bot.
`;
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: backButton.reply_markup
      });

    } else if (query.data === "earnings") {
      const text = `
💸 *Earnings & Tasks*

Currently, there are no active tasks available. Check back later!
`;
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: backButton.reply_markup
      });

    } else if (query.data === "account") {
      const text = `
👤 *Account Info*

🆔 ID: \`${telegramId}\`
🗣️ Language: ${user.languageCode || 'en'}
👥 Referrals: ${user.referralCount}
📅 Joined: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}
⚡ Level: ${user.miningLevel}
🟢 Status: ${user.status.toUpperCase()}
`;
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: backButton.reply_markup
      });

    } else if (query.data === "withdraw") {
      const minWithdraw = 0.5;
      
      const text = `
🏦 *Withdraw Funds*

💰 Balance: ${user.balance.toFixed(4)} TON
⚠️ Minimum Withdrawal: ${minWithdraw} TON

To withdraw, please use the button below to start the process.
`;
      
      const withdrawKeyboard = {
        reply_markup: {
          inline_keyboard: [
             user.balance >= minWithdraw 
             ? [{ text: "✅ Request Withdrawal", callback_data: "request_withdrawal" }]
             : [{ text: "❌ Insufficient Balance", callback_data: "no_balance" }],
             [{ text: "↩️ Back", callback_data: "back_to_menu" }]
          ]
        }
      };

      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: withdrawKeyboard.reply_markup
      });

    } else if (query.data === "request_withdrawal") {
      bot?.sendMessage(chatId, "🏦 Please enter your TON wallet address:", {
         reply_markup: { force_reply: true }
      }).then(sent => {
         bot?.onReplyToMessage(chatId, sent.message_id, async (reply) => {
             const wallet = reply.text;
             if (!wallet) return;

             // Ask for amount
             const amountMsg = await bot?.sendMessage(chatId, "💰 Enter amount to withdraw:", {
                 reply_markup: { force_reply: true }
             });

             if (amountMsg) {
                 bot?.onReplyToMessage(chatId, amountMsg.message_id, async (amountReply) => {
                     const amount = parseFloat(amountReply.text || "0");
                     if (isNaN(amount) || amount <= 0) {
                         bot?.sendMessage(chatId, "❌ Invalid amount.");
                         return;
                     }

                     const freshUser = await storage.getUser(user.id);
                     if (!freshUser || freshUser.balance < amount) {
                         bot?.sendMessage(chatId, "❌ Insufficient balance.");
                         return;
                     }

                     // Deduct balance
                     await storage.updateUser(user.id, {
                         balance: freshUser.balance - amount
                     });

                     // Create withdrawal request
                     await storage.createWithdrawal({
                         userId: user.id,
                         amount: amount,
                         walletAddress: wallet,
                         status: "pending"
                     });

                     bot?.sendMessage(chatId, "✅ Withdrawal request submitted! Status: Pending");
                 });
             }
         });
      });
    } else if (query.data === "promo") {
      const text = `
🎁 *Promo Code*

Enter your promo code below to get rewards like free TON or mining speed boosts!
`;
      const promoKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "↩️ Back", callback_data: "back_to_menu" }]
          ]
        }
      };

      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: {
          force_reply: true,
          inline_keyboard: promoKeyboard.reply_markup.inline_keyboard
        } as any
      });

      // Listen for the next message from this user specifically to avoid global conflict
      // This is a simplified approach; in production you'd track user state
      bot?.onReplyToMessage(chatId, messageId, async (reply) => {
        const code = reply.text?.trim().toUpperCase();
        if (code === "FREE_TON") {
          const freshUser = await storage.getUserByTelegramId(telegramId);
          if (freshUser) {
            await storage.updateUser(freshUser.id, {
              balance: freshUser.balance + 1
            });
            bot?.sendMessage(chatId, "🎉 Promo code redeemed! +1 TON added to your balance.");
          }
        } else {
          bot?.sendMessage(chatId, "❌ Invalid promo code.");
        }
      });
    }
  });

  console.log("Bot setup complete.");
}
