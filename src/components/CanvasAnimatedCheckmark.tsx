/**
 * Lumina 24-Hour Cafe - HTML5 Canvas Animated Success Checkmark
 * Smooth Vector Drawing Automation:
 * 1. Circular Stroke Animation (0 to 360 deg)
 * 2. Two-segment Vector Checkmark Tracing with Cubic Easing
 * 3. Radiant Emerald (#10B981) & Cafe Gold (#FF8C33) Micro-Particle Bloom
 * Synchronized with Web Audio API Tactile Sound
 */

import React, { useEffect, useRef } from 'react';
import { audioFeedbackService } from '../services/audioFeedbackService';

interface Props {
  size?: number;
  color?: string;
  glowColor?: string;
  onAnimationComplete?: () => void;
  playAudio?: boolean;
}

export const CanvasAnimatedCheckmark: React.FC<Props> = ({
  size = 110,
  color = '#34D399',
  glowColor = 'rgba(52, 211, 153, 0.45)',
  onAnimationComplete,
  playAudio = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (playAudio) {
      audioFeedbackService.playSuccessChime();
    }

    const dpr = window.devicePixelRatio || 2;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let animationFrameId: number;
    const startTime = performance.now();
    const duration = 950; // total animation duration ms

    // Particle spark system on completion
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      color: string;
    }
    const sparks: Spark[] = [];
    let sparksSpawned = false;

    // Cubic easing functions
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

    const render = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const radius = (size / 2) - 8;

      // Phase 1: Draw Circle (0% -> 45% of total time)
      const circleProgress = Math.min(progress / 0.45, 1);
      const easedCircle = easeOutCubic(circleProgress);

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        radius,
        -Math.PI / 2,
        -Math.PI / 2 + easedCircle * Math.PI * 2,
        false
      );
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.restore();

      // Phase 2: Draw Checkmark (40% -> 85% of total time)
      if (progress > 0.4) {
        const checkProgress = Math.min((progress - 0.4) / 0.45, 1);
        const easedCheck = easeOutCubic(checkProgress);

        // Key points of the checkmark
        const p1 = { x: size * 0.28, y: size * 0.52 };
        const p2 = { x: size * 0.44, y: size * 0.68 };
        const p3 = { x: size * 0.72, y: size * 0.36 };

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#FFFFFF';
        ctx.shadowColor = color;
        ctx.shadowBlur = 16;

        ctx.moveTo(p1.x, p1.y);

        if (easedCheck <= 0.4) {
          // Tracing first segment (down to vertex)
          const seg1Progress = easedCheck / 0.4;
          const currX = p1.x + (p2.x - p1.x) * seg1Progress;
          const currY = p1.y + (p2.y - p1.y) * seg1Progress;
          ctx.lineTo(currX, currY);
        } else {
          // First segment finished, tracing second segment (up to wing)
          ctx.lineTo(p2.x, p2.y);
          const seg2Progress = (easedCheck - 0.4) / 0.6;
          const currX = p2.x + (p3.x - p2.x) * seg2Progress;
          const currY = p2.y + (p3.y - p2.y) * seg2Progress;
          ctx.lineTo(currX, currY);
        }

        ctx.stroke();
        ctx.restore();

        // Phase 3: Particle bloom on apex completion
        if (checkProgress >= 0.9 && !sparksSpawned) {
          sparksSpawned = true;
          for (let i = 0; i < 18; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.2 + Math.random() * 2.8;
            sparks.push({
              x: centerX,
              y: centerY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              radius: 1.5 + Math.random() * 2,
              alpha: 0.95,
              color: Math.random() > 0.4 ? color : '#FF8C33',
            });
          }
        }
      }

      // Render sparks
      if (sparks.length > 0) {
        ctx.save();
        for (const s of sparks) {
          s.x += s.vx;
          s.y += s.vy;
          s.vx *= 0.94;
          s.vy *= 0.94;
          s.alpha *= 0.92;

          if (s.alpha > 0.05) {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 8;
            ctx.globalAlpha = s.alpha;
            ctx.fill();
          }
        }
        ctx.restore();
      }

      if (progress < 1 || sparks.some((s) => s.alpha > 0.05)) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, color, glowColor, onAnimationComplete, playAudio]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="block filter drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]"
      />
    </div>
  );
};
