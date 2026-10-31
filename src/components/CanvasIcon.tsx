/**
 * Lumina 24-Hour Cafe - Custom HTML5 Canvas Icon Renderer
 * Eliminates standard icon fonts, SVGs, and emojis.
 * Renders all iconography directly with HTML5 Canvas 2D vector drawing commands
 * Crisp Retina rendering with devicePixelRatio support
 */

import React, { useEffect, useRef } from 'react';

export type CanvasIconName =
  | 'star'
  | 'star-filled'
  | 'coffee'
  | 'table'
  | 'cart'
  | 'user'
  | 'check'
  | 'check-circle'
  | 'plus'
  | 'minus'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'chevron-up'
  | 'arrow-right'
  | 'arrow-left'
  | 'shield'
  | 'lock'
  | 'key'
  | 'wifi'
  | 'zap'
  | 'alert'
  | 'refresh'
  | 'copy'
  | 'file'
  | 'upload'
  | 'search'
  | 'chart'
  | 'bot'
  | 'close'
  | 'map-pin'
  | 'clock'
  | 'trash'
  | 'sparkles'
  | 'volume'
  | 'volume-x';

interface CanvasIconProps {
  name: CanvasIconName;
  size?: number; // Size in css pixels, default 18
  color?: string; // Hex or CSS color, default #FF6B00
  secondaryColor?: string;
  strokeWidth?: number; // default 1.8
  className?: string;
  animateSpin?: boolean;
}

export const CanvasIcon: React.FC<CanvasIconProps> = ({
  name,
  size = 18,
  color = '#FF6B00',
  secondaryColor = 'rgba(255, 107, 0, 0.25)',
  strokeWidth = 1.8,
  className = '',
  animateSpin = false,
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

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const s = size;
    const p = s * 0.12; // padding
    const w = s - p * 2; // drawable width

    switch (name) {
      case 'star': {
        // Outline 5-pointed star
        drawStarPath(ctx, s / 2, s / 2, 5, w * 0.48, w * 0.22);
        ctx.stroke();
        break;
      }

      case 'star-filled': {
        // Filled 5-pointed star with subtle gradient
        const grad = ctx.createLinearGradient(0, p, 0, s - p);
        grad.addColorStop(0, '#FFB800');
        grad.addColorStop(1, '#FF6B00');
        ctx.fillStyle = grad;
        drawStarPath(ctx, s / 2, s / 2, 5, w * 0.48, w * 0.22);
        ctx.fill();
        ctx.strokeStyle = '#FFAA00';
        ctx.stroke();
        break;
      }

      case 'coffee': {
        // Specialty espresso mug with crema steam
        ctx.beginPath();
        // Mug body
        ctx.moveTo(p + w * 0.15, p + w * 0.35);
        ctx.lineTo(p + w * 0.7, p + w * 0.35);
        ctx.lineTo(p + w * 0.65, p + w * 0.85);
        ctx.quadraticCurveTo(p + w * 0.65, p + w * 0.95, p + w * 0.42, p + w * 0.95);
        ctx.quadraticCurveTo(p + w * 0.2, p + w * 0.95, p + w * 0.2, p + w * 0.85);
        ctx.closePath();
        ctx.stroke();

        // Handle
        ctx.beginPath();
        ctx.moveTo(p + w * 0.7, p + w * 0.45);
        ctx.quadraticCurveTo(p + w * 0.95, p + w * 0.45, p + w * 0.9, p + w * 0.68);
        ctx.quadraticCurveTo(p + w * 0.85, p + w * 0.78, p + w * 0.66, p + w * 0.75);
        ctx.stroke();

        // Steam ripples
        ctx.beginPath();
        ctx.moveTo(p + w * 0.3, p + w * 0.24);
        ctx.quadraticCurveTo(p + w * 0.35, p + w * 0.12, p + w * 0.3, p + w * 0.05);
        ctx.moveTo(p + w * 0.52, p + w * 0.24);
        ctx.quadraticCurveTo(p + w * 0.58, p + w * 0.12, p + w * 0.52, p + w * 0.05);
        ctx.stroke();
        break;
      }

      case 'table': {
        // Minimalist study desk with lamp/socket
        ctx.beginPath();
        // Desktop
        ctx.moveTo(p, p + w * 0.35);
        ctx.lineTo(s - p, p + w * 0.35);
        // Table legs
        ctx.moveTo(p + w * 0.12, p + w * 0.35);
        ctx.lineTo(p + w * 0.12, s - p);
        ctx.moveTo(s - p - w * 0.12, p + w * 0.35);
        ctx.lineTo(s - p - w * 0.12, s - p);
        ctx.stroke();

        // Ergonomic seat arc
        ctx.beginPath();
        ctx.arc(s / 2, p + w * 0.58, w * 0.22, Math.PI, 0);
        ctx.stroke();
        break;
      }

      case 'cart': {
        // Shopping cart
        ctx.beginPath();
        ctx.moveTo(p, p + w * 0.15);
        ctx.lineTo(p + w * 0.2, p + w * 0.15);
        ctx.lineTo(p + w * 0.35, p + w * 0.7);
        ctx.lineTo(p + w * 0.82, p + w * 0.7);
        ctx.lineTo(p + w * 0.95, p + w * 0.3);
        ctx.lineTo(p + w * 0.25, p + w * 0.3);
        ctx.stroke();

        // Wheels
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p + w * 0.4, p + w * 0.88, w * 0.08, 0, Math.PI * 2);
        ctx.arc(p + w * 0.78, p + w * 0.88, w * 0.08, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'user': {
        // User silhouette
        ctx.beginPath();
        ctx.arc(s / 2, p + w * 0.28, w * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s / 2, s - p + w * 0.1, w * 0.45, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
        break;
      }

      case 'check': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.15, p + w * 0.52);
        ctx.lineTo(p + w * 0.42, p + w * 0.78);
        ctx.lineTo(p + w * 0.88, p + w * 0.22);
        ctx.stroke();
        break;
      }

      case 'check-circle': {
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, w * 0.46, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p + w * 0.28, p + w * 0.5);
        ctx.lineTo(p + w * 0.44, p + w * 0.68);
        ctx.lineTo(p + w * 0.74, p + w * 0.34);
        ctx.stroke();
        break;
      }

      case 'plus': {
        ctx.beginPath();
        ctx.moveTo(s / 2, p + w * 0.15);
        ctx.lineTo(s / 2, s - p - w * 0.15);
        ctx.moveTo(p + w * 0.15, s / 2);
        ctx.lineTo(s - p - w * 0.15, s / 2);
        ctx.stroke();
        break;
      }

      case 'minus': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.15, s / 2);
        ctx.lineTo(s - p - w * 0.15, s / 2);
        ctx.stroke();
        break;
      }

      case 'chevron-right': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.35, p + w * 0.2);
        ctx.lineTo(p + w * 0.65, s / 2);
        ctx.lineTo(p + w * 0.35, s - p - w * 0.2);
        ctx.stroke();
        break;
      }

      case 'chevron-left': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.65, p + w * 0.2);
        ctx.lineTo(p + w * 0.35, s / 2);
        ctx.lineTo(p + w * 0.65, s - p - w * 0.2);
        ctx.stroke();
        break;
      }

      case 'chevron-down': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.2, p + w * 0.35);
        ctx.lineTo(s / 2, p + w * 0.65);
        ctx.lineTo(s - p - w * 0.2, p + w * 0.35);
        ctx.stroke();
        break;
      }

      case 'chevron-up': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.2, p + w * 0.65);
        ctx.lineTo(s / 2, p + w * 0.35);
        ctx.lineTo(s - p - w * 0.2, p + w * 0.65);
        ctx.stroke();
        break;
      }

      case 'arrow-right': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.1, s / 2);
        ctx.lineTo(s - p - w * 0.1, s / 2);
        ctx.lineTo(s - p - w * 0.35, p + w * 0.25);
        ctx.moveTo(s - p - w * 0.1, s / 2);
        ctx.lineTo(s - p - w * 0.35, s - p - w * 0.25);
        ctx.stroke();
        break;
      }

      case 'arrow-left': {
        ctx.beginPath();
        ctx.moveTo(s - p - w * 0.1, s / 2);
        ctx.lineTo(p + w * 0.1, s / 2);
        ctx.lineTo(p + w * 0.35, p + w * 0.25);
        ctx.moveTo(p + w * 0.1, s / 2);
        ctx.lineTo(p + w * 0.35, s - p - w * 0.25);
        ctx.stroke();
        break;
      }

      case 'shield': {
        ctx.beginPath();
        ctx.moveTo(s / 2, p + w * 0.05);
        ctx.lineTo(s - p - w * 0.1, p + w * 0.2);
        ctx.lineTo(s - p - w * 0.1, p + w * 0.58);
        ctx.quadraticCurveTo(s / 2, s - p, s / 2, s - p);
        ctx.quadraticCurveTo(p + w * 0.1, p + w * 0.58, p + w * 0.1, p + w * 0.2);
        ctx.closePath();
        ctx.stroke();
        // Inner keyhole or check
        ctx.beginPath();
        ctx.arc(s / 2, p + w * 0.38, w * 0.08, 0, Math.PI * 2);
        ctx.lineTo(s / 2, p + w * 0.58);
        ctx.stroke();
        break;
      }

      case 'lock': {
        // Shackle
        ctx.beginPath();
        ctx.arc(s / 2, p + w * 0.35, w * 0.24, Math.PI, 0);
        ctx.lineTo(s / 2 + w * 0.24, p + w * 0.5);
        ctx.moveTo(s / 2 - w * 0.24, p + w * 0.35);
        ctx.lineTo(s / 2 - w * 0.24, p + w * 0.5);
        ctx.stroke();
        // Body
        ctx.strokeRect(p + w * 0.16, p + w * 0.48, w * 0.68, w * 0.45);
        // Keyhole
        ctx.beginPath();
        ctx.arc(s / 2, p + w * 0.68, w * 0.07, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 'key': {
        ctx.beginPath();
        ctx.arc(p + w * 0.35, p + w * 0.35, w * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p + w * 0.5, p + w * 0.5);
        ctx.lineTo(s - p - w * 0.1, s - p - w * 0.1);
        ctx.lineTo(s - p - w * 0.1, s - p - w * 0.25);
        ctx.moveTo(s - p - w * 0.22, s - p - w * 0.22);
        ctx.lineTo(s - p - w * 0.22, s - p - w * 0.34);
        ctx.stroke();
        break;
      }

      case 'wifi': {
        ctx.beginPath();
        ctx.arc(s / 2, s - p - w * 0.1, w * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(s / 2, s - p - w * 0.1, w * 0.35, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s / 2, s - p - w * 0.1, w * 0.65, Math.PI * 1.25, Math.PI * 1.75);
        ctx.stroke();
        break;
      }

      case 'zap': {
        // Lightning bolt / Power socket PD
        ctx.beginPath();
        ctx.moveTo(s / 2 + w * 0.1, p + w * 0.05);
        ctx.lineTo(p + w * 0.25, p + w * 0.5);
        ctx.lineTo(s / 2, p + w * 0.5);
        ctx.lineTo(s / 2 - w * 0.1, s - p);
        ctx.lineTo(s - p - w * 0.2, p + w * 0.42);
        ctx.lineTo(s / 2 + w * 0.05, p + w * 0.42);
        ctx.closePath();
        ctx.stroke();
        break;
      }

      case 'alert': {
        ctx.beginPath();
        ctx.moveTo(s / 2, p + w * 0.08);
        ctx.lineTo(s - p - w * 0.05, s - p - w * 0.08);
        ctx.lineTo(p + w * 0.05, s - p - w * 0.08);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s / 2, p + w * 0.38);
        ctx.lineTo(s / 2, p + w * 0.62);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s / 2, p + w * 0.76, strokeWidth * 0.7, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'refresh': {
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, w * 0.38, Math.PI * 0.3, Math.PI * 1.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s / 2 + w * 0.45, p + w * 0.15);
        ctx.lineTo(s / 2 + w * 0.45, p + w * 0.38);
        ctx.lineTo(s / 2 + w * 0.22, p + w * 0.38);
        ctx.stroke();
        break;
      }

      case 'copy': {
        ctx.strokeRect(p + w * 0.25, p + w * 0.25, w * 0.6, w * 0.65);
        ctx.beginPath();
        ctx.moveTo(p + w * 0.15, p + w * 0.7);
        ctx.lineTo(p + w * 0.15, p + w * 0.15);
        ctx.lineTo(p + w * 0.7, p + w * 0.15);
        ctx.stroke();
        break;
      }

      case 'file': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.18, p + w * 0.1);
        ctx.lineTo(p + w * 0.6, p + w * 0.1);
        ctx.lineTo(s - p - w * 0.18, p + w * 0.32);
        ctx.lineTo(s - p - w * 0.18, s - p - w * 0.1);
        ctx.lineTo(p + w * 0.18, s - p - w * 0.1);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p + w * 0.32, p + w * 0.45);
        ctx.lineTo(s - p - w * 0.32, p + w * 0.45);
        ctx.moveTo(p + w * 0.32, p + w * 0.65);
        ctx.lineTo(s - p - w * 0.32, p + w * 0.65);
        ctx.stroke();
        break;
      }

      case 'upload': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.1, s - p - w * 0.25);
        ctx.lineTo(p + w * 0.1, s - p - w * 0.1);
        ctx.lineTo(s - p - w * 0.1, s - p - w * 0.1);
        ctx.lineTo(s - p - w * 0.1, s - p - w * 0.25);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s / 2, s - p - w * 0.28);
        ctx.lineTo(s / 2, p + w * 0.15);
        ctx.lineTo(p + w * 0.28, p + w * 0.38);
        ctx.moveTo(s / 2, p + w * 0.15);
        ctx.lineTo(s - p - w * 0.28, p + w * 0.38);
        ctx.stroke();
        break;
      }

      case 'search': {
        ctx.beginPath();
        ctx.arc(p + w * 0.4, p + w * 0.4, w * 0.28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p + w * 0.6, p + w * 0.6);
        ctx.lineTo(s - p - w * 0.12, s - p - w * 0.12);
        ctx.stroke();
        break;
      }

      case 'chart': {
        ctx.beginPath();
        // Axis
        ctx.moveTo(p + w * 0.1, p + w * 0.1);
        ctx.lineTo(p + w * 0.1, s - p - w * 0.1);
        ctx.lineTo(s - p - w * 0.1, s - p - w * 0.1);
        ctx.stroke();
        // Bars
        ctx.fillStyle = color;
        ctx.fillRect(p + w * 0.25, p + w * 0.5, w * 0.15, w * 0.35);
        ctx.fillRect(p + w * 0.48, p + w * 0.3, w * 0.15, w * 0.55);
        ctx.fillRect(p + w * 0.72, p + w * 0.15, w * 0.15, w * 0.7);
        break;
      }

      case 'bot': {
        // Robotic head with antenna
        ctx.beginPath();
        // Antenna
        ctx.moveTo(s / 2, p + w * 0.2);
        ctx.lineTo(s / 2, p + w * 0.05);
        ctx.arc(s / 2, p + w * 0.05, w * 0.05, 0, Math.PI * 2);
        ctx.stroke();
        // Head
        ctx.strokeRect(p + w * 0.2, p + w * 0.22, w * 0.6, w * 0.55);
        // Eyes
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p + w * 0.38, p + w * 0.42, w * 0.07, 0, Math.PI * 2);
        ctx.arc(p + w * 0.62, p + w * 0.42, w * 0.07, 0, Math.PI * 2);
        ctx.fill();
        // Mouth line
        ctx.beginPath();
        ctx.moveTo(p + w * 0.35, p + w * 0.62);
        ctx.lineTo(p + w * 0.65, p + w * 0.62);
        ctx.stroke();
        break;
      }

      case 'close': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.2, p + w * 0.2);
        ctx.lineTo(s - p - w * 0.2, s - p - w * 0.2);
        ctx.moveTo(s - p - w * 0.2, p + w * 0.2);
        ctx.lineTo(p + w * 0.2, s - p - w * 0.2);
        ctx.stroke();
        break;
      }

      case 'map-pin': {
        ctx.beginPath();
        ctx.arc(s / 2, p + w * 0.35, w * 0.28, Math.PI, 0);
        ctx.quadraticCurveTo(s - p - w * 0.1, p + w * 0.75, s / 2, s - p);
        ctx.quadraticCurveTo(p + w * 0.1, p + w * 0.75, p + w * 0.22, p + w * 0.35);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(s / 2, p + w * 0.35, w * 0.1, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'clock': {
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, w * 0.45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s / 2, p + w * 0.2);
        ctx.lineTo(s / 2, s / 2);
        ctx.lineTo(s / 2 + w * 0.25, s / 2);
        ctx.stroke();
        break;
      }

      case 'trash': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.15, p + w * 0.25);
        ctx.lineTo(s - p - w * 0.15, p + w * 0.25);
        ctx.strokeRect(p + w * 0.25, p + w * 0.25, w * 0.5, w * 0.65);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p + w * 0.35, p + w * 0.25);
        ctx.lineTo(p + w * 0.35, p + w * 0.12);
        ctx.lineTo(p + w * 0.65, p + w * 0.12);
        ctx.lineTo(p + w * 0.65, p + w * 0.25);
        ctx.stroke();
        break;
      }

      case 'sparkles': {
        drawStarPath(ctx, s / 2, s / 2, 4, w * 0.45, w * 0.15);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'volume': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.1, p + w * 0.35);
        ctx.lineTo(p + w * 0.3, p + w * 0.35);
        ctx.lineTo(p + w * 0.55, p + w * 0.15);
        ctx.lineTo(p + w * 0.55, s - p - w * 0.15);
        ctx.lineTo(p + w * 0.3, s - p - w * 0.35);
        ctx.lineTo(p + w * 0.1, s - p - w * 0.35);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p + w * 0.55, s / 2, w * 0.32, -Math.PI * 0.3, Math.PI * 0.3);
        ctx.stroke();
        break;
      }

      case 'volume-x': {
        ctx.beginPath();
        ctx.moveTo(p + w * 0.1, p + w * 0.35);
        ctx.lineTo(p + w * 0.3, p + w * 0.35);
        ctx.lineTo(p + w * 0.55, p + w * 0.15);
        ctx.lineTo(p + w * 0.55, s - p - w * 0.15);
        ctx.lineTo(p + w * 0.3, s - p - w * 0.35);
        ctx.lineTo(p + w * 0.1, s - p - w * 0.35);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p + w * 0.7, p + w * 0.35);
        ctx.lineTo(s - p - w * 0.05, s - p - w * 0.35);
        ctx.moveTo(s - p - w * 0.05, p + w * 0.35);
        ctx.lineTo(p + w * 0.7, s - p - w * 0.35);
        ctx.stroke();
        break;
      }

      default: {
        ctx.beginPath();
        ctx.arc(s / 2, s / 2, w * 0.35, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [name, size, color, secondaryColor, strokeWidth]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`inline-block flex-shrink-0 align-middle ${animateSpin ? 'animate-spin' : ''} ${className}`}
    />
  );
};

// Helper: draws a symmetrical star with cx, cy, points, outerRadius, innerRadius
function drawStarPath(
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
