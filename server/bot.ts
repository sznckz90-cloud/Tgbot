import TelegramBot from "node-telegram-bot-api";
import { storage } from "./storage";
import crypto from "crypto";

let botInstance: TelegramBot | null = null;
let isPolling = false;

// Translations
const translations: Record<string, Record<string, string>> = {
    en: {
    selectLanguage: "Select language / Выберите язык",
    dashboard: "💎 *MY ACCOUNT*",
    balance: "Wallet Balance",
    partners: "👥 Referrals",
    withdraw: "🏦 Cash Out",
    info: "ℹ️ Guide",
    back: "↩️ Menu",
    subscribe: "🚀 Join Channel",
    subscribed: "✅ Verified",
    subscribeMessage: "😉 Please join our official channel to unlock all features",
    letsGo: "🏂 Start!",
    userNotFound: "⚠️ User profile not found. Type /start",
    partnersTitle: "👥 *Referral Program*",
    partnersDesc: "Grow your network and earn more!",
    partnersReward: "Get *{amount} TON* per active friend",
    shareReferral: "🔗 Copy Link",
    shareReferralMessage: "🚀 Start earning TON with me!\n\nJoin now and get rewards 💰\n\n👉 Start here: {link}",
    language: "🌎 Language",
    support: "📞 Support",
    notification: "🔔 Alerts",
    notificationOn: "🔔 Alerts: ON",
    notificationOff: "🔕 Alerts: OFF",
    notificationToggled: "Settings updated!",
    supportMessage: "📞 *Support Center*\n\nNeed help? Contact our team anytime.",
    referralLink: "🔗 *Personal Invite Link:*",
    totalReferrals: "Friends Invited",
    infoTitle: "ℹ️ *Help Center*",
    infoWhat: "🤖 *What is TON Miner?*",
    infoWhatDesc: "A referral platform on Telegram. Invite friends and convert to real rewards.",
    infoHow: "⚙️ *Quick Start*",
    infoStep1: "1. Complete tasks for rewards.",
    infoStep3: "2. \"Invite\" friends for massive bonuses.",
    infoStep4: "3. \"Cash Out\" to your TON wallet.",
    infoNote: "⚠️ *Notice:* This is a simulation platform.",
    infoEarnings: "💸 *Rewards & Tasks*",
    earningsTitle: "💸 Earn More",
    noTasks: "No active tasks at the moment.\nCheck back soon!",
    newTasks: "New earning opportunities!\nComplete missions for rewards.",
    goToTasks: "👉 View Tasks 👈",
    taskList: "📌 *Mission Board*",
    channelTask: "🔹 Subscribe to Channel",
    botTask: "🔹 Launch Partner Bot",
    accountTitle: "👤 *Profile Details*",
    accountId: "🆔 User ID",
    accountLang: "🗣️ Language",
    accountReferrals: "👥 Friends",
    accountJoined: "📅 Member Since",
    accountStatus: "🟢 Account Status",
    withdrawTitle: "🏦 *Cash Out Funds*",
    minWithdraw: "⚠️ Min. Payout",
    requestWithdraw: "✅ Confirm Request",
    insufficientBalance: "❌ Low Balance",
    enterWallet: "🏦 Enter your destination TON wallet:",
    enterAmount: "💰 Amount to withdraw:",
    invalidAmount: "❌ Invalid figure.",
    insufficientBalanceMsg: "❌ Balance too low.",
    withdrawPending: "✅ Request queued! Status: Pending review",
    notSubscribed: "❌ Verification failed: Join channel first!",
    subscriptionError: "❌ Network error. Try again.",
    newReferral: "👥 New friend joined! You earned {amount} TON.",
    verificationPending: "⏳ Verification in progress (up to 7 days).",
    channelTaskTitle: "📌 *Task: Channel Subscription*",
    channelTaskStep1: "➡️ Join using the button below",
    channelTaskStep2: "➡️ Maintain sub for 7+ days",
    channelTaskNote: "⚠️ Reward pending manual verification.",
    botTaskTitle: "📌 *Task: Partner Bot Launch*",
    botTaskStep1: "➡️ Start the bot below",
    botTaskStep2: "➡️ Keep active for 7+ days",
    botTaskWarning: "❗ Early block will forfeit reward",
    missionChannel: "👉🏻 *Mission: Channel Engagement*\n\n❓ Join and press « ✅ Verified ».",
    missionBot: "👉🏻 *Mission: Bot Engagement*\n\n❓ Start and forward any message for verification.",
    joined: "✅ Joined",
    started: "✅ Started",
    skip: "↪️ Skip",
    check: "🔄 Verify",
    advertiseMenu: "📈 Growth Tools",
    advertiseChannel: "📢 Promo Channel",
    advertiseBots: "🤖 Promo Bot",
    myTasks: "💼 Campaigns",
    channelPromoInfo: "📈 Promote Channel\n\nReach thousands of active users.\n\n↳ 💰 Cost: 0.250 TON\n↳ 📌 Reach: 1000 users\n\n➕ Add @{botUsername} as ADMIN for verification.\n\n📝 Send channel link:",
    subscribeChannel: "📢 Open Channel",
    notJoined: "❌ Not found in channel. Join first!",
    enterChannelUrl: "📈 Promote Channel\n\nReach thousands of active users.\n\n↳ 💰 Cost: 0.250 TON\n↳ 📌 Reach: 1000 users\n\n➕ Add @{botUsername} as ADMIN for verification.\n\n📝 Send channel link:",
    taskPublished: "🎉 Campaign launched successfully!",
    botPromoInfo: "📈 Promote Bot\n\nGet new users for your project.\n\n↳ 💰 Cost: 0.250 TON\n↳ 📌 Reach: 1000 users\n\n📝 Send bot link:",
    enterBotUrl: "📝 Send bot URL (e.g., https://t.me/your_bot):",
    forwardBotMsg: "📌 Forward any message from your bot for verification.",
    botVerified: "✅ Bot linked successfully.\n\nNext step? 👇",
    publishTask: "📢 Start Campaign",
    addReferralLink: "🔗 Link Referrer",
    startBot: "🤖 Open Bot",
    forwardMessage: "📩 Please forward a message from your bot.",
    adminChannelPost: "📌 Mission: New Channel Subscription\n\n➡️ Join via button\n➡️ Stay subbed 24h+\n\n⚠️ Reward verified automatically.",
    claimReward: "👉 Claim Reward 👈",
  },
  ru: {
    selectLanguage: "Выберите язык / Select language",
    dashboard: "👤 *Account Dashboard*",
    balance: "Баланс",
    partners: "👥 Partner",
    withdraw: "🏦 Вывод",
    info: "ℹ️ Инфо",
    back: "↩️ Назад",
    subscribe: "🚀 Подписаться",
    subscribed: "✅ Я подписан",
    subscribeMessage: "😉 Подпишитесь на наш канал, чтобы начать",
    letsGo: "🏂 Поехали!",
    userNotFound: "⚠️ Пользователь не найден. Напишите /start",
    partnersTitle: "👥 *Партнёрская программа*",
    partnersDesc: "Приглашайте друзей и зарабатывайте TON!",
    partnersReward: "Получайте *{amount} TON* за каждого активного реферала",
    shareReferral: "🔗 Поделиться",
    shareReferralMessage: "🚀 Начни зарабатывать TON со мной!\n\nПрисоединяйся и получай награды 💰\n\n👉 Начать: {link}",
    language: "🌎 Language",
    support: "📞 Support",
    notification: "🔔 Уведомления",
    notificationOn: "🔔 Уведомления: ВКЛ",
    notificationOff: "🔕 Уведомления: ВЫКЛ",
    notificationToggled: "Уведомления обновлены!",
    supportMessage: "📞 *Поддержка*\n\nПо любым вопросам обращайтесь в нашу службу поддержки.",
    referralLink: "🔗 *Ваша реферальная ссылка:*",
    totalReferrals: "Всего рефералов",
    infoTitle: "ℹ️ *Информация*",
    infoWhat: "🤖 *Что это за бот?*",
    infoWhatDesc: "Это платформа для заработка TON. Вы можете приглашать друзей и выводить награды.",
    infoHow: "⚙️ *Как это работает?*",
    infoStep1: "1. Выполняйте задания чтобы получать TON.",
    infoStep3: "2. Приглашайте друзей для заработка.",
    infoStep4: "3. Выводите заработок на кошелёк.",
    infoNote: "⚠️ *Примечание:* Это симуляционный бот.",
    infoEarnings: "💸 *Заработок и задания*",
    earningsTitle: "💸 Заработок",
    noTasks: "В данный момент нет активных заданий.\nПроверьте позже.",
    newTasks: "Доступны новые задания!\nВыполняйте и получайте награды.",
    goToTasks: "👉 Перейти к заданиям 👈",
    taskList: "📌 *Список заданий*",
    channelTask: "🔹 Задание: Подписка на канал",
    botTask: "🔹 Задание: Запуск бота",
    accountTitle: "👤 *Информация об аккаунте*",
    accountId: "🆔 ID",
    accountLang: "🗣️ Язык",
    accountReferrals: "👥 Рефералы",
    accountJoined: "📅 Регистрация",
    accountStatus: "🟢 Статус",
    withdrawTitle: "🏦 *Вывод средств*",
    minWithdraw: "⚠️ Минимальный вывод",
    requestWithdraw: "✅ Запросить вывод",
    insufficientBalance: "❌ Недостаточный баланс",
    enterWallet: "🏦 Введите адрес вашего TON кошелька:",
    enterAmount: "💰 Введите сумму для вывода:",
    invalidAmount: "❌ Неверная сумма.",
    insufficientBalanceMsg: "❌ Недостаточный баланс.",
    withdrawPending: "✅ Заявка на вывод отправлена! Статус: Ожидание",
    notSubscribed: "❌ Вы ещё не подписаны!",
    subscriptionError: "❌ Ошибка проверки подписки.",
    newReferral: "👥 Новый реферал! Вы получили {amount} TON.",
    verificationPending: "⏳ Проверка в процессе. Подождите до 7 дней.",
    channelTaskTitle: "📌 *Новое задание: Подписка на канал*",
    channelTaskStep1: "➡️ Присоединитесь к каналу по кнопке ниже",
    channelTaskStep2: "➡️ Оставайтесь подписанным минимум 24 часа",
    channelTaskNote: "⚠️ Награда будет начислена после проверки.",
    botTaskTitle: "📌 *Новое задание: Запустить бота*",
    botTaskStep1: "➡️ Откройте бота по кнопке ниже",
    botTaskStep2: "➡️ НЕ блокируйте бота минимум 7 дней",
    botTaskWarning: "❗ Блокировка до 7 дней может привести к штрафу",
    missionChannel: "👉🏻 *Миссия: Взаимодействуйте с каналом и вступите в него.*\n\n❓ После вступления нажмите « ✅ Вступил » ниже.",
    missionBot: "👉🏻 *Mission: Engage with the bot.*\n\n❓ Нажмите « ✅ Запущен » и перешлите ЛЮБОЕ сообщение\nот этого бота сюда для проверки.",
    joined: "✅ Вступил",
    started: "✅ Запущен",
    skip: "↪️ Пропустить",
    check: "🔄 Проверить",
  },
};

function t(lang: string | null | undefined, key: string): string {
  const language = lang || "en";
  return translations[language]?.[key] || translations.en[key] || key;
}

const REFERRAL_REWARD = 0.008;

let bot: TelegramBot | null = null;

export function setupBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not set. Bot will not start.");
    return;
  }

  if (botInstance) {
    console.log("Stopping existing bot instance...");
    try {
      botInstance.stopPolling();
    } catch (e) {
      console.error("Error stopping bot:", e);
    }
    botInstance = null;
    isPolling = false;
  }

  try {
    bot = new TelegramBot(token, { 
      polling: {
        interval: 1000,
        autoStart: true,
        params: {
          timeout: 10
        }
      }
    });
    botInstance = bot;
    isPolling = true;
    
    bot.on("polling_error", (error: Error) => {
      console.error("Telegram polling error:", error.message);
      if (error.message.includes("409")) {
        console.warn("409 Conflict: Another bot instance may be running. Consider using webhooks for production.");
      }
    });
    
    bot.on("error", (error: Error) => {
      console.error("Telegram bot error:", error.message);
    });
    
    console.log("Telegram bot started successfully!");
  } catch (error) {
    console.error("Failed to start Telegram bot:", error);
    isPolling = false;
    return;
  }

  if (!bot) return;

  // --- Helpers ---
  const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID || "6653616672";

  function isSuperAdmin(telegramId: string | number | undefined) {
    if (!telegramId) return false;
    const isAdmin = telegramId.toString() === SUPER_ADMIN_ID;
    if (isAdmin) {
      console.log(`[ADMIN] Admin bypass triggered for ${telegramId}`);
    }
    return isAdmin;
  }

  async function getUserOrRegister(msg: TelegramBot.Message, referrerId?: string) {
    const telegramId = msg.from?.id.toString();
    if (!telegramId) return null;

    let user = await storage.getUserByTelegramId(telegramId);
    
    if (!user) {
      try {
        user = await storage.createUser({
          telegramId,
          username: msg.from?.username || null,
          firstName: msg.from?.first_name || null,
          languageCode: msg.from?.language_code || null,
          lastClaimTime: Date.now(),
          referrerId: referrerId || null,
          referralCount: 0,
          balance: 0,
          isPremium: false,
          status: "active"
        });

        // Handle referral reward if applicable
        if (referrerId && referrerId !== telegramId) {
          const referrer = await storage.getUserByTelegramId(referrerId);
          if (referrer) {
             await storage.updateUser(referrer.id, {
               referralCount: (referrer.referralCount || 0) + 1,
               balance: (referrer.balance || 0) + REFERRAL_REWARD
             });
             
             bot?.sendMessage(referrer.telegramId, t(referrer.language, "newReferral").replace("{amount}", REFERRAL_REWARD.toString()));
          }
        }
      } catch (error: any) {
        if (error.code === '23505') {
          user = await storage.getUserByTelegramId(telegramId);
        } else {
          console.error("Error creating user:", error);
          return null;
        }
      }
    }
    return user;
  }

  function getMainMenuKeyboard(lang: string | null | undefined) {
    const adBotUrl = "https://t.me/TONAdzbot/EARN";
    return {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📺 Watch Ads & Earn", url: adBotUrl }],
          [{ text: t(lang, "partners"), callback_data: "partners" }, { text: t(lang, "withdraw"), callback_data: "withdraw" }],
          [{ text: t(lang, "language"), callback_data: "language" }, { text: t(lang, "support"), callback_data: "support" }],
          [{ text: t(lang, "info"), callback_data: "info" }]
        ]
      }
    };
  }

  function getBackButton(lang: string | null | undefined) {
    return {
      reply_markup: {
        inline_keyboard: [[{ text: t(lang, "back"), callback_data: "back_to_menu" }]]
      }
    };
  }

  function getSubscribeKeyboard(lang: string | null | undefined) {
    const channelUrl = "https://t.me/your_channel_link"; // Replace with your actual channel link
    return {
      reply_markup: {
        inline_keyboard: [
          [
            { text: t(lang, "advertiseChannel"), url: channelUrl },
            { text: t(lang, "subscribed"), callback_data: "check_subscription" }
          ]
        ]
      }
    };
  }

  // --- Keyboards ---
  function getLanguageKeyboard() {
    return {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🇷🇺 Русский", callback_data: "set_lang_ru" }, { text: "🇬🇧 English", callback_data: "set_lang_en" }],
          [{ text: "🇪🇸 Español", callback_data: "set_lang_es" }, { text: "🇵🇹 Português", callback_data: "set_lang_pt" }],
          [{ text: "🇫🇷 Français", callback_data: "set_lang_fr" }, { text: "🇾🇪 العربية", callback_data: "set_lang_ar" }]
        ]
      }
    };
  }

  function getDashboardText(user: any) {
    const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown";
    const username = user.username ? `@${user.username}` : "Not set";
    
    return `
✨ *User Profile* ✨
━━━━━━━━━━━━━━━━━━
👤 *Username:* ${username}
🆔 *ID:* \`${user.telegramId}\`
📅 *Joined:* ${createdAt}
━━━━━━━━━━━━━━━━━━
💰 *Wallet Balance*
*${user.balance.toFixed(8)} TON*
━━━━━━━━━━━━━━━━━━
`;
  }

  // --- Callback Query Handler ---
  bot.on("callback_query", async (query) => {
    const chatId = query.message?.chat.id;
    const messageId = query.message?.message_id;
    const telegramId = query.from.id.toString();
    const data = query.data;

    if (!chatId || !data) return;

    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      return bot?.sendMessage(chatId, t(null, "userNotFound"));
    }

    const lang = user.language;

    try {
      if (data === "partners") {
        const webAppUrl = process.env.APP_URL || `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
        const referralLink = `${webAppUrl}?ref=${telegramId}`;
        const partnersText = `
👥 *Partners Program*
Invite friends and earn TON!

Earn *0.008 TON* for each active referral

🔗 *Your Referral Link:*
\`${referralLink}\`

Total Referrals: ${user.referralCount || 0}
`;
        bot?.editMessageText(partnersText, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          ...getBackButton(lang)
        });
        bot?.answerCallbackQuery(query.id);
      } else if (data === "withdraw") {
        const withdrawText = `
🏦 *Withdraw Funds*
Minimum Withdrawal: 0.5 TON

Your Balance: ${user.balance.toFixed(8)} TON

Please enter your TON wallet address:
`;
        bot?.editMessageText(withdrawText, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          ...getBackButton(lang)
        });
        bot?.answerCallbackQuery(query.id);
      } else if (data === "info") {
        const infoText = `
ℹ️ *Information*

🤖 *What is this bot?*
This is a TON referral platform. You can earn TON coins by inviting friends and withdraw real rewards.

⚙️ *How it works?*
1. Complete tasks to earn rewards.
2. Invite friends to earn rewards.
3. Withdraw earnings to your wallet.

⚠️ *Notice:* This is a simulation platform.
`;
        bot?.editMessageText(infoText, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          ...getBackButton(lang)
        });
        bot?.answerCallbackQuery(query.id);
      } else if (data === "language") {
        bot?.editMessageText(t(lang, "selectLanguage"), {
          chat_id: chatId,
          message_id: messageId,
          ...getLanguageKeyboard()
        });
        bot?.answerCallbackQuery(query.id);
      } else if (data === "back_to_menu") {
        const dashboardText = getDashboardText(user);
        bot?.editMessageText(dashboardText, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          ...getMainMenuKeyboard(lang)
        });
        bot?.answerCallbackQuery(query.id);
      } else if (data.startsWith("set_lang_")) {
        const selectedLang = data.replace("set_lang_", "");
        const updatedUser = await storage.updateUser(user.id, { language: selectedLang, isOnboarded: true });
        
        const dashboardText = getDashboardText(updatedUser);
        bot?.editMessageText(dashboardText, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          ...getMainMenuKeyboard(selectedLang)
        });
        bot?.answerCallbackQuery(query.id, { text: "Language updated!" });
      }
    } catch (error) {
      console.error("Callback query error:", error);
      bot?.answerCallbackQuery(query.id, { text: "An error occurred." });
    }
  });

  // --- Commands ---
  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const payload = match?.[1];
    
    const userResult = await storage.getUserByTelegramId(msg.from?.id.toString() || "");
    let user = userResult;
    
    // Check if this is a task link
    const taskMatch = payload?.match(/^task_(\d+)$/);
    
    if (!user) {
      const referralCode = taskMatch ? undefined : payload;
      const newUser = await getUserOrRegister(msg, referralCode);
      if (!newUser) return;
      user = newUser;
      
      // If user came via task link, redirect to task after onboarding
      if (taskMatch) {
        await storage.updateUser(user.id, { status: `pending_task_${taskMatch[1]}` } as any);
      }
      
      return bot?.sendMessage(chatId, t(null, "selectLanguage"), getLanguageKeyboard());
    }

    if (!user.isOnboarded) {
      if (!user.language) {
        return bot?.sendMessage(chatId, t(null, "selectLanguage"), getLanguageKeyboard());
      }
      // Skip verification - go directly to subscription check
      return bot?.sendMessage(chatId, t(user.language, "subscribeMessage"), getSubscribeKeyboard(user.language));
    }
    
    // Handle task link for existing onboarded users
    if (taskMatch) {
      const taskId = parseInt(taskMatch[1]);
      const task = await storage.getTask(taskId);
      
      if (task && task.isActive) {
        const lang = user.language;
        
        // Check if user already completed this task
        const existingUserTask = await storage.getUserTask(user.id, taskId);
        if (existingUserTask?.status === "completed") {
          bot?.sendMessage(chatId, "✅ You have already completed this task.");
          return;
        }
        
        // Create or get user task
        if (!existingUserTask) {
          await storage.createUserTask({
            userId: user.id,
            taskId: task.id,
            status: "pending"
          });
        }
        
        if (task.type === "bot") {
          const missionText = `👉🏻 *Mission: Engage with the bot.*

❓ Press « ✅ Started » and then forward ANY message
from that bot here for verification.`;
          
          const keyboard = {
            reply_markup: {
              inline_keyboard: [
                [{ text: "🤖 Start Bot", url: task.link }],
                [{ text: "✅ Started", callback_data: `verify_bot_task_${task.id}` }],
                [{ text: "↩️ Back", callback_data: "back_to_menu" }]
              ]
            }
          };
          
          bot?.sendMessage(chatId, missionText, { parse_mode: "Markdown", ...keyboard });
        } else if (task.type === "channel") {
          const missionText = `👉🏻 *Mission: Channel Engagement*

❓ Join and press « ✅ Verified ».`;
          
          const keyboard = {
            reply_markup: {
              inline_keyboard: [
                [{ text: "🚀 Join Channel", url: task.link }],
                [{ text: "✅ Verified", callback_data: `verify_channel_task_${task.id}` }],
                [{ text: "↩️ Back", callback_data: "back_to_menu" }]
              ]
            }
          };
          
          bot?.sendMessage(chatId, missionText, { parse_mode: "Markdown", ...keyboard });
        }
        return;
      }
    }
    
    const dashboardText = getDashboardText(user);
    bot?.sendMessage(chatId, dashboardText, { parse_mode: "Markdown", ...getMainMenuKeyboard(user.language) });
  });

  const TASK_CHANNEL_ID = "-1002480439556";
  const ADMIN_ID = "6653616672";

  function isAdmin(telegramId: string | undefined) {
    if (!telegramId) return false;
    const superAdminId = process.env.SUPER_ADMIN_ID;
    const isSpecial = telegramId === ADMIN_ID || (superAdminId && telegramId === superAdminId);
    if (isSpecial) {
      console.log(`[ADMIN] Authorized access for user ${telegramId} (SUPER_ADMIN_ID: ${superAdminId})`);
    }
    return !!isSpecial;
  }

  // Handle task verification for bots (forwarded message)
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id.toString();
    const text = msg.text;

    if (!telegramId) return;

    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) return;

    if (msg.forward_from_chat || msg.forward_from) {
      const pendingTask = await storage.getPendingUserTask(user.id);
      if (pendingTask) {
        const task = await storage.getTask(pendingTask.taskId);
        if (task && task.type === "bot") {
          await storage.updateUser(user.id, { balance: (user.balance || 0) + task.reward });
          await storage.updateUserTask(user.id, task.id, { status: "completed", verifiedAt: new Date() });
          await storage.incrementTaskCompletion(task.id);
          bot?.sendMessage(chatId, "✅ Reward credited!");
          
          const dashboardText = getDashboardText(user.language, (user.balance || 0) + task.reward, user.telegramId);
          bot?.sendMessage(chatId, dashboardText, { parse_mode: "Markdown", ...getMainMenuKeyboard(user.language) });
        }
      }
      return;
    }

    if (!text) return;

    // Admin commands
    if (isAdmin(telegramId) && text === "/admin") {
      const stats = await storage.getStats();
      const adminText = `
👑 *Admin Panel*

👥 Total Users: ${stats.totalUsers}
💰 Total Balance: ${stats.totalBalance.toFixed(2)} TON
🏦 Total Withdrawals: ${stats.totalWithdrawals}
`;
      bot?.sendMessage(chatId, adminText, { parse_mode: "Markdown" });
    }
  });
}
