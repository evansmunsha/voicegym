"use client";

import { useEffect, useRef } from "react";

export function Confetti({ trigger }: { trigger: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    const confettiCount = 120;
    const confetti: any[] = [];
    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random() * W,
        y: Math.random() * H - H,
        r: Math.random() * 6 + 4,
        d: Math.random() * confettiCount,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        tilt: Math.random() * 10 - 10,
        tiltAngle: 0,
      });
    }
    let angle = 0;
    let tiltAngle = 0;
    let animationFrame: number;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < confettiCount; i++) {
        const c = confetti[i];
        ctx.beginPath();
        ctx.lineWidth = c.r;
        ctx.strokeStyle = c.color;
        ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
        ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 5);
        ctx.stroke();
      }
      update();
      animationFrame = requestAnimationFrame(draw);
    }
    function update() {
      angle += 0.01;
      tiltAngle += 0.1;
      for (let i = 0; i < confettiCount; i++) {
        const c = confetti[i];
        c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2;
        c.x += Math.sin(angle);
        c.tilt = Math.sin(tiltAngle - i / 3) * 15;
        if (c.y > H) {
          c.x = Math.random() * W;
          c.y = -10;
        }
      }
    }
    draw();
    setTimeout(() => {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, W, H);
    }, 2000);
    // eslint-disable-next-line
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 50,
        display: trigger ? "block" : "none",
      }}
    />
  );
}
