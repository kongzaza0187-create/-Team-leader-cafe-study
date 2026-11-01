/**
 * Lumina 24-Hour Cafe - Minimalist Luxury Table Selection Screen
 * High-Contrast Prominent Header Design ("เลือกโต๊ะทำงาน & ตะกร้าสินค้า")
 * Embossed Neumorphic Available Tables (#10B981) & Sunken Muted Occupied Tables
 * Resilient State Management & Native Click Event Handlers (Zero Freezes / Lockups)
 * Custom HTML5 Canvas Icons & Web Audio API Tactile Feedback
 * Mobile & Tablet Responsive Grid (iPad Mini/Pro & Smartphone)
 */

import React, { useState } from 'react';
import { CafeTable, TableSession } from '../types';
import { CanvasIcon } from './CanvasIcon';
import { audioFeedbackService } from '../services/audioFeedbackService';
import { CanvasAnimatedCheckmark } from './CanvasAnimatedCheckmark';
import { TableGridSystem } from './TableGridSystem';
import { TABLE_ICON_AVAILABLE_BASE64 } from '../data/tableIconBase64';
import { APP_LOGO_BASE64 } from '../data/appLogoBase64';

interface Props {
  tables: CafeTable[];
  activeSession: TableSession | null;
  onSelectAndOccupyTable: (tableId: string) => void;
  onNavigateToMenu: () => void;
}

export const TableSelectionScreen: React.FC<Props> = ({
  tables = [],
  activeSession,
  onSelectAndOccupyTable,
  onNavigateToMenu,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [confirmingTable, setConfirmingTable] = useState<CafeTable | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [successTableInfo, setSuccessTableInfo] = useState<{ tableId: string; secretCode?: string } | null>(null);
  const [myTableDetailModal, setMyTableDetailModal] = useState<CafeTable | null>(null);
  const [blockedModalMessage, setBlockedModalMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const zones = ['ALL', 'Silent Focus Zone', 'Collaborative Zone', 'Zen Garden View', 'Team Workshop Area', 'VIP Soundproof Pod'];

  const safeTables = Array.isArray(tables) ? tables : [];
  const filteredTables = selectedZone === 'ALL'
    ? safeTables
    : safeTables.filter((t) => t.zone === selectedZone);

  const availableCount = safeTables.filter((t) => t.status === 'AVAILABLE').length;

  const handleTableClick = (table: CafeTable) => {
    try {
      audioFeedbackService.playTactileClickSound();
    } catch {}

    // If customer clicks their own active table
    if (activeSession?.tableId === table.tableId) {
      setMyTableDetailModal(table);
      return;
    }

    // Prevent multi-table booking if customer already has an active unpaid session
    if (activeSession && activeSession.status === 'ACTIVE' && activeSession.tableId !== table.tableId) {
      setBlockedModalMessage(
        `คุณมีโต๊ะที่กำลังใช้งานอยู่แล้ว (โต๊ะ ${activeSession.tableId}) กรุณาชำระเงินและ Checkout ก่อนจองโต๊ะเพิ่ม`
      );
      return;
    }

    // If table is occupied by someone else, do nothing
    if (table.status === 'OCCUPIED' || table.status === 'MAINTENANCE') {
      return;
    }

    // Prompt confirmation
    setConfirmingTable(table);
  };

  const handleConfirmLease = () => {
    if (!confirmingTable) return;
    const targetId = confirmingTable.tableId;

    try {
      onSelectAndOccupyTable(targetId);

      setSuccessTableInfo({
        tableId: targetId,
        secretCode: activeSession?.tableId === targetId ? activeSession.secretCode : undefined,
      });

      setConfirmingTable(null);
      setShowSuccessModal(true);

      try {
        audioFeedbackService.playSuccessChime();
      } catch {}
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเลือกโต๊ะ');
    }
  };

  const activeTableCode = activeSession?.secretCode || '••••••';

  return (
    <div className="px-3 sm:px-5 py-3 space-y-4 max-w-5xl mx-auto">
      {/* PROMINENT HIGH-CONTRAST HERO HEADER ("เลือกโต๊ะทำงาน & ตะกร้าสินค้า") */}
      <div className="header-hero-glow rounded-3xl p-4 sm:p-5 space-y-3 relative overflow-hidden">
        {/* Subtle decorative background light flare */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={APP_LOGO_BASE64}
              alt="Study Café 24/7"
              className="h-16 sm:h-20 w-auto max-w-[130px] sm:max-w-[160px] object-contain filter drop-shadow-xl flex-shrink-0 hover:scale-105 transition-transform"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Study Café 24/7
                </h1>
                <span className="text-[10px] font-mono text-[#FF6B00] bg-[#FF6B00]/15 px-2 py-0.2 rounded-full border border-[#FF6B00]/30 font-bold">
                  20 โต๊ะ
                </span>
              </div>
              <p className="text-xs text-stone-300">
                แตะโต๊ะที่ว่างเพื่อเริ่มต้นใช้งานและรับรหัสลับ 6 หลัก
              </p>
            </div>
          </div>

          {/* Consolidated Single Status Pill (Zero Redundancy) */}
          <div className="flex-shrink-0 self-start sm:self-auto">
            <div className="badge-tactile-available px-3 py-1.5 rounded-2xl inline-flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
              <span>ว่าง {availableCount} / {safeTables.length}</span>
            </div>
          </div>
        </div>

        {/* Current Active Session Card (If customer is checked in) */}
        {activeSession && (
          <div className="mt-3 p-3 rounded-2xl bg-[#0B0B0C] border border-[#FF6B00] shadow-[0_0_16px_rgba(255,107,0,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center border border-[#FF6B00]/40 flex-shrink-0">
                <CanvasIcon name="table" size={16} color="#FF6B00" />
              </div>
              <div>
                <span className="text-[10px] text-stone-400 block font-medium">โต๊ะที่คุณกำลังใช้งาน</span>
                <span className="text-xs font-bold text-white">
                  โต๊ะ {activeSession.tableId} • PIN: <strong className="text-[#FF6B00] font-mono text-sm tracking-wide">{activeSession.secretCode}</strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onNavigateToMenu();
                try {
                  audioFeedbackService.playTactileClickSound();
                } catch {}
              }}
              className="btn-tactile-orange px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
            >
              <span>สั่งกาแฟ</span>
              <CanvasIcon name="arrow-right" size={11} color="#0B0B0C" />
            </button>
          </div>
        )}
      </div>

      {/* Zone Horizontal Filter */}
      <div className="overflow-x-auto scrollbar-none -mx-3 sm:mx-0 px-3 sm:px-0 flex items-center gap-1.5 py-1">
        {zones.map((zone) => {
          const isSelected = selectedZone === zone;
          return (
            <button
              key={zone}
              onClick={() => {
                setSelectedZone(zone);
                try {
                  audioFeedbackService.playTactileClickSound();
                } catch {}
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all min-h-[36px] cursor-pointer ${
                isSelected
                  ? 'btn-tactile-orange text-stone-950 font-bold'
                  : 'bg-[#141418] text-stone-400 border border-[#24242C] hover:text-stone-200'
              }`}
            >
              {zone === 'ALL' ? 'ทุกโซน' : zone}
            </button>
          );
        })}
      </div>

      {/* Responsive 20-Table Grid with Instant Base64 Status Icon Switching */}
      <TableGridSystem
        tables={filteredTables}
        activeSession={activeSession}
        onTableSelect={handleTableClick}
        variant="mobile"
      />

      {/* Check-in Confirmation Modal */}
      {confirmingTable && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-sm bg-[#1A1A1E] rounded-t-3xl sm:rounded-2xl border border-[#282830] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-widest font-mono">
                  HMAC-SHA256 CHECK-IN
                </span>
                <h3 className="text-base font-bold text-stone-100">
                  ยืนยันเข้าใช้โต๊ะ {confirmingTable.tableId}
                </h3>
              </div>
              <button
                onClick={() => setConfirmingTable(null)}
                className="w-7 h-7 rounded-full bg-[#121214] text-stone-400 hover:text-stone-100 flex items-center justify-center text-xs cursor-pointer"
                aria-label="ปิด"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#121214] border border-[#282830] space-y-2 text-xs">
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">ประเภทโต๊ะ:</span>
                <span className="font-semibold text-stone-100">{confirmingTable.name}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">โซนที่ตั้ง:</span>
                <span className="text-[#FF6B00]">{confirmingTable.zone}</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">ระบบไฟฟ้า:</span>
                <span className="text-stone-200">220V x {confirmingTable.socketCount} ช่อง + PD 100W Fast Charge</span>
              </div>
              <div className="flex justify-between text-stone-300">
                <span className="text-stone-400">ระบบรักษาความปลอดภัย:</span>
                <span className="text-[#10B981] font-mono">HMAC Session + 6-digit OTP</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 leading-relaxed">
              เมื่อกดยืนยัน ระบบจะผูกโต๊ะนี้เข้ากับเซสชันของคุณและสร้างรหัสลับ 6 หลักประจำรอบการใช้งาน และโต๊ะจะถูกปล่อยเป็นสถานะว่างอัตโนมัติเมื่อทำการชำระเงิน (Checkout) เท่านั้น
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingTable(null)}
                className="btn-tactile-dark flex-1 py-2.5 rounded-xl text-stone-300 text-xs font-semibold min-h-[44px] cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmLease}
                className="btn-tactile-orange flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <CanvasIcon name="key" size={14} color="#0B0B0C" />
                <span>ยืนยัน Check-in</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal Showing HTML5 Canvas Animated Checkmark & 6-digit Secret Code */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1A1E] rounded-3xl border border-[#282830] p-6 shadow-2xl text-center space-y-4 relative">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#121214] text-stone-400 hover:text-stone-200 flex items-center justify-center text-xs border border-[#282830] cursor-pointer"
              aria-label="ปิด"
            >
              ✕
            </button>

            <div className="flex justify-center pt-2">
              <CanvasAnimatedCheckmark size={90} />
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#10B981] font-mono uppercase tracking-widest">
                CHECK-IN SUCCESSFUL
              </span>
              <h3 className="text-lg font-bold text-stone-100 mt-1">
                เข้าใช้งานโต๊ะ {successTableInfo?.tableId || activeSession?.tableId} สำเร็จ
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                รหัสลับประจำเซสชันของคุณ (ใช้ยืนยันคำสั่งซื้อ)
              </p>
            </div>

            {/* 6-Digit Code Box */}
            <div className="py-3 px-4 rounded-2xl bg-[#121214] border border-[#282830] shadow-inner">
              <span className="text-[10px] text-stone-400 block mb-0.5">รหัสลับ 6 หลัก (Secret Code)</span>
              <span className="text-3xl font-black text-[#FF6B00] tracking-[0.25em] font-mono">
                {activeSession?.secretCode || successTableInfo?.secretCode || activeTableCode}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-[#121214] border border-[#282830] text-[10px] text-stone-400 font-mono break-all text-left">
              <span className="text-stone-300 font-semibold block mb-0.5">HMAC-SHA256 Token:</span>
              {(activeSession?.hmacSignature || 'sec_tok_live_authenticated').substring(0, 36)}...
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  onNavigateToMenu();
                }}
                className="btn-tactile-orange w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
              >
                <span>ไปสั่งกาแฟและอาหาร</span>
                <CanvasIcon name="arrow-right" size={14} color="#0B0B0C" />
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="btn-tactile-dark w-full py-2.5 rounded-xl font-semibold text-xs text-stone-300 min-h-[40px] cursor-pointer"
              >
                อยู่หน้านี้ต่อ (ดูโต๊ะทั้งหมด)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* My Table Details Modal */}
      {myTableDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1A1E] rounded-3xl border border-[#FF6B00]/40 p-5 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/15 border border-[#FF6B00]/40 text-[#FF6B00] flex items-center justify-center mx-auto">
              <CanvasIcon name="table" size={24} color="#FF6B00" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#FF6B00] font-mono uppercase tracking-widest">
                YOUR ACTIVE TABLE
              </span>
              <h3 className="text-base font-bold text-stone-100 mt-1">
                คุณกำลังใช้งานโต๊ะ {myTableDetailModal.tableId}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {myTableDetailModal.name} • {myTableDetailModal.zone}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#121214] border border-[#282830] flex items-center justify-between text-xs">
              <span className="text-stone-400">รหัสลับเซสชัน (PIN):</span>
              <span className="font-mono text-base font-bold text-[#FF6B00]">
                {activeSession?.secretCode}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMyTableDetailModal(null)}
                className="btn-tactile-dark flex-1 py-2.5 rounded-xl text-stone-300 text-xs font-semibold min-h-[44px] cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => {
                  setMyTableDetailModal(null);
                  onNavigateToMenu();
                }}
                className="btn-tactile-orange flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <span>สั่งกาแฟที่โต๊ะนี้</span>
                <CanvasIcon name="arrow-right" size={12} color="#0B0B0C" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Table Booking Restriction Warning Modal */}
      {blockedModalMessage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1A1E] rounded-3xl border border-[#EF4444]/40 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] flex items-center justify-center mx-auto">
              <CanvasIcon name="alert" size={24} color="#EF4444" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#EF4444] font-mono uppercase tracking-widest">
                ONE ACTIVE TABLE PER DEVICE
              </span>
              <h3 className="text-base font-bold text-stone-100">
                มีโต๊ะที่กำลังใช้งานอยู่แล้ว
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed pt-1">
                {blockedModalMessage}
              </p>
            </div>

            {activeSession && (
              <div className="p-3 rounded-2xl bg-[#121214] border border-[#282830] text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse"></span>
                  <span className="font-bold text-stone-200">โต๊ะปัจจุบัน: {activeSession.tableId}</span>
                </div>
                <span className="font-mono text-[#FF8C33] font-bold bg-[#0B0B0C] px-2 py-0.5 rounded border border-[#FF6B00]/30">
                  PIN {activeSession.secretCode}
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setBlockedModalMessage(null)}
                className="btn-tactile-dark flex-1 py-2.5 rounded-xl text-stone-300 text-xs font-semibold min-h-[44px] cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <button
                onClick={() => {
                  setBlockedModalMessage(null);
                  onNavigateToMenu();
                }}
                className="btn-tactile-orange flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
              >
                <span>ไปที่โต๊ะปัจจุบัน</span>
                <CanvasIcon name="arrow-right" size={12} color="#0B0B0C" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Error In-App Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1A1E] rounded-3xl border border-[#EF4444]/40 p-5 shadow-2xl text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] flex items-center justify-center mx-auto">
              <CanvasIcon name="alert" size={20} color="#EF4444" />
            </div>
            <h3 className="text-sm font-bold text-stone-100">แจ้งเตือนจากระบบ</h3>
            <p className="text-xs text-stone-300">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="btn-tactile-dark w-full py-2.5 rounded-xl text-stone-200 text-xs font-semibold min-h-[44px] cursor-pointer"
            >
              รับทราบ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
