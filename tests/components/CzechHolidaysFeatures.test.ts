import { describe, expect, it, vi } from 'vitest';
import CzechHolidays, { HolidayShopRestriction } from '@app/components/CzechHolidays.ts';

vi.mock('@app/components/DataProvider.ts', () => ({
  getEasterHolidays: vi.fn(() => []),
  getFixedHolidays: vi.fn(() => [
    {
      day: 1, month: 1,
      name: { cs: 'Nový rok', en: "New Year's Day" },
      description: { cs: '', en: '' },
      shopRestriction: 1,
      isMoveable: false
    },
    {
      day: 1, month: 5,
      name: { cs: 'Svátek práce', en: 'Labour Day' },
      description: { cs: '', en: '' },
      shopRestriction: 0,
      isMoveable: false
    },
    {
      day: 8, month: 5,
      name: { cs: 'Den vítězství', en: 'Victory in Europe Day' },
      description: { cs: '', en: '' },
      shopRestriction: 1,
      isMoveable: false
    },
    {
      day: 24, month: 12,
      name: { cs: 'Štědrý den', en: 'Christmas Eve' },
      description: { cs: '', en: '' },
      shopRestriction: 2,
      isMoveable: false
    },
    {
      day: 25, month: 12,
      name: { cs: '1. svátek vánoční', en: 'Christmas Day' },
      description: { cs: '', en: '' },
      shopRestriction: 1,
      isMoveable: false
    },
    {
      day: 26, month: 12,
      name: { cs: '2. svátek vánoční', en: 'Second Day of Christmas' },
      description: { cs: '', en: '' },
      shopRestriction: 1,
      isMoveable: false
    }
  ])
}));

// ── Weekend ───────────────────────────────────────────────────────────────

describe('isWeekend', () => {
  it('should return true for Saturday', () => {
    // 2024-01-06 is a Saturday
    expect(CzechHolidays.isWeekend(new Date(2024, 0, 6))).toBe(true);
  });

  it('should return true for Sunday', () => {
    // 2024-01-07 is a Sunday
    expect(CzechHolidays.isWeekend(new Date(2024, 0, 7))).toBe(true);
  });

  it('should return false for Monday through Friday', () => {
    // 2024-01-08 (Mon) through 2024-01-12 (Fri)
    for (let day = 8; day <= 12; day++) {
      expect(CzechHolidays.isWeekend(new Date(2024, 0, day))).toBe(false);
    }
  });
});

// ── Business Day ──────────────────────────────────────────────────────────

describe('isBusinessDay', () => {
  it('should return true for a regular weekday', () => {
    // 2024-01-08 is a Monday, not a holiday
    expect(CzechHolidays.isBusinessDay(new Date(2024, 0, 8))).toBe(true);
  });

  it('should return false for a weekend', () => {
    // 2024-01-06 is a Saturday
    expect(CzechHolidays.isBusinessDay(new Date(2024, 0, 6))).toBe(false);
  });

  it('should return false for a holiday on a weekday', () => {
    // 2024-01-01 is a Monday and a holiday
    expect(CzechHolidays.isBusinessDay(new Date(2024, 0, 1))).toBe(false);
  });
});

// ── Next Business Day ─────────────────────────────────────────────────────

describe('getNextBusinessDay', () => {
  it('should return the next day if it is a business day', () => {
    // 2024-01-08 (Mon) -> 2024-01-09 (Tue)
    const result = CzechHolidays.getNextBusinessDay(new Date(2024, 0, 8));
    expect(result.getDate()).toBe(9);
    expect(result.getMonth()).toBe(0);
  });

  it('should skip weekends', () => {
    // 2024-01-05 (Fri) -> skip Sat 6, Sun 7 -> 2024-01-08 (Mon)
    const result = CzechHolidays.getNextBusinessDay(new Date(2024, 0, 5));
    expect(result.getDate()).toBe(8);
    expect(result.getMonth()).toBe(0);
  });

  it('should skip holidays', () => {
    // 2023-12-29 (Fri) -> skip Sat 30, Sun 31, Mon Jan 1 (holiday) -> Tue Jan 2
    const result = CzechHolidays.getNextBusinessDay(new Date(2023, 11, 29));
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(2);
  });
});

// ── Add Business Days ─────────────────────────────────────────────────────

describe('addBusinessDays', () => {
  it('should add positive business days', () => {
    // 2024-01-08 (Mon) + 3 business days = 2024-01-11 (Thu)
    const result = CzechHolidays.addBusinessDays(new Date(2024, 0, 8), 3);
    expect(result.getDate()).toBe(11);
  });

  it('should skip weekends when adding', () => {
    // 2024-01-08 (Mon) + 5 business days = 2024-01-15 (Mon)
    const result = CzechHolidays.addBusinessDays(new Date(2024, 0, 8), 5);
    expect(result.getDate()).toBe(15);
    expect(result.getMonth()).toBe(0);
  });

  it('should handle negative business days', () => {
    // 2024-01-11 (Thu) - 3 business days = 2024-01-08 (Mon)
    const result = CzechHolidays.addBusinessDays(new Date(2024, 0, 11), -3);
    expect(result.getDate()).toBe(8);
  });

  it('should handle zero business days', () => {
    const date = new Date(2024, 0, 8);
    const result = CzechHolidays.addBusinessDays(date, 0);
    expect(result.getDate()).toBe(8);
  });

  it('should skip holidays when adding', () => {
    // 2023-12-29 (Fri) + 1 = skip Sat 30, Sun 31, Mon Jan 1 (holiday) -> Tue Jan 2
    const result = CzechHolidays.addBusinessDays(new Date(2023, 11, 29), 1);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(2);
  });

  it('should not mutate the input date', () => {
    const date = new Date(2024, 0, 8);
    const originalTime = date.getTime();
    CzechHolidays.addBusinessDays(date, 5);
    expect(date.getTime()).toBe(originalTime);
  });
});

// ── Count Business Days ───────────────────────────────────────────────────

describe('countBusinessDays', () => {
  it('should count business days between two dates (exclusive)', () => {
    // 2024-01-08 (Mon) to 2024-01-12 (Fri) -> Tue 9, Wed 10, Thu 11 = 3
    const count = CzechHolidays.countBusinessDays(new Date(2024, 0, 8), new Date(2024, 0, 12));
    expect(count).toBe(3);
  });

  it('should return 0 for consecutive days', () => {
    const count = CzechHolidays.countBusinessDays(new Date(2024, 0, 8), new Date(2024, 0, 9));
    expect(count).toBe(0);
  });

  it('should handle reversed date order', () => {
    const count1 = CzechHolidays.countBusinessDays(new Date(2024, 0, 8), new Date(2024, 0, 15));
    const count2 = CzechHolidays.countBusinessDays(new Date(2024, 0, 15), new Date(2024, 0, 8));
    expect(count1).toBe(count2);
  });

  it('should skip weekends in count', () => {
    // Mon Jan 8 to Mon Jan 15 -> Tue 9, Wed 10, Thu 11, Fri 12 = 4 (skip Sat 13, Sun 14)
    const count = CzechHolidays.countBusinessDays(new Date(2024, 0, 8), new Date(2024, 0, 15));
    expect(count).toBe(4);
  });

  it('should skip holidays in count', () => {
    // 2023-12-29 (Fri) to 2024-01-03 (Wed) -> Sat 30 skip, Sun 31 skip, Mon Jan 1 holiday skip, Tue Jan 2 = 1
    const count = CzechHolidays.countBusinessDays(new Date(2023, 11, 29), new Date(2024, 0, 3));
    expect(count).toBe(1);
  });
});

// ── Business Days In Month ────────────────────────────────────────────────

describe('getBusinessDaysInMonth', () => {
  it('should return the correct number of business days in January 2024', () => {
    // January 2024: 31 days, starts on Monday
    // Weekends: 6-7, 13-14, 20-21, 27-28 = 8 days
    // Holidays: Jan 1 (Mon) = 1 day
    // Business days: 31 - 8 - 1 = 22
    expect(CzechHolidays.getBusinessDaysInMonth(2024, 1)).toBe(22);
  });

  it('should return the correct number of business days in May 2024', () => {
    // May 2024: 31 days, starts on Wednesday
    // Weekends: 4-5, 11-12, 18-19, 25-26 = 8 days
    // Holidays: May 1 (Wed), May 8 (Wed) = 2 days
    // Business days: 31 - 8 - 2 = 21
    expect(CzechHolidays.getBusinessDaysInMonth(2024, 5)).toBe(21);
  });

  it('should return the correct number of business days in December 2024', () => {
    // December 2024: 31 days, starts on Sunday
    // Weekends: 1, 7-8, 14-15, 21-22, 28-29 = 9 days
    // Holidays on weekdays: Dec 24 (Tue), Dec 25 (Wed), Dec 26 (Thu) = 3 days
    // Business days: 31 - 9 - 3 = 19
    expect(CzechHolidays.getBusinessDaysInMonth(2024, 12)).toBe(19);
  });
});

// ── Remaining Business Days ───────────────────────────────────────────────

describe('getRemainingBusinessDays', () => {
  it('should count remaining business days from a given date to end of month (inclusive)', () => {
    // From Jan 29 (Mon) 2024: Jan 29 (Mon), 30 (Tue), 31 (Wed) = 3
    expect(CzechHolidays.getRemainingBusinessDays(new Date(2024, 0, 29))).toBe(3);
  });

  it('should return 0 when starting from a weekend at end of month', () => {
    // Feb 2025: 28 days. Feb 28 2025 is a Friday, so not 0. Use a month ending on weekend.
    // March 2024: 31 days. Mar 31 2024 is a Sunday.
    expect(CzechHolidays.getRemainingBusinessDays(new Date(2024, 2, 31))).toBe(0);
  });

  it('should exclude holidays from count', () => {
    // From Dec 23 (Mon) 2024: Dec 23 (Mon, biz), 24 (Tue, holiday), 25 (Wed, holiday),
    // 26 (Thu, holiday), 27 (Fri, biz), 28 (Sat), 29 (Sun), 30 (Mon, biz), 31 (Tue, biz)
    // Business days: 23, 27, 30, 31 = 4
    expect(CzechHolidays.getRemainingBusinessDays(new Date(2024, 11, 23))).toBe(4);
  });
});

// ── Last Business Day of Month ────────────────────────────────────────────

describe('isLastBusinessDayOfMonth', () => {
  it('should return true for the last business day of a month', () => {
    // January 2024: Jan 31 is a Wednesday, no holiday -> last business day
    expect(CzechHolidays.isLastBusinessDayOfMonth(new Date(2024, 0, 31))).toBe(true);
  });

  it('should return false for a day that is not the last business day', () => {
    // Jan 30 2024 (Tue) - Jan 31 (Wed) is also a business day
    expect(CzechHolidays.isLastBusinessDayOfMonth(new Date(2024, 0, 30))).toBe(false);
  });

  it('should return false for non-business days', () => {
    // Jan 6 2024 is Saturday
    expect(CzechHolidays.isLastBusinessDayOfMonth(new Date(2024, 0, 6))).toBe(false);
  });

  it('should handle months ending on a weekend', () => {
    // March 2024: Mar 31 is Sunday, Mar 30 is Saturday, Mar 29 is Friday -> last biz day
    expect(CzechHolidays.isLastBusinessDayOfMonth(new Date(2024, 2, 29))).toBe(true);
  });

  it('should account for holidays at end of month', () => {
    // December 2024: Dec 31 is Tue (biz), so Dec 31 is last business day
    // Dec 27 (Fri) is NOT the last because Dec 30 (Mon) and 31 (Tue) follow
    expect(CzechHolidays.isLastBusinessDayOfMonth(new Date(2024, 11, 31))).toBe(true);
    expect(CzechHolidays.isLastBusinessDayOfMonth(new Date(2024, 11, 27))).toBe(false);
  });
});

// ── Next Holiday ──────────────────────────────────────────────────────────

describe('getNextHoliday', () => {
  it('should return the current day if it is a holiday', () => {
    const result = CzechHolidays.getNextHoliday(new Date(2024, 0, 1));
    expect(result.day).toBe(1);
    expect(result.month).toBe(1);
    expect(result.name.en).toBe("New Year's Day");
    expect(result.date).toBeInstanceOf(Date);
  });

  it('should find the next holiday in the future', () => {
    // Jan 2 -> next holiday is May 1
    const result = CzechHolidays.getNextHoliday(new Date(2024, 0, 2));
    expect(result.day).toBe(1);
    expect(result.month).toBe(5);
    expect(result.name.en).toBe('Labour Day');
  });

  it('should include a date property on the result', () => {
    const result = CzechHolidays.getNextHoliday(new Date(2024, 0, 1));
    expect(result.date.getFullYear()).toBe(2024);
    expect(result.date.getMonth()).toBe(0);
    expect(result.date.getDate()).toBe(1);
  });
});

// ── Previous Holiday ──────────────────────────────────────────────────────

describe('getPreviousHoliday', () => {
  it('should return the current day if it is a holiday', () => {
    const result = CzechHolidays.getPreviousHoliday(new Date(2024, 0, 1));
    expect(result.day).toBe(1);
    expect(result.month).toBe(1);
    expect(result.name.en).toBe("New Year's Day");
  });

  it('should find the most recent holiday in the past', () => {
    // May 2 -> previous holiday is May 1
    const result = CzechHolidays.getPreviousHoliday(new Date(2024, 4, 2));
    expect(result.day).toBe(1);
    expect(result.month).toBe(5);
    expect(result.name.en).toBe('Labour Day');
  });

  it('should cross year boundaries', () => {
    // 2025-01-02 -> previous is 2025-01-01
    const result = CzechHolidays.getPreviousHoliday(new Date(2025, 0, 2));
    expect(result.day).toBe(1);
    expect(result.month).toBe(1);
  });
});

// ── Holidays In Range ─────────────────────────────────────────────────────

describe('getHolidaysInRange', () => {
  it('should return holidays within a date range', () => {
    // Dec 23 to Dec 26 should include Dec 24, 25, 26
    const result = CzechHolidays.getHolidaysInRange(
      new Date(2024, 11, 23),
      new Date(2024, 11, 26)
    );
    expect(result).toHaveLength(3);
    expect(result.map((h) => h.day)).toEqual([24, 25, 26]);
  });

  it('should return empty array if no holidays in range', () => {
    // Feb 1-10, no holidays
    const result = CzechHolidays.getHolidaysInRange(
      new Date(2024, 1, 1),
      new Date(2024, 1, 10)
    );
    expect(result).toHaveLength(0);
  });

  it('should handle reversed date order', () => {
    const result = CzechHolidays.getHolidaysInRange(
      new Date(2024, 11, 26),
      new Date(2024, 11, 23)
    );
    expect(result).toHaveLength(3);
  });

  it('should span across years', () => {
    // Dec 24 2024 to Jan 1 2025 -> Dec 24, 25, 26 (2024) + Jan 1 (2025)
    const result = CzechHolidays.getHolidaysInRange(
      new Date(2024, 11, 24),
      new Date(2025, 0, 1)
    );
    expect(result).toHaveLength(4);
  });

  it('should include date property on each result', () => {
    const result = CzechHolidays.getHolidaysInRange(
      new Date(2024, 0, 1),
      new Date(2024, 0, 1)
    );
    expect(result).toHaveLength(1);
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].date.getFullYear()).toBe(2024);
  });
});

// ── Holiday Eve ───────────────────────────────────────────────────────────

describe('isHolidayEve', () => {
  it('should return true for the day before a holiday', () => {
    // Dec 23 is the day before Dec 24 (Christmas Eve holiday)
    expect(CzechHolidays.isHolidayEve(new Date(2024, 11, 23))).toBe(true);
  });

  it('should return false for a random non-eve date', () => {
    // Feb 15 2024 - next day (Feb 16) is not a holiday
    expect(CzechHolidays.isHolidayEve(new Date(2024, 1, 15))).toBe(false);
  });

  it('should return true for Dec 31 (eve of Jan 1 next year)', () => {
    // Dec 31 2024 -> Jan 1 2025 is a holiday
    expect(CzechHolidays.isHolidayEve(new Date(2024, 11, 31))).toBe(true);
  });

  it('should return true for Apr 30 (eve of May 1 Labour Day)', () => {
    expect(CzechHolidays.isHolidayEve(new Date(2024, 3, 30))).toBe(true);
  });
});

// ── Shop Restrictions ─────────────────────────────────────────────────────

describe('areShopsClosed', () => {
  it('should return true for holidays with Closed restriction', () => {
    // Jan 1 has shopRestriction: 1 (Closed)
    expect(CzechHolidays.areShopsClosed(new Date(2024, 0, 1))).toBe(true);
  });

  it('should return false for holidays with Partial restriction', () => {
    // Dec 24 has shopRestriction: 2 (Partial)
    expect(CzechHolidays.areShopsClosed(new Date(2024, 11, 24))).toBe(false);
  });

  it('should return false for holidays with Open restriction', () => {
    // May 1 has shopRestriction: 0 (Open)
    expect(CzechHolidays.areShopsClosed(new Date(2024, 4, 1))).toBe(false);
  });

  it('should return false for non-holidays', () => {
    expect(CzechHolidays.areShopsClosed(new Date(2024, 1, 15))).toBe(false);
  });
});

describe('areShopsRestricted', () => {
  it('should return true for Closed holidays', () => {
    // Jan 1 -> Closed
    expect(CzechHolidays.areShopsRestricted(new Date(2024, 0, 1))).toBe(true);
  });

  it('should return true for Partial holidays', () => {
    // Dec 24 -> Partial
    expect(CzechHolidays.areShopsRestricted(new Date(2024, 11, 24))).toBe(true);
  });

  it('should return false for Open holidays', () => {
    // May 1 -> Open
    expect(CzechHolidays.areShopsRestricted(new Date(2024, 4, 1))).toBe(false);
  });

  it('should return false for non-holidays', () => {
    expect(CzechHolidays.areShopsRestricted(new Date(2024, 1, 15))).toBe(false);
  });
});

describe('getShopRestriction', () => {
  it('should return Closed for Jan 1', () => {
    expect(CzechHolidays.getShopRestriction(new Date(2024, 0, 1))).toBe(HolidayShopRestriction.Closed);
  });

  it('should return Partial for Dec 24', () => {
    expect(CzechHolidays.getShopRestriction(new Date(2024, 11, 24))).toBe(HolidayShopRestriction.Partial);
  });

  it('should return Open for May 1', () => {
    expect(CzechHolidays.getShopRestriction(new Date(2024, 4, 1))).toBe(HolidayShopRestriction.Open);
  });

  it('should return null for non-holidays', () => {
    expect(CzechHolidays.getShopRestriction(new Date(2024, 1, 15))).toBeNull();
  });
});

// ── Holidays By Month ─────────────────────────────────────────────────────

describe('getHolidaysByMonth', () => {
  it('should return holidays for a month that has them', () => {
    // December has 3 holidays: 24, 25, 26
    const result = CzechHolidays.getHolidaysByMonth(2024, 12);
    expect(result).toHaveLength(3);
    expect(result.map((h) => h.day)).toEqual([24, 25, 26]);
    expect(result[0].date).toBeInstanceOf(Date);
    expect(result[0].date.getFullYear()).toBe(2024);
  });

  it('should return holidays for May', () => {
    const result = CzechHolidays.getHolidaysByMonth(2024, 5);
    expect(result).toHaveLength(2);
    expect(result.map((h) => h.day)).toEqual([1, 8]);
  });

  it('should return empty array for months without holidays', () => {
    const result = CzechHolidays.getHolidaysByMonth(2024, 2);
    expect(result).toHaveLength(0);
  });
});

// ── Long Weekends ─────────────────────────────────────────────────────────

describe('getLongWeekends', () => {
  it('should find long weekends in 2024', () => {
    const result = CzechHolidays.getLongWeekends(2024);
    // Should find at least the Christmas stretch
    expect(result.length).toBeGreaterThan(0);
  });

  it('should find the Christmas/New Year long weekend stretch in 2024', () => {
    // Dec 24 (Tue, holiday), 25 (Wed, holiday), 26 (Thu, holiday), 27 (Fri, biz),
    // 28 (Sat), 29 (Sun) -> Dec 24-26 is only 3 holidays in a row, but 27 is a business day
    // so Dec 24-26 = 3 consecutive non-working days
    // Actually: Dec 24 (Tue), 25 (Wed), 26 (Thu) = 3 consecutive holidays
    // That's 3 days, which meets the >= 3 threshold
    const result = CzechHolidays.getLongWeekends(2024);
    const xmas = result.find(
      (lw) => lw.start.getMonth() === 11 && lw.start.getDate() >= 21
    );
    expect(xmas).toBeDefined();
    expect(xmas!.days).toBeGreaterThanOrEqual(3);
    expect(xmas!.holidays.length).toBeGreaterThanOrEqual(1);
  });

  it('should include holidays array in each long weekend', () => {
    const result = CzechHolidays.getLongWeekends(2024);
    for (const lw of result) {
      expect(lw.holidays.length).toBeGreaterThanOrEqual(1);
      expect(lw.start).toBeInstanceOf(Date);
      expect(lw.end).toBeInstanceOf(Date);
      expect(lw.days).toBeGreaterThanOrEqual(3);
    }
  });

  it('should find Jan 1 2024 long weekend (Sat Dec 30, Sun Dec 31, Mon Jan 1)', () => {
    // Jan 1 2024 is Monday. Dec 30 (Sat), Dec 31 (Sun), Jan 1 (Mon holiday) = 3 days
    const result = CzechHolidays.getLongWeekends(2024);
    const newYear = result.find(
      (lw) => lw.holidays.some((h) => h.day === 1 && h.month === 1)
    );
    expect(newYear).toBeDefined();
    expect(newYear!.days).toBeGreaterThanOrEqual(3);
  });
});

// ── Bridge Days ───────────────────────────────────────────────────────────

describe('getBridgeDays', () => {
  it('should return an array of bridge days', () => {
    const result = CzechHolidays.getBridgeDays(2024);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should find bridge day on Dec 27 2024 (Fri between holidays and weekend)', () => {
    // Dec 26 (Thu, holiday), Dec 27 (Fri, business day), Dec 28 (Sat, weekend)
    // prev (Dec 26) is holiday -> off, next (Dec 28) is weekend -> off => bridge day
    const result = CzechHolidays.getBridgeDays(2024);
    const dec27 = result.find(
      (bd) => bd.date.getMonth() === 11 && bd.date.getDate() === 27
    );
    expect(dec27).toBeDefined();
    expect(dec27!.date).toBeInstanceOf(Date);
    expect(dec27!.surroundingHolidays.length).toBeGreaterThanOrEqual(1);
    expect(dec27!.totalDaysOff).toBeGreaterThanOrEqual(3);
  });

  it('should include surroundingHolidays and totalDaysOff for each bridge day', () => {
    const result = CzechHolidays.getBridgeDays(2024);
    for (const bd of result) {
      expect(bd.date).toBeInstanceOf(Date);
      expect(Array.isArray(bd.surroundingHolidays)).toBe(true);
      expect(typeof bd.totalDaysOff).toBe('number');
    }
  });

  it('should find bridge day on Dec 23 2024 (Mon between weekend and holiday)', () => {
    // Dec 22 (Sun, weekend), Dec 23 (Mon, business day), Dec 24 (Tue, holiday)
    // prev (Dec 22) is weekend -> off, next (Dec 24) is holiday -> off => bridge day
    const result = CzechHolidays.getBridgeDays(2024);
    const dec23 = result.find(
      (bd) => bd.date.getMonth() === 11 && bd.date.getDate() === 23
    );
    expect(dec23).toBeDefined();
  });
});
