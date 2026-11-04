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

    // 1. Background Track (Subtle dark ring with ticks)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#1A1A1E';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'butt';
    ctx.stroke();

    // 2. Deficit Gap Arc (Red #EF4444)
    // Drawn along the remainder of the circle if target not achieved
    if (!analytics.isTargetAchieved) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle + ratio * Math.PI * 2, startAngle + Math.PI * 2);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    }

    // 3. Achieved Real Revenue Arc (Green #10B981)
    if (settled > 0) {
      const greenEndAngle = startAngle + (analytics.isTargetAchieved ? Math.PI * 2 : ratio * Math.PI * 2);

      // Glow effect
      ctx.save();
      ctx.shadowColor = 'rgba(16, 185, 129, 0.45)';
      ctx.shadowBlur = 12;

      const grad = ctx.createLinearGradient(0, cy - radius, 0, cy + radius);
      grad.addColorStop(0, '#34D399');
      grad.addColorStop(1, '#10B981');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, greenEndAngle);
      ctx.strokeStyle = grad;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }

    // 4. Subtle Radial Scale Notch Ticks around the donut
    const tickCount = 24;
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
      const innerR = radius - lineWidth / 2 - 4;
      const outerR = radius - lineWidth / 2 - 1;
      const x1 = cx + Math.cos(angle) * innerR;
      const y1 = cy + Math.sin(angle) * innerR;
      const x2 = cx + Math.cos(angle) * outerR;
      const y2 = cy + Math.sin(angle) * outerR;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 5. Center Content (Rendered onto canvas for crispness)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Label: "รายได้จริง (REAL)"
    ctx.font = '600 10px Prompt, sans-serif';
    ctx.fillStyle = '#A1A1AA';
    ctx.fillText('รายได้จริง (REAL)', cx, cy - 26);

    // Big amount
    ctx.font = '700 22px Prompt, monospace';
    ctx.fillStyle = analytics.totalSettledAmount > 0 ? '#10B981' : '#F4F4F5';
    ctx.fillText(`฿${analytics.totalSettledAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, cx, cy);

    // Target comparison label
    ctx.font = '500 10px Prompt, sans-serif';
    ctx.fillStyle = '#71717A';
    ctx.fillText(`เป้าหมาย ฿${target.toLocaleString()} / วัน`, cx, cy + 22);

    // Percentage badge
    const badgeText = `${analytics.percentageRatio.toFixed(1)}%`;
    ctx.font = '700 11px monospace';
    ctx.fillStyle = analytics.isTargetAchieved ? '#10B981' : '#FF6B00';
    ctx.fillText(badgeText, cx, cy + 38);

    ctx.restore();
  }, [analytics, size]);

  return (
    <div className="flex flex-col items-center justify-center p-3 space-y-3">
      <canvas
        ref={canvasRef}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="block mx-auto"
      />

      {/* Thai 12:00 PM Business Cycle & Countdown Information Bar */}
      <div className="w-full max-w-xs space-y-1.5 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121214] border border-[#282830] text-[10px] text-stone-300">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
          <span className="font-semibold text-stone-200">รอบตัดยอด: ทุก 12:00 น. (เวลาประเทศไทย)</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono px-2 text-stone-400">
          <span>{analytics.cycleStartFormatted || '12:00 น.'}</span>
          <span className="text-[#FF8C33] font-bold">
            {analytics.remainingFormatted ? `เหลืออีก ${analytics.remainingFormatted}` : 'รอตัดยอด 12:00 น.'}
          </span>
          <span>{analytics.cycleEndFormatted || '11:59 น.'}</span>
        </div>

        {analytics.totalSettledAmount === 0 && (
          <div className="px-2.5 py-1 rounded-xl bg-[#0B0B0C] border border-[#282830] text-[10px] text-stone-400">
            <span className="text-[#34D399] font-bold">● ค่าเริ่มต้น ฿0.00</span> (กราฟจะเริ่มนับเมื่อมีรายการชำระจริงในรอบ 12:00 น. นี้)
          </div>
        )}
      </div>
    </div>
  );
};
