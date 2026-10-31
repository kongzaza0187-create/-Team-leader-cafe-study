/**
 * Lumina 24-Hour Cafe - Native Mobile Bottom Navigation Bar
 * Unified Black & Orange Theme (#0B0B0C, #1A1A1E, #FF6B00)
 * Custom HTML5 Canvas Icons (No Lucide / Emojis)
 * Unconditional Immediate Tab Routing
 * Full Mobile & Tablet Responsive Docking
 */

import React from 'react';
import { CanvasIcon } from './CanvasIcon';
import { audioFeedbackService } from '../services/audioFeedbackService';

export type NavigationTab = 'tables' | 'menu' | 'session' | 'admin';

interface Props {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  cartCount: number;
  hasActiveSession: boolean;
  activeTableId?: string;
  onOpenCart: () => void;
}

export const Navigation: React.FC<Props> = ({
  activeTab,
  onTabChange,
  cartCount,
  hasActiveSession,
  activeTableId,
  onOpenCart,
}) => {
  const handleSelect = (tab: NavigationTab) => {
    // 1. Unconditionally switch tab first
    onTabChange(tab);
    // 2. Safe audio feedback
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
  };

  return (
    <nav className="w-full z-40 bg-[#0B0B0C]/95 backdrop-blur-xl border-t border-[#282830] shadow-2xl safe-area-pb select-none">
      <div className="max-w-md mx-auto px-3 sm:px-4 py-2 flex items-center justify-between">
        {/* Tab 1: Table List */}
        <button
          onClick={() => handleSelect('tables')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 transition-all rounded-xl cursor-pointer ${
            activeTab === 'tables'
              ? 'text-[#FF6B00] scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="โต๊ะที่นั่ง"
        >
          <div className="relative">
            <CanvasIcon
              name="table"
              size={20}
              color={activeTab === 'tables' ? '#FF6B00' : '#A1A1AA'}
            />
            {hasActiveSession && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium tracking-tight">โต๊ะที่นั่ง</span>
        </button>

        {/* Tab 2: Menu */}
        <button
          onClick={() => handleSelect('menu')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 transition-all rounded-xl cursor-pointer ${
            activeTab === 'menu'
              ? 'text-[#FF6B00] scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="เมนูสั่งซื้อ"
        >
          <div className="relative">
            <CanvasIcon
              name="coffee"
              size={20}
              color={activeTab === 'menu' ? '#FF6B00' : '#A1A1AA'}
            />
          </div>
          <span className="text-[10px] mt-1 font-medium tracking-tight">เมนูสั่งซื้อ</span>
        </button>

        {/* Center Floating Cart Button */}
        {cartCount > 0 && (
          <div className="-mt-6 flex-shrink-0 px-1 sm:px-2">
            <button
              onClick={() => {
                onOpenCart();
                try {
                  audioFeedbackService.playTactileClickSound();
                } catch {}
              }}
              className="relative w-12 h-12 rounded-full bg-[#FF6B00] hover:bg-[#FF8C33] text-stone-950 flex items-center justify-center shadow-lg shadow-[#FF6B00]/40 transform active:scale-95 transition-all btn-tactile-orange cursor-pointer"
              aria-label="ตะกร้าสินค้า"
            >
              <CanvasIcon name="cart" size={20} color="#0B0B0C" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0B0B0C] text-[#FF6B00] text-[10px] font-bold flex items-center justify-center border-2 border-[#FF6B00]">
                {cartCount}
              </span>
            </button>
          </div>
        )}

        {/* Tab 3: Session & Timeline */}
        <button
          onClick={() => handleSelect('session')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 transition-all rounded-xl cursor-pointer ${
            activeTab === 'session'
              ? 'text-[#FF6B00] scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="เซสชันของฉัน"
        >
          <div className="relative">
            <CanvasIcon
              name="clock"
              size={20}
              color={activeTab === 'session' ? '#FF6B00' : '#A1A1AA'}
            />
            {hasActiveSession && (
              <span className="absolute -top-1 -right-2 px-1 rounded-full bg-[#FF6B00] text-stone-950 text-[8px] font-bold font-mono">
                {activeTableId}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 font-medium tracking-tight">เซสชัน</span>
        </button>

        {/* Tab 4: Manager & Architecture */}
        <button
          onClick={() => handleSelect('admin')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 transition-all rounded-xl cursor-pointer ${
            activeTab === 'admin'
              ? 'text-[#FF6B00] scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="ระบบหลังบ้าน"
        >
          <div className="relative">
            <CanvasIcon
              name="shield"
              size={20}
              color={activeTab === 'admin' ? '#FF6B00' : '#A1A1AA'}
            />
          </div>
          <span className="text-[10px] mt-1 font-medium tracking-tight">หลังบ้าน</span>
        </button>
      </div>
    </nav>
  );
};
