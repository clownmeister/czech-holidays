# @clownmeister/czech-holidays

![GitHub license](https://img.shields.io/github/license/clownmeister/czech-holidays?style=flat-square)
![GitHub package.json version](https://img.shields.io/github/package-json/v/clownmeister/czech-holidays?style=flat-square)

## Overview

`@clownmeister/czech-holidays` is a lightweight package for managing public Czech holidays.

## Features

- Determine if a date is a Czech holiday.
- Retrieve the name of a Czech holiday for a given date.
- Includes fixed holidays and dynamically calculated Easter holidays.
- Easy to integrate with TypeScript projects.
- Optional caching into local storage.

## Installation

You can install `@clownmeister/czech-holidays` via npm or yarn:

```bash
# Using npm
npm install @clownmeister/czech-holidays

# Using yarn
yarn add @clownmeister/czech-holidays
```

### Import

```typescript
//Typescript
import CzechHolidays, {HolidaySupportedLocales} from '@clownmeister/czech-holidays';
```



## API Reference

Below is the list of public functions along with their descriptions and parameters.

| Function             | Description                                                                                          | Parameters                                                | Return Type       |
|----------------------|------------------------------------------------------------------------------------------------------|-----------------------------------------------------------|-------------------|
| `isHoliday`          | Checks if a specified date is a Czech holiday.                                                       | `date: Date`                                              | `boolean`         |
| `getHolidayName`     | Retrieves the localized name of the holiday for a given date.                                        | `date: Date`<br/>`locale: HolidaySupportedLocales = 'cs'` | `string \| null`  |
| `getHoliday`         | Returns the holiday object for a given date.                                                         | `date: Date`                                              | `Holiday \| null` |
| `getHolidaysForYear` | Fetches all Czech holidays for a specified year. Optionally uses local storage to cache the results. | `year: number`<br/>`useLocalStorage: boolean = false`     | `Holiday[]`       |

### Function Details

- **`isHoliday(date: Date): boolean`**  
  Checks if the provided date is a recognized Czech holiday by looking up the date in the internal holiday map.

- **`getHolidayName(date: Date, locale: HolidaySupportedLocales = HolidaySupportedLocales.Czech): string | null`**  
  Returns the name of the holiday on the given date in the specified locale (`'cs'` for Czech, `'en'` for English).
  Returns `null` if there is no holiday on that date.

- **`getHoliday(date: Date): Holiday | null`**  
  Retrieves the full `Holiday` object for the specified date, providing detailed information such as the day, month,
  name, description, and shop restriction status.

- **`getHolidaysForYear(year: number, useLocalStorage: boolean = false): Holiday[]`**  
  Compiles a list of all holidays for the specified year. If `useLocalStorage` is true, it will fetch the holidays from
  local storage if available or calculate and store them otherwise.

## Usage examples

### Check if a Date is a Holiday

```typescript
const date = new Date('2024-12-24');
const isHoliday = CzechHolidays.isHoliday(date);
console.log(isHoliday);  // Outputs: true if the date is a holiday
```

### Get the Name of a Holiday

```typescript
const holidayName = CzechHolidays.getHolidayName(date, HolidaySupportedLocales.English);
console.log(`Holiday: ${holidayName}`);  // Outputs the name of the holiday if it's a holiday
```

### Get Holiday Details

```typescript
const holidayDetails = CzechHolidays.getHoliday(date);
console.log(holidayDetails);  // Outputs the Holiday object with details
```

### Get All Holidays for a Year

```typescript
const holidays = CzechHolidays.getHolidaysForYear(2024, true);
console.log(holidays);  // Outputs an array of Holiday objects for the year 2024
```

### Holiday output format

```json
{
  "day": 24,
  "month": 12,
  "name": {
    "cs": "Štědrý den",
    "en": "Christmas Eve"
  },
  "description": {
    "cs": "",
    "en": "Christmas is celebrated during the evening of the 24th."
  },
  "shopRestriction": 2
}
```

### Shop restriction enum

```typescript
enum HolidayShopRestriction {
  Open, //=0
  Closed, //=1
  Partial, //=2 - When shops close after set time
}
```

## Caching

If you call `getHolidayForYear` with second parameter `true`,
it will fetch from local storage or regenerate
and save it to local storage based on if it already exists.

`CzechHolidays.getHolidayForYear(2024, true);`

Other methods already use localstorage out of the box.

## License

This project is licensed under the terms of the MIT License - see the [LICENSE](./LICENSE.md) file for details.
