import { getEasterHolidays, getFixedHolidays } from '@app/components/DataProvider.ts';
import {
  BridgeDay,
  DatedHoliday,
  Holiday,
  HolidayShopRestriction,
  HolidaySupportedLocales,
  LongWeekend
} from '@app/components/types.ts';

export type { LocalizedText, Holiday, DatedHoliday, LongWeekend, BridgeDay } from '@app/components/types.ts';
export { HolidayShopRestriction, HolidaySupportedLocales } from '@app/components/types.ts';

const CzechHolidays = (() => {
  const fixedHolidays: Holiday[] = getFixedHolidays();
  const cache = new Map<number, Holiday[]>();
  const mapCache = new Map<number, Map<string, Holiday>>();

  function getHolidayMap(year: number): Map<string, Holiday> {
    let map = mapCache.get(year);
    if (!map) {
      const holidays = getHolidaysForYear(year);
      map = new Map<string, Holiday>();
      holidays.forEach((h) => map!.set(`${h.day}-${h.month}`, h));
      mapCache.set(year, map);
    }
    return map;
  }

  function getMapKey(date: Date): { key: string; year: number } {
    return {
      key: `${date.getDate()}-${date.getMonth() + 1}`,
      year: date.getFullYear()
    };
  }

  function toDatedHoliday(holiday: Holiday, date: Date): DatedHoliday {
    return { ...holiday, date: new Date(date) };
  }

  // ── Core ──────────────────────────────────────────────────────────────

  /**
   * Returns all Czech public holidays for a given year.
   * Results are cached in memory — subsequent calls for the same year are instant.
   * @param year - The full year (e.g. 2024).
   * @returns Array of Holiday objects (11 fixed + 2 Easter-based).
   */
  function getHolidaysForYear(year: number): Holiday[] {
    let holidays = cache.get(year);
    if (!holidays) {
      const easterHolidays = getEasterHolidays(year);
      holidays = fixedHolidays.concat(easterHolidays);
      cache.set(year, holidays);
    }
    return holidays;
  }

  /**
   * Checks if a date is a Czech public holiday.
   * @param date - The date to check.
   * @returns `true` if the date is a public holiday.
   */
  function isHoliday(date: Date): boolean {
    const { key, year } = getMapKey(date);
    return getHolidayMap(year).has(key);
  }

  /**
   * Returns the Holiday object for a given date.
   * @param date - The date to look up.
   * @returns The Holiday object, or `null` if not a holiday.
   */
  function getHoliday(date: Date): Holiday | null {
    const { key, year } = getMapKey(date);
    return getHolidayMap(year).get(key) ?? null;
  }

  /**
   * Returns the localized name of the holiday on a given date.
   * @param date - The date to look up.
   * @param locale - `'cs'` for Czech (default) or `'en'` for English.
   * @returns The holiday name string, or `null` if not a holiday.
   */
  function getHolidayName(date: Date, locale: HolidaySupportedLocales = HolidaySupportedLocales.Czech): string | null {
    const holiday = getHoliday(date);
    return holiday?.name[locale] ?? null;
  }

  /**
   * Returns holidays for a given month.
   * @param year - The full year (e.g. 2024).
   * @param month - The month (1–12).
   * @returns Array of DatedHoliday objects with the `date` field populated.
   */
  function getHolidaysByMonth(year: number, month: number): DatedHoliday[] {
    const holidays = getHolidaysForYear(year);
    return holidays
      .filter((h) => h.month === month)
      .map((h) => toDatedHoliday(h, new Date(year, h.month - 1, h.day)));
  }

  // ── Weekend & Business Days ───────────────────────────────────────────

  /**
   * Checks if a date falls on a weekend (Saturday or Sunday).
   * @param date - The date to check.
   */
  function isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  /**
   * Checks if a date is a business day (not a weekend and not a public holiday).
   * @param date - The date to check.
   */
  function isBusinessDay(date: Date): boolean {
    return !isWeekend(date) && !isHoliday(date);
  }

  /**
   * Returns the next business day after the given date.
   * Skips weekends and public holidays.
   * @param date - The starting date (excluded from result).
   */
  function getNextBusinessDay(date: Date): Date {
    const next = new Date(date);
    do {
      next.setDate(next.getDate() + 1);
    } while (!isBusinessDay(next));
    return next;
  }

  /**
   * Adds (or subtracts) a number of business days to a date.
   * Skips weekends and public holidays. Does not mutate the input date.
   * @param date - The starting date.
   * @param count - Number of business days to add. Use negative values to subtract.
   * @returns A new Date that is `count` business days away.
   */
  function addBusinessDays(date: Date, count: number): Date {
    const direction = count < 0 ? -1 : 1;
    let current = new Date(date);
    let remaining = Math.abs(count);
    while (remaining > 0) {
      current.setDate(current.getDate() + direction);
      if (isBusinessDay(current)) {
        remaining--;
      }
    }
    return current;
  }

  /**
   * Counts business days between two dates (exclusive of both endpoints).
   * Order of arguments does not matter.
   * @param from - One boundary date.
   * @param to - The other boundary date.
   * @returns Number of business days between `from` and `to`.
   */
  function countBusinessDays(from: Date, to: Date): number {
    const start = from < to ? from : to;
    const end = from < to ? to : from;
    let count = 0;
    const current = new Date(start);
    current.setDate(current.getDate() + 1);
    while (current < end) {
      if (isBusinessDay(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  /**
   * Returns the number of business days in a given month.
   * @param year - The full year (e.g. 2024).
   * @param month - The month (1–12).
   */
  function getBusinessDaysInMonth(year: number, month: number): number {
    const daysInMonth = new Date(year, month, 0).getDate();
    let count = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      if (isBusinessDay(new Date(year, month - 1, day))) {
        count++;
      }
    }
    return count;
  }

  /**
   * Returns the number of remaining business days in the month from the given date (inclusive).
   * @param date - The starting date.
   */
  function getRemainingBusinessDays(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let count = 0;
    for (let day = date.getDate(); day <= daysInMonth; day++) {
      if (isBusinessDay(new Date(year, month, day))) {
        count++;
      }
    }
    return count;
  }

  /**
   * Checks if a date is the last business day of its month.
   * Useful for payroll and invoicing deadlines.
   * @param date - The date to check.
   */
  function isLastBusinessDayOfMonth(date: Date): boolean {
    if (!isBusinessDay(date)) return false;
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = date.getDate() + 1; day <= daysInMonth; day++) {
      if (isBusinessDay(new Date(year, month, day))) {
        return false;
      }
    }
    return true;
  }

  // ── Holiday Navigation ────────────────────────────────────────────────

  /**
   * Returns the next public holiday on or after the given date.
   * @param date - The starting date.
   * @returns A DatedHoliday with the `date` field set.
   */
  function getNextHoliday(date: Date): DatedHoliday {
    const current = new Date(date);
    for (let i = 0; i < 366; i++) {
      const holiday = getHoliday(current);
      if (holiday) {
        return toDatedHoliday(holiday, current);
      }
      current.setDate(current.getDate() + 1);
    }
    throw new Error('No holiday found within 366 days');
  }

  /**
   * Returns the most recent public holiday on or before the given date.
   * @param date - The starting date.
   * @returns A DatedHoliday with the `date` field set.
   */
  function getPreviousHoliday(date: Date): DatedHoliday {
    const current = new Date(date);
    for (let i = 0; i < 366; i++) {
      const holiday = getHoliday(current);
      if (holiday) {
        return toDatedHoliday(holiday, current);
      }
      current.setDate(current.getDate() - 1);
    }
    throw new Error('No holiday found within 366 days');
  }

  /**
   * Returns all holidays within a date range (inclusive of both endpoints).
   * Order of arguments does not matter.
   * @param from - One boundary date.
   * @param to - The other boundary date.
   * @returns Array of DatedHoliday objects sorted chronologically.
   */
  function getHolidaysInRange(from: Date, to: Date): DatedHoliday[] {
    const start = from < to ? from : to;
    const end = from < to ? to : from;
    const result: DatedHoliday[] = [];
    const current = new Date(start);
    while (current <= end) {
      const holiday = getHoliday(current);
      if (holiday) {
        result.push(toDatedHoliday(holiday, current));
      }
      current.setDate(current.getDate() + 1);
    }
    return result;
  }

  /**
   * Checks if a date is the day before a public holiday (holiday eve).
   * @param date - The date to check.
   */
  function isHolidayEve(date: Date): boolean {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    return isHoliday(next);
  }

  // ── Shop Restrictions ─────────────────────────────────────────────────

  /**
   * Checks if shops are fully closed on a given date (large retail >200m²).
   * Returns `true` for holidays with `HolidayShopRestriction.Closed`.
   * Returns `false` for non-holidays, Open holidays, and Partial restriction days.
   * @param date - The date to check.
   */
  function areShopsClosed(date: Date): boolean {
    const holiday = getHoliday(date);
    return holiday?.shopRestriction === HolidayShopRestriction.Closed;
  }

  /**
   * Checks if shops have any restriction on a given date.
   * Returns `true` for holidays with `Closed` or `Partial` shop restrictions.
   * @param date - The date to check.
   */
  function areShopsRestricted(date: Date): boolean {
    const holiday = getHoliday(date);
    if (!holiday) return false;
    return holiday.shopRestriction === HolidayShopRestriction.Closed
      || holiday.shopRestriction === HolidayShopRestriction.Partial;
  }

  /**
   * Returns the shop restriction for a given date.
   * @param date - The date to check.
   * @returns The `HolidayShopRestriction` value, or `null` if not a holiday.
   */
  function getShopRestriction(date: Date): HolidayShopRestriction | null {
    const holiday = getHoliday(date);
    return holiday?.shopRestriction ?? null;
  }

  // ── Long Weekends & Bridge Days ───────────────────────────────────────

  /**
   * Finds all long weekends in a given year — continuous stretches of 3+ non-working days
   * (weekends and holidays) that include at least one public holiday.
   * @param year - The full year (e.g. 2024).
   * @returns Array of LongWeekend objects sorted chronologically.
   */
  function getLongWeekends(year: number): LongWeekend[] {
    const holidays = getHolidaysForYear(year);
    const result: LongWeekend[] = [];
    const processed = new Set<string>();

    for (const holiday of holidays) {
      const holidayDate = new Date(year, holiday.month - 1, holiday.day);
      const dateKey = holidayDate.toISOString();
      if (processed.has(dateKey)) continue;

      // Expand backward to find the start of the non-working stretch
      const start = new Date(holidayDate);
      while (true) {
        const prev = new Date(start);
        prev.setDate(prev.getDate() - 1);
        if (isWeekend(prev) || isHoliday(prev)) {
          start.setDate(start.getDate() - 1);
        } else {
          break;
        }
      }

      // Expand forward to find the end
      const end = new Date(holidayDate);
      while (true) {
        const next = new Date(end);
        next.setDate(next.getDate() + 1);
        if (isWeekend(next) || isHoliday(next)) {
          end.setDate(end.getDate() + 1);
        } else {
          break;
        }
      }

      const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (days >= 3) {
        // Collect all holidays in this stretch
        const stretchHolidays: DatedHoliday[] = [];
        const cursor = new Date(start);
        while (cursor <= end) {
          const h = getHoliday(cursor);
          if (h) {
            stretchHolidays.push(toDatedHoliday(h, cursor));
            processed.add(cursor.toISOString());
          }
          cursor.setDate(cursor.getDate() + 1);
        }

        result.push({
          start: new Date(start),
          end: new Date(end),
          days,
          holidays: stretchHolidays
        });
      }
    }

    // Deduplicate (multiple holidays can belong to the same long weekend)
    const seen = new Set<string>();
    return result.filter((lw) => {
      const key = lw.start.toISOString();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Finds bridge days in a given year — single working days that, if taken off,
   * connect a holiday with a weekend to create a longer break.
   * @param year - The full year (e.g. 2024).
   * @returns Array of BridgeDay objects sorted chronologically.
   */
  function getBridgeDays(year: number): BridgeDay[] {
    const result: BridgeDay[] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const current = new Date(startDate);

    while (current <= endDate) {
      if (isBusinessDay(current)) {
        const prev = new Date(current);
        prev.setDate(prev.getDate() - 1);
        const next = new Date(current);
        next.setDate(next.getDate() + 1);

        const prevOff = isWeekend(prev) || isHoliday(prev);
        const nextOff = isWeekend(next) || isHoliday(next);

        if (prevOff && nextOff) {
          // Expand backward to find full stretch start
          const stretchStart = new Date(prev);
          while (true) {
            const before = new Date(stretchStart);
            before.setDate(before.getDate() - 1);
            if (isWeekend(before) || isHoliday(before)) {
              stretchStart.setDate(stretchStart.getDate() - 1);
            } else {
              break;
            }
          }

          // Expand forward to find full stretch end
          const stretchEnd = new Date(next);
          while (true) {
            const after = new Date(stretchEnd);
            after.setDate(after.getDate() + 1);
            if (isWeekend(after) || isHoliday(after)) {
              stretchEnd.setDate(stretchEnd.getDate() + 1);
            } else {
              break;
            }
          }

          // Collect surrounding holidays
          const surroundingHolidays: DatedHoliday[] = [];
          const cursor = new Date(stretchStart);
          while (cursor <= stretchEnd) {
            const h = getHoliday(cursor);
            if (h) {
              surroundingHolidays.push(toDatedHoliday(h, cursor));
            }
            cursor.setDate(cursor.getDate() + 1);
          }

          const totalDaysOff = Math.round(
            (stretchEnd.getTime() - stretchStart.getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;

          result.push({
            date: new Date(current),
            surroundingHolidays,
            totalDaysOff
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  return {
    // Core
    isHoliday,
    getHolidayName,
    getHoliday,
    getHolidaysForYear,
    getHolidaysByMonth,
    // Weekend & Business Days
    isWeekend,
    isBusinessDay,
    getNextBusinessDay,
    addBusinessDays,
    countBusinessDays,
    getBusinessDaysInMonth,
    getRemainingBusinessDays,
    isLastBusinessDayOfMonth,
    // Holiday Navigation
    getNextHoliday,
    getPreviousHoliday,
    getHolidaysInRange,
    isHolidayEve,
    // Shop Restrictions
    areShopsClosed,
    areShopsRestricted,
    getShopRestriction,
    // Long Weekends & Bridge Days
    getLongWeekends,
    getBridgeDays,
  };
})();

export default CzechHolidays;
