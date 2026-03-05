import { describe, expect, it } from 'vitest';
import { getFixedHolidays, getEasterHolidays } from '@app/components/DataProvider.ts';
import { HolidayShopRestriction } from '@app/components/types.ts';

describe('DataProvider', () => {
  describe('getFixedHolidays', () => {
    it('should return 11 fixed holidays', () => {
      const holidays = getFixedHolidays();
      expect(holidays).toHaveLength(11);
    });

    it('should include New Year / Restoration Day (Jan 1)', () => {
      const holidays = getFixedHolidays();
      const newYear = holidays.find((h) => h.day === 1 && h.month === 1);
      expect(newYear).toBeDefined();
      expect(newYear!.name.cs).toContain('Nový rok');
      expect(newYear!.name.en).toContain("New Year's Day");
      expect(newYear!.shopRestriction).toBe(HolidayShopRestriction.Closed);
    });

    it('should include Christmas Eve (Dec 24) with Partial shop restriction', () => {
      const holidays = getFixedHolidays();
      const christmasEve = holidays.find((h) => h.day === 24 && h.month === 12);
      expect(christmasEve).toBeDefined();
      expect(christmasEve!.shopRestriction).toBe(HolidayShopRestriction.Partial);
    });

    it('should include all expected fixed holiday dates', () => {
      const holidays = getFixedHolidays();
      const dates = holidays.map((h) => `${h.day}-${h.month}`);
      const expectedDates = [
        '1-1', '1-5', '8-5', '5-7', '6-7',
        '28-9', '28-10', '17-11', '24-12', '25-12', '26-12',
      ];
      expectedDates.forEach((date) => {
        expect(dates).toContain(date);
      });
    });

    it('should have both cs and en locale for all holidays', () => {
      const holidays = getFixedHolidays();
      holidays.forEach((h) => {
        expect(h.name).toHaveProperty('cs');
        expect(h.name).toHaveProperty('en');
        expect(h.description).toHaveProperty('cs');
        expect(h.description).toHaveProperty('en');
        expect(h.name.cs).toBeTruthy();
        expect(h.name.en).toBeTruthy();
      });
    });

    it('should have valid shop restriction values for all holidays', () => {
      const holidays = getFixedHolidays();
      const validValues = [
        HolidayShopRestriction.Open,
        HolidayShopRestriction.Closed,
        HolidayShopRestriction.Partial,
      ];
      holidays.forEach((h) => {
        expect(validValues).toContain(h.shopRestriction);
      });
    });

    it('should mark all fixed holidays as not moveable', () => {
      const holidays = getFixedHolidays();
      holidays.forEach((h) => {
        expect(h.isMoveable).toBe(false);
      });
    });
  });

  describe('getEasterHolidays', () => {
    it('should return 2 Easter holidays (Good Friday and Easter Monday)', () => {
      const holidays = getEasterHolidays(2024);
      expect(holidays).toHaveLength(2);
    });

    it('should return Good Friday for 2024 on March 29', () => {
      const holidays = getEasterHolidays(2024);
      const goodFriday = holidays.find((h) => h.name.en === 'Good Friday');
      expect(goodFriday).toBeDefined();
      expect(goodFriday!.day).toBe(29);
      expect(goodFriday!.month).toBe(3);
      expect(goodFriday!.shopRestriction).toBe(HolidayShopRestriction.Open);
    });

    it('should return Easter Monday for 2024 on April 1', () => {
      const holidays = getEasterHolidays(2024);
      const easterMonday = holidays.find((h) => h.name.en === 'Easter Monday');
      expect(easterMonday).toBeDefined();
      expect(easterMonday!.day).toBe(1);
      expect(easterMonday!.month).toBe(4);
      expect(easterMonday!.shopRestriction).toBe(HolidayShopRestriction.Closed);
    });

    it('should have Czech and English names', () => {
      const holidays = getEasterHolidays(2024);
      holidays.forEach((h) => {
        expect(h.name.cs).toBeTruthy();
        expect(h.name.en).toBeTruthy();
      });
    });

    it('should mark Easter holidays as moveable', () => {
      const holidays = getEasterHolidays(2024);
      holidays.forEach((h) => {
        expect(h.isMoveable).toBe(true);
      });
    });

    it('should calculate different dates for different years', () => {
      const holidays2024 = getEasterHolidays(2024);
      const holidays2025 = getEasterHolidays(2025);
      const friday2024 = holidays2024.find((h) => h.name.en === 'Good Friday')!;
      const friday2025 = holidays2025.find((h) => h.name.en === 'Good Friday')!;
      expect(`${friday2024.day}-${friday2024.month}`).not.toBe(`${friday2025.day}-${friday2025.month}`);
    });
  });
});
