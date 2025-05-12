// lib/telegram-translations.ts
// Define the translation interface
interface TelegramTranslations {
  // Connection related
  connectionFailed: string;
  alreadyConnected: string;
  connectionProblem: string;
  connectionError: string;
  technicalProblem: string;
  successfullyConnected: string;
  accountLinked: string;

  // Welcome messages
  welcomeToVocabry: string;
  botDescription: string;
  toConnectAccount: string;
  goToProfile: string;
  openNotifications: string;
  clickConnect: string;
  needHelp: string;
  welcomeMessage: string;

  // Command descriptions
  commands: string;
  checkNotifications: string;
  pauseNotifications: string;
  resumeNotifications: string;
  showCommands: string;
  useHelp: string;
  toPause: string;
  toResume: string;
  useStartToResume: string;

  // Status related
  notificationStatus: string;
  telegramNotifications: string;
  emailNotifications: string;
  enabled: string;
  disabled: string;
  youCanUse: string;
  accountNotConnected: string;
  telegramNotLinked: string;
  accountNotFound: string;
  error: string;
  couldNotUpdateSettings: string;
  notificationsPaused: string;
  noLongerReceiveReminders: string;

  // Help content
  vocabryBotCommands: string;
  connectAndEnable: string;
  showHelp: string;
  aboutVocabry: string;
  vocabryHelpsYou: string;
  youllReceiveReminders: string;
  oneHour: string;
  threeHours: string;
  eightHours: string;
  oneDay: string;
  threeDays: string;
  sevenDays: string;
}

// Available languages
const SUPPORTED_LANGUAGES = ['en', 'ru', 'es', 'de', 'uz', 'fr', 'zh', 'ja'];

// Default English translations
const defaultTranslations: TelegramTranslations = {
  // Connection related
  connectionFailed: "Connection Failed",
  alreadyConnected: "This Telegram account is already connected to a different Vocabry account. Please disconnect it first before connecting to a new account.",
  connectionProblem: "There was a problem connecting your Telegram account. Please try again or contact support.",
  connectionError: "Connection Error",
  technicalProblem: "There was a technical problem connecting your account. Please try again later.",
  successfullyConnected: "Successfully Connected!",
  accountLinked: "Your Telegram account is now linked to your Vocabry account. You'll receive vocabulary review reminders here.",

  // Welcome messages
  welcomeToVocabry: "Welcome to Vocabry!",
  botDescription: "This bot helps you remember new vocabulary words using spaced repetition.",
  toConnectAccount: "To connect your account, please",
  goToProfile: "Go to your Vocabry profile settings",
  openNotifications: "Open the Notifications tab",
  clickConnect: "Click the \"Connect\" button",
  needHelp: "Need help? Visit our website for more information.",
  welcomeMessage: "Welcome to Vocabry! I can help you review vocabulary words through scheduled notifications.",

  // Command descriptions
  commands: "Commands",
  checkNotifications: "Check your notification settings",
  pauseNotifications: "Pause Telegram notifications",
  resumeNotifications: "Resume Telegram notifications",
  showCommands: "Show available commands",
  useHelp: "Use /help to see available commands.",
  toPause: "to pause Telegram notifications",
  toResume: "to resume notifications",
  useStartToResume: "Use /start command to resume notifications anytime.",

  // Status related
  notificationStatus: "Notification Status",
  telegramNotifications: "Telegram notifications",
  emailNotifications: "Email notifications",
  enabled: "Enabled",
  disabled: "Disabled",
  youCanUse: "You can use",
  accountNotConnected: "Account Not Connected",
  telegramNotLinked: "Your Telegram account is not linked to any Vocabry account. Please connect your account through the Vocabry app settings.",
  accountNotFound: "Account Not Found",
  error: "Error",
  couldNotUpdateSettings: "Could not update your notification settings. Please try again later.",
  notificationsPaused: "Notifications Paused",
  noLongerReceiveReminders: "You will no longer receive vocabulary reminders via Telegram.",

  // Help content
  vocabryBotCommands: "Vocabry Bot Commands",
  connectAndEnable: "Connect account and enable notifications",
  showHelp: "Show this help message",
  aboutVocabry: "About Vocabry",
  vocabryHelpsYou: "Vocabry helps you remember new words through spaced repetition.",
  youllReceiveReminders: "You'll receive reminders at scientifically optimized intervals",
  oneHour: "1 hour after adding a word",
  threeHours: "3 hours later",
  eightHours: "8 hours later",
  oneDay: "1 day later",
  threeDays: "3 days later",
  sevenDays: "7 days later"
};

// Russian translations
const russianTranslations: TelegramTranslations = {
  // Connection related
  connectionFailed: "Ошибка Подключения",
  alreadyConnected: "Этот аккаунт Telegram уже подключен к другому аккаунту Vocabry. Пожалуйста, отключите его перед подключением к новому аккаунту.",
  connectionProblem: "Возникла проблема при подключении вашего аккаунта Telegram. Пожалуйста, попробуйте снова или свяжитесь с поддержкой.",
  connectionError: "Ошибка Соединения",
  technicalProblem: "Возникла техническая проблема при подключении вашего аккаунта. Пожалуйста, попробуйте позже.",
  successfullyConnected: "Успешно Подключено!",
  accountLinked: "Ваш аккаунт Telegram теперь привязан к вашему аккаунту Vocabry. Вы будете получать напоминания для повторения слов здесь.",

  // Welcome messages
  welcomeToVocabry: "Добро пожаловать в Vocabry!",
  botDescription: "Этот бот помогает вам запоминать новые слова с помощью интервального повторения.",
  toConnectAccount: "Чтобы подключить свой аккаунт, пожалуйста",
  goToProfile: "Перейдите в настройки профиля Vocabry",
  openNotifications: "Откройте вкладку Уведомления",
  clickConnect: "Нажмите кнопку \"Подключить\"",
  needHelp: "Нужна помощь? Посетите наш сайт для получения дополнительной информации.",
  welcomeMessage: "Добро пожаловать в Vocabry! Я могу помочь вам повторять словарные слова через запланированные уведомления.",

  // Command descriptions
  commands: "Команды",
  checkNotifications: "Проверить настройки уведомлений",
  pauseNotifications: "Приостановить уведомления Telegram",
  resumeNotifications: "Возобновить уведомления Telegram",
  showCommands: "Показать доступные команды",
  useHelp: "Используйте /help чтобы увидеть доступные команды.",
  toPause: "чтобы приостановить уведомления Telegram",
  toResume: "чтобы возобновить уведомления",
  useStartToResume: "Используйте команду /start, чтобы возобновить уведомления в любое время.",

  // Status related
  notificationStatus: "Статус Уведомлений",
  telegramNotifications: "Уведомления Telegram",
  emailNotifications: "Уведомления по электронной почте",
  enabled: "Включены",
  disabled: "Отключены",
  youCanUse: "Вы можете использовать",
  accountNotConnected: "Аккаунт Не Подключен",
  telegramNotLinked: "Ваш аккаунт Telegram не привязан ни к одному аккаунту Vocabry. Пожалуйста, подключите свой аккаунт через настройки приложения Vocabry.",
  accountNotFound: "Аккаунт Не Найден",
  error: "Ошибка",
  couldNotUpdateSettings: "Не удалось обновить настройки уведомлений. Пожалуйста, попробуйте позже.",
  notificationsPaused: "Уведомления Приостановлены",
  noLongerReceiveReminders: "Вы больше не будете получать напоминания о словах через Telegram.",

  // Help content
  vocabryBotCommands: "Команды Бота Vocabry",
  connectAndEnable: "Подключить аккаунт и включить уведомления",
  showHelp: "Показать это сообщение помощи",
  aboutVocabry: "О Vocabry",
  vocabryHelpsYou: "Vocabry помогает вам запоминать новые слова с помощью интервального повторения.",
  youllReceiveReminders: "Вы будете получать напоминания в научно оптимизированные интервалы",
  oneHour: "через 1 час после добавления слова",
  threeHours: "спустя 3 часа",
  eightHours: "спустя 8 часов",
  oneDay: "спустя 1 день",
  threeDays: "спустя 3 дня",
  sevenDays: "спустя 7 дней"
};

// Spanish translations
const spanishTranslations: TelegramTranslations = {
  // Connection related
  connectionFailed: "Conexión Fallida",
  alreadyConnected: "Esta cuenta de Telegram ya está conectada a una cuenta diferente de Vocabry. Por favor, desconéctala primero antes de conectarla a una nueva cuenta.",
  connectionProblem: "Hubo un problema al conectar tu cuenta de Telegram. Por favor, intenta de nuevo o contacta con soporte.",
  connectionError: "Error de Conexión",
  technicalProblem: "Hubo un problema técnico al conectar tu cuenta. Por favor, intenta más tarde.",
  successfullyConnected: "¡Conectado Exitosamente!",
  accountLinked: "Tu cuenta de Telegram ahora está vinculada a tu cuenta de Vocabry. Recibirás recordatorios de repaso de vocabulario aquí.",

  // Welcome messages
  welcomeToVocabry: "¡Bienvenido a Vocabry!",
  botDescription: "Este bot te ayuda a recordar nuevas palabras de vocabulario utilizando repetición espaciada.",
  toConnectAccount: "Para conectar tu cuenta, por favor",
  goToProfile: "Ve a la configuración de tu perfil de Vocabry",
  openNotifications: "Abre la pestaña de Notificaciones",
  clickConnect: "Haz clic en el botón \"Conectar\"",
  needHelp: "¿Necesitas ayuda? Visita nuestro sitio web para más información.",
  welcomeMessage: "¡Bienvenido a Vocabry! Puedo ayudarte a repasar palabras de vocabulario a través de notificaciones programadas.",

  // Command descriptions
  commands: "Comandos",
  checkNotifications: "Revisar la configuración de tus notificaciones",
  pauseNotifications: "Pausar notificaciones de Telegram",
  resumeNotifications: "Reanudar notificaciones de Telegram",
  showCommands: "Mostrar comandos disponibles",
  useHelp: "Usa /help para ver los comandos disponibles.",
  toPause: "para pausar las notificaciones de Telegram",
  toResume: "para reanudar las notificaciones",
  useStartToResume: "Usa el comando /start para reanudar las notificaciones en cualquier momento.",

  // Status related
  notificationStatus: "Estado de Notificaciones",
  telegramNotifications: "Notificaciones de Telegram",
  emailNotifications: "Notificaciones por email",
  enabled: "Activadas",
  disabled: "Desactivadas",
  youCanUse: "Puedes usar",
  accountNotConnected: "Cuenta No Conectada",
  telegramNotLinked: "Tu cuenta de Telegram no está vinculada a ninguna cuenta de Vocabry. Por favor, conecta tu cuenta a través de la configuración de la aplicación Vocabry.",
  accountNotFound: "Cuenta No Encontrada",
  error: "Error",
  couldNotUpdateSettings: "No se pudo actualizar la configuración de notificaciones. Por favor, intenta más tarde.",
  notificationsPaused: "Notificaciones Pausadas",
  noLongerReceiveReminders: "Ya no recibirás recordatorios de vocabulario a través de Telegram.",

  // Help content
  vocabryBotCommands: "Comandos del Bot de Vocabry",
  connectAndEnable: "Conectar cuenta y activar notificaciones",
  showHelp: "Mostrar este mensaje de ayuda",
  aboutVocabry: "Acerca de Vocabry",
  vocabryHelpsYou: "Vocabry te ayuda a recordar nuevas palabras a través de repetición espaciada.",
  youllReceiveReminders: "Recibirás recordatorios en intervalos científicamente optimizados",
  oneHour: "1 hora después de añadir una palabra",
  threeHours: "3 horas después",
  eightHours: "8 horas después",
  oneDay: "1 día después",
  threeDays: "3 días después",
  sevenDays: "7 días después"
};

// German translations
const germanTranslations: TelegramTranslations = {
  // Connection related
  connectionFailed: "Verbindung fehlgeschlagen",
  alreadyConnected: "Dieses Telegram-Konto ist bereits mit einem anderen Vocabry-Konto verbunden. Bitte trenne zuerst die Verbindung, bevor du es mit einem neuen Konto verbindest.",
  connectionProblem: "Es gab ein Problem beim Verbinden deines Telegram-Kontos. Bitte versuche es erneut oder kontaktiere den Support.",
  connectionError: "Verbindungsfehler",
  technicalProblem: "Es gab ein technisches Problem beim Verbinden deines Kontos. Bitte versuche es später erneut.",
  successfullyConnected: "Erfolgreich verbunden!",
  accountLinked: "Dein Telegram-Konto ist jetzt mit deinem Vocabry-Konto verknüpft. Du erhältst hier Erinnerungen zur Vokabelwiederholung.",

  // Welcome messages
  welcomeToVocabry: "Willkommen bei Vocabry!",
  botDescription: "Dieser Bot hilft dir, neue Vokabeln mithilfe von zeitlich verteiltem Wiederholen zu merken.",
  toConnectAccount: "Um dein Konto zu verbinden, bitte",
  goToProfile: "Gehe zu deinen Vocabry-Profileinstellungen",
  openNotifications: "Öffne die Registerkarte Benachrichtigungen",
  clickConnect: "Klicke auf die Schaltfläche \"Verbinden\"",
  needHelp: "Brauchst du Hilfe? Besuche unsere Website für weitere Informationen.",
  welcomeMessage: "Willkommen bei Vocabry! Ich kann dir helfen, Vokabeln durch geplante Benachrichtigungen zu wiederholen.",

  // Command descriptions
  commands: "Befehle",
  checkNotifications: "Überprüfe deine Benachrichtigungseinstellungen",
  pauseNotifications: "Pausiere Telegram-Benachrichtigungen",
  resumeNotifications: "Setze Telegram-Benachrichtigungen fort",
  showCommands: "Zeige verfügbare Befehle",
  useHelp: "Verwende /help, um verfügbare Befehle zu sehen.",
  toPause: "um Telegram-Benachrichtigungen zu pausieren",
  toResume: "um Benachrichtigungen fortzusetzen",
  useStartToResume: "Verwende den Befehl /start, um Benachrichtigungen jederzeit fortzusetzen.",

  // Status related
  notificationStatus: "Benachrichtigungsstatus",
  telegramNotifications: "Telegram-Benachrichtigungen",
  emailNotifications: "E-Mail-Benachrichtigungen",
  enabled: "Aktiviert",
  disabled: "Deaktiviert",
  youCanUse: "Du kannst verwenden",
  accountNotConnected: "Konto nicht verbunden",
  telegramNotLinked: "Dein Telegram-Konto ist mit keinem Vocabry-Konto verknüpft. Bitte verbinde dein Konto über die Einstellungen der Vocabry-App.",
  accountNotFound: "Konto nicht gefunden",
  error: "Fehler",
  couldNotUpdateSettings: "Deine Benachrichtigungseinstellungen konnten nicht aktualisiert werden. Bitte versuche es später erneut.",
  notificationsPaused: "Benachrichtigungen pausiert",
  noLongerReceiveReminders: "Du erhältst keine Vokabelerinnerungen mehr über Telegram.",

  // Help content
  vocabryBotCommands: "Vocabry-Bot-Befehle",
  connectAndEnable: "Konto verbinden und Benachrichtigungen aktivieren",
  showHelp: "Zeige diese Hilfemeldung",
  aboutVocabry: "Über Vocabry",
  vocabryHelpsYou: "Vocabry hilft dir, neue Wörter durch zeitlich verteiltes Wiederholen zu merken.",
  youllReceiveReminders: "Du erhältst Erinnerungen in wissenschaftlich optimierten Intervallen",
  oneHour: "1 Stunde nach dem Hinzufügen eines Wortes",
  threeHours: "3 Stunden später",
  eightHours: "8 Stunden später",
  oneDay: "1 Tag später",
  threeDays: "3 Tage später",
  sevenDays: "7 Tage später"
};

// Uzbek translations
const uzbekTranslations: TelegramTranslations = {
  // Connection related
  connectionFailed: "Ulanish muvaffaqiyatsiz tugadi",
  alreadyConnected: "Bu Telegram hisobi allaqachon boshqa Vocabry hisobiga ulangan. Iltimos, yangi hisobga ulanishdan oldin uni uzib qo'ying.",
  connectionProblem: "Telegram hisobingizni ulashda muammo yuz berdi. Iltimos, qayta urinib ko'ring yoki yordam xizmatiga murojaat qiling.",
  connectionError: "Ulanish xatosi",
  technicalProblem: "Hisobingizni ulashda texnik muammo yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
  successfullyConnected: "Muvaffaqiyatli ulandi!",
  accountLinked: "Sizning Telegram hisobingiz endi Vocabry hisobingizga bog'langan. Siz bu yerda so'z takrorlash eslatmalarini olasiz.",

  // Welcome messages
  welcomeToVocabry: "Vocabry'ga xush kelibsiz!",
  botDescription: "Bu bot sizga vaqt oralig'ida takrorlash orqali yangi so'zlarni eslab qolishga yordam beradi.",
  toConnectAccount: "Hisobingizni ulash uchun, iltimos",
  goToProfile: "Vocabry profil sozlamalaringizga o'ting",
  openNotifications: "Bildirishnomalar yorlig'ini oching",
  clickConnect: "\"Ulash\" tugmasini bosing",
  needHelp: "Yordam kerakmi? Qo'shimcha ma'lumot uchun veb-saytimizga tashrif buyuring.",
  welcomeMessage: "Vocabry'ga xush kelibsiz! Men sizga rejalashtirilgan bildirishnomalar orqali so'zlarni takrorlashga yordam bera olaman.",

  // Command descriptions
  commands: "Buyruqlar",
  checkNotifications: "Bildirishnoma sozlamalaringizni tekshiring",
  pauseNotifications: "Telegram bildirishnomalarini to'xtatib turing",
  resumeNotifications: "Telegram bildirishnomalarini davom ettiring",
  showCommands: "Mavjud buyruqlarni ko'rsating",
  useHelp: "Mavjud buyruqlarni ko'rish uchun /help dan foydalaning.",
  toPause: "Telegram bildirishnomalarini to'xtatib turish uchun",
  toResume: "bildirishnomalarni davom ettirish uchun",
  useStartToResume: "Bildirishnomalarni istalgan vaqtda davom ettirish uchun /start buyrug'idan foydalaning.",

  // Status related
  notificationStatus: "Bildirishnoma holati",
  telegramNotifications: "Telegram bildirishnomalari",
  emailNotifications: "Elektron pochta bildirishnomalari",
  enabled: "Yoqilgan",
  disabled: "O'chirilgan",
  youCanUse: "Siz foydalanishingiz mumkin",
  accountNotConnected: "Hisob ulanmagan",
  telegramNotLinked: "Sizning Telegram hisobingiz hech qanday Vocabry hisobiga bog'lanmagan. Iltimos, hisobingizni Vocabry ilovasi sozlamalari orqali ulang.",
  accountNotFound: "Hisob topilmadi",
  error: "Xato",
  couldNotUpdateSettings: "Bildirishnoma sozlamalaringizni yangilab bo'lmadi. Iltimos, keyinroq qayta urinib ko'ring.",
  notificationsPaused: "Bildirishnomalar to'xtatildi",
  noLongerReceiveReminders: "Endi siz Telegram orqali so'z eslatmalarini olmaysiz.",

  // Help content
  vocabryBotCommands: "Vocabry bot buyruqlari",
  connectAndEnable: "Hisobni ulash va bildirishnomalarni yoqish",
  showHelp: "Ushbu yordam xabarini ko'rsatish",
  aboutVocabry: "Vocabry haqida",
  vocabryHelpsYou: "Vocabry sizga vaqt oralig'ida takrorlash orqali yangi so'zlarni eslab qolishga yordam beradi.",
  youllReceiveReminders: "Siz ilmiy jihatdan optimallashtirilgan vaqt oraliqlarida eslatmalar olasiz",
  oneHour: "so'z qo'shilgandan 1 soat keyin",
  threeHours: "3 soat o'tgach",
  eightHours: "8 soat o'tgach",
  oneDay: "1 kun o'tgach",
  threeDays: "3 kun o'tgach",
  sevenDays: "7 kun o'tgach"
};

// Language map for all translations
const translations = {
  en: defaultTranslations,
  ru: russianTranslations,
  es: spanishTranslations,
  de: germanTranslations,
  uz: uzbekTranslations,
  // For now, all other languages will fallback to English
};

/**
 * Gets translations for the specified language code
 * @param langCode ISO language code (e.g., 'en', 'ru', 'es')
 * @returns Translation object for the language, or English if not supported
 */
export async function getTranslations(langCode: string): Promise<TelegramTranslations> {
  // Extract primary language if langCode contains region (e.g., 'en-US' -> 'en')
  const primaryLang = langCode.split('-')[0].toLowerCase();

  // Return translations for the language or default to English
  return translations[primaryLang as keyof typeof translations] || defaultTranslations;
}

/**
 * Get a list of supported languages
 * @returns Array of supported language codes
 */
export function getSupportedLanguages(): string[] {
  return SUPPORTED_LANGUAGES;
}
