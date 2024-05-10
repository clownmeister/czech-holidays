import { beforeEach, describe, expect, it, vi } from 'vitest';
import CzechHolidays, { HolidaySupportedLocales } from '@app/components/CzechHolidays.ts';
import * as DataProvider from '@app/components/DataProvider.ts';

//TODO: finish this is not nice
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
  shopRestriction: 1
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
      shopRestriction: 1
    }
  ])
}));

describe('CzechHolidays', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  it('should get holidays for the current year if not in local storage and store them', () => {
    const year = new Date().getFullYear();
    vi.mocked(DataProvider.getFixedHolidays).mockReturnValue([]);
    vi.mocked(DataProvider.getEasterHolidays).mockReturnValue([]);

    const holidays = CzechHolidays.getHolidaysForYear(year);
    expect(holidays).toHaveLength(1);
    // expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should determine if a specific date is a holiday', () => {
    const date = new Date(new Date().getFullYear(), 0, 1);
    const holidays = [holiday];
    localStorage.setItem(`holidays-${date.getFullYear()}`, JSON.stringify(holidays));

    expect(CzechHolidays.isHoliday(date)).toBe(true);
  });

  it('should return the holiday name for a given date and locale', () => {
    const date = new Date(new Date().getFullYear(), 0, 1);
    const holidays = [holiday];
    localStorage.setItem(`holidays-${date.getFullYear()}`, JSON.stringify(holidays));

    expect(CzechHolidays.getHolidayName(date, HolidaySupportedLocales.English)).toBe('New Year\'s Day');
  });

  it('should return null for non-holiday dates when checking holiday name', () => {
    const date = new Date(new Date().getFullYear(), 6, 10);
    expect(CzechHolidays.getHolidayName(date, HolidaySupportedLocales.English)).toBe(null);
  });

  it('should retrieve the holiday object for a given date', () => {
    const date = new Date(new Date().getFullYear(), 0, 1);
    const holidays = [holiday];
    localStorage.setItem(`holidays-${date.getFullYear()}`, JSON.stringify(holidays));

    expect(CzechHolidays.getHoliday(date)).toEqual(holidays[0]);
  });

  it('should return null when trying to retrieve a holiday object for a non-holiday date', () => {
    const date = new Date(new Date().getFullYear(), 6, 10);
    expect(CzechHolidays.getHoliday(date)).toBe(null);
  });
});
