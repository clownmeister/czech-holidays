# @clownmeister/czech-holidays

[![npm version](https://img.shields.io/npm/v/@clownmeister/czech-holidays?label=npm&style=flat-square)](https://www.npmjs.com/package/@clownmeister/czech-holidays)
[![CI](https://img.shields.io/github/actions/workflow/status/clownmeister/czech-holidays/main-flow.yml?branch=master&label=CI&style=flat-square)](https://github.com/clownmeister/czech-holidays/actions/workflows/main-flow.yml?query=branch%3Amaster)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@clownmeister/czech-holidays?label=size&style=flat-square)](https://bundlephobia.com/package/@clownmeister/czech-holidays)
[![license](https://img.shields.io/github/license/clownmeister/czech-holidays?label=license&style=flat-square)](./LICENSE.md)

Zero-dependency Czech public holiday library. Works in Node.js, browsers, and any JS runtime.

**[Live Demo & Calendar](https://clownmeister.github.io/czech-holidays/)**

## Install

```bash
npm install @clownmeister/czech-holidays
```

```typescript
import CzechHolidays from '@clownmeister/czech-holidays';
```

Also works with `require()`:
```javascript
const { default: CzechHolidays } = require('@clownmeister/czech-holidays');
```

## Quick start

```typescript
import CzechHolidays, { HolidaySupportedLocales } from '@clownmeister/czech-holidays';

// Is today a holiday?
CzechHolidays.isHoliday(new Date('2024-12-24')); // true

// Get the name
CzechHolidays.getHolidayName(new Date('2024-12-24'), HolidaySupportedLocales.English);
// "Christmas Eve"

// Is it a business day?
CzechHolidays.isBusinessDay(new Date('2024-12-24')); // false

// Can I go shopping?
CzechHolidays.areShopsClosed(new Date('2024-12-25')); // true
CzechHolidays.areShopsRestricted(new Date('2024-12-24')); // true (Partial — closes at noon)
```

## Business days

```typescript
// Working days in a month (great for payroll)
CzechHolidays.getBusinessDaysInMonth(2024, 12); // 19

// Next business day
CzechHolidays.getNextBusinessDay(new Date('2024-12-24'));
// Fri Dec 27 (skips holidays)

// Add/subtract business days
CzechHolidays.addBusinessDays(new Date('2024-12-20'), 5);
// skips Dec 24-26 holidays + weekends

// Count business days between two dates
CzechHolidays.countBusinessDays(new Date('2024-12-20'), new Date('2024-12-31'));

// Remaining business days this month
CzechHolidays.getRemainingBusinessDays(new Date('2024-12-20'));

// Is it the last business day of the month? (payroll deadline)
CzechHolidays.isLastBusinessDayOfMonth(new Date('2024-12-31')); // true
```

## Holiday lookup

```typescript
// Get all holidays for a year
CzechHolidays.getHolidaysForYear(2024); // Holiday[]

// Holidays in a specific month
CzechHolidays.getHolidaysByMonth(2024, 12); // DatedHoliday[]

// Find holidays in a date range
CzechHolidays.getHolidaysInRange(new Date('2024-12-01'), new Date('2025-01-31'));

// Next / previous holiday from a date
CzechHolidays.getNextHoliday(new Date('2024-06-15'));
CzechHolidays.getPreviousHoliday(new Date('2024-06-15'));

// Is tomorrow a holiday?
CzechHolidays.isHolidayEve(new Date('2024-12-23')); // true
```

## Long weekends & bridge days

```typescript
// Find all long weekends (3+ consecutive days off that include a holiday)
CzechHolidays.getLongWeekends(2024);
// [{ start: Date, end: Date, days: 3, holidays: [...] }, ...]

// Find bridge days (take 1 day off, get a longer break)
CzechHolidays.getBridgeDays(2024);
// [{ date: Date, surroundingHolidays: [...], totalDaysOff: 6 }, ...]
```

## Types

```typescript
import type { Holiday, DatedHoliday, LongWeekend, BridgeDay } from '@clownmeister/czech-holidays';
import { HolidayShopRestriction, HolidaySupportedLocales } from '@clownmeister/czech-holidays';
```

### Holiday

```typescript
interface Holiday {
  day: number;
  month: number;
  name: { cs: string; en: string };
  description: { cs: string; en: string };
  shopRestriction: HolidayShopRestriction; // Open (0), Closed (1), Partial (2)
  isMoveable: boolean; // true for Easter-based holidays
}
```

### Shop restrictions

| Value | Meaning |
|-------|---------|
| `Open` (0) | Shops open normally |
| `Closed` (1) | Large retail (>200m²) must close |
| `Partial` (2) | Shops close early (e.g. Christmas Eve at noon) |

## Output formats

The package ships as ESM, CJS, and UMD with TypeScript declarations and sourcemaps.

| Format | File | Use case |
|--------|------|----------|
| ESM | `czech-holidays.js` | Modern bundlers, Node.js |
| CJS | `czech-holidays.cjs` | `require()`, older Node.js |
| UMD | `czech-holidays.umd.cjs` | `<script>` tags, CDN |

## Full API

See the [full API reference](./docs/API.md) for detailed documentation of all 24 methods.

## License

MIT — see [LICENSE](./LICENSE.md).
