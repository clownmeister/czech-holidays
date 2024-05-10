import { Holiday, HolidayShopRestriction } from '@app/components/CzechHolidays.ts';
import { calculateEasterHolidays } from '@app/components/EasterCalculator.ts';

export function getEasterHolidays(year: number): Holiday[] {
  const easterHolidays = calculateEasterHolidays(year);
  return [
    {
      day: easterHolidays.goodFriday.getDate(),
      month: easterHolidays.goodFriday.getMonth() + 1,
      name: {
        cs: 'Velký pátek',
        en: 'Good Friday'
      },
      description: {
        cs: '',
        en: ''
      },
      shopRestriction: HolidayShopRestriction.Open
    },
    {
      day: easterHolidays.easterMonday.getDate(),
      month: easterHolidays.easterMonday.getMonth() + 1,
      name: {
        cs: 'Velikonoční pondělí',
        en: 'Easter Monday'
      },
      description: {
        cs: '',
        en: ''
      },
      shopRestriction: HolidayShopRestriction.Closed
    }
  ];
}

export function getFixedHolidays(): Holiday[] {
  return [
    {
      day: 1,
      month: 1,
      name: {
        cs: 'Den obnovy samostatného českého státu; Nový rok',
        en: 'Restoration Day of the Independent Czech State, New Year\'s Day'
      },
      description: {
        cs: '1993 – vznik samostatné České republiky',
        en: 'Czechoslovakia split into the Czech Republic and Slovakia.'
      },
      shopRestriction: HolidayShopRestriction.Closed
    }, {
      day: 1,
      month: 5,
      name: {
        cs: 'Svátek práce',
        en: 'Labor Day'
      },
      description: {
        cs: '',
        en: ''
      },
      shopRestriction: HolidayShopRestriction.Open
    }, {
      day: 8,
      month: 5,
      name: {
        cs: 'Den vítězství',
        en: 'Victory Day'
      },
      description: {
        cs: '1945 – konec druhé světové války v Evropě',
        en: '1945, the end of the European part of World War II.'
      },
      shopRestriction: HolidayShopRestriction.Closed
    }, {
      day: 5,
      month: 7,
      name: {
        cs: 'Den slovanských věrozvěstů Cyrila a Metoděje',
        en: 'Day of the Slavic Apostles Cyril and Methodius'
      },
      description: {
        cs: '863 – příchod bratrů, kteří přinesli křesťanství a vzdělanost na Velkou Moravu',
        en: 'In 863, Church teachers St. Cyril (Constantine) and Metoděj (Methodius) came from the Balkans to Great Moravia to propagate Christian faith and literacy.'
      },
      shopRestriction: HolidayShopRestriction.Open
    }, {
      day: 6,
      month: 7,
      name: {
        cs: 'Den upálení mistra Jana Husa',
        en: 'Jan Hus Day'
      },
      description: {
        cs: '1415',
        en: 'The religious reformer Jan Hus was burned at the stake in 1415.'
      },
      shopRestriction: HolidayShopRestriction.Open
    }, {
      day: 28,
      month: 9,
      name: {
        cs: 'Den české státnosti',
        en: 'Czech Statehood Day'
      },
      description: {
        cs: '935 – zavraždění knížete Václava',
        en: 'In 935, St. Wenceslas, Duke of Bohemia, now patron of the Czech State, was murdered by his brother.'
      },
      shopRestriction: HolidayShopRestriction.Closed
    }, {
      day: 28,
      month: 10,
      name: {
        cs: 'Den vzniku samostatného československého státu',
        en: 'Independent Czechoslovak State Day'
      },
      description: {
        cs: '1918 – vznik Československa',
        en: 'Independence Day and Creation of Czechoslovakia in 1918.'
      },
      shopRestriction: HolidayShopRestriction.Closed
    }, {
      day: 17,
      month: 11,
      name: {
        cs: 'Den boje za svobodu a demokracii',
        en: 'Struggle for Freedom and Democracy Day'
      },
      description: {
        cs: '1939 – uzavření českých vysokých škol nacisty, 1989 – studentské protesty, které spustily sametovou revoluci',
        en: 'Commemorating the student demonstration against Nazi occupation in 1939, and the demonstration in 1989 that started the Velvet Revolution.'
      },
      shopRestriction: HolidayShopRestriction.Open
    }, {
      day: 24,
      month: 12,
      name: {
        cs: 'Štědrý den',
        en: 'Christmas Eve'
      },
      description: {
        cs: '',
        en: 'Christmas is celebrated during the evening of the 24th.'
      },
      shopRestriction: HolidayShopRestriction.Partial
    }, {
      day: 25,
      month: 12,
      name: {
        cs: '1. svátek vánoční',
        en: 'Christmas Day'
      },
      description: {
        cs: '',
        en: ''
      },
      shopRestriction: HolidayShopRestriction.Closed
    }, {
      day: 26,
      month: 12,
      name: {
        cs: '2. svátek vánoční',
        en: 'Second Day of Christmas'
      },
      description: {
        cs: '',
        en: ''
      },
      shopRestriction: HolidayShopRestriction.Closed
    }
  ];
}
