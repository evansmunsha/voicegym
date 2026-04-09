"use client";

import { useEffect, useRef } from "react";

interface ProgressChartProps {
  scores: number[];
}

export function ProgressChart({ scores }: ProgressChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !scores.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 320, 80);
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 3;
    ctx.beginPath();
    scores.forEach((score, i) => {
      const x = (i / (scores.length - 1)) * 300 + 10;
      const y = 70 - (score / 100) * 60;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // Dots
    ctx.fillStyle = "#f59e42";
    scores.forEach((score, i) => {
      const x = (i / (scores.length - 1)) * 300 + 10;
      const y = 70 - (score / 100) * 60;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }, [scores]);
  return (
    <div className="my-4">
      <canvas ref={canvasRef} width={320} height={80} className="w-full h-20 bg-white rounded-xl shadow border" />
      <div className="text-xs text-gray-500 text-center">Your recent scores</div>
    </div>
  );
}
