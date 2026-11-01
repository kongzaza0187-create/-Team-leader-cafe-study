/**
 * Lumina 24-Hour Cafe - Mobile-First Viewport Shell
 * Unified Black & Orange Theme (#0B0B0C, #121214, #1A1A1E, #FF6B00)
 * Responsive on All Devices: Mobile (Edge-to-Edge), Tablet & Desktop (Centered Luxury Shell)
 * Always in Viewport: Top Bar + Scrollable Content + Docked Bottom Navigation
 * Custom HTML5 Canvas Icons (No Lucide / Emojis)
 */

import React, { useState, useEffect } from 'react';
import { audioFeedbackService } from '../services/audioFeedbackService';
import { WebGLAmbientBackground } from './WebGLAmbientBackground';
import { APP_LOGO_BASE64 } from '../data/appLogoBase64';

interface Props {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  activeTableId?: string;
  secretCode?: string;
  hideNavigation?: boolean;
}

export const MobileFrame: React.FC<Props> = ({
  children,
  navigation,
  activeTableId,
  secretCode,
  hideNavigation = false,
}) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const THAI_MONTHS = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    const updateDateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);

      const day = now.getDate();
      const month = THAI_MONTHS[now.getMonth()];
      const year = now.getFullYear();
      setCurrentDate(`${day} ${month} ${year}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#070708] text-stone-100 flex justify-center items-stretch selection:bg-[#FF6B00] selection:text-stone-950 font-sans">
      {/* Mobile-First Centered Container (Edge-to-edge on mobile, sleek device frame on tablet/desktop) */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl min-h-screen bg-[#0B0B0C] border-x border-[#1E1E24] shadow-2xl flex flex-col justify-between relative overflow-hidden">
        {/* Dynamic Shader Ambient Background */}
        <WebGLAmbientBackground />

        {/* Refined Neumorphic Status Bar (Strictly Local Time & Date CE, Zero 5G/WiFi) */}
        <header className="sticky top-0 z-30 px-3.5 py-2.5 topbar-neumorphic backdrop-blur-xl flex items-center justify-between text-xs border-b border-[#282832] flex-shrink-0">
          {/* Left: Embossed Time Capsule */}
          <div
            onClick={() => audioFeedbackService.playTactileClickSound()}
            className="pill-embossed-dark px-3 py-1 rounded-xl flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse"></span>
            <span className="font-mono text-xs font-bold text-stone-100 tracking-wider">
              {currentTime || '22:03:00'}
            </span>
          </div>

          {/* Center: Active Table Session Pill (if occupied) */}
          {activeTableId ? (
            <div
              onClick={() => audioFeedbackService.playTactileClickSound()}
              className="px-2.5 py-1 rounded-xl flex items-center gap-1.5 cursor-pointer bg-[#122419] border border-[#1E432E] shadow-lg shadow-[#34D399]/10 active:scale-95 transition-transform"
            >
              <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"></span>
              <span className="text-[11px] font-bold text-[#34D399]">โต๊ะ {activeTableId}</span>
              {secretCode && (
                <span className="text-[10px] text-[#FF8C33] font-mono font-bold bg-[#0B0B0C] px-1 py-0.2 rounded border border-[#FF6B00]/40">
                  {secretCode}
                </span>
              )}
            </div>
          ) : (
            <div
              onClick={() => audioFeedbackService.playTactileClickSound()}
              className="pill-embossed-dark px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-stone-400 cursor-pointer active:scale-95 transition-transform"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
              <span className="text-[10px] font-mono font-medium text-stone-400">24H CAFE</span>
            </div>
          )}

          {/* Right: Embossed Local Date Capsule */}
          <div className="flex items-center gap-1.5">
            <div
              onClick={() => audioFeedbackService.playTactileClickSound()}
              className="pill-embossed-dark px-2.5 py-1 rounded-xl flex items-center gap-1 select-none cursor-pointer active:scale-95 transition-transform"
            >
              <span className="font-mono text-[11px] font-semibold text-stone-300">
                {currentDate || '28 ต.ค. 2026'}
              </span>
            </div>
          </div>
        </header>
        
        {/* Study Café 24/7 Brand Ribbon */}
        <div className="px-3.5 py-1.5 bg-[#0D0D10]/90 backdrop-blur-md border-b border-[#202028] flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-2">
            <img
              src={APP_LOGO_BASE64}
              alt="Study Café 24/7"
              className="h-6 w-auto object-contain filter drop-shadow"
            />
            <span className="font-extrabold text-[11px] text-white tracking-wide font-['Plus_Jakarta_Sans',sans-serif]">
              STUDY CAFÉ 24/7
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold text-[#34D399] bg-[#122419] px-2 py-0.5 rounded-full border border-[#1E432E] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            <span>OPEN 24/7</span>
          </span>
        </div>

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 scrollbar-none pb-4">
          {children}
        </main>

        {/* Docked Bottom Navigation with Auto-Hide Transition */}
        {navigation && (
          <div
            className={`sticky bottom-0 z-40 w-full flex-shrink-0 transition-all duration-300 ease-in-out transform ${
              hideNavigation
                ? 'translate-y-full opacity-0 pointer-events-none max-h-0 overflow-hidden'
                : 'translate-y-0 opacity-100 max-h-24'
            }`}
          >
            {navigation}
          </div>
        )}
      </div>
    </div>
  );
};
