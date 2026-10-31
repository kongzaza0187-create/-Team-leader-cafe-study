/**
 * Lumina 24-Hour Cafe - Floating Cart Bottom Sheet
 * Unified Black & Orange Theme (#0B0B0C, #1A1A1E, #FF6B00)
 * One-Handed Thumb Checkout with VAT 7% & Service Charge 5% Calculation
 * Custom HTML5 Canvas Icons (No Lucide / Emojis)
 * Web Audio API Tactile Sound Feedback
 */

import React from 'react';
import { CartItem, BillBreakdown, TableSession } from '../types';
import { CanvasIcon } from './CanvasIcon';
import { audioFeedbackService } from '../services/audioFeedbackService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totals: BillBreakdown;
  activeSession: TableSession | null;
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onClearCart: () => void;
  onProceedToPayment: () => void;
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
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end justify-center animate-in fade-in">
      <div className="w-full max-w-md max-h-[90vh] bg-[#1A1A1E] rounded-t-[32px] border-t border-[#282830] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="w-10 h-1 bg-[#282830] rounded-full mx-auto my-3 flex-shrink-0"></div>

        {/* Sheet Header */}
        <div className="px-5 pb-3 border-b border-[#282830] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <CanvasIcon name="cart" size={16} color="#FF6B00" />
            <div>
              <h3 className="text-xs font-bold text-stone-100">ตะกร้าสินค้า (Cart)</h3>
              <p className="text-[10px] text-stone-400">
                {activeSession ? (
                  <span>สำหรับโต๊ะ <strong className="text-[#FF6B00] font-mono">{activeSession.tableId}</strong> (PIN: {activeSession.secretCode})</span>
                ) : (
                  <span className="text-[#EF4444]">* ยังไม่ได้เลือกโต๊ะ</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={() => {
                  audioFeedbackService.playTactileClickSound();
                  onClearCart();
                }}
                className="text-[10px] text-stone-500 hover:text-[#EF4444] transition underline"
              >
                ล้างตะกร้า
              </button>
            )}
            <button
              onClick={() => {
                audioFeedbackService.playTactileClickSound();
                onClose();
              }}
              className="w-7 h-7 rounded-full bg-[#121214] text-stone-400 hover:text-stone-100 flex items-center justify-center border border-[#282830]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-none">
          {items.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#121214] flex items-center justify-center mx-auto text-stone-600">
                <CanvasIcon name="cart" size={20} color="#71717A" />
              </div>
              <p className="text-xs">ไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cartItemId}
                className="p-3 rounded-2xl bg-[#121214] border border-[#282830] flex items-center gap-3"
              >
                {/* Inline Base64 Thumbnail */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#0B0B0C] border border-[#282830] flex-shrink-0">
                  <img
                    src={item.menuItem.imageBase64 || item.menuItem.imageUrl || ''}
                    alt={item.menuItem.nameTh}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <h4 className="text-xs font-bold text-stone-100 truncate">
                      {item.menuItem.nameTh}
                    </h4>
                    <span className="px-1.5 py-0.2 rounded bg-[#222228] text-stone-300 text-[9px] font-mono font-bold">
                      {item.size}
                    </span>
                  </div>

                  <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                    {item.customization.temperature === 'ICED' ? 'เย็น' : 'ร้อน'} • หวาน {item.customization.sweetness}%
                    {item.customization.milk !== 'WHOLE' && ` • นม${item.customization.milk}`}
                    {item.customization.extraShot && ' • +ช็อต'}
                  </p>

                  <span className="text-xs font-bold text-[#FF6B00] font-mono block mt-1">
                    ฿{item.itemSubtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-[#1A1A1E] px-2.5 py-1 rounded-xl border border-[#282830] flex-shrink-0">
                  <button
                    onClick={() => {
                      audioFeedbackService.playTactileClickSound();
                      onUpdateQty(item.cartItemId, -1);
                    }}
                    className="w-5 h-5 rounded-md bg-[#222228] text-stone-300 flex items-center justify-center hover:bg-[#282830]"
                  >
                    <CanvasIcon name="minus" size={8} color="#F4F4F5" />
                  </button>
                  <span className="font-mono text-xs font-bold text-stone-100 min-w-4 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => {
                      audioFeedbackService.playTactileClickSound();
                      onUpdateQty(item.cartItemId, 1);
                    }}
                    className="w-5 h-5 rounded-md bg-[#222228] text-stone-300 flex items-center justify-center hover:bg-[#282830]"
                  >
                    <CanvasIcon name="plus" size={8} color="#F4F4F5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Financial Breakdown (VAT 7% + Service Charge 5%) */}
        {items.length > 0 && (
          <div className="p-4 bg-[#121214] border-t border-[#282830] space-y-2 text-xs">
            <div className="space-y-1 text-stone-400">
              <div className="flex justify-between">
                <span>ยอดรวมสินค้า (Subtotal):</span>
                <span className="font-mono text-stone-200">฿{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>ภาษีมูลค่าเพิ่ม VAT (7%):</span>
                <span className="font-mono text-stone-300">+฿{totals.vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>ค่าบริการ Service Charge (5%):</span>
                <span className="font-mono text-stone-300">+฿{totals.serviceChargeAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-[#282830] flex justify-between items-baseline font-bold text-stone-100">
                <span className="text-stone-300">ยอดชำระสุทธิ (Total Amount):</span>
                <span className="text-lg font-black text-[#FF6B00] font-mono">
                  ฿{totals.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                audioFeedbackService.playTactileClickSound();
                onProceedToPayment();
              }}
              disabled={!activeSession}
              className={`w-full py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all ${
                activeSession
                  ? 'btn-tactile-orange'
                  : 'bg-[#222228] text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>ดำเนินการชำระเงิน (PromptPay QR)</span>
              <CanvasIcon name="arrow-right" size={14} color={activeSession ? '#0B0B0C' : '#71717A'} />
            </button>

            {!activeSession && (
              <p className="text-[10px] text-[#EF4444] text-center flex items-center justify-center gap-1">
                <CanvasIcon name="alert" size={12} color="#EF4444" />
                กรุณาเลือกโต๊ะก่อนเพื่อผูกกับเซสชัน
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
