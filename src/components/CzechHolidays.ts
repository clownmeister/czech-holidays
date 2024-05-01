export interface Holiday {
  day: number;
  month: number;
  name: string;
}

const CzechHolidays = (() => {
  const currentYear = new Date().getFullYear();
  const fixedHolidays: Holiday[] = [
    {day: 1, month: 1, name: "Den obnovy samostatného českého státu"},
    {day: 1, month: 5, name: "Svátek práce"},
    {day: 8, month: 5, name: "Den vítězství"},
    {day: 5, month: 7, name: "Den slovanských věrozvěstů Cyrila a Metoděje"},
    {day: 6, month: 7, name: "Den upálení mistra Jana Husa"},
    {day: 28, month: 9, name: "Den české státnosti"},
    {day: 28, month: 10, name: "Den vzniku samostatného československého státu"},
    {day: 17, month: 11, name: "Den boje za svobodu a demokracii"},
    {day: 24, month: 12, name: "Štědrý den"},
    {day: 25, month: 12, name: "1. svátek vánoční"},
    {day: 26, month: 12, name: "2. svátek vánoční"}
  ];

  function getStoredHolidays(): Holiday[] | null {
    const stored = localStorage.getItem(`holidays-${currentYear}`);
    return stored ? JSON.parse(stored) : null;
  }

  function storeHolidays(holidays: Holiday[]) {
    localStorage.setItem(`holidays-${currentYear}`, JSON.stringify(holidays));
  }

  function initializeHolidays(): Map<string, string> {
    const holidays = getHolidayForYear(currentYear, true);
    const holidayMap = new Map<string, string>();
    holidays.forEach(h => holidayMap.set(`${h.day}-${h.month}`, h.name));
    return holidayMap;
  }

  function getHolidayForYear(year: number, useLocalStorage: boolean = false): Holiday[] {
    let holidays = getStoredHolidays();
    if (!holidays) {
      const easterHolidays = calculateEasterHolidays(year);
      holidays = fixedHolidays.concat([
        {
          day: easterHolidays.goodFriday.getDate(),
          month: easterHolidays.goodFriday.getMonth() + 1,
          name: "Velký pátek"
        },
        {
          day: easterHolidays.easterSunday.getDate(),
          month: easterHolidays.easterSunday.getMonth() + 1,
          name: "Velikonoční neděle"
        },
        {
          day: easterHolidays.easterMonday.getDate(),
          month: easterHolidays.easterMonday.getMonth() + 1,
          name: "Velikonoční pondělí"
        }
      ]);
      if (useLocalStorage) storeHolidays(holidays);
    }

    return holidays;
  }


  const holidayMap = initializeHolidays();

  function isHoliday(date: Date): boolean {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const key = `${day}-${month}`;
    return holidayMap.has(key);
  }

  function getHolidayName(date: Date): string | null {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const key = `${day}-${month}`;
    return holidayMap.get(key) || null;
  }

  return {isHoliday, getHolidayName};
})();

export default CzechHolidays;

function calculateEasterHolidays(year: number): { easterSunday: Date; goodFriday: Date; easterMonday: Date } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  const easterSunday = new Date(year, month - 1, day);
  const goodFriday = new Date(year, month - 1, day - 2);
  const easterMonday = new Date(year, month - 1, day + 1);

  return {
    easterSunday,
    goodFriday,
    easterMonday
  };
}