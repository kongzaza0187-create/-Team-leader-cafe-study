/**
 * Lumina 24-Hour Cafe - Bangkok Time (UTC+7) 12:00 PM Daily Cycle Service
 * 
 * Business Rule:
 * The Daily Circular Revenue Dashboard (15,000 THB target) resets strictly
 * every day at 12:00:00 PM (เที่ยงวัน) Bangkok Time (Asia/Bangkok, UTC+7).
 * At 12:00:00 PM, accumulated revenue resets to 0.00 THB and begins counting anew.
 * Defaults strictly to 0.00 THB until real transactions are settled in the current cycle.
 */

export interface BangkokCycleWindow {
  cycleStartUtc: Date;
  cycleEndUtc: Date;
  currentBangkokHour: number;
  currentBangkokMinute: number;
  cycleStartTh: string;
  cycleEndTh: string;
  nextCutoffFormatted: string;
  isInitialBaselineZero: boolean;
}

/**
 * Computes the exact 12:00 PM - 12:00 PM Bangkok Time business cycle for any reference timestamp.
 * Bangkok is UTC+7 (420 minutes ahead of UTC).
 * 12:00:00 PM Bangkok Time = 05:00:00 AM UTC.
 */
export function getBangkokCycleWindow(refDate: Date = new Date()): BangkokCycleWindow {
  const refTime = refDate.getTime();
  // Offset to Bangkok Time (UTC+7)
  const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
  const bangkokDate = new Date(refTime + BANGKOK_OFFSET_MS);

  const bYear = bangkokDate.getUTCFullYear();
  const bMonth = bangkokDate.getUTCMonth();
  const bDay = bangkokDate.getUTCDate();
  const bHour = bangkokDate.getUTCHours();
  const bMinute = bangkokDate.getUTCMinutes();

  let cycleStartUtcMs: number;
  let cycleEndUtcMs: number;

  if (bHour < 12) {
    // Current cycle started yesterday at 12:00:00 Bangkok Time (= 05:00:00 UTC yesterday)
    cycleStartUtcMs = Date.UTC(bYear, bMonth, bDay - 1, 5, 0, 0, 0);
    cycleEndUtcMs = Date.UTC(bYear, bMonth, bDay, 5, 0, 0, 0);
  } else {
    // Current cycle started today at 12:00:00 Bangkok Time (= 05:00:00 UTC today)
    cycleStartUtcMs = Date.UTC(bYear, bMonth, bDay, 5, 0, 0, 0);
    cycleEndUtcMs = Date.UTC(bYear, bMonth, bDay + 1, 5, 0, 0, 0);
  }

  const cycleStartUtc = new Date(cycleStartUtcMs);
  const cycleEndUtc = new Date(cycleEndUtcMs);

  const formatThTime = (d: Date) => {
    return d.toLocaleDateString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' น.';
  };

  const nextCutoffFormatted = cycleEndUtc.toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' น. (เที่ยงวัน)';

  return {
    cycleStartUtc,
    cycleEndUtc,
    currentBangkokHour: bHour,
    currentBangkokMinute: bMinute,
    cycleStartTh: formatThTime(cycleStartUtc),
    cycleEndTh: formatThTime(cycleEndUtc),
    nextCutoffFormatted,
    isInitialBaselineZero: true,
  };
}

/**
 * Validates if a transaction's settlement timestamp falls strictly within the active 12:00 PM Bangkok cycle.
 */
export function isTransactionInCurrent12NoonCycle(settledAtOrCreatedAt: string, refDate: Date = new Date()): boolean {
  if (!settledAtOrCreatedAt) return false;
  const txTime = new Date(settledAtOrCreatedAt).getTime();
  if (isNaN(txTime)) return false;

  const { cycleStartUtc, cycleEndUtc } = getBangkokCycleWindow(refDate);
  return txTime >= cycleStartUtc.getTime() && txTime < cycleEndUtc.getTime();
}
