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
}

interface WaterParticlesProps {
  sourceX: number;
  sourceY: number;
  rate?: number;
  active?: boolean;
}

export function WaterParticles({ sourceX, sourceY, rate = 50, active = true }: WaterParticlesProps) {
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

    const animate = (timestamp: number) => {
      if (!active) {
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

      const now = performance.now();
      const elapsed = now - lastSpawnRef.current;
      const toSpawn = Math.floor(elapsed / spawnInterval);
      if (toSpawn > 0) {
        lastSpawnRef.current = now - (elapsed % spawnInterval);
        for (let i = 0; i < Math.min(toSpawn, 10); i++) {
          const spread = (Math.random() - 0.5) * 20;
          particlesRef.current.push({
            x: sx + spread,
            y: sy + Math.random() * 4,
            vx: (Math.random() - 0.5) * 0.4,
            vy: 1.5 + Math.random() * 3,
            life: 60 + Math.random() * 80,
            maxLife: 60 + Math.random() * 80,
            size: 1.5 + Math.random() * 3,
          });
        }
      }

      ctx.clearRect(0, 0, w, h);
      const p = particlesRef.current;

      for (let i = p.length - 1; i >= 0; i--) {
        const pt = p[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.03;
        pt.life--;

        if (pt.life <= 0) {
          p.splice(i, 1);
          continue;
        }

        const alpha = (pt.life / pt.maxLife) * 0.6;
        const size = pt.size * (0.5 + alpha);

        // Water glow
        ctx.save();
        ctx.globalAlpha = alpha * 0.25;
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Water core
        ctx.globalAlpha = alpha * 0.8;
        ctx.fillStyle = '#bfdbfe';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size * 0.5, 0, Math.PI * 2);
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
