/**
 * Study Café 24/7 - Super Professional Top Navigation Bar
 * Single Source of Truth Brand Header & Compact Primary Navigation
 * 
 * Production Features:
 * - Single Brand Identity: Clean transparent logo (no box) + compact title + 24/7 status
 * - Consolidated Status Pill: Real-time clock + active table PIN indicator
 * - 4-Column Balanced Grid Navigation (Tables, Order Menu, Session, Dashboard):
 *   Zero horizontal scroll (fits all phone screens from 360px up seamlessly)
 * - Session-Locked Language Badge (TH, EN, JA, PT, ZH)
 * - Quick Action Cart Button with live item count & amount
 * - Minimalist Height (<72px total): Saves massive vertical viewport space for menu items
 */

import React, { useState, useEffect } from 'react';
import { AppLanguage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { APP_LOGO_BASE64 } from '../data/appLogoBase64';
import { CanvasIcon } from './CanvasIcon';
import { audioFeedbackService } from '../services/audioFeedbackService';

export type NavigationTab = 'tables' | 'menu' | 'session' | 'admin';

interface Props {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  language: AppLanguage;
  activeTableId?: string;
  secretCode?: string;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  availableTablesCount: number;
  totalTablesCount: number;
}

export const TopNavigationBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  language,
  activeTableId,
  secretCode,
  cartCount,
  cartTotal,
  onOpenCart,
  availableTablesCount,
  totalTablesCount,
}) => {
  const dict = TRANSLATIONS[language];
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${h}:${m}:${s}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTabClick = (tab: NavigationTab) => {
    onTabChange(tab);
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
  };

  const navItems: { id: NavigationTab; labelFull: string; icon: 'table' | 'coffee' | 'clock' | 'chart' }[] = [
    { id: 'tables', labelFull: dict.topNav.tables, icon: 'table' },
    { id: 'menu', labelFull: dict.topNav.menu, icon: 'coffee' },
    { id: 'session', labelFull: dict.topNav.session, icon: 'clock' },
    { id: 'admin', labelFull: dict.topNav.dashboard, icon: 'chart' },
  ];

  const langFlagMap: Record<AppLanguage, string> = {
    th: 'TH',
    en: 'EN',
    ja: 'JA',
    pt: 'PT',
    zh: 'ZH',
  };

  return (
    <header className="w-full bg-[#0B0B0E]/95 backdrop-blur-xl border-b border-[#22222C] shadow-xl select-none relative z-40 overflow-hidden">
      {/* ROW 1: BRAND IDENTITY + CONSOLIDATED STATUS PILL + CONTROLS */}
      <div className="max-w-[1600px] mx-auto px-2.5 sm:px-4 pt-2 pb-1.5 flex items-center justify-between gap-1.5 w-full box-border">
        
        {/* Left: Single Compact Brand Logo + Title */}
        <div 
          onClick={() => handleTabClick('tables')}
          className="flex items-center gap-1.5 cursor-pointer flex-shrink-0 min-w-0 group active:scale-95 transition-transform"
        >
          <img
            src={APP_LOGO_BASE64}
            alt="Study Café 24/7"
            className="h-7 sm:h-8 w-auto object-contain filter drop-shadow group-hover:scale-105 transition-transform flex-shrink-0"
          />
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[11px] sm:text-xs font-black text-white tracking-tight font-['Plus_Jakarta_Sans',sans-serif] whitespace-nowrap">
              STUDY CAFÉ 24/7
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse hidden md:inline-block flex-shrink-0" />
          </div>
        </div>

        {/* Center / Right: Consolidated Status Pill (Time & Active Table PIN) */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink min-w-0 justify-end">
          {/* Active Table PIN Badge (If checked in) */}
          {activeTableId ? (
            <div
              onClick={() => handleTabClick('session')}
              className="px-1.5 sm:px-2 py-0.5 rounded-lg bg-[#122419] border border-[#1E432E] text-[10px] font-mono text-[#34D399] flex items-center gap-1 cursor-pointer active:scale-95 transition-transform flex-shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse flex-shrink-0" />
              <span className="font-bold whitespace-nowrap">โต๊ะ {activeTableId}</span>
              {secretCode && (
                <span className="text-[#FF8C33] font-bold bg-[#0B0B0C] px-1 rounded border border-[#FF6B00]/40 hidden xs:inline-block">
                  {secretCode}
                </span>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#141418] border border-[#222228] text-[10px] font-mono text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              <span>{timeStr || '24H'}</span>
            </div>
          )}

          {/* Locked Language Pill */}
          <div 
            title="ภาษาเซสชัน (Session Language)"
            className="px-1.5 py-0.5 rounded-lg bg-[#141418] border border-[#282830] text-[10px] font-mono font-bold text-stone-300 flex items-center gap-1 select-none flex-shrink-0"
          >
            <span>{langFlagMap[language] || 'TH'}</span>
          </div>

          {/* Quick Action Cart Trigger Button (Strictly Bounded Inside Viewport, Never Clips) */}
          <button
            onClick={() => {
              onOpenCart();
              try {
                audioFeedbackService.playTactileClickSound();
              } catch {}
            }}
            className={`px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all flex-shrink-0 box-border ${
              cartCount > 0
                ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF8C33] text-stone-950 shadow-md shadow-[#FF6B00]/25'
                : 'bg-[#181820] hover:bg-[#20202A] text-stone-300 border border-[#282832]'
            }`}
            aria-label="ตะกร้าสินค้า"
          >
            <div className="relative flex items-center flex-shrink-0">
              <CanvasIcon name="cart" size={13} color={cartCount > 0 ? '#0B0B0C' : '#A1A1AA'} />
              {cartCount > 0 && (
                <span className="ml-1 px-1 rounded-full bg-[#0B0B0C] text-[#FF8C33] text-[9px] font-mono font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            {cartTotal > 0 && (
              <span className="font-mono text-[10px] sm:text-[11px] font-bold whitespace-nowrap">
                ฿{cartTotal.toFixed(0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ROW 2: PRIMARY NAVIGATION TABS (Auto 2-Row Grid on Phone, 4-Cols on Desktop/Tablet) */}
      <div className="max-w-[1600px] mx-auto px-2.5 sm:px-4 pb-2 pt-0.5 w-full box-border">
        <nav className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full max-w-full box-border">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`relative py-2 px-2.5 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 overflow-hidden min-w-0 box-border ${
                  isActive
                    ? 'btn-tactile-orange text-stone-950 shadow-md shadow-[#FF6B00]/25 font-extrabold'
                    : 'bg-[#131317] hover:bg-[#1A1A22] text-stone-200 border border-[#22222A]'
                }`}
              >
                <CanvasIcon
                  name={item.icon}
                  size={14}
                  color={isActive ? '#0B0B0C' : '#A1A1AA'}
                />
                
                {/* Full Responsive Label (Never clipped in 2-row grid) */}
                <span className="truncate tracking-tight font-medium">
                  {item.labelFull}
                </span>

                {/* Table Available Count Badge */}
                {item.id === 'tables' && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-1 flex-shrink-0 ${
                      isActive
                        ? 'bg-[#0B0B0C]/25 text-[#0B0B0C]'
                        : 'bg-[#18261E] text-[#34D399] border border-[#1E432E]'
                    }`}
                  >
                    {availableTablesCount}
                  </span>
                )}

                {/* Active Session Live Indicator */}
                {item.id === 'session' && activeTableId && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse ml-1 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
