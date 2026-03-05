import CzechHolidays, {
  HolidayShopRestriction,
  type BridgeDay,
  type LongWeekend,
} from '../src/index';
import { detectLocale, saveLocale, getTranslations, getHolidayLocale, type Locale, type Translations } from './i18n';

let currentYear: number;
let currentMonth: number;
let locale: Locale;
let t: Translations;

function formatDate(date: Date): string {
  return `${date.getDate()} ${t.months[date.getMonth()]}`;
}

function formatDateFull(date: Date): string {
  return `${date.getDate()} ${t.months[date.getMonth()]} ${date.getFullYear()}`;
}

function daysUntil(from: Date, to: Date): number {
  const diff = to.getTime() - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function isInRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return d >= s && d <= e;
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? 6 : day - 1);
  d.setDate(d.getDate() - diff);
  return d;
}

function getBusinessDaysInWeek(date: Date): number {
  const start = getWeekStart(date);
  let count = 0;
  for (let i = 0; i < 5; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (CzechHolidays.isBusinessDay(d)) count++;
  }
  return count;
}

function getYearBusinessDays(year: number): number {
  let count = 0;
  for (let m = 1; m <= 12; m++) {
    count += CzechHolidays.getBusinessDaysInMonth(year, m);
  }
  return count;
}

function getYearHolidaysOnWeekdays(year: number): number {
  const holidays = CzechHolidays.getHolidaysForYear(year);
  return holidays.filter((h) => {
    const d = new Date(year, h.month - 1, h.day);
    return !CzechHolidays.isWeekend(d);
  }).length;
}

function holidayName(holiday: { name: { cs: string; en: string } }): string {
  return holiday.name[getHolidayLocale(locale)];
}

function updateStaticLabels() {
  document.getElementById('page-title')!.textContent = t.title;
  document.getElementById('subtitle-text')!.textContent = t.subtitle;
  document.getElementById('next-holiday-title')!.textContent = t.nextHoliday;
  document.getElementById('month-holidays-title')!.textContent = t.holidaysThisMonth;
  document.getElementById('long-weekends-title')!.textContent = t.longWeekends;
  document.getElementById('bridge-days-title')!.textContent = t.bridgeDays;
  document.getElementById('bridge-hint')!.textContent = t.bridgeHint;
  document.documentElement.lang = locale;

  // Language picker active state
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.lang === locale);
  });

  // Weekday headers
  const headers = document.getElementById('weekday-headers')!;
  headers.innerHTML = t.weekdays.map((d, i) =>
    `<div class="weekday-header${i >= 5 ? ' weekend-header' : ''}">${d}</div>`
  ).join('');

  // Legend
  const legend = document.getElementById('legend')!;
  legend.innerHTML = [
    ['dot-today', t.legendToday],
    ['dot-holiday', t.legendHoliday],
    ['dot-bridge', t.legendBridge],
    ['dot-weekend', t.legendWeekend],
    ['dot-shops-closed', t.legendShopsClosed],
    ['dot-shops-partial', t.legendShopsRestricted],
  ].map(([cls, label]) =>
    `<span class="legend-item"><span class="dot ${cls}"></span> ${label}</span>`
  ).join('');
}

function renderStats() {
  const today = new Date();
  const yearBizDays = getYearBusinessDays(currentYear);
  const monthBizDays = CzechHolidays.getBusinessDaysInMonth(currentYear, currentMonth + 1);
  const weekBizDays = getBusinessDaysInWeek(today);
  const yearHolidaysOnWeekdays = getYearHolidaysOnWeekdays(currentYear);
  const remainingThisMonth = CzechHolidays.getRemainingBusinessDays(today);

  const statsBar = document.getElementById('stats-bar')!;
  statsBar.innerHTML = `
    <div class="stat">
      <div class="stat-value">${yearBizDays}</div>
      <div class="stat-label">${t.workDaysIn(String(currentYear))}</div>
    </div>
    <div class="stat">
      <div class="stat-value">${yearHolidaysOnWeekdays}</div>
      <div class="stat-label">${t.holidaysOnWeekdays}</div>
    </div>
    <div class="stat">
      <div class="stat-value">${monthBizDays}</div>
      <div class="stat-label">${t.workDaysIn(t.months[currentMonth])}</div>
    </div>
    <div class="stat">
      <div class="stat-value">${weekBizDays}</div>
      <div class="stat-label">${t.workDaysThisWeek}</div>
    </div>
    <div class="stat">
      <div class="stat-value">${remainingThisMonth}</div>
      <div class="stat-label">${t.workDaysLeft}</div>
    </div>
  `;
}

function renderCalendar() {
  const today = new Date();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  const longWeekends = CzechHolidays.getLongWeekends(currentYear);
  const bridgeDays = CzechHolidays.getBridgeDays(currentYear);

  document.getElementById('month-title')!.textContent =
    `${t.months[currentMonth]} ${currentYear}`;

  renderStats();

  const cells = document.getElementById('calendar-cells')!;
  cells.innerHTML = '';

  for (let i = 0; i < firstDayOfWeek; i++) {
    const empty = document.createElement('div');
    empty.className = 'day-cell empty';
    cells.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const cell = document.createElement('div');
    const classes: string[] = [];
    const tooltipParts: string[] = [];

    const isToday = isSameDay(date, today);
    const isWeekend = CzechHolidays.isWeekend(date);
    const holiday = CzechHolidays.getHoliday(date);
    const isBridge = bridgeDays.some((bd) => isSameDay(date, bd.date));
    const inLongWeekend = longWeekends.some((lw) => isInRange(date, lw.start, lw.end));

    if (isToday) classes.push('today');
    if (isWeekend) classes.push('weekend');

    if (holiday) {
      classes.push('holiday');
      tooltipParts.push(holidayName(holiday));

      if (holiday.shopRestriction === HolidayShopRestriction.Closed) {
        classes.push('shops-closed');
        tooltipParts.push(t.shopsClosed);
      } else if (holiday.shopRestriction === HolidayShopRestriction.Partial) {
        classes.push('shops-partial');
        tooltipParts.push(t.shopsCloseEarly);
      }
    } else if (isBridge) {
      classes.push('bridge-day');
      const bd = bridgeDays.find((bd) => isSameDay(date, bd.date))!;
      tooltipParts.push(t.bridgeTooltip(bd.totalDaysOff));
    } else if (inLongWeekend && isWeekend) {
      classes.push('long-weekend-day');
    }

    cell.className = ['day-cell', ...classes].join(' ');

    const dayNum = document.createElement('span');
    dayNum.className = 'day-num';
    dayNum.textContent = String(day);
    cell.appendChild(dayNum);

    if (holiday && holiday.shopRestriction !== HolidayShopRestriction.Open) {
      const badge = document.createElement('span');
      badge.className = `shop-badge ${holiday.shopRestriction === HolidayShopRestriction.Closed ? 'closed' : 'partial'}`;
      badge.textContent = holiday.shopRestriction === HolidayShopRestriction.Closed ? '!' : '~';
      cell.appendChild(badge);
    }

    if (tooltipParts.length > 0) {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = tooltipParts.join(' · ');
      cell.appendChild(tooltip);
    }

    cells.appendChild(cell);
  }

  renderSidebar(today, longWeekends, bridgeDays);
}

function renderSidebar(today: Date, longWeekends: LongWeekend[], bridgeDays: BridgeDay[]) {
  const nextHoliday = CzechHolidays.getNextHoliday(today);
  const days = daysUntil(today, nextHoliday.date);
  document.getElementById('next-holiday-content')!.innerHTML = `
    <div class="next-holiday-name">${holidayName(nextHoliday)}</div>
    <div class="next-holiday-date">${formatDateFull(nextHoliday.date)}</div>
    <div class="next-holiday-countdown">${days === 0 ? t.today : days === 1 ? t.tomorrow : t.inDays(days)}</div>
  `;

  const monthHolidays = CzechHolidays.getHolidaysByMonth(currentYear, currentMonth + 1);
  const monthList = document.getElementById('month-holidays-list')!;
  if (monthHolidays.length === 0) {
    monthList.innerHTML = `<div class="empty-message">${t.noHolidays}</div>`;
  } else {
    monthList.innerHTML = monthHolidays.map((h) => `
      <div class="holiday-list-item">
        <div>${holidayName(h)}</div>
        <div class="date">${formatDate(h.date)}${h.isMoveable ? ` ${t.moveable}` : ''}</div>
      </div>
    `).join('');
  }

  const lwList = document.getElementById('long-weekends-list')!;
  if (longWeekends.length === 0) {
    lwList.innerHTML = `<div class="empty-message">${t.none}</div>`;
  } else {
    lwList.innerHTML = longWeekends.map((lw) => `
      <div class="lw-item">
        <div class="lw-dates">${formatDate(lw.start)} – ${formatDate(lw.end)}</div>
        <div class="lw-days">${lw.days} ${t.days} · ${lw.holidays.map((h) => holidayName(h)).join(', ')}</div>
      </div>
    `).join('');
  }

  const bdList = document.getElementById('bridge-days-list')!;
  if (bridgeDays.length === 0) {
    bdList.innerHTML = `<div class="empty-message">${t.none}</div>`;
  } else {
    bdList.innerHTML = bridgeDays.map((bd) => `
      <div class="bridge-item">
        <div class="bridge-date">${formatDateFull(bd.date)}</div>
        <div class="bridge-info">${t.takeOff(bd.totalDaysOff)}</div>
      </div>
    `).join('');
  }
}

function navigate(delta: number) {
  currentMonth += delta;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function setLocale(newLocale: Locale) {
  locale = newLocale;
  t = getTranslations(locale);
  saveLocale(locale);
  updateStaticLabels();
  renderCalendar();
}

// Init
const now = new Date();
currentYear = now.getFullYear();
currentMonth = now.getMonth();
locale = detectLocale();
t = getTranslations(locale);

updateStaticLabels();
renderCalendar();

document.getElementById('prev-month')!.addEventListener('click', () => navigate(-1));
document.getElementById('next-month')!.addEventListener('click', () => navigate(1));

document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    setLocale((btn as HTMLElement).dataset.lang as Locale);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});
