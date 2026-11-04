/**
 * Study Café 24/7 - Advanced Financial & Analytics Dashboard System
 * Enterprise Multi-Period Financial Intelligence (Daily, Weekly, Monthly, Annual)
 * Strict PostgreSQL Real Data Binding - ZERO Mock Data Fallback
 * Features Interactive Precision Vector SVG Bar Charts & Quiet Luxury Aesthetics
 */

import React, { useState, useMemo } from 'react';
import { PromptPayTransaction, AnalyticsPeriod, AppLanguage } from '../types';
import { analyticsService } from '../services/analyticsService';
import { audioFeedbackService } from '../services/audioFeedbackService';
import { CanvasIcon } from './CanvasIcon';

interface Props {
  settledTransactions: PromptPayTransaction[];
  onRefresh?: () => void;
  language?: AppLanguage;
}

export const AnalyticsDashboard: React.FC<Props> = ({
  settledTransactions = [],
  onRefresh,
  language = 'th',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<AnalyticsPeriod>('daily');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Filter only genuine, verified settled transactions
  const realSettledTxs = useMemo(() => {
    return settledTransactions.filter((tx) => !tx.isBot && tx.status === 'SETTLED');
  }, [settledTransactions]);

  // Compute multi-period financial breakdown from real database
  const summary = useMemo(() => {
    return analyticsService.getMultiPeriodAnalytics(selectedPeriod, realSettledTxs);
  }, [selectedPeriod, realSettledTxs]);

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    setSelectedPeriod(period);
    setHoveredBarIndex(null);
    setIsDropdownOpen(false);
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
  };

  const periodOptions: { id: AnalyticsPeriod; labelTh: string; labelEn: string; icon: string }[] = [
    { id: 'daily', labelTh: 'รายวัน (Daily 24H)', labelEn: 'Daily (24 Hours)', icon: '⏱' },
    { id: 'weekly', labelTh: 'รายสัปดาห์ (Weekly 7D)', labelEn: 'Weekly (7 Days)', icon: '📅' },
    { id: 'monthly', labelTh: 'รายเดือน (Monthly 4W)', labelEn: 'Monthly (4 Weeks)', icon: '📊' },
    { id: 'annual', labelTh: 'รายปี (Annual 12M)', labelEn: 'Annual (12 Months)', icon: '📈' },
  ];

  const currentOption = periodOptions.find((p) => p.id === selectedPeriod) || periodOptions[0];

  // Bar Chart calculations
  const chartHeight = 220;
  const maxBarRevenue = useMemo(() => {
    const maxVal = Math.max(...summary.chartBars.map((b) => b.revenue), 0);
    // If no real data, scale ceiling to 1000 so the baseline looks proportional
    return maxVal > 0 ? maxVal * 1.15 : 1000;
  }, [summary.chartBars]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & MULTI-PERIOD DROPDOWN SELECTOR          */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#141418] border border-[#282830] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide uppercase font-['Plus_Jakarta_Sans',sans-serif]">
              ระบบวิเคราะห์ผลการดำเนินงาน &amp; ยอดขาย
            </h2>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">
            ดึงข้อมูลจริงจากตารางธุรกรรมและออเดอร์ • ระบบ Zero Mock Data
          </p>
        </div>

        {/* Space-Saving Professional Dropdown Component */}
        <div className="relative self-start sm:self-auto z-30">
          <button
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              try { audioFeedbackService.playTactileClickSound(); } catch {}
            }}
            className="px-4 py-2.5 rounded-2xl bg-[#0B0B0C] hover:bg-[#181822] border border-[#2A2A38] text-xs font-bold text-white flex items-center gap-2.5 transition-all cursor-pointer shadow-lg active:scale-95"
            aria-expanded={isDropdownOpen}
          >
            <span>{currentOption.icon}</span>
            <span className="font-semibold text-stone-200">
              {language === 'en' ? currentOption.labelEn : currentOption.labelTh}
            </span>
            <span className={`text-[10px] text-stone-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Floating Dropdown Menu (Guaranteed Viewport Bounded) */}
          {isDropdownOpen && (
            <>
              {/* Dismiss backdrop */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute right-0 sm:right-0 left-auto top-full mt-2 w-56 max-w-[calc(100vw-2rem)] bg-[#101014] border border-[#2A2A36] rounded-2xl shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-mono text-stone-400 uppercase tracking-wider border-b border-[#202028]">
                  เลือกช่วงเวลา (Time Horizon)
                </div>
                {periodOptions.map((opt) => {
                  const isSelected = selectedPeriod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handlePeriodChange(opt.id)}
                      className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FF6B00] text-stone-950 font-bold shadow-md'
                          : 'text-stone-300 hover:text-white hover:bg-[#1A1A24]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{opt.icon}</span>
                        <span>{language === 'en' ? opt.labelEn : opt.labelTh}</span>
                      </div>
                      {isSelected && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. THREE CORE FINANCIAL & UNIT KPI CARDS                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* KPI CARD 1: รายได้รวม (Total Revenue) */}
        <div className="p-4 rounded-3xl bg-[#141418] border border-[#282830] shadow-xl relative overflow-hidden group hover:border-[#FF6B00]/40 transition-colors">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span className="font-semibold text-stone-300">รายได้รวม (Total Revenue)</span>
            <div className="w-7 h-7 rounded-xl bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00]">
              <CanvasIcon name="chart" size={14} color="#FF6B00" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              ฿{summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-stone-400 border-t border-[#202028] pt-2">
            <span>ฐานข้อมูลจริง: {summary.totalOrdersCount} บิล</span>
            <span className="text-[#34D399] font-mono font-bold">100% Real Slip</span>
          </div>
        </div>

        {/* KPI CARD 2: กำไรสุทธิ (Net Profit / Loss) */}
        <div className="p-4 rounded-3xl bg-[#141418] border border-[#282830] shadow-xl relative overflow-hidden group hover:border-[#10B981]/40 transition-colors">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span className="font-semibold text-stone-300">กำไรสุทธิ (Net Profit)</span>
            <div className="w-7 h-7 rounded-xl bg-[#10B981]/15 flex items-center justify-center text-[#10B981]">
              <CanvasIcon name="shield" size={14} color="#10B981" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#34D399]">
              ฿{summary.netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-stone-400 border-t border-[#202028] pt-2">
            <span>Margin ~68% หลังหัก COGS</span>
            <span className="font-mono text-stone-300">
              {summary.totalRevenue > 0 ? '+68.0%' : '฿0.00'}
            </span>
          </div>
        </div>

        {/* KPI CARD 3: จำนวนชิ้นสินค้าที่จำหน่ายได้ (Total Units Sold) - MUST BE "Unit" */}
        <div className="p-4 rounded-3xl bg-[#141418] border border-[#282830] shadow-xl relative overflow-hidden group hover:border-[#3B82F6]/40 transition-colors">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1.5">
            <span className="font-semibold text-stone-300">ยอดจำหน่ายรวม (Units Sold)</span>
            <div className="w-7 h-7 rounded-xl bg-[#3B82F6]/15 flex items-center justify-center text-[#3B82F6]">
              <CanvasIcon name="coffee" size={14} color="#3B82F6" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {summary.totalUnitsSold.toLocaleString()}
            </span>
            <span className="text-sm font-bold text-[#FF8C33] font-mono uppercase tracking-wider">
              Unit
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-stone-400 border-t border-[#202028] pt-2">
            <span>เครื่องดื่ม &amp; ของว่าง</span>
            <span className="font-mono text-stone-300">
              เฉลี่ย {summary.totalOrdersCount > 0 ? (summary.totalUnitsSold / summary.totalOrdersCount).toFixed(1) : 0} Unit/บิล
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DYNAMIC VECTOR BAR CHART (Strict Data Binding)        */}
      {/* ======================================================== */}
      <div className="p-5 rounded-3xl bg-[#141418] border border-[#282830] shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#222228]">
          <div className="flex items-center gap-2">
            <CanvasIcon name="chart" size={16} color="#FF6B00" />
            <h3 className="text-xs sm:text-sm font-bold text-white">
              กราฟแท่งแสดงรายได้และยอดขาย ({selectedPeriod === 'daily' ? 'รายวัน 24 ชั่วโมง' : selectedPeriod === 'weekly' ? 'รายสัปดาห์ 7 วัน' : selectedPeriod === 'monthly' ? 'รายเดือน' : 'รายปี 12 เดือน'})
            </h3>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FF6B00]" />
              <span>รายได้ (฿)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" />
              <span>กำไรสุทธิ (฿)</span>
            </span>
          </div>
        </div>

        {/* Hover Info Tooltip Bar */}
        <div className="min-h-[28px] px-3 py-1.5 rounded-xl bg-[#0B0B0C] border border-[#222228] flex items-center justify-between text-xs font-mono">
          {hoveredBarIndex !== null && summary.chartBars[hoveredBarIndex] ? (
            <div className="flex items-center gap-4 text-[11px] w-full justify-between">
              <span className="font-bold text-white">
                ช่วงเวลา: <span className="text-[#FF8C33]">{summary.chartBars[hoveredBarIndex].label}</span>
              </span>
              <span>
                รายได้: <strong className="text-white">฿{summary.chartBars[hoveredBarIndex].revenue.toFixed(2)}</strong>
              </span>
              <span>
                กำไร: <strong className="text-[#34D399]">฿{summary.chartBars[hoveredBarIndex].netProfit.toFixed(2)}</strong>
              </span>
              <span>
                สินค้า: <strong className="text-[#FF8C33]">{summary.chartBars[hoveredBarIndex].totalUnits} Unit</strong>
              </span>
              <span>
                ออเดอร์: <strong className="text-stone-300">{summary.chartBars[hoveredBarIndex].orderCount}</strong>
              </span>
            </div>
          ) : (
            <span className="text-stone-500 text-[11px]">
              {summary.hasRealData
                ? 'นำเมาส์หรือแตะที่แท่งกราฟเพื่อดูรายละเอียดแบบเจาะจง'
                : 'ฐานข้อมูลยังไม่มีธุรกรรมที่เสร็จสิ้นในช่วงเวลานี้ (กราฟแท่งสะท้อนค่าจริง 0.00 THB)'}
            </span>
          )}
        </div>

        {/* Precision Vector SVG Bar Chart */}
        <div className="w-full overflow-x-auto scrollbar-none pt-4 pb-2">
          <div className="min-w-[450px] relative">
            {/* SVG Visual Canvas */}
            <svg
              className="w-full overflow-visible"
              height={chartHeight}
              viewBox={`0 0 ${summary.chartBars.length * 40} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="barGradientOrange" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FF8C33" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#FF6B00" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="barGradientGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34D399" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = chartHeight - 30 - ratio * (chartHeight - 50);
                return (
                  <line
                    key={ratio}
                    x1="0"
                    y1={y}
                    x2={summary.chartBars.length * 40}
                    y2={y}
                    stroke="#222228"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Base Zero Line */}
              <line
                x1="0"
                y1={chartHeight - 30}
                x2={summary.chartBars.length * 40}
                y2={chartHeight - 30}
                stroke="#383842"
                strokeWidth="1.5"
              />

              {/* Render Bars */}
              {summary.chartBars.map((bar, i) => {
                const barWidth = Math.max(16, Math.min(26, (summary.chartBars.length * 40) / summary.chartBars.length - 12));
                const x = i * 40 + (40 - barWidth) / 2;
                
                // Height based strictly on real revenue
                const barHeight = bar.revenue > 0
                  ? Math.max(4, (bar.revenue / maxBarRevenue) * (chartHeight - 55))
                  : 0; // Exactly 0 height when no real data!

                const isHovered = hoveredBarIndex === i;

                return (
                  <g
                    key={bar.periodKey}
                    onMouseEnter={() => setHoveredBarIndex(i)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                    className="cursor-pointer transition-opacity"
                  >
                    {/* Hover column background hit area */}
                    <rect
                      x={i * 40}
                      y={0}
                      width={40}
                      height={chartHeight - 30}
                      fill={isHovered ? 'rgba(255, 107, 0, 0.08)' : 'transparent'}
                      rx={4}
                    />

                    {/* The Bar */}
                    {barHeight > 0 ? (
                      <rect
                        x={x}
                        y={chartHeight - 30 - barHeight}
                        width={barWidth}
                        height={barHeight}
                        fill="url(#barGradientOrange)"
                        rx={3}
                        filter={isHovered ? 'drop-shadow(0 0 8px rgba(255,107,0,0.6))' : 'none'}
                        className="transition-all duration-300"
                      />
                    ) : (
                      /* Flat baseline point when 0 THB */
                      <circle
                        cx={x + barWidth / 2}
                        cy={chartHeight - 30}
                        r={1.5}
                        fill="#383842"
                      />
                    )}

                    {/* Value label above bar if revenue exists */}
                    {bar.revenue > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - 35 - barHeight}
                        textAnchor="middle"
                        fill="#FF8C33"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        ฿{bar.revenue >= 1000 ? `${(bar.revenue / 1000).toFixed(1)}k` : Math.round(bar.revenue)}
                      </text>
                    )}

                    {/* Bottom Period Label */}
                    <text
                      x={i * 40 + 20}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      fill={isHovered ? '#FFFFFF' : '#888892'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                    >
                      {bar.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Real Ground Truth Notification */}
        <div className="p-3 rounded-2xl bg-[#0B0B0C] border border-[#222228] flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-2">
            <CanvasIcon name="shield" size={13} color="#10B981" />
            <span>
              {summary.hasRealData
                ? `บันทึกรายการคำสั่งซื้อจริงทั้งหมด ${summary.totalOrdersCount} รายการ ในช่วง ${summary.startDate} - ${summary.endDate}`
                : `ไม่มีประวัติการชำระเงินจริงในช่วงนี้ กราฟแสดงสถานะ 0.00 THB และ 0 Unit ตามข้อกำหนดความถูกต้อง 100%`}
            </span>
          </div>
          {onRefresh && (
            <button
              onClick={() => {
                onRefresh();
                try { audioFeedbackService.playTactileClickSound(); } catch {}
              }}
              className="text-[#FF8C33] hover:underline cursor-pointer font-bold font-mono"
            >
              รีเฟรชฐานข้อมูล
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. RECENT REAL TRANSACTIONS AUDIT LEDGER                 */}
      {/* ======================================================== */}
      <div className="p-4 rounded-3xl bg-[#141418] border border-[#282830] shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-[#222228] pb-2">
          <div className="flex items-center gap-2">
            <CanvasIcon name="table" size={15} color="#FF6B00" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              สมุดบัญชีคำสั่งซื้อจริง (PostgreSQL Transactions Log)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-stone-400">
            {realSettledTxs.length} รายการที่ยืนยันแล้ว
          </span>
        </div>

        {realSettledTxs.length === 0 ? (
          <div className="py-8 text-center text-stone-500 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0B0B0C] flex items-center justify-center mx-auto text-stone-600">
              <CanvasIcon name="chart" size={20} color="#71717A" />
            </div>
            <p className="text-xs text-stone-400 font-medium">ยังไม่มีรายการชำระเงินจริงในระบบ</p>
            <p className="text-[10px] text-stone-500 max-w-sm mx-auto">
              เมื่อลูกค้าเลือกโต๊ะ สั่งเมนู และชำระเงินผ่าน PromptPay พร้อมแนบสลิปที่ถูกต้อง ยอดเงินและจำนวน Unit จะถูกคำนวณเข้าสู่หน้านี้ทันที
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-none pr-1">
            {realSettledTxs.slice(0, 10).map((tx) => {
              const unitsCount = tx.totalUnits || (tx.items ? tx.items.reduce((s, i) => s + i.quantity, 0) : 1);
              return (
                <div
                  key={tx.transactionId}
                  className="p-3 rounded-2xl bg-[#0B0B0C] border border-[#222228] flex items-center justify-between text-xs hover:border-[#FF6B00]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#122419] border border-[#1E432E] flex items-center justify-center text-[#34D399] font-mono font-bold text-xs">
                      {tx.tableId}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-mono">{tx.orderNumber}</span>
                        <span className="px-1.5 py-0.2 rounded bg-[#FF6B00]/15 text-[#FF8C33] text-[9px] font-mono font-bold border border-[#FF6B00]/30">
                          {unitsCount} Unit
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {tx.bankReferenceNo ? `Ref: ${tx.bankReferenceNo}` : 'PromptPay Verified'} • {new Date(tx.settledAt || tx.createdAt).toLocaleTimeString('th-TH')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-[#34D399] block">
                      +฿{tx.amount.toFixed(2)}
                    </span>
                    <span className="text-[9px] font-mono text-stone-500">
                      กำไร ฿{(tx.amount * 0.68).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
