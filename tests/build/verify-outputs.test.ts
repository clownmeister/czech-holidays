import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../../dist');

describe('Build outputs', () => {
  describe('ESM output', () => {
    const esmPath = resolve(distDir, 'czech-holidays.js');

    it('should exist', () => {
      expect(existsSync(esmPath)).toBe(true);
    });

    it('should contain export statements', () => {
      const content = readFileSync(esmPath, 'utf-8');
      expect(content).toMatch(/export\s*\{/);
    });

    it('should have a sourcemap', () => {
      expect(existsSync(esmPath + '.map')).toBe(true);
    });
  });

  describe('CJS output', () => {
    const cjsPath = resolve(distDir, 'czech-holidays.cjs');

    it('should exist', () => {
      expect(existsSync(cjsPath)).toBe(true);
    });

    it('should contain module.exports or exports', () => {
      const content = readFileSync(cjsPath, 'utf-8');
      expect(content).toMatch(/exports/);
    });

    it('should have a sourcemap', () => {
      expect(existsSync(cjsPath + '.map')).toBe(true);
    });
  });

  describe('UMD output', () => {
    const umdPath = resolve(distDir, 'czech-holidays.umd.cjs');

    it('should exist', () => {
      expect(existsSync(umdPath)).toBe(true);
    });

    it('should contain UMD wrapper', () => {
      const content = readFileSync(umdPath, 'utf-8');
      expect(content).toMatch(/typeof exports/);
    });

    it('should reference the global name CzechHolidays', () => {
      const content = readFileSync(umdPath, 'utf-8');
      expect(content).toMatch(/CzechHolidays/);
    });

    it('should have a sourcemap', () => {
      expect(existsSync(umdPath + '.map')).toBe(true);
    });
  });

  describe('TypeScript declarations', () => {
    const dtsPath = resolve(distDir, 'czech-holidays.d.ts');

    it('should exist', () => {
      expect(existsSync(dtsPath)).toBe(true);
    });

    it('should export CzechHolidays as default', () => {
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toMatch(/export.*default/);
    });

    it('should export Holiday interface', () => {
      const content = readFileSync(dtsPath, 'utf-8');
      expect(content).toMatch(/Holiday/);
    });
  });

  describe('ESM functional test', () => {
    it('should load and expose the expected API', async () => {
      const mod = await import(resolve(distDir, 'czech-holidays.js'));
      const CzechHolidays = mod.default;

      expect(typeof CzechHolidays.isHoliday).toBe('function');
      expect(typeof CzechHolidays.isBusinessDay).toBe('function');
      expect(typeof CzechHolidays.getHolidaysForYear).toBe('function');
      expect(typeof CzechHolidays.getLongWeekends).toBe('function');
      expect(typeof CzechHolidays.getBridgeDays).toBe('function');
      expect(typeof CzechHolidays.areShopsClosed).toBe('function');

      // Smoke test
      expect(CzechHolidays.isHoliday(new Date(2024, 0, 1))).toBe(true);
      expect(CzechHolidays.isHoliday(new Date(2024, 0, 2))).toBe(false);

      // Named exports
      expect(mod.HolidayShopRestriction).toBeDefined();
      expect(mod.HolidaySupportedLocales).toBeDefined();
    });
  });
});
