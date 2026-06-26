"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  char: string;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  offsetX: number;
  offsetY: number;
}

export function CursorAsciiEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    // Character pool (math, symbols, emojis)
    const CHAR_POOL = ["=", "+", "-", "#", "%", "&", "@", "*", "$"];

    const getRandomChar = () => {
      return CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];
    };

    const isLightMode = () => {
      return document.documentElement.classList.contains("light");
    };

    // Color constraint: white in dark mode, black in light mode
    const getActiveColor = () => {
      return isLightMode() ? "#000000" : "#ffffff";
    };

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Watch resize of parent element as well
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(container);

    const handleMouseEnter = () => {
      mouseRef.current.active = true;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Continuous, decoupled spawning:
      // Spawns 1 particle on every animation frame for high density, regardless of mouse movement.
      if (mouseRef.current.active) {
        // Spawn characters uniformly within a squarish box of limited radius (e.g. 70px) around the cursor
        const boxSize = 70;
        const offsetX = (Math.random() - 0.5) * boxSize;
        const offsetY = (Math.random() - 0.5) * boxSize;

        // Slow float speeds
        const vx = (Math.random() - 0.5) * 0.08;
        const vy = (Math.random() - 0.5) * 0.08 - 0.04;

        // Persistence: 75 to 105 frames (~1.2 to 1.7 seconds)
        const maxLife = 75 + Math.floor(Math.random() * 30);
        const activeColor = getActiveColor();

        particles.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          char: getRandomChar(),
          color: activeColor,
          size: 11 + Math.random() * 3,
          life: maxLife,
          maxLife,
          vx,
          vy,
          offsetX,
          offsetY
        });
      }

      particles.forEach((p, index) => {
        p.life--;

        if (p.life <= 0) {
          particles.splice(index, 1);
          return;
        }

        // Cycle character slow (8% chance) to preserve symbol readability
        if (Math.random() < 0.08) {
          p.char = getRandomChar();
        }

        // Sync colors with current theme
        p.color = getActiveColor();

        // Drift animation
        p.offsetX += p.vx;
        p.offsetY += p.vy;

        const drawX = p.x + p.offsetX;
        const drawY = p.y + p.offsetY;

        // Draw character to canvas with appropriate transparency/fade
        const alpha = (p.life / p.maxLife) * 0.15;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        const isEmoji = p.char === "🧠" || p.char === "⏱️" || p.char === "💵";
        ctx.font = isEmoji ? `${p.size + 2}px sans-serif` : `${p.size}px monospace`;

        ctx.fillText(p.char, drawX, drawY);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    animationFrameId = requestAnimationFrame(updateAndDraw);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      resizeObserver.disconnect();
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[-1]"
    />
  );
}
