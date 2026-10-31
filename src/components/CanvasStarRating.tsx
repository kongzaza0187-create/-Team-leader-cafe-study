/**
 * Lumina 24-Hour Cafe - HTML5 Canvas Star Rating Component
 * Custom vector drawing of 1 to 5 stars via Canvas 2D
 * Web Audio API tactile audio on hover and selection
 * Supports interactive and display-only modes
 */

import React, { useState, useRef, useEffect } from 'react';
import { audioFeedbackService } from '../services/audioFeedbackService';

interface CanvasStarRatingProps {
  value: number; // 0 to 5 (e.g. 4.8 or 0 for unselected)
  onChange?: (rating: number) => void;
  size?: number; // size of each star in px, default 32
  readOnly?: boolean;
  showScoreText?: boolean;
  className?: string;
}

export const CanvasStarRating: React.FC<CanvasStarRatingProps> = ({
  value,
  onChange,
  size = 32,
  readOnly = false,
  showScoreText = false,
  className = '',
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const displayRating = hoverValue !== null ? hoverValue : value;
  const starCount = 5;
  const gap = 8;
  const totalWidth = starCount * size + (starCount - 1) * gap;
  const height = size;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2;
    canvas.width = totalWidth * dpr;
    canvas.height = height * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, totalWidth, height);

    for (let i = 0; i < starCount; i++) {
      const cx = i * (size + gap) + size / 2;
      const cy = height / 2;
      const outerR = size * 0.44;
      const innerR = size * 0.2;

      const starScore = i + 1;
      const isFilled = displayRating >= starScore;
      const isPartial = !isFilled && displayRating > i && displayRating < starScore;

      // Draw star path
      drawStar(ctx, cx, cy, 5, outerR, innerR);

      if (isFilled) {
        // Glowing Golden-Orange Gradient
        const grad = ctx.createLinearGradient(cx, cy - outerR, cx, cy + outerR);
        grad.addColorStop(0, '#FFD15C');
        grad.addColorStop(0.4, '#FF9E1A');
        grad.addColorStop(1, '#FF6B00');

        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(255, 107, 0, 0.55)';
        ctx.shadowBlur = 8;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#FFA020';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      } else if (isPartial) {
        // Clip partial fill
        const fillFraction = displayRating - i;
        ctx.save();
        ctx.fillStyle = '#222228';
        ctx.fill();
        ctx.strokeStyle = '#32323c';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Draw left side filled
        ctx.beginPath();
        ctx.rect(cx - outerR, cy - outerR, outerR * 2 * fillFraction, outerR * 2);
        ctx.clip();

        drawStar(ctx, cx, cy, 5, outerR, innerR);
        const grad = ctx.createLinearGradient(cx, cy - outerR, cx, cy + outerR);
        grad.addColorStop(0, '#FFD15C');
        grad.addColorStop(1, '#FF6B00');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      } else {
        // Unfilled star
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#18181D';
        ctx.fill();
        ctx.strokeStyle = '#32323C';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [displayRating, size, totalWidth, height]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (readOnly || !onChange) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const starIndex = Math.min(Math.max(Math.ceil((x / totalWidth) * starCount), 1), 5);
    if (hoverValue !== starIndex) {
      setHoverValue(starIndex);
      audioFeedbackService.playStarSelectSound(starIndex);
    }
  };

  const handlePointerLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly || !onChange) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const starIndex = Math.min(Math.max(Math.ceil((x / totalWidth) * starCount), 1), 5);
    onChange(starIndex);
    audioFeedbackService.playStarSelectSound(starIndex);
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        style={{ width: `${totalWidth}px`, height: `${height}px` }}
        className={`${readOnly ? 'cursor-default' : 'cursor-pointer active:scale-95 transition-transform'}`}
      />
      {showScoreText && (
        <span className="font-mono text-sm font-bold text-[#FF6B00]">
          {displayRating > 0 ? displayRating.toFixed(1) : '0.0'}
          <span className="text-xs text-stone-500 font-normal"> / 5.0</span>
        </span>
      )}
    </div>
  );
};

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}
