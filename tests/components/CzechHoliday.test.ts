import { beforeEach, describe, expect, it, vi } from 'vitest';
import CzechHolidays, { HolidaySupportedLocales } from '@app/components/CzechHolidays.ts';
import * as DataProvider from '@app/components/DataProvider.ts';

const holiday = {
  day: 1,
  month: 1,
  name: {
    cs: 'Nový rok',
    en: 'New Year\'s Day'
  },
  description: {
    cs: '',
    en: ''
  },
  shopRestriction: 1,
  isMoveable: false
};

vi.mock('@app/components/DataProvider.ts', () => ({
  getEasterHolidays: vi.fn(() => []),
  getFixedHolidays: vi.fn(() => [
    {
      day: 1,
      month: 1,
      name: {
        cs: 'Nový rok',
        en: 'New Year\'s Day'
      },
      description: {
        cs: '',
        en: ''
      },
      shopRestriction: 1,
      isMoveable: false
    }
  ])
}));

describe('CzechHolidays', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should get holidays for the current year', () => {
    const year = new Date().getFullYear();
    vi.mocked(DataProvider.getFixedHolidays).mockReturnValue([]);
    vi.mocked(DataProvider.getEasterHolidays).mockReturnValue([]);

    const holidays = CzechHolidays.getHolidaysForYear(year);
    expect(holidays).toHaveLength(1);
  });

  it('should determine if a specific date is a holiday', () => {
    const date = new Date(new Date().getFullYear(), 0, 1);
    expect(CzechHolidays.isHoliday(date)).toBe(true);
  });

  it('should return the holiday name for a given date and locale', () => {
    const date = new Date(new Date().getFullYear(), 0, 1);
    expect(CzechHolidays.getHolidayName(date, HolidaySupportedLocales.English)).toBe('New Year\'s Day');
  });

  it('should return null for non-holiday dates when checking holiday name', () => {
    const date = new Date(new Date().getFullYear(), 6, 10);
    expect(CzechHolidays.getHolidayName(date, HolidaySupportedLocales.English)).toBe(null);
  });

  it('should retrieve the holiday object for a given date', () => {
    const date = new Date(new Date().getFullYear(), 0, 1);
    expect(CzechHolidays.getHoliday(date)).toEqual(holiday);
  });

  it('should return null when trying to retrieve a holiday object for a non-holiday date', () => {
    const date = new Date(new Date().getFullYear(), 6, 10);
    expect(CzechHolidays.getHoliday(date)).toBe(null);
  });
});
