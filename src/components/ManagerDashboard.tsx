/**
 * Lumina 24-Hour Cafe - Admin Revenue & Distributed Architecture Control Room
 * Password Protected: Cryptographically hashed with SHA-256 (Strictly zero plaintext comparison)
 * Features HTML5 Canvas Circular Chart Analytics vs 15,000 THB Minimum Daily Target
 * Post-Checkout Customer Review & Star Rating Analytics
 * Bot Simulation Load Testing & Strict Financial Isolation Module
 * System Audit Logs Protected Exclusively for Admin
 * Unified Black & Orange Theme (#0B0B0C, #1A1A1E, #FF6B00, #10B981, #EF4444)
 */

import React, { useState } from 'react';
import { 
  CafeTable, 
  ConcurrencyMetrics, 
  TableActivityLog, 
  PromptPayTransaction,
  RevenueAnalytics,
  AppLanguage
} from '../types';
import { cafeStore } from '../services/cafeStore';
import { audioFeedbackService } from '../services/audioFeedbackService';
import { CanvasIcon } from './CanvasIcon';
import { CanvasStarRating } from './CanvasStarRating';
import { CanvasRevenueDonut } from './CanvasRevenueDonut';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface Props {
  tables: CafeTable[];
  metrics: ConcurrencyMetrics;
  activityLogs: TableActivityLog[];
  settledTransactions: PromptPayTransaction[];
  revenueAnalytics: RevenueAnalytics;
  language?: AppLanguage;
  onTriggerFailoverTest: () => void;
  onForceResetTable: (tableId: string) => void;
}

export const ManagerDashboard: React.FC<Props> = ({
  tables,
  metrics,
  activityLogs,
  settledTransactions,
  revenueAnalytics,
  language,
  onTriggerFailoverTest,
  onForceResetTable,
}) => {
  // Password Protection State synced with cafeStore
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(cafeStore.getIsAdminAuthenticated());
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard Subtabs (With Multi-Period Financial & Unit Analytics as Primary View)
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'REVENUE' | 'REVIEWS' | 'BOT_TEST' | 'METRICS' | 'TABLES' | 'AUDIT'>('ANALYTICS');
  const [logFilter, setLogFilter] = useState<string>('ALL');

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [serverRlsLogs, setServerRlsLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  const fetchServerRlsLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/v1/admin/audit-logs?limit=150');
      if (res.ok) {
        const data = await res.json();
        if (data.logs && Array.isArray(data.logs)) {
          setServerRlsLogs(data.logs);
        }
      }
    } catch {}
    finally {
      setIsLoadingLogs(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'AUDIT' && isAuthenticated) {
      fetchServerRlsLogs();
    }
  }, [activeTab, isAuthenticated]);

  // Verify Admin Password strictly against server-side authorization endpoint
  const handleVerifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim() || isVerifying) return;
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
    
    setIsVerifying(true);
    setAuthError(null);
    try {
      const isSuccess = await cafeStore.verifyAndLoginAdmin(passwordInput.trim());
      if (isSuccess) {
        setIsAuthenticated(true);
        setAuthError(null);
        setPasswordInput('');
        try {
          audioFeedbackService.playSuccessChime();
        } catch {}
      } else {
        setAuthError('รหัสผ่านผู้ดูแลระบบไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง');
      }
    } catch {
      setAuthError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
    cafeStore.logoutAdmin();
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
  };

  const reviewAnalytics = cafeStore.getReviewAnalytics();
  const botStatus = cafeStore.getBotSimulationStatus();

  const handleToggleBot = () => {
    cafeStore.toggleBotSimulation();
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
  };

  const filteredLogs = logFilter === 'ALL'
    ? activityLogs
    : activityLogs.filter((l) => l.eventType === logFilter);

  // If not authenticated, render strict password prompt modal
  if (!isAuthenticated) {
    return (
      <div className="px-4 py-8 max-w-sm mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#1A1A1E] border border-[#282830] flex items-center justify-center shadow-xl">
          <CanvasIcon name="lock" size={32} color="#FF6B00" />
        </div>

        <div className="text-center space-y-1">
          <span className="text-[10px] font-mono tracking-widest text-[#FF6B00] uppercase font-bold">
            RESTRICTED ADMIN ACCESS
          </span>
          <h2 className="text-lg font-bold text-stone-100">
            ระบบจัดการรายได้และผู้ดูแลระบบ
          </h2>
          <p className="text-xs text-stone-400 max-w-xs">
            กรุณาระบุรหัสผ่านเพื่อเข้าสู่หน้าต่างบริหารจัดการรายได้และสถาปัตยกรรมระบบ
          </p>
        </div>

        <form onSubmit={handleVerifyPassword} className="w-full space-y-3">
          <div className="relative">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setAuthError(null);
              }}
              placeholder="ระบุรหัสผ่านผู้ดูแลระบบ (Admin Password)"
              className="w-full px-4 py-3 rounded-2xl bg-[#121214] border border-[#282830] text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-[#FF6B00] text-xs font-mono transition-colors"
              autoFocus
            />
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-[11px] flex items-center gap-2">
              <CanvasIcon name="alert" size={14} color="#EF4444" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="btn-tactile-orange w-full py-3 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CanvasIcon name={isVerifying ? "refresh" : "key"} size={14} color="#0B0B0C" animateSpin={isVerifying} />
            <span>{isVerifying ? 'กำลังตรวจสอบสิทธิ์...' : 'เข้าสู่ระบบหลังบ้าน (Admin Login)'}</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-4">
      {/* Admin Top Navigation & Status Bar */}
      <div className="p-3.5 rounded-2xl bg-[#1A1A1E] border border-[#282830] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-stone-100 uppercase tracking-wide">
                Admin Control Room
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-stone-400">
                ระบบจัดการคาเฟ่ 24 ชั่วโมง • เซิร์ฟเวอร์ทำงานปกติ
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn-tactile-dark px-2.5 py-1.5 rounded-xl text-stone-300 text-[10px] flex items-center gap-1 transition"
        >
          <CanvasIcon name="close" size={11} color="#EF4444" />
          <span>ออกจากระบบ</span>
        </button>
      </div>

      {/* Subtab Selector */}
      <div className="overflow-x-auto scrollbar-none -mx-4 px-4 flex gap-1.5 py-1">
        <button
          onClick={() => { setActiveTab('ANALYTICS'); audioFeedbackService.playTactileClickSound(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'ANALYTICS'
              ? 'btn-tactile-orange text-stone-950 font-bold shadow-md'
              : 'bg-[#1A1A1E] text-stone-400 border border-[#282830]'
          }`}
        >
          <CanvasIcon name="chart" size={12} color={activeTab === 'ANALYTICS' ? '#0B0B0C' : '#FF6B00'} />
          <span>แดชบอร์ดหลายช่วงเวลา (Multi-Period)</span>
        </button>

        <button
          onClick={() => { setActiveTab('REVENUE'); audioFeedbackService.playTactileClickSound(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'REVENUE'
              ? 'btn-tactile-orange text-stone-950'
              : 'bg-[#1A1A1E] text-stone-400 border border-[#282830]'
          }`}
        >
          <CanvasIcon name="shield" size={12} color={activeTab === 'REVENUE' ? '#0B0B0C' : '#A1A1AA'} />
          <span>รายได้จริง (15k Target)</span>
        </button>

        <button
          onClick={() => { setActiveTab('REVIEWS'); audioFeedbackService.playTactileClickSound(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'REVIEWS'
              ? 'btn-tactile-orange text-stone-950'
              : 'bg-[#1A1A1E] text-stone-400 border border-[#282830]'
          }`}
        >
          <CanvasIcon name="star" size={12} color={activeTab === 'REVIEWS' ? '#0B0B0C' : '#A1A1AA'} />
          <span>คะแนนความพึงพอใจ ({reviewAnalytics.averageRating}★)</span>
        </button>

        <button
          onClick={() => { setActiveTab('BOT_TEST'); audioFeedbackService.playTactileClickSound(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'BOT_TEST'
              ? 'btn-tactile-orange text-stone-950'
              : 'bg-[#1A1A1E] text-stone-400 border border-[#282830]'
          }`}
        >
          <CanvasIcon name="bot" size={12} color={activeTab === 'BOT_TEST' ? '#0B0B0C' : '#A1A1AA'} />
          <span>บอททดสอบโหลด (5 โต๊ะ)</span>
        </button>

        <button
          onClick={() => { setActiveTab('METRICS'); audioFeedbackService.playTactileClickSound(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'METRICS'
              ? 'btn-tactile-orange text-stone-950'
              : 'bg-[#1A1A1E] text-stone-400 border border-[#282830]'
          }`}
        >
          <CanvasIcon name="zap" size={12} color={activeTab === 'METRICS' ? '#0B0B0C' : '#A1A1AA'} />
          <span>สถานะระบบ & คลัสเตอร์</span>
        </button>

        <button
          onClick={() => { setActiveTab('TABLES'); audioFeedbackService.playTactileClickSound(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'TABLES'
              ? 'btn-tactile-orange text-stone-950'
              : 'bg-[#1A1A1E] text-stone-400 border border-[#282830]'
          }`}
        >
          <CanvasIcon name="table" size={12} color={activeTab === 'TABLES' ? '#0B0B0C' : '#A1A1AA'} />
          <span>จัดการ 20 โต๊ะ</span>
        </button>

        <button
          onClick={() => { setActiveTab('AUDIT'); audioFeedbackService.playTactileClickSound(); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'AUDIT'
              ? 'btn-tactile-orange text-stone-950'
              : 'bg-[#1A1A1E] text-stone-400 border border-[#282830]'
          }`}
        >
          <CanvasIcon name="file" size={12} color={activeTab === 'AUDIT' ? '#0B0B0C' : '#A1A1AA'} />
          <span>Audit Logs ({activityLogs.length})</span>
        </button>
      </div>

      {/* TAB 0: ADVANCED MULTI-PERIOD FINANCIAL & ANALYTICS DASHBOARD (STRICT REAL DATA) */}
      {activeTab === 'ANALYTICS' && (
        <AnalyticsDashboard
          settledTransactions={settledTransactions}
          language={language}
        />
      )}

      {/* TAB 1: REVENUE ANALYTICS & HTML5 CANVAS DONUT CHART */}
      {activeTab === 'REVENUE' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#1A1A1E] border border-[#282830] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-bold tracking-wider">
                  CANVAS REVENUE ENGINE
                </span>
                <h3 className="text-sm font-bold text-stone-100">
                  สถิติรายได้จริงเทียบเป้าหมายประจำวัน
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                15,000฿ TARGET
              </span>
            </div>

            {/* Custom HTML5 Canvas Circular Chart */}
            <CanvasRevenueDonut analytics={revenueAnalytics} size={230} />

            {/* Target Breakdown Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-3 rounded-2xl bg-[#121214] border border-[#282830]">
                <span className="text-[10px] text-stone-400 block">รายได้จริงที่ผ่านการตรวจสลิป</span>
                <span className="text-base font-black text-[#10B981] font-mono mt-0.5 block">
                  ฿{revenueAnalytics.totalSettledAmount.toFixed(2)}
                </span>
                <span className="text-[9px] text-stone-500 font-mono">
                  {revenueAnalytics.totalOrdersCount} ออเดอร์จริง (เริ่มต้นที่ 0.00฿)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#121214] border border-[#282830]">
                <span className="text-[10px] text-stone-400 block">
                  {revenueAnalytics.isTargetAchieved ? 'ยอดเงินเกินเป้าหมาย (Surplus)' : 'ส่วนต่างที่ขาด (Target Gap)'}
                </span>
                <span className={`text-base font-black font-mono mt-0.5 block ${revenueAnalytics.isTargetAchieved ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {revenueAnalytics.isTargetAchieved ? '+' : '-'}฿{revenueAnalytics.gapOrSurplusAmount.toFixed(2)}
                </span>
                <span className="text-[9px] text-stone-500 font-mono">
                  {revenueAnalytics.isTargetAchieved ? 'บรรลุเป้าหมายรายวันแล้ว' : 'คิดเป็นสีแดงบนกราฟวงกลม'}
                </span>
              </div>
            </div>

            {/* Bot Non-Revenue Isolation Note */}
            <div className="p-2.5 rounded-xl bg-[#0B0B0C] border border-[#282830] flex items-center justify-between text-[11px] text-stone-300">
              <div className="flex items-center gap-1.5">
                <CanvasIcon name="shield" size={13} color="#10B981" />
                <span>ระบบแยกบัญชีบอทเด็ดขาด: ยอดจำลองบอทไม่ถูกนำมานับเข้า Dashboard</span>
              </div>
              <span className="text-[10px] font-mono text-[#10B981]">100% ISOLATED</span>
            </div>
          </div>

          {/* Genuine Verified Transactions List */}
          <div className="p-4 rounded-3xl bg-[#1A1A1E] border border-[#282830] space-y-3">
            <h4 className="text-xs font-bold text-stone-200">
              รายการสลิปจริงที่ตรวจสอบผ่านแล้ว ({settledTransactions.filter(t => !t.isBot).length})
            </h4>

            {settledTransactions.filter(t => !t.isBot).length === 0 ? (
              <div className="py-6 text-center text-stone-500 text-xs">
                ยังไม่มีรายการโอนเงินจริง (รายได้เริ่มต้นที่ 0.00 บาท)
              </div>
            ) : (
              <div className="space-y-2">
                {settledTransactions.filter(t => !t.isBot).map((tx) => (
                  <div key={tx.transactionId} className="p-2.5 rounded-xl bg-[#121214] border border-[#282830] flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-stone-200 font-bold block">
                        {tx.orderNumber} (โต๊ะ {tx.tableId})
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        อ้างอิง: {tx.bankReferenceNo || 'N/A'} • {tx.senderBank}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[#10B981] font-bold block">
                        +฿{tx.amount.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-stone-500">
                        {tx.settledAt ? new Date(tx.settledAt).toLocaleTimeString('th-TH') : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POST-CHECKOUT CUSTOMER REVIEWS & RATING ANALYTICS */}
      {activeTab === 'REVIEWS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#1A1A1E] border border-[#282830] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-bold tracking-wider">
                  CUSTOMER SATISFACTION
                </span>
                <h3 className="text-sm font-bold text-stone-100">
                  สถิติคะแนนความพึงพอใจของลูกค้า
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF6B00]/20 text-[#FF8C33] border border-[#FF6B00]/30">
                POST-CHECKOUT
              </span>
            </div>

            {/* Score Hero Card */}
            <div className="p-4 rounded-2xl bg-[#121214] border border-[#282830] flex items-center justify-between">
              <div>
                <span className="text-3xl font-black text-[#FF6B00] font-mono">
                  {reviewAnalytics.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-stone-500"> / 5.0</span>
                <div className="mt-1">
                  <CanvasStarRating value={reviewAnalytics.averageRating} readOnly size={18} />
                </div>
                <span className="text-[10px] text-stone-400 block mt-1">
                  จากทั้งหมด {reviewAnalytics.totalReviews} ความคิดเห็น
                </span>
              </div>

              {/* Star Distribution Breakdown */}
              <div className="space-y-1 w-36 text-[10px]">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = (reviewAnalytics.starDistribution as any)[star] || 0;
                  const pct = reviewAnalytics.totalReviews > 0 ? (count / reviewAnalytics.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-1.5 text-stone-400">
                      <span className="w-4 font-mono">{star}★</span>
                      <div className="flex-1 h-1.5 bg-[#222228] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6B00] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-5 text-right font-mono text-stone-500">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Reviews List */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-stone-300 block">
                ความคิดเห็นล่าสุดของลูกค้า:
              </span>

              {reviewAnalytics.recentReviews.map((rev) => (
                <div key={rev.reviewId} className="p-3 rounded-2xl bg-[#121214] border border-[#282830] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-stone-200">
                      {rev.customerName || `ลูกค้าโต๊ะ ${rev.tableId}`}
                    </span>
                    <CanvasStarRating value={rev.rating} readOnly size={13} />
                  </div>

                  {rev.comment && (
                    <p className="text-[11px] text-stone-300 italic">
                      "{rev.comment}"
                    </p>
                  )}

                  {rev.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {rev.tags.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-[#1A1A1E] text-stone-400 text-[9px] border border-[#282830]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="text-[9px] text-stone-500 block text-right font-mono">
                    {new Date(rev.createdAt).toLocaleString('th-TH')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOT SIMULATION CONTROL (NON-REVENUE ISOLATED) */}
      {activeTab === 'BOT_TEST' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#1A1A1E] border border-[#282830] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-bold tracking-wider">
                  BOT SIMULATION ENGINE
                </span>
                <h3 className="text-sm font-bold text-stone-100">
                  ระบบจำลองการเข้า-ออกโต๊ะ (5 โต๊ะทดสอบ)
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${botStatus.enabled ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30' : 'bg-[#EF4444]/20 text-[#EF4444]'}`}>
                {botStatus.enabled ? 'ACTIVE' : 'PAUSED'}
              </span>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              โมดูลนี้รันงานอัตโนมัติบน 5 โต๊ะที่กำหนด (T03, T07, T11, T15, T19) เพื่อทดสอบรอบการหมุนเวียนและการเข้าใช้งานพร้อมกัน 50,000 คน
            </p>

            <div className="p-3 rounded-2xl bg-[#121214] border border-[#282830] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">โต๊ะที่จำลองการทดสอบ:</span>
                <span className="font-mono text-[#FF6B00] font-bold">{botStatus.simulatedTables.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">รอบออเดอร์จำลองสะสม:</span>
                <span className="font-mono text-stone-100 font-bold">{botStatus.totalSimulatedOrders} รอบ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">การกระทำล่าสุดของบอท:</span>
                <span className="font-mono text-[#10B981] text-[11px]">{botStatus.lastSimulatedAction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">การแยกส่วนรายได้:</span>
                <span className="text-[#10B981] font-bold font-mono">100% ISOLATED (ไม่บวกเข้ายอดเงินจริง)</span>
              </div>
            </div>

            <button
              onClick={handleToggleBot}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                botStatus.enabled ? 'btn-tactile-dark text-stone-300' : 'btn-tactile-orange text-stone-950'
              }`}
            >
              <CanvasIcon name="bot" size={14} color={botStatus.enabled ? '#A1A1AA' : '#0B0B0C'} />
              <span>{botStatus.enabled ? 'พักการทำงานของบอท (Pause Bot)' : 'เริ่มจำลองบอทอีกครั้ง (Resume Bot)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: 50K CONCURRENCY & ARCHITECTURE */}
      {activeTab === 'METRICS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#1A1A1E] border border-[#282830] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-bold tracking-wider">
                  ENTERPRISE INFRASTRUCTURE
                </span>
                <h3 className="text-sm font-bold text-stone-100">
                  สถาปัตยกรรมรองรับ 50,000 Concurrent Users
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981]">
                {metrics.concurrentUsers.toLocaleString()} USERS
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#121214] border border-[#282830]">
                <span className="text-[10px] text-stone-400 block">Go Goroutines Hub</span>
                <span className="text-sm font-black text-stone-100 font-mono mt-0.5 block">
                  {metrics.activeGoroutines.toLocaleString()}
                </span>
                <span className="text-[9px] text-[#10B981] font-mono">Zero Thread Lock</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#121214] border border-[#282830]">
                <span className="text-[10px] text-stone-400 block">Redis Cache Hit Rate</span>
                <span className="text-sm font-black text-[#FF6B00] font-mono mt-0.5 block">
                  {metrics.redisCacheHitRatio}%
                </span>
                <span className="text-[9px] text-stone-500 font-mono">Cluster Sharding</span>
              </div>
            </div>

            {/* Node Breakdown */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-stone-300 block">สถานะ Microservice Nodes:</span>
              {metrics.nodes.map((node) => (
                <div key={node.name} className="p-2.5 rounded-xl bg-[#121214] border border-[#282830] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-stone-200 block">{node.name}</span>
                    <span className="text-[10px] text-stone-500 font-mono">Port {node.port} • {node.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#10B981] font-bold text-[10px] block">{node.status}</span>
                    <span className="text-stone-400 font-mono text-[10px]">{node.latencyMs}ms</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Failover Recovery Test */}
            <div className="pt-2">
              <button
                onClick={() => { onTriggerFailoverTest(); audioFeedbackService.playTactileClickSound(); }}
                disabled={metrics.isAutoRecovering}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 ${
                  metrics.isAutoRecovering ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'btn-tactile-dark text-stone-200'
                }`}
              >
                <CanvasIcon name="refresh" size={13} color={metrics.isAutoRecovering ? '#EF4444' : '#FF6B00'} animateSpin={metrics.isAutoRecovering} />
                <span>
                  {metrics.isAutoRecovering
                    ? `กำลังทดสอบ Failover Recovery (${metrics.failoverRemainingSec}s)...`
                    : 'ทดสอบจำลองเซิร์ฟเวอร์ล่ม (15s Auto-Recovery Test)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TABLES MANAGEMENT */}
      {activeTab === 'TABLES' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#1A1A1E] border border-[#282830] space-y-3">
            <h3 className="text-sm font-bold text-stone-100">
              สถานะโต๊ะทั้งหมด (T01 - T20)
            </h3>
            <div className="space-y-2">
              {tables.map((table) => (
                <div key={table.tableId} className="p-2.5 rounded-xl bg-[#121214] border border-[#282830] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-100 block">
                      {table.tableId} - {table.name}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {table.zone} • สถานะ: <strong className={table.status === 'AVAILABLE' ? 'text-[#10B981]' : 'text-[#FF6B00]'}>{table.status}</strong>
                    </span>
                  </div>
                  {table.status === 'OCCUPIED' && (
                    <button
                      onClick={() => { onForceResetTable(table.tableId); audioFeedbackService.playTactileClickSound(); }}
                      className="px-2.5 py-1 rounded-lg bg-[#EF4444]/20 text-[#EF4444] text-[10px] font-bold border border-[#EF4444]/30"
                    >
                      ล้างเซสชัน
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: SYSTEM AUDIT LOGS & RLS PERSISTENCE (PROTECTED FOR ADMIN ONLY) */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-[#1A1A1E] border border-[#282830] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#FF6B00] uppercase font-bold tracking-wider">
                    RLS DATABASE AUDIT TRAIL
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                    /server_data/rls_audit_logs.json
                  </span>
                </div>
                <h3 className="text-sm font-bold text-stone-100">
                  ประวัติระบบและ RLS Logs จำแนกตามบทบาทและโต๊ะ
                </h3>
              </div>
              <button
                onClick={() => { fetchServerRlsLogs(); audioFeedbackService.playTactileClickSound(); }}
                disabled={isLoadingLogs}
                className="btn-tactile-dark px-2.5 py-1.5 rounded-xl text-[10px] font-mono flex items-center gap-1.5 self-start sm:self-auto"
              >
                <CanvasIcon name="refresh" size={12} color="#FF6B00" animateSpin={isLoadingLogs} />
                <span>{isLoadingLogs ? 'กำลังโหลด...' : 'รีเฟรช RLS Logs'}</span>
              </button>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 overflow-x-auto scrollbar-none py-1">
              {['ALL', 'CUSTOMER', 'ADMIN', 'SYSTEM_CRON', 'CHECK_IN', 'CHECK_OUT', 'SLIP_VERIFIED'].map((f) => (
                <button
                  key={f}
                  onClick={() => { setLogFilter(f); audioFeedbackService.playTactileClickSound(); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap ${
                    logFilter === f ? 'bg-[#FF6B00] text-stone-950 font-bold' : 'bg-[#121214] text-stone-400 border border-[#282830]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Structured RLS Log Entries */}
            <div className="space-y-2 max-h-[55vh] overflow-y-auto scrollbar-none">
              {(serverRlsLogs.length > 0 ? serverRlsLogs : filteredLogs)
                .filter((log: any) => {
                  if (logFilter === 'ALL') return true;
                  return log.user_role === logFilter || log.event_type === logFilter || log.eventType === logFilter;
                })
                .map((log: any) => {
                  const role = log.user_role || (log.eventType === 'MAINTENANCE' ? 'ADMIN' : 'CUSTOMER');
                  const roleBadgeColor = role === 'ADMIN' ? 'text-[#FF6B00] bg-[#FF6B00]/15 border-[#FF6B00]/30' : role === 'SYSTEM_CRON' ? 'text-[#60A5FA] bg-[#60A5FA]/15 border-[#60A5FA]/30' : 'text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30';
                  const eventType = log.event_type || log.eventType;
                  const timeStr = log.created_at || log.timestamp;

                  return (
                    <div key={log.log_id || log.id} className="p-3 rounded-2xl bg-[#121214] border border-[#282830] space-y-1.5 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#202028] pb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${roleBadgeColor}`}>
                            RLS: {role}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[#202028] text-stone-300 font-mono text-[9px] font-bold">
                            {eventType}
                          </span>
                          {log.table_id && log.table_id !== 'SYSTEM' && (
                            <span className="text-[10px] text-[#FF8C33] font-mono font-semibold">
                              โต๊ะ {log.table_id}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                          {log.client_ip && <span>IP: {log.client_ip}</span>}
                          <span>{timeStr ? new Date(timeStr).toLocaleTimeString('th-TH') : ''}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
                        {log.message}
                      </p>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="p-2 rounded-xl bg-[#0B0B0C] text-[10px] font-mono text-stone-400 overflow-x-auto scrollbar-none">
                          <span className="text-stone-500 block mb-0.5">RLS PAYLOAD METADATA:</span>
                          <code>{JSON.stringify(log.metadata)}</code>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
