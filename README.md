# @clownmeister/czech-holidays

![GitHub license](https://img.shields.io/github/license/clownmeister/czech-holidays)
![GitHub package.json version](https://img.shields.io/github/package-json/v/clownmeister/czech-holidays)

## Overview

`@clownmeister/czech-holidays` is a lightweight TypeScript package for managing Czech holidays. It provides functionality to determine if a given date is a Czech holiday and to retrieve the name of a holiday for a specific date.

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

## Usage

Example usage:

```typescript
import CzechHolidays, {type Holiday} from '@clownmeister/czech-holidays';

// Check if a date is a Czech holiday
const date = new Date('2024-12-24');
const isHoliday = CzechHolidays.isHoliday(date);
if (isHoliday) {
  console.log('This is a Czech holiday!');
} else {
  console.log('This is not a Czech holiday.');
}
//o: This is a Czech holiday!

// Get the name of a Czech holiday for a given date
const holidayName = CzechHolidays.getHolidayName(date);
console.log(`The holiday on ${date.toDateString()} is: ${holidayName}`);
//o: The holiday on Mon Dec 24 2024 is: Štědrý den

// Get all Czech holidays for a specific year
const holidaysForYear: Holiday[] = CzechHolidays.getHolidayForYear(2024);
console.log('Czech holidays for 2024:', holidaysForYear);
//o: Czech holidays for 2024: [
//   { day: 1, month: 1, name: 'Den obnovy samostatného českého státu' },
//   { day: 1, month: 5, name: 'Svátek práce' },
//   { day: 8, month: 5, name: 'Den vítězství' },
//   ... ]
```

### Caching

If you call `getHolidayForYear` with second parameter `true`, 
it will fetch from local storage or regenerate 
and save it to local storage based on if it already exists.

`CzechHolidays.getHolidayForYear(2024, true);`

## License
This project is licensed under the terms of the MIT License - see the [LICENSE](./LICENSE.md) file for details.