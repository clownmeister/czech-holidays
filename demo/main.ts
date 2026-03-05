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
let viewMode: 'month' | 'year' = 'month';

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

function navigateToDate(date: Date) {
  if (viewMode === 'year') {
    setViewMode('month');
  }
  currentYear = date.getFullYear();
  currentMonth = date.getMonth();
  renderCalendar();

  requestAnimationFrame(() => {
    const cell = document.querySelector(`.day-cell[data-date="${date.getFullYear()}-${date.getMonth()}-${date.getDate()}"]`);
    if (cell) {
      cell.classList.add('flash');
      cell.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => cell.classList.remove('flash'), 1500);
    }
  });
}

function setViewMode(mode: 'month' | 'year') {
  viewMode = mode;
  const monthView = document.getElementById('month-view')!;
  const yearView = document.getElementById('year-view')!;
  const prevBtn = document.getElementById('prev-month')!;
  const toggleIcon = document.getElementById('view-toggle-icon')!;

  if (mode === 'year') {
    monthView.classList.add('hidden');
    yearView.classList.remove('hidden');
    prevBtn.textContent = '\u2190';
    toggleIcon.innerHTML = '&#9776;';
    renderYearOverview();
  } else {
    monthView.classList.remove('hidden');
    yearView.classList.add('hidden');
    toggleIcon.innerHTML = '&#9638;';
  }

  document.getElementById('month-title')!.textContent = mode === 'year'
    ? String(currentYear)
    : `${t.months[currentMonth]} ${currentYear}`;
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

  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.lang === locale);
  });

  const headers = document.getElementById('weekday-headers')!;
  headers.innerHTML = t.weekdays.map((d, i) =>
    `<div class="weekday-header${i >= 5 ? ' weekend-header' : ''}">${d}</div>`
  ).join('');

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

function getDayClasses(date: Date, today: Date, bridgeDays: BridgeDay[], longWeekends: LongWeekend[]): string[] {
  const classes: string[] = [];
  const isToday = isSameDay(date, today);
  const isWeekend = CzechHolidays.isWeekend(date);
  const holiday = CzechHolidays.getHoliday(date);
  const isBridge = bridgeDays.some((bd) => isSameDay(date, bd.date));
  const inLongWeekend = longWeekends.some((lw) => isInRange(date, lw.start, lw.end));

  if (isToday) classes.push('today');
  if (isWeekend) classes.push('weekend');

  if (holiday) {
    classes.push('holiday');
    if (holiday.shopRestriction === HolidayShopRestriction.Closed) {
      classes.push('shops-closed');
    } else if (holiday.shopRestriction === HolidayShopRestriction.Partial) {
      classes.push('shops-partial');
    }
  } else if (isBridge) {
    classes.push('bridge-day');
  } else if (inLongWeekend && isWeekend) {
    classes.push('long-weekend-day');
  }

  return classes;
}

function renderCalendar() {
  const today = new Date();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7;

  const longWeekends = CzechHolidays.getLongWeekends(currentYear);
  const bridgeDays = CzechHolidays.getBridgeDays(currentYear);

  document.getElementById('month-title')!.textContent = viewMode === 'year'
    ? String(currentYear)
    : `${t.months[currentMonth]} ${currentYear}`;

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
    const tooltipParts: string[] = [];

    const holiday = CzechHolidays.getHoliday(date);
    const classes = getDayClasses(date, today, bridgeDays, longWeekends);

    if (holiday) {
      tooltipParts.push(holidayName(holiday));
      if (holiday.shopRestriction === HolidayShopRestriction.Closed) {
        tooltipParts.push(t.shopsClosed);
      } else if (holiday.shopRestriction === HolidayShopRestriction.Partial) {
        tooltipParts.push(t.shopsCloseEarly);
      }
    } else if (classes.includes('bridge-day')) {
      const bd = bridgeDays.find((bd) => isSameDay(date, bd.date))!;
      tooltipParts.push(t.bridgeTooltip(bd.totalDaysOff));
    }

    cell.className = ['day-cell', ...classes].join(' ');
    cell.dataset.date = `${currentYear}-${currentMonth}-${day}`;

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
      tooltip.textContent = tooltipParts.join(' \u00b7 ');
      cell.appendChild(tooltip);
    }

    cells.appendChild(cell);
  }

  renderSidebar(today, longWeekends, bridgeDays);
}

function renderYearOverview() {
  const today = new Date();
  const yearView = document.getElementById('year-view')!;
  const longWeekends = CzechHolidays.getLongWeekends(currentYear);
  const bridgeDays = CzechHolidays.getBridgeDays(currentYear);

  yearView.innerHTML = '';

  for (let month = 0; month < 12; month++) {
    const miniMonth = document.createElement('div');
    miniMonth.className = 'mini-month';
    miniMonth.addEventListener('click', () => {
      currentMonth = month;
      setViewMode('month');
      renderCalendar();
    });

    const title = document.createElement('div');
    title.className = 'mini-month-title';
    title.textContent = t.months[month];
    miniMonth.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'mini-grid';

    // Weekday headers
    for (let w = 0; w < 7; w++) {
      const wh = document.createElement('div');
      wh.className = 'mini-weekday';
      wh.textContent = t.weekdays[w][0];
      grid.appendChild(wh);
    }

    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    const firstDayOfWeek = (new Date(currentYear, month, 1).getDay() + 6) % 7;

    for (let i = 0; i < firstDayOfWeek; i++) {
      const empty = document.createElement('div');
      empty.className = 'mini-day empty';
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, month, day);
      const cell = document.createElement('div');
      const classes = getDayClasses(date, today, bridgeDays, longWeekends);
      cell.className = ['mini-day', ...classes].join(' ');

      const holiday = CzechHolidays.getHoliday(date);
      if (holiday) {
        cell.title = holidayName(holiday);
      }

      grid.appendChild(cell);
    }

    miniMonth.appendChild(grid);
    yearView.appendChild(miniMonth);
  }
}

function renderSidebar(today: Date, longWeekends: LongWeekend[], bridgeDays: BridgeDay[]) {
  const nextHoliday = CzechHolidays.getNextHoliday(today);
  const days = daysUntil(today, nextHoliday.date);
  const nextHolidayContent = document.getElementById('next-holiday-content')!;
  nextHolidayContent.innerHTML = `
    <div class="next-holiday-name">${holidayName(nextHoliday)}</div>
    <div class="next-holiday-date">${formatDateFull(nextHoliday.date)}</div>
    <div class="next-holiday-countdown">${days === 0 ? t.today : days === 1 ? t.tomorrow : t.inDays(days)}</div>
  `;
  nextHolidayContent.classList.add('clickable');
  nextHolidayContent.onclick = () => navigateToDate(nextHoliday.date);

  const monthHolidays = CzechHolidays.getHolidaysByMonth(currentYear, currentMonth + 1);
  const monthList = document.getElementById('month-holidays-list')!;
  if (monthHolidays.length === 0) {
    monthList.innerHTML = `<div class="empty-message">${t.noHolidays}</div>`;
  } else {
    monthList.innerHTML = monthHolidays.map((h, i) => `
      <div class="holiday-list-item clickable" data-sidebar-idx="${i}">
        <div>${holidayName(h)}</div>
        <div class="date">${formatDate(h.date)}${h.isMoveable ? ` ${t.moveable}` : ''}</div>
      </div>
    `).join('');
    monthList.querySelectorAll('.holiday-list-item').forEach((el, i) => {
      el.addEventListener('click', () => navigateToDate(monthHolidays[i].date));
    });
  }

  const lwList = document.getElementById('long-weekends-list')!;
  if (longWeekends.length === 0) {
    lwList.innerHTML = `<div class="empty-message">${t.none}</div>`;
  } else {
    lwList.innerHTML = longWeekends.map((lw) => `
      <div class="lw-item clickable">
        <div class="lw-dates">${formatDate(lw.start)} \u2013 ${formatDate(lw.end)}</div>
        <div class="lw-days">${lw.days} ${t.days} \u00b7 ${lw.holidays.map((h) => holidayName(h)).join(', ')}</div>
      </div>
    `).join('');
    lwList.querySelectorAll('.lw-item').forEach((el, i) => {
      el.addEventListener('click', () => navigateToDate(longWeekends[i].holidays[0].date));
    });
  }

  const bdList = document.getElementById('bridge-days-list')!;
  if (bridgeDays.length === 0) {
    bdList.innerHTML = `<div class="empty-message">${t.none}</div>`;
  } else {
    bdList.innerHTML = bridgeDays.map((bd) => `
      <div class="bridge-item clickable">
        <div class="bridge-date">${formatDateFull(bd.date)}</div>
        <div class="bridge-info">${t.takeOff(bd.totalDaysOff)}</div>
      </div>
    `).join('');
    bdList.querySelectorAll('.bridge-item').forEach((el, i) => {
      el.addEventListener('click', () => navigateToDate(bridgeDays[i].date));
    });
  }
}

function navigate(delta: number) {
  if (viewMode === 'year') {
    currentYear += delta;
    document.getElementById('month-title')!.textContent = String(currentYear);
    renderYearOverview();
    renderStats();
    return;
  }
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
  if (viewMode === 'year') {
    renderYearOverview();
    document.getElementById('month-title')!.textContent = String(currentYear);
  }
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

document.getElementById('view-toggle')!.addEventListener('click', () => {
  setViewMode(viewMode === 'month' ? 'year' : 'month');
  if (viewMode === 'month') renderCalendar();
});

document.querySelectorAll('.lang-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    setLocale((btn as HTMLElement).dataset.lang as Locale);
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});
