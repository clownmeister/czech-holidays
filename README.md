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

## Limitations

- Does not provide historical data. i.e.: incorrect holidays for 100 years ago.

## Installation

You can install `@clownmeister/czech-holidays` via npm or yarn:

```bash
# Using npm
npm install @clownmeister/czech-holidays

# Using yarn
yarn add @clownmeister/czech-holidays
```

## Usage

```typescript
import CzechHolidays from '@clownmeister/czech-holidays';

// Check if a date is a Czech holiday
const date = new Date('2024-12-24');
const isHoliday = CzechHolidays.isHoliday(date);

if (isHoliday) {
  console.log('This is a Czech holiday!');
} else {
  console.log('This is not a Czech holiday.');
}

// Get the name of a Czech holiday for a given date
const holidayName = CzechHolidays.getHolidayName(date);
console.log(`The holiday on ${date.toDateString()} is: ${holidayName}`);
```

## License
This project is licensed under the terms of the MIT License - see the [LICENSE](./LICENSE.md) file for details.