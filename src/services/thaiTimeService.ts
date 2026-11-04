/**
 * Study Café 24/7 - Thai Time Business Cycle Service
 * Cutoff: Every Day at 12:00:00 PM Thailand Time (UTC+7 / Asia/Bangkok)
 * At 12:00 PM daily, revenue resets to 0.00 THB and begins counting new transactions
 */

export interface ThaiCycleWindow {
  cycleStartUtcMs: number;
  cycleEndUtcMs: number;
  cycleStart: Date;
  cycleEnd: Date;
  nextReset: Date;
  cycleStartFormatted: string;
  cycleEndFormatted: string;
  nextResetFormatted: string;
  remainingMsToReset: number;
  remainingFormatted: string;
  isInCurrentCycle: (dateInput: string | Date | number) => boolean;
}

/**
 * Calculates the current 12:00 PM Thai Time business cycle window.
 */
export function getThai12pmCycleWindow(referenceDate: Date = new Date()): ThaiCycleWindow {
  const utcMs = referenceDate.getTime();
  // Thai Time is UTC+7 hours
  const THAI_OFFSET_MS = 7 * 60 * 60 * 1000;
  const thaiDate = new Date(utcMs + THAI_OFFSET_MS);

  const thaiYear = thaiDate.getUTCFullYear();
  const thaiMonth = thaiDate.getUTCMonth();
  const thaiDay = thaiDate.getUTCDate();
  const thaiHours = thaiDate.getUTCHours();

  // If current Thai time hour is < 12:
  // Cycle started YESTERDAY at 12:00:00 PM Thai Time (which is yesterday 05:00:00 UTC)
  // Next reset is TODAY at 12:00:00 PM Thai Time (which is today 05:00:00 UTC)
  //
  // If current Thai time hour is >= 12:
  // Cycle started TODAY at 12:00:00 PM Thai Time (which is today 05:00:00 UTC)
  // Next reset is TOMORROW at 12:00:00 PM Thai Time (which is tomorrow 05:00:00 UTC)
  let startYear = thaiYear;
  let startMonth = thaiMonth;
  let startDay = thaiDay;

  let nextYear = thaiYear;
  let nextMonth = thaiMonth;
  let nextDay = thaiDay;

  if (thaiHours < 12) {
    // Started yesterday
    startDay = thaiDay - 1;
    // Next reset is today at 12:00 PM
  } else {
    // Started today
    // Next reset is tomorrow at 12:00 PM
    nextDay = thaiDay + 1;
  }

  // 12:00:00 Thai Time is 05:00:00 UTC (12 - 7 = 5)
  const cycleStartUtcMs = Date.UTC(startYear, startMonth, startDay, 5, 0, 0, 0);
  const nextResetUtcMs = Date.UTC(nextYear, nextMonth, nextDay, 5, 0, 0, 0);
  const cycleEndUtcMs = nextResetUtcMs - 1; // 11:59:59.999 Thai Time

  const cycleStart = new Date(cycleStartUtcMs);
  const cycleEnd = new Date(cycleEndUtcMs);
  const nextReset = new Date(nextResetUtcMs);

  const remainingMsToReset = Math.max(0, nextResetUtcMs - utcMs);
  const totalSec = Math.floor(remainingMsToReset / 1000);
  const remH = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const remM = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const remS = String(totalSec % 60).padStart(2, '0');
  const remainingFormatted = `${remH}:${remM}:${remS}`;

  const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
    timeZone: 'Asia/Bangkok',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const cycleStartFormatted = `${thaiDateFormatter.format(cycleStart)} น.`;
  const cycleEndFormatted = `${thaiDateFormatter.format(cycleEnd)} น.`;
  const nextResetFormatted = `ตัดยอดเวลา 12:00 น. (${remainingFormatted})`;

  const isInCurrentCycle = (dateInput: string | Date | number): boolean => {
    if (!dateInput) return false;
    const txMs = new Date(dateInput).getTime();
    if (isNaN(txMs)) return false;
    return txMs >= cycleStartUtcMs && txMs <= cycleEndUtcMs;
  };

  return {
    cycleStartUtcMs,
    cycleEndUtcMs,
    cycleStart,
    cycleEnd,
    nextReset,
    cycleStartFormatted,
    cycleEndFormatted,
    nextResetFormatted,
    remainingMsToReset,
    remainingFormatted,
    isInCurrentCycle,
  };
}
