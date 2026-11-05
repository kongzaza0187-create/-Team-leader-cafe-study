/**
 * Lumina 24-Hour Cafe - Ultra-Lightweight Ambient Background
 * Zero-CPU & Zero-RAM CSS Compositor Surface (Replaces 60fps WebGL loop to eliminate stutter)
 * Luxury Deep Obsidian (#0B0B0C) with Soft Cafe Amber Vignette
 * Strictly pointer-events-none to never interfere with clicks or gestures
 */

import React from 'react';

export const WebGLAmbientBackground: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 select-none overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(255, 107, 0, 0.05) 0%, transparent 55%), radial-gradient(circle at 85% 100%, rgba(255, 140, 51, 0.03) 0%, transparent 45%), #070708',
      }}
    >
      {/* Subtle organic quiet ambient glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#FF6B00]/[0.03] rounded-full blur-3xl pointer-events-none"
      />
    </div>
  );
};
