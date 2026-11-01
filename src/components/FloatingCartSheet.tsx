/**
 * Lumina 24-Hour Cafe - Floating Cart Bottom Sheet & Checkout Drawer
 * Unified Black & Orange Theme (#0B0B0C, #1A1A1E, #FF6B00)
 * 
 * Production-Grade Scrolling & Viewport Architecture:
 * - Container max-height: 85vh with responsive flexbox layout
 * - Scrollable body with -webkit-overflow-scrolling: touch and overscroll-behavior: contain
 * - Generous bottom padding (pb-32 sm:pb-36) ensuring the Checkout action button
 *   and financial calculations (Subtotal, VAT 7%, Service Charge 5%) are NEVER obscured
 *   by the mobile bottom navigation bar or browser safe areas.
 * - Neumorphic 3D pressed states, glowing accents, and tactile Web Audio API feedback.
 */

import React from 'react';
import { CartItem, BillBreakdown, TableSession } from '../types';
import { CanvasIcon } from './CanvasIcon';
import { audioFeedbackService } from '../services/audioFeedbackService';
import { APP_LOGO_BASE64 } from '../data/appLogoBase64';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totals: BillBreakdown;
  activeSession: TableSession | null;
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onClearCart: () => void;
  onProceedToPayment: () => void;
  onNavigateToTables?: () => void;
}

export const FloatingCartSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  items,
  totals,
  activeSession,
  onUpdateQty,
  onClearCart,
  onProceedToPayment,
  onNavigateToTables,
}) => {
  if (!isOpen) return null;

  const handleSafeClose = () => {
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
    onClose();
  };

  const handleSafeClear = () => {
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
    onClearCart();
  };

  const handleSafeQtyChange = (cartItemId: string, delta: number) => {
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
    onUpdateQty(cartItemId, delta);
  };

  const handleSafeProceed = () => {
    if (!activeSession) {
      try {
        audioFeedbackService.playErrorSound();
      } catch {}
      if (onNavigateToTables) {
        onNavigateToTables();
      }
      return;
    }
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}
    onProceedToPayment();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-200">
      {/* Backdrop tap to dismiss */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={handleSafeClose}
        aria-hidden="true"
      />

      {/* Main Cart Modal Container (Strict max-height: 85vh and flexbox layout) */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[85vh] bg-[#1A1A1E] rounded-t-[32px] border-t border-[#282830] shadow-[0_-16px_50px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Top Drag Handle Bar */}
        <div className="pt-3 pb-1 flex justify-center flex-shrink-0 bg-[#1A1A1E]">
          <div className="w-12 h-1.5 bg-[#32323C] rounded-full hover:bg-stone-500 transition-colors" />
        </div>

        {/* Fixed Sheet Header (Always pinned to top of modal) */}
        <div className="px-5 py-3 border-b border-[#282830] flex items-center justify-between flex-shrink-0 bg-[#1A1A1E]">
          <div className="flex items-center gap-3">
            <img
              src={APP_LOGO_BASE64}
              alt="Study Café 24/7"
              className="h-12 w-auto max-w-[110px] object-contain filter drop-shadow-md flex-shrink-0 hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-stone-100 tracking-tight">ตะกร้าสินค้า</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#24242C] text-[#FF8C33] text-[10px] font-mono font-bold border border-[#2E2E3A]">
                  {items.reduce((acc, item) => acc + item.quantity, 0)} ชิ้น
                </span>
              </div>
              <p className="text-[10px] text-stone-400 mt-0.5">
                {activeSession ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                    <span>โต๊ะ <strong className="text-[#FF8C33] font-mono font-bold">{activeSession.tableId}</strong> (PIN: {activeSession.secretCode})</span>
                  </span>
                ) : (
                  <span className="text-[#EF4444] font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                    <span>* ยังไม่ได้ผูกโต๊ะทำงาน</span>
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={handleSafeClear}
                className="px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#EF4444]/15 border border-[#282830] hover:border-[#EF4444]/40 text-[11px] text-stone-400 hover:text-[#EF4444] transition-all cursor-pointer active:scale-95"
              >
                ล้างตะกร้า
              </button>
            )}
            <button
              onClick={handleSafeClose}
              className="w-8 h-8 rounded-full bg-[#121214] text-stone-400 hover:text-stone-100 hover:border-stone-500 flex items-center justify-center border border-[#282830] transition-all cursor-pointer active:scale-95 shadow-inner"
              aria-label="ปิดหน้าต่างตะกร้า"
            >
              <CanvasIcon name="close" size={13} color="#A1A1AA" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body (Smooth Mobile Scroll & Never Obscured by Bottom Nav) */}
        <div 
          className="flex-1 overflow-y-auto overscroll-contain px-4 pt-3 pb-32 sm:pb-36 space-y-4 scrollbar-none"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {items.length === 0 ? (
            /* Empty State */
            <div className="py-14 text-center text-stone-500 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#121214] border border-[#282830] flex items-center justify-center mx-auto text-stone-600 shadow-inner">
                <CanvasIcon name="cart" size={28} color="#71717A" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-stone-300">ยังไม่มีสินค้าในตะกร้า</p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  เลือกเครื่องดื่มกาแฟ เบเกอรี่อบสด หรือของว่างที่แท็บเมนูด้านล่างเพื่อเพิ่มลงในตะกร้า
                </p>
              </div>
              <button
                onClick={handleSafeClose}
                className="btn-tactile-dark px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer text-stone-300 inline-flex items-center gap-1.5"
              >
                <span>เลือกดูเมนูเครื่องดื่ม & อาหาร</span>
                <CanvasIcon name="arrow-right" size={12} color="#A1A1AA" />
              </button>
            </div>
          ) : (
            <>
              {/* Cart Items List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-stone-400 font-semibold px-1">
                  <span>รายการสินค้าที่เลือก</span>
                  <span>จำนวน / ราคา</span>
                </div>

                {items.map((item) => (
                  <div
                    key={item.cartItemId}
                    className="p-3.5 rounded-2xl bg-[#121214] border border-[#282830] flex items-center gap-3 shadow-md hover:border-[#383844] transition-all"
                  >
                    {/* Inline Base64 Photo Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#0B0B0C] border border-[#282830] flex-shrink-0 relative group">
                      <img
                        src={item.menuItem.imageBase64 || item.menuItem.imageUrl || ''}
                        alt={item.menuItem.nameTh}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-stone-100 truncate">
                          {item.menuItem.nameTh}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded bg-[#222228] text-stone-300 text-[9px] font-mono font-bold border border-[#2c2c34]">
                          {item.size === 'S' ? 'Small' : 'Large'}
                        </span>
                      </div>

                      {/* Customization Details */}
                      <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                        {item.customization.temperature === 'ICED' ? 'เย็น' : 'ร้อน'} • หวาน {item.customization.sweetness}%
                        {item.customization.milk && item.customization.milk !== 'WHOLE' && ` • นม${item.customization.milk}`}
                        {item.customization.extraShot && ' • +ช็อต'}
                      </p>

                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xs font-black text-[#FF6B00] font-mono">
                          ฿{item.itemSubtotal.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          (@฿{item.unitPrice.toFixed(2)})
                        </span>
                      </div>
                    </div>

                    {/* Stepper Controls with Neumorphic Tactile Pressed States */}
                    <div className="flex items-center gap-2 bg-[#1A1A1E] px-2.5 py-1.5 rounded-xl border border-[#282830] flex-shrink-0 shadow-inner">
                      <button
                        onClick={() => handleSafeQtyChange(item.cartItemId, -1)}
                        className="w-6 h-6 rounded-lg btn-tactile-dark flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                        aria-label="ลดจำนวน"
                      >
                        <CanvasIcon name="minus" size={9} color="#F4F4F5" />
                      </button>
                      <span className="font-mono text-xs sm:text-sm font-bold text-stone-100 min-w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleSafeQtyChange(item.cartItemId, 1)}
                        className="w-6 h-6 rounded-lg btn-tactile-dark flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                        aria-label="เพิ่มจำนวน"
                      >
                        <CanvasIcon name="plus" size={9} color="#F4F4F5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial Calculation Breakdown Card (VAT 7% + Service Charge 5%) */}
              <div className="p-4 rounded-2xl bg-[#121214] border border-[#282830] space-y-2.5 text-xs shadow-inner">
                <div className="flex items-center gap-1.5 text-stone-300 font-bold border-b border-[#222228] pb-2">
                  <CanvasIcon name="file" size={14} color="#FF6B00" />
                  <span>สรุปรายการยอดชำระเงิน (Tax Invoice Breakdown)</span>
                </div>

                <div className="space-y-1.5 text-stone-400">
                  <div className="flex justify-between items-center">
                    <span>ยอดรวมค่าสินค้า (Subtotal):</span>
                    <span className="font-mono text-stone-200 font-semibold">฿{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="flex items-center gap-1">
                      <span>ภาษีมูลค่าเพิ่ม VAT</span>
                      <span className="text-[9px] px-1 rounded bg-[#1e1e24] text-stone-400 font-mono">7%</span>
                    </span>
                    <span className="font-mono text-stone-300">+฿{totals.vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="flex items-center gap-1">
                      <span>ค่าบริการ Service Charge</span>
                      <span className="text-[9px] px-1 rounded bg-[#1e1e24] text-stone-400 font-mono">5%</span>
                    </span>
                    <span className="font-mono text-stone-300">+฿{totals.serviceChargeAmount.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-2.5 border-t border-[#282830] flex justify-between items-baseline font-bold text-stone-100">
                    <div>
                      <span className="text-xs text-stone-200 block">ยอดชำระสุทธิ (Net Total):</span>
                      <span className="text-[10px] text-stone-500 font-normal">รวมภาษีและค่าบริการเรียบร้อย</span>
                    </div>
                    <span className="text-2xl font-black text-[#FF6B00] font-mono tracking-tight">
                      ฿{totals.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Table Binding Verification Alert Banner */}
              {activeSession ? (
                <div className="p-3 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                      <CanvasIcon name="table" size={13} color="#10B981" />
                    </div>
                    <div>
                      <span className="text-stone-300 font-bold block">ผูกกับโต๊ะ {activeSession.tableId}</span>
                      <span className="text-[10px] text-stone-400">เซสชันพร้อมใช้งาน 24 ชม.</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-extrabold text-[#10B981] bg-[#0B0B0C] px-2.5 py-1 rounded-lg border border-[#10B981]/30">
                    PIN {activeSession.secretCode}
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/40 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-[#EF4444] font-bold">
                    <CanvasIcon name="alert" size={16} color="#EF4444" />
                    <span>ยังไม่ได้เลือกโต๊ะทำงานที่นั่ง</span>
                  </div>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    ระบบคาเฟ่ 24 ชม. กำหนดให้เลือกโต๊ะที่นั่งเพื่อผูกคำสั่งซื้อและออกรหัสยืนยันก่อนชำระเงิน
                  </p>
                  {onNavigateToTables && (
                    <button
                      onClick={() => {
                        handleSafeClose();
                        onNavigateToTables();
                      }}
                      className="btn-tactile-orange w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <span>ไปเลือกโต๊ะทำงานทันที</span>
                      <CanvasIcon name="arrow-right" size={12} color="#0B0B0C" />
                    </button>
                  )}
                </div>
              )}

              {/* Checkout CTA Action Button (Prominent & Always Accessible) */}
              <div className="pt-1">
                <button
                  onClick={handleSafeProceed}
                  disabled={!activeSession}
                  className={`w-full py-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[50px] active:scale-[0.98] ${
                    activeSession
                      ? 'btn-tactile-orange shadow-lg shadow-[#FF6B00]/25'
                      : 'bg-[#222228] text-stone-500 border border-[#2e2e38] cursor-not-allowed opacity-60'
                  }`}
                >
                  <CanvasIcon name="shield" size={16} color={activeSession ? '#0B0B0C' : '#71717A'} />
                  <span>ชำระเงิน / ยืนยันคำสั่งซื้อ (PromptPay QR)</span>
                  <CanvasIcon name="arrow-right" size={14} color={activeSession ? '#0B0B0C' : '#71717A'} />
                </button>
              </div>

              {/* Guaranteed Clearance Spacer so the button can be scrolled past Bottom Nav Bar */}
              <div className="h-10 sm:h-14 flex-shrink-0" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
