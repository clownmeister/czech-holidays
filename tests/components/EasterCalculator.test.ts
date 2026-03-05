import { describe, expect, it } from 'vitest';
import { calculateEasterHolidays, EasterDates } from '@app/components/EasterCalculator.ts';

describe('EasterCalculator', () => {
  // Known Easter Sunday dates to verify the algorithm
  const knownEasterSundays: [number, number, number][] = [
    // [year, month (1-based), day]
    [2020, 4, 12],
    [2021, 4, 4],
    [2022, 4, 17],
    [2023, 4, 9],
    [2024, 3, 31],
    [2025, 4, 20],
    [2026, 4, 5],
    [2027, 3, 28],
    [2030, 4, 21],
    [2035, 3, 25],
  ];

  knownEasterSundays.forEach(([year, month, day]) => {
    it(`should calculate Easter Sunday for ${year} as ${day}.${month}.`, () => {
      const result = calculateEasterHolidays(year);
      expect(result.easterSunday.getFullYear()).toBe(year);
      expect(result.easterSunday.getMonth() + 1).toBe(month);
      expect(result.easterSunday.getDate()).toBe(day);
    });
  });

  it('should calculate Good Friday as 2 days before Easter Sunday', () => {
    const result = calculateEasterHolidays(2024);
    // Easter Sunday 2024 = March 31
    expect(result.goodFriday.getMonth() + 1).toBe(3);
    expect(result.goodFriday.getDate()).toBe(29);
  });

  it('should calculate Easter Monday as 1 day after Easter Sunday', () => {
    const result = calculateEasterHolidays(2024);
    // Easter Sunday 2024 = March 31
    expect(result.easterMonday.getMonth() + 1).toBe(4);
    expect(result.easterMonday.getDate()).toBe(1);
  });

  it('should handle Good Friday crossing month boundary', () => {
    // Easter 2024: Sunday = March 31, so Friday = March 29 (same month)
    // Easter 2026: Sunday = April 5, so Friday = April 3
    const result = calculateEasterHolidays(2026);
    expect(result.goodFriday.getMonth() + 1).toBe(4);
    expect(result.goodFriday.getDate()).toBe(3);
    expect(result.easterMonday.getMonth() + 1).toBe(4);
    expect(result.easterMonday.getDate()).toBe(6);
  });

  it('should return correct types', () => {
    const result: EasterDates = calculateEasterHolidays(2024);
    expect(result.easterSunday).toBeInstanceOf(Date);
    expect(result.goodFriday).toBeInstanceOf(Date);
    expect(result.easterMonday).toBeInstanceOf(Date);
  });
});
