/**
 * Lumina 24-Hour Cafe - Mobile User Session Screen
 * Unified Black & Orange Theme (#0B0B0C, #1A1A1E, #FF6B00)
 * Pure Check-in -> Checkout Flow (No Table Release Button)
 * Custom HTML5 Canvas Icons (No Lucide / Emojis)
 * Web Audio API Tactile Sound Feedback
 */

import React from 'react';
import { TableSession, CafeTable, TableActivityLog } from '../types';
import { CanvasIcon } from './CanvasIcon';
import { audioFeedbackService } from '../services/audioFeedbackService';

interface Props {
  activeSession: TableSession | null;
  table?: CafeTable;
  activityLogs: TableActivityLog[];
  onNavigateToMenu: () => void;
  onNavigateToTables: () => void;
}

export const SessionTimelineScreen: React.FC<Props> = ({
  activeSession,
  table,
  onNavigateToMenu,
  onNavigateToTables,
}) => {
  return (
    <div className="px-4 py-3 space-y-4">
      {/* Active Session Status */}
      {activeSession && table ? (
        <div className="space-y-4">
          {/* Active Card */}
          <div className="relative overflow-hidden rounded-3xl bg-[#1A1A1E] border border-[#282830] p-5 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#FF6B00] font-mono tracking-wider uppercase">
                  ACTIVE SESSION LEASE
                </span>
                <h2 className="text-xl font-bold text-stone-100 mt-0.5">
                  โต๊ะ {table.tableId} • {table.name}
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">{table.zone}</p>
              </div>

              <div className="px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30 font-mono text-[10px] font-bold">
                CHECKED-IN
              </div>
            </div>

            {/* 6-Digit PIN Box */}
            <div className="p-4 rounded-2xl bg-[#121214] border border-[#282830] flex items-center justify-between shadow-inner">
              <div>
                <span className="text-[10px] text-stone-400 block font-mono">
                  รหัสลับประจำเซสชัน (Secret PIN)
                </span>
                <span className="text-3xl font-black text-[#FF6B00] tracking-[0.25em] font-mono block mt-0.5">
                  {activeSession.secretCode}
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#FF6B00]/15 flex items-center justify-center text-[#FF6B00] border border-[#FF6B00]/30">
                <CanvasIcon name="key" size={18} color="#FF6B00" />
              </div>
            </div>

            {/* Hardware & Power Amenities */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#121214] border border-[#282830] space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                  <CanvasIcon name="zap" size={13} color="#FF6B00" />
                  <span>ระบบไฟฟ้าโต๊ะ</span>
                </div>
                <span className="font-mono text-stone-200 font-bold block">
                  {table.socketCount} ช่อง (220V + PD 100W)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#121214] border border-[#282830] space-y-1">
                <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                  <CanvasIcon name="wifi" size={13} color="#10B981" />
                  <span>Lumina WiFi 6</span>
                </div>
                <span className="font-mono text-[#10B981] font-bold block">
                  1,000 / 1,000 Mbps
                </span>
              </div>
            </div>

            {/* HMAC Token Verification */}
            <div className="p-2.5 rounded-xl bg-[#121214] border border-[#282830] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-mono">HMAC Cryptogram:</span>
                <span className="text-[10px] text-[#10B981] font-mono">SHA256 SIGNED</span>
              </div>
              <p className="text-[9px] text-stone-500 font-mono break-all leading-tight">
                {activeSession.hmacSignature}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  audioFeedbackService.playTactileClickSound();
                  onNavigateToMenu();
                }}
                className="btn-tactile-orange w-full py-3 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <CanvasIcon name="coffee" size={14} color="#0B0B0C" />
                <span>สั่งเครื่องดื่ม & อาหารทานที่โต๊ะ</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 text-center rounded-3xl bg-[#1A1A1E] border border-[#282830] space-y-4 my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#121214] border border-[#282830] flex items-center justify-center mx-auto text-stone-600">
            <CanvasIcon name="table" size={24} color="#71717A" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-100">ยังไม่มีเซสชันที่ใช้งาน</h3>
            <p className="text-xs text-stone-400 max-w-xs mx-auto mt-1">
              กรุณาเลือกโต๊ะที่นั่งเพื่อเริ่มต้นใช้งานโต๊ะทำงาน 24 ชั่วโมง และรับรหัสผ่านสำหรับสั่งอาหาร
            </p>
          </div>
          <button
            onClick={() => {
              audioFeedbackService.playTactileClickSound();
              onNavigateToTables();
            }}
            className="btn-tactile-orange px-6 py-2.5 rounded-xl text-xs inline-flex items-center gap-2"
          >
            <span>ไปที่หน้าเลือกโต๊ะ</span>
            <CanvasIcon name="arrow-right" size={13} color="#0B0B0C" />
          </button>
        </div>
      )}
    </div>
  );
};
