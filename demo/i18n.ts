export type Locale = 'cs' | 'en';

const STORAGE_KEY = 'czech-holidays-locale';

const translations = {
  en: {
    title: 'Czech Holidays',
    subtitle: 'Interactive calendar powered by',
    workDaysIn: (s: string) => `Work days in ${s}`,
    holidaysOnWeekdays: 'Holidays on weekdays',
    workDaysThisWeek: 'Work days this week',
    workDaysLeft: 'Work days left this month',
    nextHoliday: 'Next holiday',
    holidaysThisMonth: 'Holidays this month',
    longWeekends: 'Long weekends this year',
    bridgeDays: 'Bridge days this year',
    bridgeHint: 'Take 1 day off, get a longer break',
    noHolidays: 'No holidays this month',
    none: 'None this year',
    today: 'Today!',
    tomorrow: 'Tomorrow!',
    inDays: (n: number) => `in ${n} days`,
    days: 'days',
    takeOff: (n: number) => `Take 1 day off → ${n} days free`,
    bridgeTooltip: (n: number) => `Bridge day — take off for ${n} days free`,
    shopsClosed: 'Shops closed',
    shopsCloseEarly: 'Shops close early',
    moveable: '(moveable)',
    legendToday: 'Today',
    legendHoliday: 'Holiday',
    legendBridge: 'Bridge day',
    legendWeekend: 'Weekend',
    legendShopsClosed: 'Shops closed',
    legendShopsRestricted: 'Shops restricted',
    weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  },
  cs: {
    title: 'České svátky',
    subtitle: 'Interaktivní kalendář s využitím',
    workDaysIn: (s: string) => `Pracovní dny v ${s}`,
    holidaysOnWeekdays: 'Svátky v pracovní dny',
    workDaysThisWeek: 'Pracovní dny tento týden',
    workDaysLeft: 'Pracovní dny do konce měsíce',
    nextHoliday: 'Další svátek',
    holidaysThisMonth: 'Svátky tento měsíc',
    longWeekends: 'Prodloužené víkendy letos',
    bridgeDays: 'Překlenovací dny letos',
    bridgeHint: 'Vezmi si 1 den volna, získej delší pauzu',
    noHolidays: 'Žádné svátky tento měsíc',
    none: 'Žádné letos',
    today: 'Dnes!',
    tomorrow: 'Zítra!',
    inDays: (n: number) => `za ${n} ${n === 1 ? 'den' : n < 5 ? 'dny' : 'dní'}`,
    days: 'dní',
    takeOff: (n: number) => `Vezmi 1 den → ${n} dní volna`,
    bridgeTooltip: (n: number) => `Překlenovací den — ${n} dní volna`,
    shopsClosed: 'Obchody zavřeny',
    shopsCloseEarly: 'Obchody zavírají dříve',
    moveable: '(pohyblivý)',
    legendToday: 'Dnes',
    legendHoliday: 'Svátek',
    legendBridge: 'Překlenovací den',
    legendWeekend: 'Víkend',
    legendShopsClosed: 'Obchody zavřeny',
    legendShopsRestricted: 'Omezení obchodů',
    weekdays: ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
    months: [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
    ],
  },
} as const;

export type Translations = typeof translations['en'];

export function detectLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'cs' || stored === 'en') return stored;

  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('cs') || lang.startsWith('sk')) return 'cs';
  return 'en';
}

export function saveLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale);
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale];
}

export function getHolidayLocale(locale: Locale): 'cs' | 'en' {
  return locale;
}
