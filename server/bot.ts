import TelegramBot from "node-telegram-bot-api";
import { storage } from "./storage";

let botInstance: TelegramBot | null = null;
let isPolling = false;

// Constants
const REFERRAL_REWARD = 0.05;
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
  14: 0.0027175
};

const UPGRADE_COSTS: Record<number, number> = {
  1: 0.5,
  2: 1.0,
  3: 2.0,
  4: 4.0,
  5: 8.0,
  6: 12.0,
  7: 16.0,
  8: 20.0,
  9: 40.0,
  10: 60.0,
  11: 80.0,
  12: 100.0,
  13: 200.0
};

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
    faq: "❓ FAQ",
    faqTitle: "❓ *Frequently Asked Questions*",
    faqDesc: "Welcome to the TON Miner FAQ section. Here you can find answers to the most common questions.",
    faqQ1: "💎 *What is TON Miner?*",
    faqA1: "It is a simulation of cloud mining where you can earn TON by upgrading your virtual hardware.",
    faqQ2: "💸 *How to withdraw?*",
    faqA2: "Go to the 'Account' section, click 'Withdraw', enter your wallet address and the amount. Minimum withdrawal is 0.5 TON.",
    faqQ3: "🚀 *How to increase speed?*",
    faqA3: "You can increase your mining speed by clicking the 'Upgrade' button on the dashboard or through the 'Account' section.",
    faqQ4: "👥 *Partners program?*",
    faqA4: "Invite friends using your referral link in the 'Partners' section and earn rewards for each active referral!",
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
    earningsTitle: "💸 *Earnings & Tasks*",
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
    addFunds: "💵 Add funds",
    withdrawBtn: "🏦 Withdraw",
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
    earningsTitle: "💸 *Заработок и задания*",
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
  },
  es: {
    selectLanguage: "Select language / Выберите язык",
    dashboard: "🪪 *Panel de control*",
    balance: "💰 Saldo",
    miningSpeed: "⛏️ Velocidad de minería",
    miningTagline: "TON — Minería sin límites",
    refresh: "♻️ Actualizar",
    upgrade: "🚀 Mejorar",
    promo: "🎁 Promo",
    partners: "👥 Socios",
    account: "👤 Cuenta",
    earnings: "💸 Ganancias",
    withdraw: "🏦 Retirar",
    info: "ℹ️ Info",
    back: "↩️ Volver",
    subscribe: "🚀 Suscribirse",
    subscribed: "✅ Ya me suscribí",
    subscribeMessage: "😉 Asegúrate de suscribirte a nuestro canal antes de comenzar",
    letsGo: "🏂 ¡Vamos!",
    userNotFound: "⚠️ Usuario no encontrado. Escribe /start",
    maxLevelReached: "🚀 ¡Nivel máximo alcanzado!",
    upgradeTitle: "🚀 *Mejorar velocidad de minería*",
    currentLevel: "Nivel actual",
    nextLevel: "Siguiente nivel",
    speed: "Velocidad",
    cost: "Costo",
    yourBalance: "💰 Tu saldo",
    buyLevel: "Comprar nivel",
    upgradeOneLevel: "⚠️ Solo puedes mejorar un nivel a la vez.",
    insufficientFunds: "❌ ¡Fondos insuficientes!",
    upgradeSuccess: "✅ ¡Mejora exitosa!",
    partnersTitle: "👥 *Programa de socios*",
    partnersDesc: "¡Invita amigos y gana TON!",
    partnersReward: "Gana *{amount} TON* por cada referido activo",
    partnersBonus: "+10% bonus de velocidad (activo con referidos)",
    shareReferral: "🔗 Compartir",
    shareReferralMessage: "🚀 ¡Empieza a ganar TON conmigo!\n\nMina TON cada segundo con este bot.\nÚnete ahora y obtén minería más rápida 💰\n\n👉 Empieza aquí: {link}",
    language: "🌎 Idioma",
    support: "📞 Soporte",
    notification: "🔔 Notificación",
    notificationOn: "🔔 Notificaciones: ON",
    notificationOff: "🔕 Notificaciones: OFF",
    notificationToggled: "¡Notificaciones actualizadas!",
    supportMessage: "📞 *Soporte*\n\nPara cualquier problema o pregunta, contacta a nuestro equipo.",
    referralLink: "🔗 *Tu enlace de referido:*",
    totalReferrals: "Total de referidos",
    infoTitle: "ℹ️ *Información*",
    infoWhat: "🤖 *¿Qué es este bot?*",
    infoWhatDesc: "Es un simulador de minería en la nube de TON. Puedes minar TON, mejorar tu equipo y retirar recompensas reales.",
    infoHow: "⚙️ *¿Cómo funciona?*",
    infoStep1: "1. Presiona \"Actualizar\" para recoger TON.",
    infoStep2: "2. Usa \"Mejorar\" para aumentar tu velocidad.",
    infoStep3: "3. Invita amigos para ganar más rápido.",
    infoStep4: "4. Retira ganancias a tu billetera.",
    infoNote: "⚠️ *Nota:* Este es un bot de simulación.",
    earningsTitle: "💸 *Ganancias y tareas*",
    noTasks: "No hay tareas activas disponibles.\nVuelve más tarde.",
    newTasks: "¡Nuevas tareas disponibles!\nCompleta tareas y gana recompensas.",
    goToTasks: "👉 Ir a la lista de tareas 👈",
    taskList: "📌 *Lista de tareas*",
    channelTask: "🔹 Tarea: Suscribirse al canal",
    botTask: "🔹 Tarea: Iniciar el bot",
    accountTitle: "👤 *Info de cuenta*",
    accountId: "🆔 ID",
    accountLang: "🗣️ Idioma",
    accountReferrals: "👥 Referidos",
    accountJoined: "📅 Registro",
    accountLevel: "⚡ Nivel",
    accountStatus: "🟢 Estado",
    withdrawTitle: "🏦 *Retirar fondos*",
    minWithdraw: "⚠️ Retiro mínimo",
    requestWithdraw: "✅ Solicitar retiro",
    insufficientBalance: "❌ Saldo insuficiente",
    enterWallet: "🏦 Ingresa tu dirección de billetera TON:",
    enterAmount: "💰 Ingresa el monto a retirar:",
    invalidAmount: "❌ Monto inválido.",
    insufficientBalanceMsg: "❌ Saldo insuficiente.",
    withdrawPending: "✅ ¡Solicitud enviada! Estado: Pendiente",
    notSubscribed: "❌ ¡Aún no estás suscrito!",
    subscriptionError: "❌ Error al verificar suscripción.",
    newReferral: "👥 ¡Nuevo referido! Ganaste {amount} TON.",
    verificationPending: "⏳ Verificación en proceso. Espera hasta 7 días.",
    channelTaskTitle: "📌 *Nueva tarea: Suscribirse al canal*",
    channelTaskStep1: "➡️ Únete al canal usando el botón",
    channelTaskStep2: "➡️ Permanece suscrito por al menos 7 días",
    channelTaskNote: "⚠️ La recompensa se acreditará después de la verificación.",
    botTaskTitle: "📌 *Nueva tarea: Iniciar el bot*",
    botTaskStep1: "➡️ Abre el bot usando el botón",
    botTaskStep2: "➡️ NO bloquees el bot por al menos 7 días",
    botTaskWarning: "❗ Bloquearlo antes de 7 días puede generar penalización",
    missionChannel: "👉🏻 *Misión: Únete al canal.*\n\n❓ Después de unirte, presiona « ✅ Me uní » abajo.",
    missionBot: "👉🏻 *Misión: Interactúa con el bot.*\n\n❓ Presiona « ✅ Iniciado » y reenvía CUALQUIER mensaje\nde ese bot aquí para verificación.",
    joined: "✅ Me uní",
    started: "✅ Iniciado",
    skip: "↪️ Omitir",
    check: "🔄 Verificar",
  },
  pt: {
    selectLanguage: "Select language / Выберите язык",
    dashboard: "🪪 *Painel*",
    balance: "💰 Saldo",
    miningSpeed: "⛏️ Velocidade de mineração",
    miningTagline: "TON — Mineração sem limites",
    refresh: "♻️ Atualizar",
    upgrade: "🚀 Melhorar",
    promo: "🎁 Promo",
    partners: "👥 Parceiros",
    account: "👤 Conta",
    earnings: "💸 Ganhos",
    withdraw: "🏦 Sacar",
    info: "ℹ️ Info",
    back: "↩️ Voltar",
    subscribe: "🚀 Inscrever-se",
    subscribed: "✅ Já me inscrevi",
    subscribeMessage: "😉 Inscreva-se no nosso canal antes de começar",
    letsGo: "🏂 Vamos lá!",
    userNotFound: "⚠️ Usuário não encontrado. Digite /start",
    maxLevelReached: "🚀 Nível máximo atingido!",
    upgradeTitle: "🚀 *Melhorar velocidade de mineração*",
    currentLevel: "Nível atual",
    nextLevel: "Próximo nível",
    speed: "Velocidade",
    cost: "Custo",
    yourBalance: "💰 Seu saldo",
    buyLevel: "Comprar nível",
    upgradeOneLevel: "⚠️ Você só pode melhorar um nível por vez.",
    insufficientFunds: "❌ Fundos insuficientes!",
    upgradeSuccess: "✅ Melhoria realizada!",
    partnersTitle: "👥 *Programa de parceiros*",
    partnersDesc: "Convide amigos e ganhe TON!",
    partnersReward: "Ganhe *{amount} TON* por cada indicação ativa",
    partnersBonus: "+10% bônus de velocidade (ativo com indicações)",
    shareReferral: "🔗 Compartilhar",
    shareReferralMessage: "🚀 Comece a ganhar TON comigo!\n\nMinere TON a cada segundo com este bot.\nJunte-se e ganhe mineração mais rápida 💰\n\n👉 Comece aqui: {link}",
    language: "🌎 Idioma",
    support: "📞 Suporte",
    notification: "🔔 Notificação",
    notificationOn: "🔔 Notificações: ON",
    notificationOff: "🔕 Notificações: OFF",
    notificationToggled: "Notificações atualizadas!",
    supportMessage: "📞 *Suporte*\n\nPara qualquer problema ou dúvida, contate nossa equipe.",
    referralLink: "🔗 *Seu link de indicação:*",
    totalReferrals: "Total de indicações",
    infoTitle: "ℹ️ *Informações*",
    infoWhat: "🤖 *O que é este bot?*",
    infoWhatDesc: "É um simulador de mineração TON na nuvem. Você pode minerar TON, melhorar seu equipamento e sacar recompensas.",
    infoHow: "⚙️ *Como funciona?*",
    infoStep1: "1. Pressione \"Atualizar\" para coletar TON.",
    infoStep2: "2. Use \"Melhorar\" para aumentar sua velocidade.",
    infoStep3: "3. Convide amigos para ganhar mais rápido.",
    infoStep4: "4. Saque ganhos para sua carteira.",
    infoNote: "⚠️ *Nota:* Este é um bot de simulação.",
    earningsTitle: "💸 *Ganhos e tarefas*",
    noTasks: "Não há tarefas ativas disponíveis.\nVolte mais tarde.",
    newTasks: "Novas tarefas disponíveis!\nComplete tarefas e ganhe recompensas.",
    goToTasks: "👉 Ir para lista de tarefas 👈",
    taskList: "📌 *Lista de tarefas*",
    channelTask: "🔹 Tarefa: Inscrever-se no canal",
    botTask: "🔹 Tarefa: Iniciar o bot",
    accountTitle: "👤 *Info da conta*",
    accountId: "🆔 ID",
    accountLang: "🗣️ Idioma",
    accountReferrals: "👥 Indicações",
    accountJoined: "📅 Cadastro",
    accountLevel: "⚡ Nível",
    accountStatus: "🟢 Status",
    withdrawTitle: "🏦 *Sacar fundos*",
    minWithdraw: "⚠️ Saque mínimo",
    requestWithdraw: "✅ Solicitar saque",
    insufficientBalance: "❌ Saldo insuficiente",
    enterWallet: "🏦 Digite o endereço da sua carteira TON:",
    enterAmount: "💰 Digite o valor para sacar:",
    invalidAmount: "❌ Valor inválido.",
    insufficientBalanceMsg: "❌ Saldo insuficiente.",
    withdrawPending: "✅ Solicitação enviada! Status: Pendente",
    notSubscribed: "❌ Você ainda não está inscrito!",
    subscriptionError: "❌ Erro ao verificar inscrição.",
    newReferral: "👥 Nova indicação! Você ganhou {amount} TON.",
    verificationPending: "⏳ Verificação em andamento. Aguarde até 7 dias.",
    channelTaskTitle: "📌 *Nova tarefa: Inscrever-se no canal*",
    channelTaskStep1: "➡️ Entre no canal usando o botão",
    channelTaskStep2: "➡️ Fique inscrito por pelo menos 7 dias",
    channelTaskNote: "⚠️ A recompensa será creditada após verificação.",
    botTaskTitle: "📌 *Nova tarefa: Iniciar o bot*",
    botTaskStep1: "➡️ Abra o bot usando o botão",
    botTaskStep2: "➡️ NÃO bloqueie o bot por pelo menos 7 dias",
    botTaskWarning: "❗ Bloquear antes de 7 dias pode gerar penalidade",
    missionChannel: "👉🏻 *Missão: Entre no canal.*\n\n❓ Depois de entrar, pressione « ✅ Entrei » abaixo.",
    missionBot: "👉🏻 *Missão: Interaja com o bot.*\n\n❓ Pressione « ✅ Iniciado » e encaminhe QUALQUER mensagem\ndesse bot aqui para verificação.",
    joined: "✅ Entrei",
    started: "✅ Iniciado",
    skip: "↪️ Pular",
    check: "🔄 Verificar",
  },
  fr: {
    selectLanguage: "Select language / Выберите язык",
    dashboard: "🪪 *Tableau de bord*",
    balance: "💰 Solde",
    miningSpeed: "⛏️ Vitesse de minage",
    miningTagline: "TON — Minage sans limites",
    refresh: "♻️ Actualiser",
    upgrade: "🚀 Améliorer",
    promo: "🎁 Promo",
    partners: "👥 Partenaires",
    account: "👤 Compte",
    earnings: "💸 Gains",
    withdraw: "🏦 Retrait",
    info: "ℹ️ Info",
    back: "↩️ Retour",
    subscribe: "🚀 S'abonner",
    subscribed: "✅ Je suis abonné",
    subscribeMessage: "😉 Abonnez-vous à notre chaîne avant de commencer",
    letsGo: "🏂 C'est parti!",
    userNotFound: "⚠️ Utilisateur non trouvé. Tapez /start",
    maxLevelReached: "🚀 Niveau maximum atteint!",
    upgradeTitle: "🚀 *Améliorer la vitesse de minage*",
    currentLevel: "Niveau actuel",
    nextLevel: "Niveau suivant",
    speed: "Vitesse",
    cost: "Coût",
    yourBalance: "💰 Votre solde",
    buyLevel: "Acheter niveau",
    upgradeOneLevel: "⚠️ Vous ne pouvez améliorer qu'un niveau à la fois.",
    insufficientFunds: "❌ Fonds insuffisants!",
    upgradeSuccess: "✅ Amélioration réussie!",
    partnersTitle: "👥 *Programme partenaires*",
    partnersDesc: "Invitez des amis et gagnez des TON!",
    partnersReward: "Gagnez *{amount} TON* par parrainage actif",
    partnersBonus: "+10% bonus de vitesse (actif avec parrainages)",
    shareReferral: "🔗 Partager",
    shareReferralMessage: "🚀 Commence à gagner des TON avec moi!\n\nMine des TON chaque seconde avec ce bot.\nRejoins-nous et obtiens un minage plus rapide 💰\n\n👉 Commence ici: {link}",
    language: "🌎 Langue",
    support: "📞 Support",
    notification: "🔔 Notification",
    notificationOn: "🔔 Notifications: ON",
    notificationOff: "🔕 Notifications: OFF",
    notificationToggled: "Notifications mises à jour!",
    supportMessage: "📞 *Support*\n\nPour toute question, contactez notre équipe.",
    referralLink: "🔗 *Votre lien de parrainage:*",
    totalReferrals: "Total parrainages",
    infoTitle: "ℹ️ *Informations*",
    infoWhat: "🤖 *Qu'est-ce que ce bot?*",
    infoWhatDesc: "C'est un simulateur de minage cloud TON. Minez, améliorez et retirez des récompenses.",
    infoHow: "⚙️ *Comment ça marche?*",
    infoStep1: "1. Appuyez sur \"Actualiser\" pour collecter les TON.",
    infoStep2: "2. Utilisez \"Améliorer\" pour augmenter votre vitesse.",
    infoStep3: "3. Invitez des amis pour gagner plus vite.",
    infoStep4: "4. Retirez vos gains vers votre portefeuille.",
    infoNote: "⚠️ *Note:* C'est un bot de simulation.",
    earningsTitle: "💸 *Gains et tâches*",
    noTasks: "Aucune tâche active disponible.\nRevenez plus tard.",
    newTasks: "Nouvelles tâches disponibles!\nComplétez-les pour gagner des récompenses.",
    goToTasks: "👉 Aller à la liste des tâches 👈",
    taskList: "📌 *Liste des tâches*",
    channelTask: "🔹 Tâche: S'abonner à la chaîne",
    botTask: "🔹 Tâche: Démarrer le bot",
    accountTitle: "👤 *Info du compte*",
    accountId: "🆔 ID",
    accountLang: "🗣️ Langue",
    accountReferrals: "👥 Parrainages",
    accountJoined: "📅 Inscription",
    accountLevel: "⚡ Niveau",
    accountStatus: "🟢 Statut",
    withdrawTitle: "🏦 *Retirer des fonds*",
    minWithdraw: "⚠️ Retrait minimum",
    requestWithdraw: "✅ Demander un retrait",
    insufficientBalance: "❌ Solde insuffisant",
    enterWallet: "🏦 Entrez l'adresse de votre portefeuille TON:",
    enterAmount: "💰 Entrez le montant à retirer:",
    invalidAmount: "❌ Montant invalide.",
    insufficientBalanceMsg: "❌ Solde insuffisant.",
    withdrawPending: "✅ Demande envoyée! Statut: En attente",
    notSubscribed: "❌ Vous n'êtes pas encore abonné!",
    subscriptionError: "❌ Erreur lors de la vérification.",
    newReferral: "👥 Nouveau parrainage! Vous avez gagné {amount} TON.",
    verificationPending: "⏳ Vérification en cours. Attendez jusqu'à 7 jours.",
    channelTaskTitle: "📌 *Nouvelle tâche: S'abonner à la chaîne*",
    channelTaskStep1: "➡️ Rejoignez la chaîne via le bouton",
    channelTaskStep2: "➡️ Restez abonné pendant au moins 7 jours",
    channelTaskNote: "⚠️ La récompense sera créditée après vérification.",
    botTaskTitle: "📌 *Nouvelle tâche: Démarrer le bot*",
    botTaskStep1: "➡️ Ouvrez le bot via le bouton",
    botTaskStep2: "➡️ NE bloquez PAS le bot pendant 7 jours",
    botTaskWarning: "❗ Bloquer avant 7 jours peut entraîner une pénalité",
    missionChannel: "👉🏻 *Mission: Rejoignez la chaîne.*\n\n❓ Après avoir rejoint, appuyez sur « ✅ Rejoint » ci-dessous.",
    missionBot: "👉🏻 *Mission: Interagissez avec le bot.*\n\n❓ Appuyez sur « ✅ Démarré » et transférez N'IMPORTE QUEL message\nde ce bot ici pour vérification.",
    joined: "✅ Rejoint",
    started: "✅ Démarré",
    skip: "↪️ Passer",
    check: "🔄 Vérifier",
  },
  ar: {
    selectLanguage: "Select language / Выберите язык",
    dashboard: "🪪 *لوحة التحكم*",
    balance: "💰 الرصيد",
    miningSpeed: "⛏️ سرعة التعدين",
    miningTagline: "TON — تعدين بلا حدود",
    refresh: "♻️ تحديث",
    upgrade: "🚀 ترقية",
    promo: "🎁 عروض",
    partners: "👥 شركاء",
    account: "👤 الحساب",
    earnings: "💸 الأرباح",
    withdraw: "🏦 سحب",
    info: "ℹ️ معلومات",
    back: "↩️ رجوع",
    subscribe: "🚀 اشتراك",
    subscribed: "✅ مشترك",
    subscribeMessage: "😉 اشترك في قناتنا قبل البدء",
    letsGo: "🏂 هيا بنا!",
    userNotFound: "⚠️ المستخدم غير موجود. اكتب /start",
    maxLevelReached: "🚀 وصلت للمستوى الأقصى!",
    upgradeTitle: "🚀 *ترقية سرعة التعدين*",
    currentLevel: "المستوى الحالي",
    nextLevel: "المستوى التالي",
    speed: "السرعة",
    cost: "التكلفة",
    yourBalance: "💰 رصيدك",
    buyLevel: "شراء المستوى",
    upgradeOneLevel: "⚠️ يمكنك الترقية مستوى واحد فقط.",
    insufficientFunds: "❌ رصيد غير كافٍ!",
    upgradeSuccess: "✅ تمت الترقية!",
    partnersTitle: "👥 *برنامج الشركاء*",
    partnersDesc: "ادعُ أصدقاءك واربح TON!",
    partnersReward: "اربح *{amount} TON* لكل إحالة نشطة",
    partnersBonus: "+10% مكافأة السرعة (نشط مع الإحالات)",
    shareReferral: "🔗 مشاركة",
    shareReferralMessage: "🚀 ابدأ ربح TON معي!\n\nعدّن TON كل ثانية مع هذا البوت.\nانضم واحصل على تعدين أسرع 💰\n\n👉 ابدأ هنا: {link}",
    language: "🌎 اللغة",
    support: "📞 الدعم",
    notification: "🔔 الإشعارات",
    notificationOn: "🔔 الإشعارات: مفعّل",
    notificationOff: "🔕 الإشعارات: معطّل",
    notificationToggled: "تم تحديث الإشعارات!",
    supportMessage: "📞 *الدعم*\n\nلأي مشكلة أو سؤال، تواصل مع فريق الدعم.",
    referralLink: "🔗 *رابط الإحالة الخاص بك:*",
    totalReferrals: "إجمالي الإحالات",
    infoTitle: "ℹ️ *معلومات*",
    infoWhat: "🤖 *ما هذا البوت؟*",
    infoWhatDesc: "هذا محاكي تعدين TON سحابي. يمكنك التعدين والترقية وسحب المكافآت.",
    infoHow: "⚙️ *كيف يعمل؟*",
    infoStep1: "1. اضغط \"تحديث\" لجمع TON.",
    infoStep2: "2. استخدم \"ترقية\" لزيادة السرعة.",
    infoStep3: "3. ادعُ أصدقاء للربح أسرع.",
    infoStep4: "4. اسحب أرباحك لمحفظتك.",
    infoNote: "⚠️ *ملاحظة:* هذا بوت محاكاة.",
    earningsTitle: "💸 *الأرباح والمهام*",
    noTasks: "لا توجد مهام نشطة حالياً.\nعد لاحقاً.",
    newTasks: "مهام جديدة متاحة!\nأكمل المهام واربح مكافآت.",
    goToTasks: "👉 الذهاب لقائمة المهام 👈",
    taskList: "📌 *قائمة المهام*",
    channelTask: "🔹 مهمة: الاشتراك في القناة",
    botTask: "🔹 مهمة: تشغيل البوت",
    accountTitle: "👤 *معلومات الحساب*",
    accountId: "🆔 المعرف",
    accountLang: "🗣️ اللغة",
    accountReferrals: "👥 الإحالات",
    accountJoined: "📅 التسجيل",
    accountLevel: "⚡ المستوى",
    accountStatus: "🟢 الحالة",
    withdrawTitle: "🏦 *سحب الأموال*",
    minWithdraw: "⚠️ الحد الأدنى للسحب",
    requestWithdraw: "✅ طلب سحب",
    insufficientBalance: "❌ رصيد غير كافٍ",
    enterWallet: "🏦 أدخل عنوان محفظة TON:",
    enterAmount: "💰 أدخل المبلغ للسحب:",
    invalidAmount: "❌ مبلغ غير صالح.",
    insufficientBalanceMsg: "❌ رصيد غير كافٍ.",
    withdrawPending: "✅ تم إرسال الطلب! الحالة: قيد الانتظار",
    notSubscribed: "❌ لم تشترك بعد!",
    subscriptionError: "❌ خطأ في التحقق من الاشتراك.",
    newReferral: "👥 إحالة جديدة! ربحت {amount} TON.",
    verificationPending: "⏳ التحقق جارٍ. انتظر حتى 7 أيام.",
    channelTaskTitle: "📌 *مهمة جديدة: الاشتراك في القناة*",
    channelTaskStep1: "➡️ انضم للقناة عبر الزر",
    channelTaskStep2: "➡️ ابقَ مشتركاً لمدة 7 أيام على الأقل",
    channelTaskNote: "⚠️ ستُضاف المكافأة بعد التحقق.",
    botTaskTitle: "📌 *مهمة جديدة: تشغيل البوت*",
    botTaskStep1: "➡️ افتح البوت عبر الزر",
    botTaskStep2: "➡️ لا تحظر البوت لمدة 7 أيام",
    botTaskWarning: "❗ الحظر قبل 7 أيام قد يؤدي لعقوبة",
    missionChannel: "👉🏻 *المهمة: انضم للقناة.*\n\n❓ بعد الانضمام، اضغط « ✅ انضممت » أدناه.",
    missionBot: "👉🏻 *المهمة: تفاعل مع البوت.*\n\n❓ اضغط « ✅ تم التشغيل » وأعد توجيه أي رسالة\nمن ذلك البوت هنا للتحقق.",
    joined: "✅ انضممت",
    started: "✅ تم التشغيل",
    skip: "↪️ تخطي",
    check: "🔄 تحقق",
  },
};

function t(lang: string | null | undefined, key: string): string {
  const language = lang || "en";
  return translations[language]?.[key] || translations.en[key] || key;
}

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
    // Rule: No hidden bonus / multiplier for now as per user request
    return baseRate;
  }

  function getMainMenuKeyboard(lang: string | null | undefined) {
    return {
      reply_markup: {
        keyboard: [
          [{ text: t(lang, "earnings") }, { text: t(lang, "advertise") || "📈 Advertise" }],
          [{ text: t(lang, "promo") }, { text: t(lang, "partners") }],
          [{ text: t(lang, "account") }, { text: t(lang, "faq") || "❓ FAQ" }]
        ],
        resize_keyboard: true,
        persistent: true
      }
    };
  }

  function getDashboardInlineKeyboard(lang: string | null | undefined) {
    return {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(lang, "refresh"), callback_data: "refresh" }],
          [{ text: t(lang, "upgrade"), callback_data: "upgrade" }]
        ],
        remove_keyboard: false
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

  function getDashboardText(lang: string | null | undefined, balance: number, miningRate: number) {
    return `
${t(lang, "dashboard")}

${t(lang, "balance")}: ${balance.toFixed(8)} TON
${t(lang, "miningSpeed")}: ${miningRate.toFixed(8)} TON / 5 seconds

${t(lang, "miningTagline")}
`;
  }

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
      
      return bot?.sendMessage(chatId, t(null, "selectLanguage"), languageKeyboard);
    }

    if (!user.isOnboarded) {
      if (!user.language) {
        return bot?.sendMessage(chatId, t(null, "selectLanguage"), languageKeyboard);
      }
      // Skip verification - go directly to subscription check
      return bot?.sendMessage(chatId, t(user.language, "subscribeMessage"), getSubscribeKeyboard(user.language));
    }
    
    const now = Date.now();
    const lastClaim = user.lastClaimTime;
    const diffSeconds = (now - lastClaim) / 1000;
    const miningRatePer5Sec = getMiningRate(user.miningLevel, user.referralCount);
    const miningRatePerSec = miningRatePer5Sec / 5;
    const minedAmount = diffSeconds * miningRatePerSec;
    const currentBalance = user.balance + minedAmount;
    
    const welcomeText = getDashboardText(user.language, currentBalance, miningRatePer5Sec);
    
    bot?.sendMessage(chatId, welcomeText, { 
      parse_mode: "Markdown", 
      ...getDashboardInlineKeyboard(user.language)
    });
  });

  bot.on("message", async (msg) => {
    if (!msg.text) return;

    const telegramId = msg.from?.id.toString();
    if (!telegramId) return;
    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) return;

    const lang = user.language;

    // Handle Reply Keyboard buttons
    if (msg.text === t(lang, "earnings")) {
      await handleEarnings(msg.chat.id, user);
    } else if (msg.text === t(lang, "partners")) {
      await handlePartners(msg.chat.id, user);
    } else if (msg.text === t(lang, "account")) {
      await handleAccount(msg.chat.id, user);
    } else if (msg.text === t(lang, "promo")) {
      bot?.sendMessage(msg.chat.id, "🎁 Promo section coming soon!");
    } else if (msg.text === "📈 Advertise" || (lang && t(lang, "advertise") === msg.text)) {
      bot?.sendMessage(msg.chat.id, "📈 Advertise section coming soon!");
    } else if (msg.text === "❓ FAQ" || (lang && t(lang, "faq") === msg.text)) {
      await handleFAQ(msg.chat.id, user);
    }

    if (["🇷🇺 Русский", "🇬🇧 English", "🇪🇸 Español", "🇵🇹 Português", "🇫🇷 Français", "🇾🇪 العربية"].includes(msg.text)) {
      const telegramId = msg.from?.id.toString();
      if (!telegramId) return;
      const user = await storage.getUserByTelegramId(telegramId);
      if (user && !user.language) {
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

    bot?.answerCallbackQuery(query.id);

    const user = await storage.getUserByTelegramId(telegramId);
    if (!user) {
      bot?.sendMessage(chatId, t(null, "userNotFound"));
      return;
    }

    const lang = user.language;

    if (query.data === "back_to_menu") {
      const welcomeText = getDashboardText(lang, user.balance, getMiningRate(user.miningLevel, user.referralCount));
      
      bot?.sendMessage(chatId, welcomeText, { 
        parse_mode: "Markdown", 
        ...getDashboardInlineKeyboard(lang)
      });
    } else if (query.data === "refresh") {
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
          reply_markup: getDashboardInlineKeyboard(lang).reply_markup
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
        reply_markup: getDashboardInlineKeyboard(lang).reply_markup
      });

    } else if (query.data === "partners") {
      await handlePartners(chatId, user, messageId);
    } else if (query.data === "earnings") {
      await handleEarnings(chatId, user, messageId);
    } else if (query.data === "account") {
      await handleAccount(chatId, user, messageId);
    } else if (query.data === "withdraw") {
      await handleWithdraw(chatId, user, messageId);
    } else if (query.data === "info") {
      // Info button is removed from UI, but keep handler if needed for direct access
      bot?.answerCallbackQuery(query.id, { text: "Section removed." });
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
      bot?.answerCallbackQuery(query.id, { text: t(lang, "verificationPending"), show_alert: true });
      
    } else if (query.data === "account") {
      await handleAccount(chatId, user, messageId);
    } else if (query.data === "withdraw") {
      await handleWithdraw(chatId, user, messageId);
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

                     await storage.updateUser(user.id, {
                         balance: freshUser.balance - amount
                     });

                     await storage.createWithdrawal({
                         userId: user.id,
                         amount: amount,
                         walletAddress: wallet,
                         status: "pending"
                     });

                     bot?.sendMessage(chatId, t(lang, "withdrawPending"));
                 });
             }
         });
      });
    } else if (query.data === "promo") {
      bot?.answerCallbackQuery(query.id, { text: "Coming soon!", show_alert: true });
    } else if (query.data === "no_balance") {
      bot?.answerCallbackQuery(query.id, { text: t(lang, "insufficientFunds"), show_alert: true });
    } else if (query.data === "share_referral") {
      const botUsername = (await bot?.getMe())?.username;
      const referralLink = `https://t.me/${botUsername}?start=${telegramId}`;
      const shareMessage = t(lang, "shareReferralMessage").replace("{link}", referralLink);
      
      await bot?.sendMessage(chatId, shareMessage, { parse_mode: "Markdown" });
      
    } else if (query.data === "change_language") {
      const languageInlineKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🇷🇺 Русский", callback_data: "set_lang_ru" }, { text: "🇬🇧 English", callback_data: "set_lang_en" }],
            [{ text: "🇪🇸 Español", callback_data: "set_lang_es" }, { text: "🇵🇹 Português", callback_data: "set_lang_pt" }],
            [{ text: "🇫🇷 Français", callback_data: "set_lang_fr" }, { text: "🇾🇪 العربية", callback_data: "set_lang_ar" }],
            [{ text: t(lang, "back"), callback_data: "account" }]
          ]
        }
      };
      bot?.editMessageText(t(null, "selectLanguage"), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: languageInlineKeyboard.reply_markup
      });
      
    } else if (query.data.startsWith("set_lang_")) {
      const newLang = query.data.split("_")[2];
      await storage.updateUser(user.id, { language: newLang });
      bot?.answerCallbackQuery(query.id, { text: "Language updated!", show_alert: true });
      
      const notifStatus = (user as any).notificationsEnabled !== false;
      const text = `
${t(newLang, "accountTitle")}

${t(newLang, "accountId")}: \`${telegramId}\`
${t(newLang, "accountLang")}: ${newLang}
${t(newLang, "accountReferrals")}: ${user.referralCount}
${t(newLang, "accountJoined")}: ${new Date(user.createdAt || Date.now()).toLocaleDateString()}
${t(newLang, "accountLevel")}: ${user.miningLevel}
${t(newLang, "accountStatus")}: ${user.status.toUpperCase()}
`;
      const accountKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: t(newLang, "language"), callback_data: "change_language" }],
            [{ text: t(newLang, "support"), callback_data: "support" }],
            [{ text: notifStatus ? t(newLang, "notificationOn") : t(newLang, "notificationOff"), callback_data: "toggle_notification" }],
            [{ text: t(newLang, "back"), callback_data: "back_to_menu" }]
          ]
        }
      };
      bot?.editMessageText(text, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: accountKeyboard.reply_markup
      });
      
    } else if (query.data === "faq") {
      await handleFAQ(chatId, user, messageId);
    } else if (query.data === "support") {
      bot?.editMessageText(t(lang, "supportMessage"), {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: t(lang, "back"), callback_data: "account" }]]
        }
      });
      
    } else if (query.data === "toggle_notification") {
      const currentStatus = (user as any).notificationsEnabled !== false;
      const newStatus = !currentStatus;
      await storage.updateUser(user.id, { notificationsEnabled: newStatus } as any);
      bot?.answerCallbackQuery(query.id, { text: t(lang, "notificationToggled"), show_alert: true });
      
      await handleAccount(chatId, user, messageId);
    }
  });

  // --- Handlers ---
  async function handlePartners(chatId: number, user: any, messageId?: number) {
    const lang = user.language;
    const botUsername = (await bot?.getMe())?.username;
    const referralLink = `https://t.me/${botUsername}?start=${user.telegramId}`;
    
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
    const partnersKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(lang, "shareReferral"), callback_data: "share_referral" }],
          [{ text: t(lang, "back"), callback_data: "back_to_menu" }]
        ]
      }
    };
    if (messageId) {
      bot?.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: partnersKeyboard.reply_markup });
    } else {
      bot?.sendMessage(chatId, text, { parse_mode: "Markdown", reply_markup: partnersKeyboard.reply_markup });
    }
  }

  async function handleEarnings(chatId: number, user: any, messageId?: number) {
    const lang = user.language;
    const activeTasks = await storage.getActiveTasksForUser(user.id);
    
    if (activeTasks.length === 0) {
      const text = `${t(lang, "earningsTitle")}\n\n${t(lang, "noTasks")}`;
      if (messageId) {
        bot?.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: getBackButton(lang).reply_markup });
      } else {
        bot?.sendMessage(chatId, text, { parse_mode: "Markdown", reply_markup: getBackButton(lang).reply_markup });
      }
    } else {
      const text = `${t(lang, "earningsTitle")}\n\n${t(lang, "newTasks")}`;
      const earningsKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: t(lang, "goToTasks"), callback_data: "task_list" }],
            [{ text: t(lang, "back"), callback_data: "back_to_menu" }]
          ]
        }
      };
      if (messageId) {
        bot?.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: earningsKeyboard.reply_markup });
      } else {
        bot?.sendMessage(chatId, text, { parse_mode: "Markdown", reply_markup: earningsKeyboard.reply_markup });
      }
    }
  }

  async function handleAccount(chatId: number, user: any, messageId?: number) {
    const lang = user.language;
    const notifStatus = (user as any).notificationsEnabled !== false;
    // Format Date: MM/DD/YYYY
    const joinedDate = new Date(user.createdAt || Date.now());
    const formattedDate = `${joinedDate.getMonth() + 1}/${joinedDate.getDate()}/${joinedDate.getFullYear()}`;
    
    const text = `
👤 *Account Info*

📅 Joined: ${formattedDate}
🆔 ID: ${user.telegramId}

⚡ Level: ${user.miningLevel}
💵 Balance: $ ${(user.balance * 2).toFixed(3)} (approx) / ${user.balance.toFixed(8)} TON

👥 Referrals: ${user.referralCount}
🗣️ Language: ${lang === 'en' ? '🇬🇧 English' : lang === 'ru' ? '🇷🇺 Русский' : lang}
🟢 Status: ${user.status.toUpperCase()}
`;
    const accountKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💵 Add funds", callback_data: "add_funds" }, { text: "🏦 Withdraw", callback_data: "withdraw" }],
          [{ text: "🌎 Language", callback_data: "change_language" }],
          [{ text: "📞 Support", callback_data: "support" }],
          [{ text: notifStatus ? "🔔 Notification: ON" : "🔕 Notification: OFF", callback_data: "toggle_notification" }]
        ]
      }
    };
    if (messageId) {
      bot?.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: accountKeyboard.reply_markup });
    } else {
      bot?.sendMessage(chatId, text, { parse_mode: "Markdown", reply_markup: accountKeyboard.reply_markup });
    }
  }

  async function handleWithdraw(chatId: number, user: any, messageId?: number) {
    const lang = user.language;
    const minWithdraw = 0.5;
    const text = `${t(lang, "withdrawTitle")}\n\n${t(lang, "balance")}: ${user.balance.toFixed(8)} TON\n${t(lang, "minWithdraw")}: ${minWithdraw} TON`;
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
    if (messageId) {
      bot?.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: withdrawKeyboard.reply_markup });
    } else {
      bot?.sendMessage(chatId, text, { parse_mode: "Markdown", reply_markup: withdrawKeyboard.reply_markup });
    }
  }

  async function handleFAQ(chatId: number, user: any, messageId?: number) {
    const lang = user.language;
    const text = `
${t(lang, "faqTitle")}

${t(lang, "faqDesc")}

${t(lang, "faqQ1")}
${t(lang, "faqA1")}

${t(lang, "faqQ2")}
${t(lang, "faqA2")}

${t(lang, "faqQ3")}
${t(lang, "faqA3")}

${t(lang, "faqQ4")}
${t(lang, "faqA4")}
`;
    const faqKeyboard = {
      reply_markup: {
        inline_keyboard: [[{ text: t(lang, "back"), callback_data: "back_to_menu" }]]
      }
    };
    if (messageId) {
      bot?.editMessageText(text, { chat_id: chatId, message_id: messageId, parse_mode: "Markdown", reply_markup: faqKeyboard.reply_markup });
    } else {
      bot?.sendMessage(chatId, text, { parse_mode: "Markdown", reply_markup: faqKeyboard.reply_markup });
    }
  }

  console.log("Bot setup complete.");
}
