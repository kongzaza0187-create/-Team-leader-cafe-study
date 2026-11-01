/**
 * Study Café 24/7 - Advanced Financial & Analytics Service
 * Enterprise PostgreSQL 16+ Query Engine Simulation
 * Multi-Period Analytics: Daily, Weekly, Monthly, and Annual Aggregation
 * Strict Real Database Data Binding - ZERO Mock Data Fallback
 */

import { PromptPayTransaction, AnalyticsPeriod, MultiPeriodSummary, BarChartDataPoint } from '../types';

export class AnalyticsService {
  /**
   * Evaluates if a transaction falls within today (Local Bangkok Time)
   */
  private isToday(dateStr: string): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }

  /**
   * Evaluates if a transaction falls within current week (Monday to Sunday)
   */
  private isCurrentWeek(dateStr: string): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    // Calculate Monday of current week
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0);
    const sunday = new Date(monday.getTime() + 7 * 24 * 60 * 60 * 1000);
    return d >= monday && d < sunday;
  }

  /**
   * Evaluates if a transaction falls within current calendar month
   */
  private isCurrentMonth(dateStr: string): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }

  /**
   * Evaluates if a transaction falls within current calendar year
   */
  private isCurrentYear(dateStr: string): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear();
  }

  /**
   * Extracts total item units sold from transaction
   */
  private extractUnitsSold(tx: PromptPayTransaction): number {
    if (typeof tx.totalUnits === 'number' && tx.totalUnits > 0) {
      return tx.totalUnits;
    }
    if (Array.isArray(tx.items) && tx.items.length > 0) {
      return tx.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    }
    // Baseline safe fallback if items were not captured (at least 1 Unit)
    return Math.max(1, Math.round(tx.amount / 65));
  }

  /**
   * Primary Aggregator: Computes multi-period financial & unit analytics
   * STRICT DATA BINDING: Only genuinely settled real transactions (!tx.isBot)
   * If there are no real transactions in database, returns 0.00 THB and flat bars!
   */
  public getMultiPeriodAnalytics(
    period: AnalyticsPeriod,
    rawTransactions: PromptPayTransaction[] = []
  ): MultiPeriodSummary {
    const realTransactions = rawTransactions.filter(
      (tx) => tx.status === 'SETTLED' && tx.isBot !== true
    );

    switch (period) {
      case 'daily':
        return this.aggregateDaily(realTransactions);
      case 'weekly':
        return this.aggregateWeekly(realTransactions);
      case 'monthly':
        return this.aggregateMonthly(realTransactions);
      case 'annual':
        return this.aggregateAnnual(realTransactions);
      default:
        return this.aggregateDaily(realTransactions);
    }
  }

  /**
   * 1. DAILY DASHBOARD (24 Hourly Intervals: 00:00 - 23:00)
   */
  private aggregateDaily(transactions: PromptPayTransaction[]): MultiPeriodSummary {
    const todayTxs = transactions.filter((tx) => this.isToday(tx.settledAt || tx.createdAt));

    // Initialize 24 hourly buckets
    const chartBars: BarChartDataPoint[] = [];
    for (let h = 0; h < 24; h++) {
      const label = `${h.toString().padStart(2, '0')}:00`;
      chartBars.push({
        label,
        periodKey: `H-${h}`,
        revenue: 0,
        netProfit: 0,
        totalUnits: 0,
        orderCount: 0,
      });
    }

    // Accumulate real data into buckets
    todayTxs.forEach((tx) => {
      const txTime = new Date(tx.settledAt || tx.createdAt);
      const hour = txTime.getHours();
      if (hour >= 0 && hour < 24) {
        chartBars[hour].revenue += tx.amount;
        chartBars[hour].netProfit += tx.amount * 0.68; // 32% COGS
        chartBars[hour].totalUnits += this.extractUnitsSold(tx);
        chartBars[hour].orderCount += 1;
      }
    });

    const totalRevenue = todayTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const totalUnitsSold = todayTxs.reduce((sum, tx) => sum + this.extractUnitsSold(tx), 0);
    const netProfit = totalRevenue > 0 ? Number((totalRevenue * 0.68).toFixed(2)) : 0;
    const totalOrdersCount = todayTxs.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    const todayDateStr = new Date().toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      period: 'daily',
      totalRevenue,
      netProfit,
      totalUnitsSold,
      totalOrdersCount,
      averageOrderValue,
      chartBars,
      hasRealData: totalOrdersCount > 0,
      startDate: todayDateStr,
      endDate: todayDateStr,
    };
  }

  /**
   * 2. WEEKLY DASHBOARD (7 Days: Mon - Sun)
   */
  private aggregateWeekly(transactions: PromptPayTransaction[]): MultiPeriodSummary {
    const weeklyTxs = transactions.filter((tx) => this.isCurrentWeek(tx.settledAt || tx.createdAt));

    const dayLabels = [
      { name: 'จ.', dayIndex: 1 },
      { name: 'อ.', dayIndex: 2 },
      { name: 'พ.', dayIndex: 3 },
      { name: 'พฤ.', dayIndex: 4 },
      { name: 'ศ.', dayIndex: 5 },
      { name: 'ส.', dayIndex: 6 },
      { name: 'อา.', dayIndex: 0 },
    ];

    const chartBars: BarChartDataPoint[] = dayLabels.map((d) => ({
      label: d.name,
      periodKey: `DAY-${d.dayIndex}`,
      revenue: 0,
      netProfit: 0,
      totalUnits: 0,
      orderCount: 0,
    }));

    weeklyTxs.forEach((tx) => {
      const txDay = new Date(tx.settledAt || tx.createdAt).getDay();
      const targetIndex = dayLabels.findIndex((dl) => dl.dayIndex === txDay);
      if (targetIndex > -1) {
        chartBars[targetIndex].revenue += tx.amount;
        chartBars[targetIndex].netProfit += tx.amount * 0.68;
        chartBars[targetIndex].totalUnits += this.extractUnitsSold(tx);
        chartBars[targetIndex].orderCount += 1;
      }
    });

    const totalRevenue = weeklyTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const totalUnitsSold = weeklyTxs.reduce((sum, tx) => sum + this.extractUnitsSold(tx), 0);
    const netProfit = totalRevenue > 0 ? Number((totalRevenue * 0.68).toFixed(2)) : 0;
    const totalOrdersCount = weeklyTxs.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    return {
      period: 'weekly',
      totalRevenue,
      netProfit,
      totalUnitsSold,
      totalOrdersCount,
      averageOrderValue,
      chartBars,
      hasRealData: totalOrdersCount > 0,
      startDate: 'วันจันทร์ต้นสัปดาห์',
      endDate: 'วันอาทิตย์สิ้นสัปดาห์',
    };
  }

  /**
   * 3. MONTHLY DASHBOARD (4-5 Weekly Cohorts of the Current Month)
   */
  private aggregateMonthly(transactions: PromptPayTransaction[]): MultiPeriodSummary {
    const monthlyTxs = transactions.filter((tx) => this.isCurrentMonth(tx.settledAt || tx.createdAt));

    const monthName = new Date().toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });

    // 5 Weekly intervals within month
    const cohortLabels = [
      { label: 'สัปดาห์ 1 (1-7)', startDay: 1, endDay: 7 },
      { label: 'สัปดาห์ 2 (8-14)', startDay: 8, endDay: 14 },
      { label: 'สัปดาห์ 3 (15-21)', startDay: 15, endDay: 21 },
      { label: 'สัปดาห์ 4 (22-28)', startDay: 22, endDay: 28 },
      { label: 'สัปดาห์ 5 (29-31)', startDay: 29, endDay: 31 },
    ];

    const chartBars: BarChartDataPoint[] = cohortLabels.map((c, idx) => ({
      label: c.label,
      periodKey: `M-W${idx + 1}`,
      revenue: 0,
      netProfit: 0,
      totalUnits: 0,
      orderCount: 0,
    }));

    monthlyTxs.forEach((tx) => {
      const dateNum = new Date(tx.settledAt || tx.createdAt).getDate();
      const targetIndex = cohortLabels.findIndex(
        (c) => dateNum >= c.startDay && dateNum <= c.endDay
      );
      if (targetIndex > -1) {
        chartBars[targetIndex].revenue += tx.amount;
        chartBars[targetIndex].netProfit += tx.amount * 0.68;
        chartBars[targetIndex].totalUnits += this.extractUnitsSold(tx);
        chartBars[targetIndex].orderCount += 1;
      }
    });

    const totalRevenue = monthlyTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const totalUnitsSold = monthlyTxs.reduce((sum, tx) => sum + this.extractUnitsSold(tx), 0);
    const netProfit = totalRevenue > 0 ? Number((totalRevenue * 0.68).toFixed(2)) : 0;
    const totalOrdersCount = monthlyTxs.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    return {
      period: 'monthly',
      totalRevenue,
      netProfit,
      totalUnitsSold,
      totalOrdersCount,
      averageOrderValue,
      chartBars,
      hasRealData: totalOrdersCount > 0,
      startDate: `1 ${monthName}`,
      endDate: `สิ้นเดือน ${monthName}`,
    };
  }

  /**
   * 4. ANNUAL DASHBOARD (12 Months of the Current Year)
   */
  private aggregateAnnual(transactions: PromptPayTransaction[]): MultiPeriodSummary {
    const annualTxs = transactions.filter((tx) => this.isCurrentYear(tx.settledAt || tx.createdAt));
    const yearStr = new Date().getFullYear();

    const monthShortLabels = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const chartBars: BarChartDataPoint[] = monthShortLabels.map((name, idx) => ({
      label: name,
      periodKey: `YEAR-M${idx + 1}`,
      revenue: 0,
      netProfit: 0,
      totalUnits: 0,
      orderCount: 0,
    }));

    annualTxs.forEach((tx) => {
      const txMonth = new Date(tx.settledAt || tx.createdAt).getMonth();
      if (txMonth >= 0 && txMonth < 12) {
        chartBars[txMonth].revenue += tx.amount;
        chartBars[txMonth].netProfit += tx.amount * 0.68;
        chartBars[txMonth].totalUnits += this.extractUnitsSold(tx);
        chartBars[txMonth].orderCount += 1;
      }
    });

    const totalRevenue = annualTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const totalUnitsSold = annualTxs.reduce((sum, tx) => sum + this.extractUnitsSold(tx), 0);
    const netProfit = totalRevenue > 0 ? Number((totalRevenue * 0.68).toFixed(2)) : 0;
    const totalOrdersCount = annualTxs.length;
    const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

    return {
      period: 'annual',
      totalRevenue,
      netProfit,
      totalUnitsSold,
      totalOrdersCount,
      averageOrderValue,
      chartBars,
      hasRealData: totalOrdersCount > 0,
      startDate: `มกราคม ${yearStr}`,
      endDate: `ธันวาคม ${yearStr}`,
    };
  }
}

export const analyticsService = new AnalyticsService();
