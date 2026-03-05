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
  isMoveable: boolean;
}

export interface DatedHoliday extends Holiday {
  date: Date;
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

export interface LongWeekend {
  start: Date;
  end: Date;
  days: number;
  holidays: DatedHoliday[];
}

export interface BridgeDay {
  date: Date;
  surroundingHolidays: DatedHoliday[];
  totalDaysOff: number;
}
