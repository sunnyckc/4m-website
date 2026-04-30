'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface MagmaParticlesProps {
  /** X position of magma source as percentage of container width (0-100) */
  sourceX: number;
  /** Y position of magma source as percentage of container height (0-100) */
  sourceY: number;
  /** Particles per second */
  rate?: number;
  /** When false, particle canvas is hidden */
  active?: boolean;
}

const COLORS = [
  '#ff4500', '#ff6347', '#ff7f50', '#ff8c00',
  '#ffa500', '#ffd700', '#ff4500', '#ff2400',
];

export function MagmaParticles({ sourceX, sourceY, rate = 40, active = true }: MagmaParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnRef = useRef(0);
  const animRef = useRef(0);

  const spawnInterval = 1000 / rate;

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [resize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const animate = (timestamp: number) => {
      if (!active) {
        // clear existing particles quickly
        const p = particlesRef.current;
        for (let i = p.length - 1; i >= 0; i--) {
          p[i].life -= 8;
          if (p[i].life <= 0) p.splice(i, 1);
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (p.length > 0) animRef.current = requestAnimationFrame(animate);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      const sx = (sourceX / 100) * w;
      const sy = (sourceY / 100) * h;

      frameCount++;

      // Spawn particles
      const now = performance.now();
      const elapsed = now - lastSpawnRef.current;
      const toSpawn = Math.floor(elapsed / spawnInterval);
      if (toSpawn > 0) {
        lastSpawnRef.current = now - (elapsed % spawnInterval);
        for (let i = 0; i < Math.min(toSpawn, 10); i++) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 3;
          const speed = 0.5 + Math.random() * 2.5;
          const life = 80 + Math.random() * 120;
          particlesRef.current.push({
            x: sx + (Math.random() - 0.5) * 8,
            y: sy + Math.random() * 4,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed * 0.6,
            life,
            maxLife: life,
            size: 2 + Math.random() * 5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
      }

      // Update & draw
      ctx.clearRect(0, 0, w, h);
      const p = particlesRef.current;

      for (let i = p.length - 1; i >= 0; i--) {
        const pt = p[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.02 + Math.random() * 0.02;
        pt.life--;

        if (pt.life <= 0) {
          p.splice(i, 1);
          continue;
        }

        const alpha = pt.life / pt.maxLife;
        const size = pt.size * (0.6 + alpha * 0.4);

        // Glow
        ctx.save();
        ctx.globalAlpha = alpha * 0.3;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x - size * 2, pt.y - size * 2, size * 4, size * 4);
        ctx.restore();

        // Core
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    lastSpawnRef.current = performance.now();
    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [sourceX, sourceY, rate, active, spawnInterval]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />;
}
