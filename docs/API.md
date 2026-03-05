# API Reference

All methods are available on the default export `CzechHolidays`.

```typescript
import CzechHolidays from '@clownmeister/czech-holidays';
```

---

## Core

### `isHoliday(date: Date): boolean`
Checks if a date is a Czech public holiday.

### `getHoliday(date: Date): Holiday | null`
Returns the Holiday object for a given date, or `null` if not a holiday.

### `getHolidayName(date: Date, locale?: HolidaySupportedLocales): string | null`
Returns the localized holiday name (`'cs'` default, `'en'` for English). Returns `null` if not a holiday.

### `getHolidaysForYear(year: number): Holiday[]`
Returns all 13 Czech public holidays for a given year (11 fixed + 2 Easter-based). Results are cached in memory.

### `getHolidaysByMonth(year: number, month: number): DatedHoliday[]`
Returns holidays for a specific month (1–12). Each result includes a `date` field.

### `getHolidaysInRange(from: Date, to: Date): DatedHoliday[]`
Returns all holidays within a date range (inclusive). Order of arguments doesn't matter. Works across year boundaries.

---

## Weekend & Business Days

### `isWeekend(date: Date): boolean`
Returns `true` for Saturday and Sunday.

### `isBusinessDay(date: Date): boolean`
Returns `true` if the date is not a weekend and not a public holiday.

### `getNextBusinessDay(date: Date): Date`
Returns the next business day after the given date. Skips weekends and holidays.

### `addBusinessDays(date: Date, count: number): Date`
Adds (or subtracts with negative values) business days to a date. Does not mutate the input.

### `countBusinessDays(from: Date, to: Date): number`
Counts business days between two dates (exclusive of both endpoints). Order doesn't matter.

### `getBusinessDaysInMonth(year: number, month: number): number`
Returns the number of business days in a given month (1–12).

### `getRemainingBusinessDays(date: Date): number`
Returns the number of remaining business days from the given date to the end of the month (inclusive of the given date).

### `isLastBusinessDayOfMonth(date: Date): boolean`
Returns `true` if the date is the last business day of its month. Returns `false` for non-business days.

---

## Holiday Navigation

### `getNextHoliday(date: Date): DatedHoliday`
Returns the next public holiday on or after the given date. Includes a `date` field.

### `getPreviousHoliday(date: Date): DatedHoliday`
Returns the most recent public holiday on or before the given date.

### `isHolidayEve(date: Date): boolean`
Returns `true` if the next day is a public holiday.

---

## Shop Restrictions

### `areShopsClosed(date: Date): boolean`
Returns `true` if large retail shops (>200m²) must be fully closed on the given date.

### `areShopsRestricted(date: Date): boolean`
Returns `true` if shops have any restriction (`Closed` or `Partial`).

### `getShopRestriction(date: Date): HolidayShopRestriction | null`
Returns the shop restriction enum value for the date, or `null` if not a holiday.

---

## Long Weekends & Bridge Days

### `getLongWeekends(year: number): LongWeekend[]`
Finds all long weekends — continuous stretches of 3+ non-working days (weekends + holidays) that include at least one public holiday.

```typescript
interface LongWeekend {
  start: Date;
  end: Date;
  days: number;
  holidays: DatedHoliday[];
}
```

### `getBridgeDays(year: number): BridgeDay[]`
Finds bridge days — single working days sandwiched between non-working days (weekend or holiday on both sides). Taking these days off extends your break.

```typescript
interface BridgeDay {
  date: Date;
  surroundingHolidays: DatedHoliday[];
  totalDaysOff: number; // total consecutive days off if you take the bridge day
}
```

---

## Types

```typescript
import type {
  Holiday,
  DatedHoliday,
  LocalizedText,
  LongWeekend,
  BridgeDay,
} from '@clownmeister/czech-holidays';

import {
  HolidayShopRestriction,
  HolidaySupportedLocales,
} from '@clownmeister/czech-holidays';
```

### Holiday
```typescript
interface Holiday {
  day: number;
  month: number;
  name: LocalizedText;        // { cs: string, en: string }
  description: LocalizedText;
  shopRestriction: HolidayShopRestriction;
  isMoveable: boolean;        // true for Easter-derived holidays
}
```

### DatedHoliday
```typescript
interface DatedHoliday extends Holiday {
  date: Date;
}
```

### Enums
```typescript
enum HolidayShopRestriction {
  Open = 0,    // Shops open normally
  Closed = 1,  // Large retail must close
  Partial = 2, // Shops close early
}

enum HolidaySupportedLocales {
  Czech = 'cs',
  English = 'en',
}
```
