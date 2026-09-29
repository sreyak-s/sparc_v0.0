'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  alpha: number;
  twinkleSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate Stars
    const numStars = Math.min(Math.floor((width * height) / 4500), 300);
    const starColors = ['#FFFFFF', '#E0F2FE', '#BAE6FD', '#7DD3FC', '#00F0FF', '#FED7AA'];
    const stars: Star[] = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 + 0.5,
      size: Math.random() * 1.8 + 0.3,
      color: starColors[Math.floor(Math.random() * starColors.length)],
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    // Shooting Stars
    const shootingStars: ShootingStar[] = [];
    const spawnShootingStar = () => {
      if (shootingStars.length < 2 && Math.random() < 0.03) {
        shootingStars.push({
          x: Math.random() * width * 0.8 + width * 0.1,
          y: Math.random() * height * 0.4,
          length: Math.random() * 80 + 40,
          speed: Math.random() * 8 + 6,
          angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
          alpha: 1,
          active: true,
        });
      }
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Deep space subtle gradient overlay
      const gradient = ctx.createRadialGradient(
        width / 2,
        height * 0.3,
        50,
        width / 2,
        height * 0.5,
        width * 0.8
      );
      gradient.addColorStop(0, 'rgba(2, 28, 68, 0.12)');
      gradient.addColorStop(0.5, 'rgba(0, 15, 38, 0.06)');
      gradient.addColorStop(1, 'rgba(2, 4, 10, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw normal stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha += Math.sin(tick * star.twinkleSpeed) * 0.015;
        const currentAlpha = Math.max(0.15, Math.min(1, star.alpha));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();

        // Subtle star glow for brighter ones
        if (star.size > 1.4) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      // Update & Draw Shooting Stars
      spawnShootingStar();
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        if (!s.active) {
          shootingStars.splice(i, 1);
          continue;
        }

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.alpha -= 0.015;

        if (s.alpha <= 0 || s.x > width || s.y > height) {
          s.active = false;
          continue;
        }

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const starGrad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        starGrad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
        starGrad.addColorStop(0.3, `rgba(0, 240, 255, ${s.alpha * 0.8})`);
        starGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = starGrad;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Head bright spot
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
}
