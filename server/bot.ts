import TelegramBot from "node-telegram-bot-api";
import { storage } from "./storage";

let botInstance: TelegramBot | null = null;
let isPolling = false;

// Translations
const translations: Record<string, Record<string, string>> = {
  en: {
    selectLanguage: "Select language / Выберите язык",
    dashboard: "🪪 *Dashboard*",
    balance: "💰 Balance",
    miningSpeed: "⛏️ Mining Speed",
    miningTagline: "TON — Mining without limits",
    refresh: "♻️ Refresh",
    upgrade: "🚀 Upgrade",
    promo: "🎁 Promo",
    partners: "👥 Partners",
    account: "👤 Account",
    earnings: "💸 Earnings",
    withdraw: "🏦 Withdraw",
    advertise: "📈 Advertise",
    info: "ℹ️ Info",
    back: "↩️ Back",
    subscribe: "🚀 Subscribe",
    subscribed: "✅ I'm subscribed",
    subscribeMessage: "😉 Make sure you subscribe to our channel before you get started",
    letsGo: "🏂 Let's go!",
    userNotFound: "⚠️ User not found. Please type /start",
    maxLevelReached: "🚀 Max level reached!",
    upgradeTitle: "🚀 *Upgrade Mining Speed*",
    currentLevel: "Current Level",
    nextLevel: "Next Level",
    speed: "Speed",
    cost: "Cost",
    yourBalance: "💰 Your Balance",
    buyLevel: "Buy Level",
    upgradeOneLevel: "⚠️ You can only upgrade one level at a time.",
    insufficientFunds: "❌ Insufficient funds!",
    upgradeSuccess: "✅ Upgrade successful!",
    partnersTitle: "👥 *Partners Program*",
    partnersDesc: "Invite friends and earn TON!",
    partnersReward: "Earn *{amount} TON* for each active referral",
    partnersBonus: "+10% mining speed bonus (active with referrals)",
    shareReferral: "🔗 Share Referral",
    shareReferralMessage: "🚀 Start earning TON with me!\n\nMine TON every second using this bot.\nJoin now and get faster mining speed 💰\n\n👉 Start here: {link}",
    language: "🌎 Language",
    support: "📞 Support",
    notification: "🔔 Notification",
    notificationOn: "🔔 Notifications: ON",
    notificationOff: "🔕 Notifications: OFF",
    notificationToggled: "Notifications updated!",
    supportMessage: "📞 *Support*\n\nFor any issues or questions, please contact our support team.",
    referralLink: "🔗 *Your Referral Link:*",
    totalReferrals: "Total Referrals",
    infoTitle: "ℹ️ *Information*",
    infoWhat: "🤖 *What is this bot?*",
    infoWhatDesc: "This is a TON cloud mining simulator. You can mine TON coins, upgrade your mining rig, and withdraw real rewards.",
    infoHow: "⚙️ *How it works?*",
    infoStep1: "1. Press \"Refresh\" to collect mined TON.",
    infoStep2: "2. Use \"Upgrade\" to increase your speed.",
    infoStep3: "3. Invite friends to earn faster.",
    infoStep4: "4. Withdraw earnings to your wallet.",
    infoNote: "⚠️ *Note:* This is a simulation bot.",
    infoEarnings: "💸 *Earnings & Tasks*",
    earningsTitle: "💸 Earnings",
    noTasks: "Currently, there are no active tasks available.\nPlease check back later.",
    newTasks: "New tasks are available!\nComplete tasks and earn rewards.",
    goToTasks: "👉 Go to the task list 👈",
    taskList: "📌 *Task List*",
    channelTask: "🔹 Channel Subscribe Task",
    botTask: "🔹 Bot Start Task",
    accountTitle: "👤 *Account Info*",
    accountId: "🆔 ID",
    accountLang: "🗣️ Language",
    accountReferrals: "👥 Referrals",
    accountJoined: "📅 Joined",
    accountLevel: "⚡ Level",
    accountStatus: "🟢 Status",
    withdrawTitle: "🏦 *Withdraw Funds*",
    minWithdraw: "⚠️ Minimum Withdrawal",
    requestWithdraw: "✅ Request Withdrawal",
    insufficientBalance: "❌ Insufficient Balance",
    enterWallet: "🏦 Please enter your TON wallet address:",
    enterAmount: "💰 Enter amount to withdraw:",
    invalidAmount: "❌ Invalid amount.",
    insufficientBalanceMsg: "❌ Insufficient balance.",
    withdrawPending: "✅ Withdrawal request submitted! Status: Pending",
    notSubscribed: "❌ You are not subscribed yet!",
    subscriptionError: "❌ Error checking subscription.",
    newReferral: "👥 New referral! You earned {amount} TON.",
    verificationPending: "⏳ Verification in progress. Please wait up to 7 days.",
    channelTaskTitle: "📌 *New Task: Subscribe to the Channel*",
    channelTaskStep1: "➡️ Join the channel using the button below",
    channelTaskStep2: "➡️ Stay subscribed for at least 7 days",
    channelTaskNote: "⚠️ Reward will be credited after verification.",
    botTaskTitle: "📌 *New Task: Start the Bot*",
    botTaskStep1: "➡️ Open the bot using the button below",
    botTaskStep2: "➡️ Do NOT block the bot for at least 7 days",
    botTaskWarning: "❗ Blocking before 7 days may lead to penalty",
    missionChannel: "👉🏻 *Mission: Engage with the channel and join it.*\n\n❓ After joining, press « ✅ Joined » below.",
    missionBot: "👉🏻 *Mission: Engage with the bot.*\n\n❓ Press « ✅ Started » and then forward ANY message\nfrom that bot here for verification.",
    joined: "✅ Joined",
    started: "✅ Started",
    skip: "↪️ Skip",
    check: "🔄 Check",
    advertiseMenu: "📈 What would you like to promote?",
    advertiseChannel: "📢 Channel",
    advertiseBots: "🤖 Bots",
    myTasks: "💼 My Tasks",
    channelPromoInfo: "📈 Advertise\n↳ Advertise your Telegram Channel or Group\n\nYour channel or group will be promoted to thousands of users.\n\n↳ 💰 Cost: 0.250 TON\n↳ 📌 Task limit: 1000 users\n\n➕ Add this bot (@{botUsername}) as ADMIN\nto verify whether users have joined.\n\n📝 Enter your URL to continue.",
    subscribeChannel: "📢 Subscribe",
    notJoined: "❌ You haven't joined the channel yet. Please join first!",
    enterChannelUrl: "📝 Enter the channel or group URL:",
    taskPublished: "🎉 Your task has been published successfully!",
    botPromoInfo: "📈 Advertise\n↳ Advertise your Telegram Bot\n\nYour bot will be promoted to thousands of users.\n\n↳ 💰 Cost: 0.250 TON\n↳ 📌 Task limit: 1000 users\n\n📝 Enter your bot URL to continue.",
    enterBotUrl: "📝 Enter your bot URL (e.g., https://t.me/your_bot):",
    forwardBotMsg: "📌 Forward ANY message from the bot you want to promote here for verification.",
    botVerified: "✅ Bot verified successfully.\n\nChoose what you want to do next 👇",
    publishTask: "📢 Publish Task",
    addReferralLink: "🔗 Add referral link",
    startBot: "🤖 Start bot",
    forwardMessage: "📩 Please forward ANY message from the promoted bot.",
    adminChannelPost: "📌 New Task: Subscribe to the Channel\n\n➡️ Join the channel using the button below\n➡️ Stay subscribed for at least 24 hours\n\n⚠️ Reward will be credited after verification.",
    claimReward: "👉 Click here to claim 👈",
  },
  ru: {
    selectLanguage: "Select language / Выберите язык",
    dashboard: "🪪 *Панель управления*",
    balance: "💰 Баланс",
    miningSpeed: "⛏️ Скорость майнинга",
    miningTagline: "TON — Майнинг без ограничений",
    refresh: "♻️ Обновить",
    upgrade: "🚀 Улучшить",
    promo: "🎁 Промо",
    partners: "👥 Партнёры",
    account: "👤 Аккаунт",
    earnings: "💸 Заработок",
    withdraw: "🏦 Вывод",
    advertise: "📈 Реклама",
    info: "ℹ️ Инфо",
    back: "↩️ Назад",
    subscribe: "🚀 Подписаться",
    subscribed: "✅ Я подписан",
    subscribeMessage: "😉 Подпишитесь на наш канал, чтобы начать",
    letsGo: "🏂 Поехали!",
    userNotFound: "⚠️ Пользователь не найден. Напишите /start",
    maxLevelReached: "🚀 Достигнут максимальный уровень!",
    upgradeTitle: "🚀 *Улучшить скорость майнинга*",
    currentLevel: "Текущий уровень",
    nextLevel: "Следующий уровень",
    speed: "Скорость",
    cost: "Стоимость",
    yourBalance: "💰 Ваш баланс",
    buyLevel: "Купить уровень",
    upgradeOneLevel: "⚠️ Можно улучшить только на один уровень.",
    insufficientFunds: "❌ Недостаточно средств!",
    upgradeSuccess: "✅ Улучшение успешно!",
    partnersTitle: "👥 *Партнёрская программа*",
    partnersDesc: "Приглашайте друзей и зарабатывайте TON!",
    partnersReward: "Получайте *{amount} TON* за каждого активного реферала",
    partnersBonus: "+10% бонус к скорости майнинга (активен с рефералами)",
    shareReferral: "🔗 Поделиться",
    shareReferralMessage: "🚀 Начни зарабатывать TON со мной!\n\nМайни TON каждую секунду с этим ботом.\nПрисоединяйся и получи ускоренный майнинг 💰\n\n👉 Начать: {link}",
    language: "🌎 Язык",
    support: "📞 Поддержка",
    notification: "🔔 Уведомления",
    notificationOn: "🔔 Уведомления: ВКЛ",
    notificationOff: "🔕 Уведомления: ВЫКЛ",
    notificationToggled: "Уведомления обновлены!",
    supportMessage: "📞 *Поддержка*\n\nПо любым вопросам обращайтесь в нашу службу поддержки.",
    referralLink: "🔗 *Ваша реферальная ссылка:*",
    totalReferrals: "Всего рефералов",
    infoTitle: "ℹ️ *Информация*",
    infoWhat: "🤖 *Что это за бот?*",
    infoWhatDesc: "Это симулятор облачного майнинга TON. Вы можете майнить TON, улучшать свою ферму и выводить награды.",
    infoHow: "⚙️ *Как это работает?*",
    infoStep1: "1. Нажмите \"Обновить\" чтобы собрать TON.",
    infoStep2: "2. Используйте \"Улучшить\" для увеличения скорости.",
    infoStep3: "3. Приглашайте друзей для быстрого заработка.",
    infoStep4: "4. Выводите заработок на кошелёк.",
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
    accountLevel: "⚡ Уровень",
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
    channelTaskStep2: "➡️ Оставайтесь подписанным минимум 7 дней",
    channelTaskNote: "⚠️ Награда будет начислена после проверки.",
    botTaskTitle: "📌 *Новое задание: Запустить бота*",
    botTaskStep1: "➡️ Откройте бота по кнопке ниже",
    botTaskStep2: "➡️ НЕ блокируйте бота минимум 7 дней",
    botTaskWarning: "❗ Блокировка до 7 дней может привести к штрафу",
    missionChannel: "👉🏻 *Миссия: Взаимодействуйте с каналом.*\n\n❓ После присоединения нажмите « ✅ Подписался » ниже.",
    missionBot: "👉🏻 *Миссия: Взаимодействуйте с ботом.*\n\n❓ Нажмите « ✅ Запущен » и перешлите ЛЮБОЕ сообщение\nот этого бота сюда для проверки.",
    joined: "✅ Подписался",
    started: "✅ Запущен",
    skip: "↪️ Пропустить",
    check: "🔄 Проверить",
    advertiseMenu: "📈 Что бы вы хотели продвигать?",
    advertiseChannel: "📢 Канал",
    advertiseBots: "🤖 Боты",
    myTasks: "💼 Мои задания",
    channelPromoInfo: "📈 Реклама\n↳ Рекламируйте свой Telegram-канал или группу\n\nВаш канал или группа будет показан тысячам пользователей.\n\n↳ 💰 Стоимость: 0.250 TON\n↳ 📌 Лимит заданий: 1000 пользователей\n\n➕ Добавьте этого бота (@{botUsername}) как АДМИНА\nчтобы проверять, присоединились ли пользователи.\n\n📝 Введите URL для продолжения.",
    subscribeChannel: "📢 Подписаться",
    notJoined: "❌ Вы ещё не подписались на канал. Пожалуйста, подпишитесь сначала!",
    enterChannelUrl: "📝 Введите URL канала или группы:",
    taskPublished: "🎉 Ваше задание успешно опубликовано!",
    botPromoInfo: "📈 Реклама\n↳ Рекламируйте свой Telegram-бот\n\nВаш бот будет продвинут тысячам пользователей.\n\n↳ 💰 Стоимость: 0.250 TON\n↳ 📌 Лимит заданий: 1000 пользователей\n\n📝 Введите URL бота для продолжения.",
    enterBotUrl: "📝 Введите URL бота (например, https://t.me/your_bot):",
    forwardBotMsg: "📌 Перешлите ЛЮБОЕ сообщение от бота, которого вы хотите продвигать, сюда для проверки.",
    botVerified: "✅ Бот успешно проверен.\n\nВыберите, что делать дальше 👇",
    publishTask: "📢 Опубликовать задание",
    addReferralLink: "🔗 Добавить реф. ссылку",
    startBot: "🤖 Запустить бота",
    forwardMessage: "📩 Пожалуйста, перешлите ЛЮБОЕ сообщение от продвигаемого бота.",
    adminChannelPost: "📌 Новое задание: Подписка на канал\n\n➡️ Присоединитесь к каналу по кнопке ниже\n➡️ Оставайтесь подписанным минимум 24 часа\n\n⚠️ Награда будет начислена после проверки.",
    claimReward: "👉 Нажмите здесь, чтобы забрать 👈",
  },
};

function t(lang: string | null | undefined, key: string): string {
  const language = lang || "en";
  return translations[language]?.[key] || translations.en[key] || key;
}

// Constants
const MINING_SPEEDS: Record<number, number> = {
  1: 0.0000001,
  2: 0.0000025,
  3: 0.0000075,
  4: 0.0000175,
  5: 0.0000375,
  6: 0.0000775,
  7: 0.0001375,
  8: 0.0002175,
  9: 0.0003175,
  10: 0.0005175,
  11: 0.0008175,
  12: 0.0012175,
  13: 0.0017175,
  14: 0.0027175,
};

const UPGRADE_COSTS: Record<number, number> = {
  2: 0.5,
  3: 1,
  4: 2,
  5: 4,
  6: 8,
  7: 12,
  8: 16,
  9: 20,
  10: 40,
  11: 60,
  12: 80,
  13: 100,
  14: 200,
};

const REFERRAL_REWARD = 0.008;

let bot: TelegramBot | null = null;

export function setupBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("TELEGRAM_BOT_TOKEN is not set. Bot will not start.");
    return;
  }

  if (isPolling && botInstance) {
    console.log("Bot is already running, skipping duplicate initialization");
    return;
  }

  try {
    bot = new TelegramBot(token, { 
      polling: {
        interval: 300,
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
          miningLevel: 1,
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

  function getMiningRate(level: number, referralCount: number = 0) {
    const baseRate = MINING_SPEEDS[level] || MINING_SPEEDS[1];
    // Apply +10% bonus if user has at least 1 active referral
    if (referralCount >= 1) {
      return baseRate * 1.10;
    }
    return baseRate;
  }

  function getMainMenuKeyboard(lang: string | null | undefined) {
    return {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(lang, "refresh"), callback_data: "refresh" }],
          [{ text: t(lang, "upgrade"), callback_data: "upgrade" }, { text: t(lang, "promo"), callback_data: "promo" }],
          [{ text: t(lang, "partners"), callback_data: "partners" }, { text: t(lang, "account"), callback_data: "account" }],
          [{ text: t(lang, "earnings"), callback_data: "earnings" }, { text: t(lang, "withdraw"), callback_data: "withdraw" }],
          [{ text: t(lang, "advertise"), callback_data: "advertise_menu" }],
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
    return {
      reply_markup: {
        inline_keyboard: [
          [
            { text: t(lang, "subscribe"), url: "https://t.me/your_channel_link" },
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

  function getDashboardText(lang: string | null | undefined, balance: number, miningRate: number) {
    return `
${t(lang, "dashboard")}

${t(lang, "balance")}: ${balance.toFixed(8)} TON
${t(lang, "miningSpeed")}: ${miningRate.toFixed(7)} TON / 5 seconds

${t(lang, "miningTagline")}
`;
  }

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
      
      return bot?.sendMessage(chatId, t(null, "selectLanguage"), languageKeyboard);
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
                [{ text: t(lang, "startBot"), url: task.link }],
                [{ text: t(lang, "started"), callback_data: `verify_bot_task_${taskId}` }]
              ]
            }
          };
          
          bot?.sendMessage(chatId, missionText, { parse_mode: "Markdown", ...keyboard });
        } else if (task.type === "channel") {
          const missionText = `👉🏻 *Mission: Engage with the channel and join it.*

❓ After joining, press « ✅ Joined » below.`;
          
          const keyboard = {
            reply_markup: {
              inline_keyboard: [
                [{ text: t(lang, "subscribeChannel"), url: task.link }],
                [{ text: t(lang, "joined"), callback_data: `verify_channel_task_${taskId}` }]
              ]
            }
          };
          
          bot?.sendMessage(chatId, missionText, { parse_mode: "Markdown", ...keyboard });
        }
        return;
      }
    }
    
    const now = Date.now();
    const lastClaim = user.lastClaimTime;
    const diffSeconds = (now - lastClaim) / 1000;
    const miningRatePer5Sec = getMiningRate(user.miningLevel, user.referralCount);
    const miningRatePerSec = miningRatePer5Sec / 5;
    const minedAmount = diffSeconds * miningRatePerSec;
    const currentBalance = user.balance + minedAmount;
    
    const welcomeText = getDashboardText(user.language, currentBalance, miningRatePer5Sec);
    bot?.sendMessage(chatId, welcomeText, { parse_mode: "Markdown", ...getMainMenuKeyboard(user.language) });
  });

  const TASK_CHANNEL_ID = "-1002480439556";
  const ADMIN_ID = "6653616672";
  const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID || ADMIN_ID; // Fallback to ADMIN_ID if not set

  function isAdmin(telegramId: string | undefined) {
    if (!telegramId) return false;
    const isSpecial = telegramId === ADMIN_ID || telegramId === SUPER_ADMIN_ID;
    if (isSpecial) {
      console.log(`[ADMIN] Authorized access for user ${telegramId}`);
    }
    return isSpecial;
  }

  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from?.id.toString();
    if (!telegramId) return;
    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) return;
    const lang = user.language;

    // Handle channel URL input for promotion
    if (msg.text && user.status === "awaiting_channel_url" && !msg.text.startsWith("/")) {
      const text = msg.text.trim();
      const channelMatch = text.match(/(?:https?:\/\/)?t\.me\/([a-zA-Z0-9_]+)/i);
      
      if (channelMatch) {
        const channelUsername = channelMatch[1];
        const cost = 0.250;
        
        // Normal users must pay 0.250 TON, Admin (6653616672) pays 0
        const isFree = isAdmin(telegramId);
        const actualCost = isFree ? 0 : cost;

        if (!isFree && user.balance < actualCost) {
          bot?.sendMessage(chatId, t(lang, "insufficientFunds"));
          await storage.updateUser(user.id, { status: "active" } as any);
          return;
        }

        await storage.updateUser(user.id, { balance: user.balance - actualCost, status: "active" } as any);
        
        const myBot = await bot?.getMe();
        const channelLink = `https://t.me/${channelUsername}`;
        
        const task = await storage.createTask({
          type: "channel",
          title: `Subscribe to the Channel`,
          description: `Join the channel and stay subscribed`,
          reward: 0.05, // Users get 0.05 per join, advertiser pays 0.250
          link: channelLink,
          targetBotUsername: channelUsername,
          creatorId: user.id,
          maxCompletions: 1000,
          currentCompletions: 0,
          isActive: true
        });

        // Auto publish to channel
        const taskLink = `https://t.me/${myBot?.username}?start=task_${task.id}`;
        const channelMessage = t(lang, "adminChannelPost");
        
        try {
          await bot?.sendMessage(TASK_CHANNEL_ID, channelMessage, { 
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: t(lang, "claimReward"), url: taskLink }]
              ]
            }
          });
        } catch (e) {
          console.error("Failed to post to channel:", e);
        }

        bot?.sendMessage(chatId, t(lang, "taskPublished"), { parse_mode: "Markdown" });
        return;
      } else {
        bot?.sendMessage(chatId, "❌ Invalid URL. Please send a valid URL like https://t.me/channelname");
        return;
      }
    }

    // Handle bot URL input for promotion
    if (msg.text && user.status === "awaiting_bot_url") {
      const text = msg.text.trim();
      const botUrlMatch = text.match(/(?:https?:\/\/)?t\.me\/([a-zA-Z0-9_]+)/i);
      
      if (botUrlMatch) {
        const botUsername = botUrlMatch[1];
        const cost = 0.250;
        
        if (user.balance < cost) {
          bot?.sendMessage(chatId, t(lang, "insufficientFunds"));
          await storage.updateUser(user.id, { status: "active" } as any);
          return;
        }

        await storage.updateUser(user.id, { balance: user.balance - cost, status: "active" } as any);
        
        const myBot = await bot?.getMe();
        const botLink = `https://t.me/${botUsername}`;
        
        const task = await storage.createTask({
          type: "bot",
          title: `Start @${botUsername}`,
          description: `Start the bot to earn reward`,
          reward: 0.0001,
          link: botLink,
          targetBotUsername: botUsername,
          creatorId: user.id,
          maxCompletions: 1000,
          currentCompletions: 0,
          isActive: true
        });

        // Auto publish to channel with new format
        const taskLink = `https://t.me/${myBot?.username}?start=task_${task.id}`;
        const channelMessage = `📌 *New Task: Start the Bot*

➡️ Open the bot using the button below
➡️ Do NOT block the bot for at least 24 hours
❗ Blocking before 24 hours may lead to penalty

⚠️ Reward will be credited after verification.`;
        
        try {
          await bot?.sendMessage(TASK_CHANNEL_ID, channelMessage, { 
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: "👉 Click here to claim 👈", url: taskLink }]
              ]
            }
          });
        } catch (e) {
          console.error("Failed to post to channel:", e);
        }

        bot?.sendMessage(chatId, t(lang, "taskPublished"), { parse_mode: "Markdown" });
        return;
      } else {
        bot?.sendMessage(chatId, "❌ Invalid bot URL. Please send a valid URL like https://t.me/your_bot");
        return;
      }
    }

    // Handle forwarded bot messages for task verification
    if (msg.forward_from && msg.forward_from.is_bot && user.status === "awaiting_bot_verification") {
      const forwardedBotUsername = msg.forward_from.username;
      
      // Get the user's pending task
      const pendingUserTask = await storage.getPendingUserTask(user.id);
      if (pendingUserTask) {
        const task = await storage.getTask(pendingUserTask.taskId);
        if (task && task.targetBotUsername === forwardedBotUsername) {
          // Verification successful
          await storage.updateUserTask(pendingUserTask.id, { status: "completed", verifiedAt: new Date() });
          await storage.updateUser(user.id, { 
            balance: user.balance + task.reward,
            status: "active"
          } as any);
          await storage.incrementTaskCompletions(task.id);
          
          bot?.sendMessage(chatId, `✅ Task verified! You earned ${task.reward} TON.`);
        } else {
          bot?.sendMessage(chatId, "❌ This message is not from the correct bot. Please forward a message from the promoted bot.");
        }
      }
      return;
    }

    // Legacy: Handle forwarded bot messages for promotion
    if (msg.forward_from && msg.forward_from.is_bot && user.status === "awaiting_bot_forward") {
      const botUsername = msg.forward_from.username;
      const cost = 0.250;
      
      if (user.balance < cost) {
        bot?.sendMessage(chatId, t(lang, "insufficientFunds"));
        await storage.updateUser(user.id, { status: "active" } as any);
        return;
      }

      await storage.updateUser(user.id, { balance: user.balance - cost, status: "active" } as any);
      
      const myBot = await bot?.getMe();
      const botLink = `https://t.me/${botUsername}`;
      
      const task = await storage.createTask({
        type: "bot",
        title: `Start @${botUsername}`,
        description: `Start the bot to earn reward`,
        reward: 0.0001,
        link: botLink,
        targetBotUsername: botUsername,
        creatorId: user.id,
        maxCompletions: 1000,
        currentCompletions: 0,
        isActive: true
      });

      // Auto publish to channel with new format
      const taskLink = `https://t.me/${myBot?.username}?start=task_${task.id}`;
      const channelMessage = `📌 *New Task: Start the Bot*

➡️ Open the bot using the button below
➡️ Do NOT block the bot for at least 24 hours
❗ Blocking before 24 hours may lead to penalty

⚠️ Reward will be credited after verification.`;
      
      try {
        await bot?.sendMessage(TASK_CHANNEL_ID, channelMessage, { 
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "👉 Click here to claim 👈", url: taskLink }]
            ]
          }
        });
      } catch (e) {
        console.error("Failed to post to channel:", e);
      }

      bot?.sendMessage(chatId, t(lang, "taskPublished"), { parse_mode: "Markdown" });
      return;
    }

    // Handle replies for advertising
    if (msg.reply_to_message) {
      const replyText = msg.reply_to_message.text;
      
      // Channel URL Promotion
      if (replyText === t(lang, "enterChannelUrl")) {
        const url = msg.text;
        if (url && (url.startsWith("https://t.me/") || url.startsWith("@"))) {
          const cost = 0.250;
          if (user.balance < cost) {
            bot?.sendMessage(chatId, t(lang, "insufficientFunds"));
            return;
          }

          await storage.updateUser(user.id, { balance: user.balance - cost });
          
          const myBot = await bot?.getMe();
          const referralLink = `https://t.me/${myBot?.username}?start=${telegramId}`;
          
          await storage.createTask({
            type: "channel",
            title: `Join ${url}`,
            description: "Join the channel to earn reward",
            reward: 0.0001,
            link: url,
            creatorId: user.id,
            maxCompletions: 1000,
            currentCompletions: 0,
            isActive: true
          });

          // Auto publish to channel
          const channelMessage = `📢 *New Channel Task*\n\n📌 Join ${url}\n💰 Reward: 0.0001 TON\n👥 Limit: 1000 users\n\n🔗 Referral: ${referralLink}`;
          try {
            await bot?.sendMessage(TASK_CHANNEL_ID, channelMessage, { parse_mode: "Markdown" });
          } catch (e) {
            console.error("Failed to post to channel:", e);
          }

          bot?.sendMessage(chatId, t(lang, "taskPublished"), { parse_mode: "Markdown" });
        } else {
          bot?.sendMessage(chatId, "❌ Invalid URL. Please try again.");
        }
        return;
      }

      // Legacy Bot Forward Promotion (fallback)
      if (replyText === t(lang, "forwardBotMsg")) {
        if (msg.forward_from && msg.forward_from.is_bot) {
          const botUser = msg.forward_from.username;
          
          const confirmText = t(lang, "botVerified");
          const keyboard = {
            reply_markup: {
              inline_keyboard: [
                [{ text: t(lang, "publishTask"), callback_data: `publish_bot_${botUser}` }],
                [{ text: t(lang, "back"), callback_data: "advertise_menu" }]
              ]
            }
          };
          bot?.sendMessage(chatId, confirmText, keyboard);
        } else {
          bot?.sendMessage(chatId, "❌ Please forward a message from a BOT.");
        }
        return;
      }
    }

    if (msg.text && ["🇷🇺 Русский", "🇬🇧 English", "🇪🇸 Español", "🇵🇹 Português", "🇫🇷 Français", "🇾🇪 العربية"].includes(msg.text)) {
      if (!user.language) {
        const langMap: Record<string, string> = {
          "🇷🇺 Русский": "ru", "🇬🇧 English": "en", "🇪🇸 Español": "es",
          "🇵🇹 Português": "pt", "🇫🇷 Français": "fr", "🇾🇪 العربية": "ar"
        };
        const selectedLang = langMap[msg.text];
        await storage.updateUser(user.id, { language: selectedLang, isVerified: true });
        
        // Skip verification - go directly to subscription check
        bot?.sendMessage(msg.chat.id, t(selectedLang, "subscribeMessage"), {
          ...getSubscribeKeyboard(selectedLang),
          reply_markup: { ...getSubscribeKeyboard(selectedLang).reply_markup }
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
        const isSubscribed = true; // Simulated for now
        
        if (isSubscribed) {
          const user = await storage.getUserByTelegramId(telegramId);
          if (user) {
            await storage.updateUser(user.id, { isOnboarded: true });
            await bot?.sendMessage(chatId, t(user.language, "letsGo"));
            const welcomeText = getDashboardText(user.language, user.balance, getMiningRate(user.miningLevel, user.referralCount));
            bot?.sendMessage(chatId, welcomeText, { parse_mode: "Markdown", ...getMainMenuKeyboard(user.language) });
          }
        } else {
          const user = await storage.getUserByTelegramId(telegramId);
          bot?.answerCallbackQuery(query.id, { text: t(user?.language, "notSubscribed"), show_alert: true });
        }
      } catch (e) {
        const user = await storage.getUserByTelegramId(telegramId);
        bot?.answerCallbackQuery(query.id, { text: t(user?.language, "subscriptionError"), show_alert: true });
      }
      return;
    }

    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      bot?.sendMessage(chatId, t(null, "userNotFound"));
      return;
    }
    const lang = user.language;

    if (query.data === "promo") {
      console.log(`[ADMIN] Promo button clicked by ${telegramId}`);
      const text = t(lang, "advertiseMenu");
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: t(lang, "advertiseChannel"), callback_data: "promo_channel" }, { text: t(lang, "advertiseBots"), callback_data: "advertise_bot" }],
            [{ text: t(lang, "myTasks"), callback_data: "my_tasks" }],
            [{ text: t(lang, "back"), callback_data: "back_to_menu" }]
          ]
        }
      };
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard.reply_markup
      });

    } else if (query.data === "promo_channel") {
      console.log(`[ADMIN] Channel button clicked by ${telegramId}`);
      const botMe = await bot?.getMe();
      const text = t(lang, "channelPromoInfo").replace("{botUsername}", botMe?.username || "bot");
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: t(lang, "back"), callback_data: "advertise_menu" }]]
        }
      });
      await storage.updateUser(user.id, { status: "awaiting_channel_url" } as any);

    } else if (query.data === "advertise_bot") {
      const text = t(lang, "botPromoInfo");
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: t(lang, "back"), callback_data: "advertise_menu" }]
          ]
        }
      };
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: keyboard.reply_markup
      });
      await storage.updateUser(user.id, { status: "awaiting_bot_url" } as any);

    } else if (query.data === "promo_channel_start") {
      bot?.sendMessage(chatId, t(lang, "enterChannelUrl"), { reply_markup: { force_reply: true } });
      bot?.answerCallbackQuery(query.id);

    } else if (query.data === "my_tasks") {
      const userTasks = await storage.getTasksByCreator(user.id);
      let text = t(lang, "myTasks") + "\n\n";
      if (userTasks.length === 0) {
        text += t(lang, "noTasks");
      } else {
        userTasks.forEach(task => {
          text += `📌 *${task.title}*\nStatus: ${task.isActive ? "Active" : "Completed"}\nCompletions: ${task.currentCompletions}/${task.maxCompletions}\n\n`;
        });
      }
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getBackButton(lang).reply_markup
      });

    } else if (query.data.startsWith("publish_bot_")) {
      const botUser = query.data.split("_")[2];
      const cost = 0.250;
      // Admin & Super Admin skip balance check
      if (!isAdmin(user.telegramId) && user.balance < cost) {
        bot?.answerCallbackQuery(query.id, { text: t(lang, "insufficientFunds"), show_alert: true });
        return;
      }

      if (!isAdmin(user.telegramId)) {
        await storage.updateUser(user.id, { balance: user.balance - cost });
      }
      await storage.createTask({
        type: "bot",
        title: `Start @${botUser}`,
        description: "Start the bot to earn reward",
        reward: 0.0001,
        link: `https://t.me/${botUser}`,
        creatorId: user.id,
        maxCompletions: 1000,
        currentCompletions: 0,
        isActive: true
      });

      bot?.editMessageText(t(lang, "taskPublished"), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getBackButton(lang).reply_markup
      });

    } else if (query.data === "advertise_menu") {
      const now = Date.now();
      const lastClaim = user.lastClaimTime;
      const diffSeconds = (now - lastClaim) / 1000;
      const miningRatePer5Sec = getMiningRate(user.miningLevel, user.referralCount);
      const miningRatePerSec = miningRatePer5Sec / 5;
      
      const minedAmount = diffSeconds * miningRatePerSec;
      const newBalance = user.balance + minedAmount;
      await storage.updateUser(user.id, {
        balance: newBalance,
        lastClaimTime: now
      });

      const text = getDashboardText(lang, newBalance, miningRatePer5Sec);
      
      try {
        await bot?.editMessageText(text, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: getMainMenuKeyboard(lang).reply_markup
        });
      } catch (e) {
        // Message might not have changed
      }
      
    } else if (query.data === "upgrade") {
      const currentLevel = user.miningLevel;
      const nextLevel = currentLevel + 1;
      const cost = UPGRADE_COSTS[currentLevel];
      
      if (!cost) {
        bot?.sendMessage(chatId, t(lang, "maxLevelReached"));
        return;
      }

      const text = `
${t(lang, "upgradeTitle")}

${t(lang, "currentLevel")}: ${currentLevel}
${t(lang, "speed")}: ${MINING_SPEEDS[currentLevel]} TON / 5s

${t(lang, "nextLevel")}: ${nextLevel}
${t(lang, "speed")}: ${MINING_SPEEDS[nextLevel]} TON / 5s
${t(lang, "cost")}: ${cost} TON

${t(lang, "yourBalance")}: ${user.balance.toFixed(4)} TON
`;
      
      const upgradeKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: `${t(lang, "buyLevel")} ${nextLevel} (${cost} TON)`, callback_data: `buy_level_${nextLevel}` }],
            [{ text: t(lang, "back"), callback_data: "back_to_menu" }]
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
      
      if (targetLevel !== currentLevel + 1) {
        bot?.sendMessage(chatId, t(lang, "upgradeOneLevel"));
        return;
      }
      
      const cost = UPGRADE_COSTS[currentLevel];
      
      if (user.balance < cost) {
        bot?.answerCallbackQuery(query.id, { text: t(lang, "insufficientFunds"), show_alert: true });
        return;
      }

      await storage.updateUser(user.id, {
        balance: user.balance - cost,
        miningLevel: targetLevel
      });
      
      bot?.answerCallbackQuery(query.id, { text: t(lang, "upgradeSuccess"), show_alert: true });
      
      const updatedUser = await storage.getUser(user.id);
      if (!updatedUser) return;

      const text = getDashboardText(lang, updatedUser.balance, getMiningRate(updatedUser.miningLevel, updatedUser.referralCount));
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getMainMenuKeyboard(lang).reply_markup
      });

    } else if (query.data === "partners") {
      const botUsername = (await bot?.getMe())?.username;
      const referralLink = `https://t.me/${botUsername}?start=${telegramId}`;
      
      const bonusStatus = user.referralCount >= 1 ? "✅ ACTIVE" : "⏳ Invite 1+ friend";
      const text = `
${t(lang, "partnersTitle")}

${t(lang, "partnersDesc")}
• ${t(lang, "partnersReward").replace("{amount}", REFERRAL_REWARD.toString())}
• ${t(lang, "partnersBonus")} ${bonusStatus}

${t(lang, "referralLink")}
\`${referralLink}\`

${t(lang, "totalReferrals")}: ${user.referralCount}
`;
      const shareMessage = t(lang, "shareReferralMessage").replace("{link}", referralLink);
      const partnersKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: t(lang, "shareReferral"), switch_inline_query: shareMessage }],
            [{ text: t(lang, "back"), callback_data: "back_to_menu" }]
          ]
        }
      };
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: partnersKeyboard.reply_markup
      });

    } else if (query.data === "info") {
      const text = `
${t(lang, "infoTitle")}

${t(lang, "infoWhat")}
${t(lang, "infoWhatDesc")}

${t(lang, "infoHow")}
${t(lang, "infoStep1")}
${t(lang, "infoStep2")}
${t(lang, "infoStep3")}
${t(lang, "infoStep4")}

${t(lang, "infoNote")}
`;
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getBackButton(lang).reply_markup
      });

    } else if (query.data === "earnings") {
      const activeTasks = await storage.getActiveTasksForUser(user.id);
      
      if (activeTasks.length === 0) {
        const text = `
${t(lang, "earningsTitle")}

${t(lang, "noTasks")}
`;
        bot?.editMessageText(text, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: getBackButton(lang).reply_markup
        });
      } else {
        const text = `
${t(lang, "earningsTitle")}

${t(lang, "newTasks")}
`;
        const earningsKeyboard = {
          reply_markup: {
            inline_keyboard: [
              [{ text: t(lang, "goToTasks"), callback_data: "task_list" }],
              [{ text: t(lang, "back"), callback_data: "back_to_menu" }]
            ]
          }
        };
        bot?.editMessageText(text, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: earningsKeyboard.reply_markup
        });
      }

    } else if (query.data === "task_list") {
      const activeTasks = await storage.getActiveTasksForUser(user.id);
      let text = `${t(lang, "taskList")}\n\n`;
      const inline_keyboard: any[][] = [];

      for (const task of activeTasks) {
        text += `${task.type === 'channel' ? t(lang, "channelTask") : t(lang, "botTask")}\n`;
        inline_keyboard.push([{ text: `👉 ${task.title}`, callback_data: `view_task_${task.id}` }]);
      }
      inline_keyboard.push([{ text: t(lang, "back"), callback_data: "earnings" }]);

      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard }
      });

    } else if (query.data.startsWith("view_task_")) {
      const taskId = parseInt(query.data.split("_")[2]);
      const task = await storage.getTask(taskId);
      if (!task) return;

      let text = "";
      if (task.type === "channel") {
        text = `
${t(lang, "channelTaskTitle")}

${t(lang, "channelTaskStep1")}
${t(lang, "channelTaskStep2")}

${t(lang, "channelTaskNote")}
`;
      } else {
        text = `
${t(lang, "botTaskTitle")}

${t(lang, "botTaskStep1")}
${t(lang, "botTaskStep2")}
${t(lang, "botTaskWarning")}

${t(lang, "channelTaskNote")}
`;
      }

      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: t(lang, "goToTasks"), callback_data: `claim_task_${task.id}` }],
            [{ text: t(lang, "back"), callback_data: "task_list" }]
          ]
        }
      });

    } else if (query.data.startsWith("claim_task_")) {
      const taskId = parseInt(query.data.split("_")[2]);
      const task = await storage.getTask(taskId);
      if (!task) return;

      let userTask = await storage.getUserTask(user.id, task.id);
      if (!userTask) {
        userTask = await storage.createUserTask({
          userId: user.id,
          taskId: task.id,
          status: "pending"
        });
      }

      let text = "";
      const inline_keyboard: any[][] = [];

      if (task.type === "channel") {
        text = t(lang, "missionChannel");
        inline_keyboard.push([{ text: t(lang, "joined"), callback_data: `check_mission_${task.id}` }]);
      } else {
        text = t(lang, "missionBot");
        inline_keyboard.push([{ text: t(lang, "started"), callback_data: `check_mission_${task.id}` }]);
      }
      
      inline_keyboard.push([{ text: t(lang, "skip"), callback_data: "task_list" }]);
      inline_keyboard.push([{ text: t(lang, "check"), callback_data: `check_mission_${task.id}` }]);

      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard }
      });

    } else if (query.data.startsWith("check_mission_")) {
      const taskId = parseInt(query.data.split("_")[2]);
      const task = await storage.getTask(taskId);
      if (!task) return;

      if (task.type === "channel") {
        try {
          // targetBotUsername should be the channel username without @
          const channelUsername = task.targetBotUsername?.startsWith("@") 
            ? task.targetBotUsername 
            : `@${task.targetBotUsername}`;
            
          const chatMember = await bot?.getChatMember(channelUsername, parseInt(telegramId));
          if (chatMember && ["member", "administrator", "creator"].includes(chatMember.status)) {
            // Reward credited
            await storage.updateUser(user.id, { balance: user.balance + task.reward });
            
            const existingUserTask = await storage.getUserTask(user.id, task.id);
            if (existingUserTask) {
              await storage.updateUserTask(existingUserTask.id, { status: "completed" });
            } else {
              await storage.createUserTask({ userId: user.id, taskId: task.id, status: "completed" });
            }
            
            await storage.incrementTaskCompletion(task.id);
            bot?.answerCallbackQuery(query.id, { text: "✅ Reward credited!", show_alert: true });
            
            // Return to dashboard
            const updatedUser = await storage.getUser(user.id);
            if (updatedUser) {
              const text = getDashboardText(lang, updatedUser.balance, getMiningRate(updatedUser.miningLevel, updatedUser.referralCount));
              bot?.editMessageText(text, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: "Markdown",
                reply_markup: getMainMenuKeyboard(lang).reply_markup
              });
            }
          } else {
            bot?.answerCallbackQuery(query.id, { text: t(lang, "notJoined"), show_alert: true });
          }
        } catch (e) {
          console.error("Verification error:", e);
          bot?.answerCallbackQuery(query.id, { text: "❌ Verification failed. Make sure the bot is admin in the channel.", show_alert: true });
        }
      } else {
        bot?.answerCallbackQuery(query.id, { text: t(lang, "verificationPending"), show_alert: true });
      }

    } else if (query.data.startsWith("verify_bot_task_")) {
      const taskId = parseInt(query.data.split("_")[3]);
      const task = await storage.getTask(taskId);
      if (!task) return;
      
      // Set user status to awaiting verification
      await storage.updateUser(user.id, { status: "awaiting_bot_verification" } as any);
      
      const text = t(lang, "forwardMessage");
      bot?.sendMessage(chatId, text, { parse_mode: "Markdown" });
      bot?.answerCallbackQuery(query.id);
      
    } else if (query.data === "account") {
      const notifStatus = (user as any).notificationsEnabled !== false;
      const langDisplay = lang === 'ru' ? '🇷🇺 Русский' : '🇬🇧 English';
      const text = `
${t(lang, "accountTitle")}

📅 Joined: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}
🆔 ID: \`${telegramId}\`

⚡ Level: ${user.miningLevel}
💎 Balance: ${user.balance.toFixed(3)}

👥 Referrals: ${user.referralCount}
🗣️ Language: ${langDisplay}
`;
      const accountKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "💵 Add funds", callback_data: "add_funds" }],
            [{ text: "🌎 Change Language", callback_data: "change_language" }],
            [{ text: "📞 Support", callback_data: "support" }],
            [{ text: notifStatus ? "🔔 Notification settings" : "🔕 Notification settings", callback_data: "toggle_notification" }],
            [{ text: t(lang, "back"), callback_data: "back_to_menu" }]
          ]
        }
      };
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: accountKeyboard.reply_markup
      });

    } else if (query.data === "withdraw") {
      const minWithdraw = 0.5;
      
      const text = `
${t(lang, "withdrawTitle")}

${t(lang, "balance")}: ${user.balance.toFixed(4)} TON
${t(lang, "minWithdraw")}: ${minWithdraw} TON
`;
      
      const withdrawKeyboard = {
        reply_markup: {
          inline_keyboard: [
             user.balance >= minWithdraw 
             ? [{ text: t(lang, "requestWithdraw"), callback_data: "request_withdrawal" }]
             : [{ text: t(lang, "insufficientBalance"), callback_data: "no_balance" }],
             [{ text: t(lang, "back"), callback_data: "back_to_menu" }]
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
      bot?.sendMessage(chatId, t(lang, "enterWallet"), {
         reply_markup: { force_reply: true }
      }).then(sent => {
         bot?.onReplyToMessage(chatId, sent.message_id, async (reply) => {
             const wallet = reply.text;
             if (!wallet) return;

             const amountMsg = await bot?.sendMessage(chatId, t(lang, "enterAmount"), {
                 reply_markup: { force_reply: true }
             });

             if (amountMsg) {
                 bot?.onReplyToMessage(chatId, amountMsg.message_id, async (amountReply) => {
                     const amount = parseFloat(amountReply.text || "0");
                     if (isNaN(amount) || amount <= 0) {
                         bot?.sendMessage(chatId, t(lang, "invalidAmount"));
                         return;
                     }

                     const freshUser = await storage.getUser(user.id);
                     if (!freshUser || freshUser.balance < amount) {
                         bot?.sendMessage(chatId, t(lang, "insufficientBalanceMsg"));
                         return;
                     }

                     await storage.updateUser(freshUser.id, { balance: freshUser.balance - amount });
                     await storage.createWithdrawal({
                         userId: freshUser.id,
                         amount,
                         walletAddress: wallet,
                         status: "pending"
                     });

                     bot?.sendMessage(chatId, t(lang, "withdrawPending"));
                 });
             }
         });
      });

    } else if (query.data === "change_language") {
      bot?.sendMessage(chatId, t(lang, "selectLanguage"), getLanguageKeyboard());
      
    } else if (query.data.startsWith("set_lang_")) {
      const selectedLang = query.data.split("_")[2];
      await storage.updateUser(user.id, { language: selectedLang, isOnboarded: true });
      bot?.answerCallbackQuery(query.id, { text: "Language updated!" });
      
      const welcomeText = getDashboardText(selectedLang, user.balance, getMiningRate(user.miningLevel, user.referralCount));
      bot?.sendMessage(chatId, welcomeText, { parse_mode: "Markdown", ...getMainMenuKeyboard(selectedLang) });

    } else if (query.data === "support") {
      bot?.editMessageText(t(lang, "supportMessage"), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getBackButton(lang).reply_markup
      });

    } else if (query.data === "add_funds") {
      const text = `
💵 *Add Funds*

To deposit TON to your account, send your desired amount to:

\`YOUR_TON_WALLET_ADDRESS_HERE\`

After sending, your balance will be updated automatically.

⚠️ Minimum deposit: 0.1 TON
`;
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: getBackButton(lang).reply_markup
      });

    } else if (query.data === "toggle_notification") {
      const current = (user as any).notificationsEnabled !== false;
      await storage.updateUser(user.id, { notificationsEnabled: !current } as any);
      bot?.answerCallbackQuery(query.id, { text: t(lang, "notificationToggled") });
      
      const updatedUser = await storage.getUser(user.id);
      if (updatedUser) {
          const isEn = updatedUser.notificationsEnabled !== false;
          const accountKeyboard = {
            reply_markup: {
              inline_keyboard: [
                [{ text: "💵 Add funds", callback_data: "add_funds" }],
                [{ text: "🌎 Change Language", callback_data: "change_language" }],
                [{ text: "📞 Support", callback_data: "support" }],
                [{ text: isEn ? "🔔 Notification settings" : "🔕 Notification settings", callback_data: "toggle_notification" }],
                [{ text: t(lang, "back"), callback_data: "back_to_menu" }]
              ]
            }
          };
          bot?.editMessageReplyMarkup(accountKeyboard.reply_markup, {
            chat_id: chatId,
            message_id: messageId
          });
      }
    }

    bot?.answerCallbackQuery(query.id);
  });
}
