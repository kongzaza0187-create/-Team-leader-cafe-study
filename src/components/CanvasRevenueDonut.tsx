/**
 * Lumina 24-Hour Cafe - HTML5 Canvas Circular Revenue Chart
 * Renders target 15,000 THB comparison entirely on HTML5 Canvas
 * Green (#10B981) for real settled revenue, Red (#EF4444) for deficit gap
 * Custom canvas typography, radial gradients, and glowing arc endpoints
 */

import React, { useEffect, useRef } from 'react';
import { RevenueAnalytics } from '../types';

interface CanvasRevenueDonutProps {
  analytics: RevenueAnalytics;
  size?: number; // default 240px
}

export const CanvasRevenueDonut: React.FC<CanvasRevenueDonutProps> = ({
  analytics,
  size = 240,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.38;
    const lineWidth = size * 0.085;

    // Daily target math
    const target = analytics.dailyTarget || 15000;
    const settled = analytics.totalSettledAmount || 0;
    const ratio = Math.min(settled / target, 1.0);
    const startAngle = -Math.PI / 2; // 12 o'clock

    // 1. Outer & Inner Track Rings (High-Precision Dial)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#181820';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'butt';
    ctx.stroke();

    // Subtle Outer Rim
    ctx.beginPath();
    ctx.arc(cx, cy, radius + lineWidth / 2 + 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Deficit Gap Arc (Muted Coral #EF4444 with subtle glow)
    if (!analytics.isTargetAchieved) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle + ratio * Math.PI * 2, startAngle + Math.PI * 2);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.28)';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // 3. Achieved Real Revenue Arc (Vibrant Emerald Gradient)
    if (settled > 0) {
      const greenEndAngle = startAngle + (analytics.isTargetAchieved ? Math.PI * 2 : ratio * Math.PI * 2);

      ctx.save();
      ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
      ctx.shadowBlur = 14;

      const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
      grad.addColorStop(0, '#34D399');
      grad.addColorStop(1, '#059669');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, greenEndAngle);
      ctx.strokeStyle = grad;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }

    // 4. Subtle Radial Scale Notch Ticks around the donut
    const tickCount = 36;
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
      const isMajor = i % 9 === 0;
      const innerR = radius - lineWidth / 2 - (isMajor ? 6 : 3);
      const outerR = radius - lineWidth / 2 - 1;
      const x1 = cx + Math.cos(angle) * innerR;
      const y1 = cy + Math.sin(angle) * innerR;
      const x2 = cx + Math.cos(angle) * outerR;
      const y2 = cy + Math.sin(angle) * outerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isMajor ? 'rgba(255, 107, 0, 0.35)' : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = isMajor ? 1.5 : 1;
      ctx.stroke();
    }

    // 5. Center Content (Crisp typography with high hierarchy)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Label: "รอบ 12:00 น. (CYCLE)"
    ctx.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = '#8E8E9A';
    ctx.fillText('รอบตัดยอด 12:00 น.', cx, cy - 28);

    // Big amount
    ctx.font = '700 24px -apple-system, BlinkMacSystemFont, "SF Pro Display", monospace';
    ctx.fillStyle = analytics.totalSettledAmount > 0 ? '#10B981' : '#F4F4F5';
    ctx.fillText(`฿${analytics.totalSettledAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, cx, cy);

    // Target comparison label
    ctx.font = '500 10px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#71717A';
    ctx.fillText(`เป้าหมาย ฿${target.toLocaleString()} / วัน`, cx, cy + 24);

    // Percentage badge
    const badgeText = `${analytics.percentageRatio.toFixed(1)}%`;
    ctx.font = '700 11px monospace';
    ctx.fillStyle = analytics.isTargetAchieved ? '#10B981' : '#FF6B00';
    ctx.fillText(badgeText, cx, cy + 40);

    ctx.restore();
  }, [analytics, size]);

  return (
    <div className="flex flex-col items-center justify-center p-3 space-y-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          style={{ width: `${size}px`, height: `${size}px` }}
          className="block mx-auto"
        />
      </div>

      {/* Thai 12:00 PM Business Cycle & Countdown Information Bar */}
      <div className="w-full max-w-sm space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#121216] border border-[#262632] text-[11px] text-stone-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse flex-shrink-0" />
          <span className="font-semibold text-stone-200">ตัดรอบทุก 12:00 น. ตามเวลาประเทศไทย (ICT)</span>
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono px-3 py-1.5 rounded-xl bg-[#0F0F13] border border-[#202028] text-stone-400">
          <div className="text-left">
            <span className="block text-[9px] uppercase tracking-wider text-stone-500">เริ่มรอบ</span>
            <span className="font-bold text-stone-300">{analytics.cycleStartFormatted || '12:00 น.'}</span>
          </div>
          <div className="text-center">
            <span className="block text-[9px] uppercase tracking-wider text-[#FF6B00]">เวลาที่เหลือ</span>
            <span className="text-[#FF8C33] font-bold">
              {analytics.remainingFormatted ? analytics.remainingFormatted : 'รอบใหม่'}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] uppercase tracking-wider text-stone-500">สิ้นสุดรอบ</span>
            <span className="font-bold text-stone-300">{analytics.cycleEndFormatted || '11:59 น.'}</span>
          </div>
        </div>

        {analytics.totalSettledAmount === 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-[#0E1511] border border-[#183624] text-[11px] text-stone-400 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] flex-shrink-0" />
            <span>เริ่มต้นที่ <strong className="text-white font-mono">฿0.00</strong> (ยอดจะนับเมื่อมีรายการชำระจริงในรอบนี้)</span>
          </div>
        )}
      </div>
    </div>
  );
};
