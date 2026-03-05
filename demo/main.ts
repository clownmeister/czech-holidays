import CzechHolidays, {
  HolidayShopRestriction,
  type BridgeDay,
  type LongWeekend,
} from '../src/index';

let currentYear: number;
let currentMonth: number;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

function formatDateFull(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
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
  const diff = (day === 0 ? 6 : day - 1); // Monday = 0
  d.setDate(d.getDate() - diff);
  return d;
}

function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

function getBusinessDaysInWeek(date: Date): number {
  const start = getWeekStart(date);
  let count = 0;
  for (let i = 0; i < 5; i++) { // Mon-Fri
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
      <div class="stat-label">Work days in ${currentYear}</div>
    </div>
    <div class="stat">
      <div class="stat-value">${yearHolidaysOnWeekdays}</div>
      <div class="stat-label">Holidays on weekdays</div>
    </div>
    <div class="stat">
      <div class="stat-value">${monthBizDays}</div>
      <div class="stat-label">Work days in ${MONTH_NAMES[currentMonth]}</div>
    </div>
    <div class="stat">
      <div class="stat-value">${weekBizDays}</div>
      <div class="stat-label">Work days this week</div>
    </div>
    <div class="stat">
      <div class="stat-value">${remainingThisMonth}</div>
      <div class="stat-label">Work days left this month</div>
    </div>
  `;
}

function renderCalendar() {
  const today = new Date();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Mon=0

  const longWeekends = CzechHolidays.getLongWeekends(currentYear);
  const bridgeDays = CzechHolidays.getBridgeDays(currentYear);

  // Month title
  document.getElementById('month-title')!.textContent =
    `${MONTH_NAMES[currentMonth]} ${currentYear}`;

  // Stats
  renderStats();

  // Calendar cells
  const cells = document.getElementById('calendar-cells')!;
  cells.innerHTML = '';

  // Empty cells before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    const empty = document.createElement('div');
    empty.className = 'day-cell empty';
    cells.appendChild(empty);
  }

  // Day cells
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
      tooltipParts.push(holiday.name.en);

      if (holiday.shopRestriction === HolidayShopRestriction.Closed) {
        classes.push('shops-closed');
        tooltipParts.push('Shops closed');
      } else if (holiday.shopRestriction === HolidayShopRestriction.Partial) {
        classes.push('shops-partial');
        tooltipParts.push('Shops close early');
      }
    } else if (isBridge) {
      classes.push('bridge-day');
      const bd = bridgeDays.find((bd) => isSameDay(date, bd.date))!;
      tooltipParts.push(`Bridge day — take off for ${bd.totalDaysOff} days free`);
    } else if (inLongWeekend && isWeekend) {
      classes.push('long-weekend-day');
    }

    cell.className = ['day-cell', ...classes].join(' ');

    // Day number
    const dayNum = document.createElement('span');
    dayNum.className = 'day-num';
    dayNum.textContent = String(day);
    cell.appendChild(dayNum);

    // Shop restriction indicator
    if (holiday && holiday.shopRestriction !== HolidayShopRestriction.Open) {
      const badge = document.createElement('span');
      badge.className = `shop-badge ${holiday.shopRestriction === HolidayShopRestriction.Closed ? 'closed' : 'partial'}`;
      badge.textContent = holiday.shopRestriction === HolidayShopRestriction.Closed ? '!' : '~';
      cell.appendChild(badge);
    }

    // Tooltip
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
  // Next holiday
  const nextHoliday = CzechHolidays.getNextHoliday(today);
  const nextHolidayContent = document.getElementById('next-holiday-content')!;
  const days = daysUntil(today, nextHoliday.date);
  nextHolidayContent.innerHTML = `
    <div class="next-holiday-name">${nextHoliday.name.en}</div>
    <div class="next-holiday-date">${formatDateFull(nextHoliday.date)}</div>
    <div class="next-holiday-countdown">${days === 0 ? 'Today!' : days === 1 ? 'Tomorrow!' : `in ${days} days`}</div>
  `;

  // Month holidays
  const monthHolidays = CzechHolidays.getHolidaysByMonth(currentYear, currentMonth + 1);
  const monthList = document.getElementById('month-holidays-list')!;
  if (monthHolidays.length === 0) {
    monthList.innerHTML = '<div class="empty-message">No holidays this month</div>';
  } else {
    monthList.innerHTML = monthHolidays.map((h) => `
      <div class="holiday-list-item">
        <div>${h.name.en}</div>
        <div class="date">${formatDate(h.date)}${h.isMoveable ? ' (moveable)' : ''}</div>
      </div>
    `).join('');
  }

  // Long weekends
  const lwList = document.getElementById('long-weekends-list')!;
  if (longWeekends.length === 0) {
    lwList.innerHTML = '<div class="empty-message">None this year</div>';
  } else {
    lwList.innerHTML = longWeekends.map((lw) => `
      <div class="lw-item">
        <div class="lw-dates">${formatDate(lw.start)} – ${formatDate(lw.end)}</div>
        <div class="lw-days">${lw.days} days · ${lw.holidays.map((h) => h.name.en).join(', ')}</div>
      </div>
    `).join('');
  }

  // Bridge days
  const bdList = document.getElementById('bridge-days-list')!;
  if (bridgeDays.length === 0) {
    bdList.innerHTML = '<div class="empty-message">None this year</div>';
  } else {
    bdList.innerHTML = bridgeDays.map((bd) => `
      <div class="bridge-item">
        <div class="bridge-date">${formatDateFull(bd.date)}</div>
        <div class="bridge-info">Take 1 day off → ${bd.totalDaysOff} days free</div>
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

// Init
const now = new Date();
currentYear = now.getFullYear();
currentMonth = now.getMonth();

document.getElementById('prev-month')!.addEventListener('click', () => navigate(-1));
document.getElementById('next-month')!.addEventListener('click', () => navigate(1));

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') navigate(-1);
  if (e.key === 'ArrowRight') navigate(1);
});

renderCalendar();
