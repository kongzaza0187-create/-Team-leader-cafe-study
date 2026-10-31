/**
 * Lumina 24-Hour Cafe - High-Performance WebGL & Canvas Ambient Fluid Visualizer
 * Real-time luxury shader with deep obsidian (#0B0B0C) and cafe amber (#FF6B00 / #FF8C33)
 * Automatic fail-safe fallback for constrained mobile WebViews and sandboxed iframes
 * Strictly pointer-events-none to never interfere with clicks or gestures
 */

import React, { useEffect, useRef } from 'react';

export const WebGLAmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number | null = null;

    try {
      let gl: WebGLRenderingContext | null = null;
      try {
        gl = canvas.getContext('webgl', {
          alpha: true,
          antialias: false,
          depth: false,
          preserveDrawingBuffer: false,
          powerPreference: 'low-power',
        });
      } catch {
        gl = null;
      }

      // If WebGL is unavailable or fails, use lightweight 2D particles
      if (!gl) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize2D = () => {
          if (!canvas) return;
          canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
          canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
        };

        resize2D();
        window.addEventListener('resize', resize2D, { passive: true });

        const particles: Array<{ x: number; y: number; r: number; vx: number; vy: number; alpha: number }> = [];
        for (let i = 0; i < 20; i++) {
          particles.push({
            x: Math.random() * (canvas.width || 360),
            y: Math.random() * (canvas.height || 640),
            r: 1 + Math.random() * 2,
            vx: (Math.random() - 0.5) * 0.2,
            vy: -0.2 - Math.random() * 0.3,
            alpha: 0.1 + Math.random() * 0.3,
          });
        }

        const render2D = () => {
          try {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const p of particles) {
              p.x += p.vx;
              p.y += p.vy;
              if (p.y < -10) {
                p.y = canvas.height + 10;
                p.x = Math.random() * canvas.width;
              }
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 140, 51, ${p.alpha})`;
              ctx.fill();
            }
            animationFrameId = requestAnimationFrame(render2D);
          } catch {
            // Graceful exit
          }
        };

        render2D();

        return () => {
          window.removeEventListener('resize', resize2D);
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
      }

      // WebGL Shader Pipeline
      const vsSource = `
        attribute vec2 a_position;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      const fsSource = `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform float u_time;

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          float t = u_time * 0.15;
          float wave = sin(uv.x * 3.0 + t) * cos(uv.y * 3.0 - t);
          vec3 baseColor = vec3(0.043, 0.043, 0.047);
          vec3 amber = vec3(1.0, 0.42, 0.0);
          float glow = smoothstep(0.8, 0.0, length(uv - vec2(0.5, 0.3))) * 0.15;
          glow += wave * 0.04;
          gl_FragColor = vec4(baseColor + amber * glow, 0.7);
        }
      `;

      const createShader = (type: number, source: string) => {
        const shader = gl!.createShader(type);
        if (!shader) return null;
        gl!.shaderSource(shader, source);
        gl!.compileShader(shader);
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
          gl!.deleteShader(shader);
          return null;
        }
        return shader;
      };

      const vertShader = createShader(gl.VERTEX_SHADER, vsSource);
      const fragShader = createShader(gl.FRAGMENT_SHADER, fsSource);

      if (!vertShader || !fragShader) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vertShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]),
        gl.STATIC_DRAW
      );

      const posLocation = gl.getAttribLocation(program, 'a_position');
      const resLocation = gl.getUniformLocation(program, 'u_resolution');
      const timeLocation = gl.getUniformLocation(program, 'u_time');

      const startTime = performance.now();

      const resize = () => {
        if (!canvas) return;
        const w = canvas.parentElement?.clientWidth || window.innerWidth;
        const h = canvas.parentElement?.clientHeight || window.innerHeight;
        canvas.width = Math.floor(w);
        canvas.height = Math.floor(h);
        gl?.viewport(0, 0, canvas.width, canvas.height);
      };

      resize();
      window.addEventListener('resize', resize, { passive: true });

      const render = (now: number) => {
        try {
          if (!gl || !program) return;
          const elapsed = (now - startTime) * 0.001;
          gl.useProgram(program);
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.enableVertexAttribArray(posLocation);
          gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);
          gl.uniform2f(resLocation, canvas.width, canvas.height);
          gl.uniform1f(timeLocation, elapsed);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          animationFrameId = requestAnimationFrame(render);
        } catch {
          // Graceful catch
        }
      };

      animationFrameId = requestAnimationFrame(render);

      return () => {
        window.removeEventListener('resize', resize);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        try {
          if (gl) {
            gl.deleteProgram(program);
            gl.deleteShader(vertShader);
            gl.deleteShader(fragShader);
            gl.deleteBuffer(positionBuffer);
          }
        } catch {}
      };
    } catch {
      // Complete safety
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0 select-none"
      style={{ pointerEvents: 'none' }}
    />
  );
};
