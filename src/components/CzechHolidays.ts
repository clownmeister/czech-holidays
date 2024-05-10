import { getEasterHolidays, getFixedHolidays } from '@app/components/DataProvider.ts';

export interface LocalizedText {
  cs: string;
  en: string;

  [key: string]: string;
}

export interface Holiday {
  day: number;
  month: number;
  name: LocalizedText;
  description: LocalizedText;
  shopRestriction: HolidayShopRestriction;
}

export enum HolidayShopRestriction {
  Open,
  Closed,
  Partial,
}

export enum HolidaySupportedLocales {
  Czech = 'cs',
  English = 'en'
}

const CzechHolidays = (() => {
  const currentYear = new Date().getFullYear();
  const fixedHolidays: Holiday[] = getFixedHolidays();

  function getStoredHolidays(): Holiday[] | null {
    const stored = localStorage.getItem(`holidays-${currentYear}`);
    return stored ? JSON.parse(stored) : null;
  }

  function storeHolidays(holidays: Holiday[]) {
    localStorage.setItem(`holidays-${currentYear}`, JSON.stringify(holidays));
  }

  function getHolidayMap(year: number): Map<string, Holiday> {
    const holidays = getHolidaysForYear(year, true);
    const holidayMap = new Map<string, Holiday>();
    holidays.forEach((h) => holidayMap.set(`${h.day}-${h.month}`, h));
    return holidayMap;
  }

  function getHolidaysForYear(year: number, useLocalStorage: boolean = false): Holiday[] {
    let holidays = getStoredHolidays();
    if (!holidays) {
      const easterHolidays = getEasterHolidays(year);
      holidays = fixedHolidays.concat(easterHolidays);
      if (useLocalStorage) storeHolidays(holidays);
    }

    return holidays;
  }

  let holidayMap = getHolidayMap(currentYear);

  function getMapKey(date: Date): string {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    if (year !== currentYear) {
      holidayMap = getHolidayMap(year);
    }

    return `${day}-${month}`;
  }

  function isHoliday(date: Date): boolean {
    return holidayMap.has(getMapKey(date));
  }

  function getHoliday(date: Date): Holiday | null {
    return holidayMap.get(getMapKey(date)) ?? null;
  }

  function getHolidayName(date: Date, locale: HolidaySupportedLocales = HolidaySupportedLocales.Czech): string | null {
    const holiday = holidayMap.get(getMapKey(date));
    return holiday?.name[locale] ?? null;
  }

  return {
    isHoliday,
    getHolidayName,
    getHoliday,
    getHolidaysForYear
  };
})();

export default CzechHolidays;


