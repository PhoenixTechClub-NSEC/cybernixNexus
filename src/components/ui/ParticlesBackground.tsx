'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  opacity: number;
  baseOpacity: number;
}

export default function ParticlesBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
    };

    const targetParticleCount = 165;
    const maxLineDistance = 160;
    const maxBubbleDistance = 400;
    const bubbleTargetSize = 12.15;
    const bubbleTargetOpacity = 0.41;
    const speed = 1.2; // Smooth calibrated speed for 60fps canvas movement

    let particles: Particle[] = [];

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      // Re-initialize or adjust particles when size changes
      if (particles.length === 0) {
        initParticles();
      } else {
        particles.forEach((p) => {
          if (p.x > width) p.x = Math.random() * width;
          if (p.y > height) p.y = Math.random() * height;
        });
      }
    };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < targetParticleCount; i++) {
        const radius = 0.8 + Math.random() * 1.5;
        const angle = Math.random() * Math.PI * 2;
        const pSpeed = 0.4 + Math.random() * speed;

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * pSpeed,
          vy: Math.sin(angle) * pSpeed,
          radius,
          baseRadius: radius,
          opacity: 0.5,
          baseOpacity: 0.5,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const numParticles = particles.length;

      // 1. Draw connecting lines between nearby particles
      ctx.lineWidth = 1;
      for (let i = 0; i < numParticles; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < numParticles; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;

          // Fast rejection box
          if (Math.abs(dx) > maxLineDistance || Math.abs(dy) > maxLineDistance) {
            continue;
          }

          const distSq = dx * dx + dy * dy;
          if (distSq < maxLineDistance * maxLineDistance) {
            const dist = Math.sqrt(distSq);
            const lineOpacity = 0.54 * (1 - dist / maxLineDistance);
            ctx.strokeStyle = `rgba(0, 0, 0, ${lineOpacity.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 2. Update & Draw each particle
      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];

        // Movement
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges to avoid glitchy wrap-around line pops
        if (p.x < p.radius) {
          p.x = p.radius;
          p.vx *= -1;
        } else if (p.x > width - p.radius) {
          p.x = width - p.radius;
          p.vx *= -1;
        }

        if (p.y < p.radius) {
          p.y = p.radius;
          p.vy *= -1;
        } else if (p.y > height - p.radius) {
          p.y = height - p.radius;
          p.vy *= -1;
        }

        // Interactivity: Bubble effect on hover
        let currentRadius = p.baseRadius;
        let currentOpacity = p.baseOpacity;

        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mDistSq = mdx * mdx + mdy * mdy;

          if (mDistSq < maxBubbleDistance * maxBubbleDistance) {
            const mDist = Math.sqrt(mDistSq);
            const ratio = 1 - mDist / maxBubbleDistance;
            currentRadius = p.baseRadius + (bubbleTargetSize - p.baseRadius) * ratio;
            currentOpacity = p.baseOpacity + (bubbleTargetOpacity - p.baseOpacity) * ratio;
          }
        }

        p.radius = currentRadius;
        p.opacity = currentOpacity;

        // Draw particle circle
        ctx.fillStyle = `rgba(0, 0, 0, ${p.opacity.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Initialize and attach listeners
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      id="particles-js"
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      style={{
        backgroundColor: '#fff1d6',
        backgroundImage: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        className="block align-bottom w-full h-full"
      />
    </div>
  );
}
