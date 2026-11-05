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
  topBar?: React.ReactNode;
  activeTableId?: string;
  secretCode?: string;
}

export const MobileFrame: React.FC<Props> = ({
  children,
  topBar,
  activeTableId,
  secretCode,
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

        {/* Unified Single Header Bar (Zero Redundant Logos, Ultra-Clean & Compact) */}
        {topBar && (
          <div className="sticky top-0 z-40 w-full flex-shrink-0">
            {topBar}
          </div>
        )}

        {/* Scrollable Main Content Area with Protected Bottom Padding (pb-32) */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none pb-32">
          {children}
        </main>
      </div>
    </div>
  );
};
