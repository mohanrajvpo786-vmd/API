import React, { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  isActive: boolean;
  audioLevel?: number; // 0 to 1
  color?: string;
  barsCount?: number;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isActive,
  audioLevel = 0,
  color = "#10b981", // emerald
  barsCount = 20,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = Math.max(2, (width / barsCount) - 3);
      const centerY = height / 2;

      for (let i = 0; i < barsCount; i++) {
        const x = i * (barWidth + 3);
        let barHeight = 4;

        if (isActive) {
          // Dynamic wave based on sine wave + microphone audio level
          const wave = Math.sin(phase + i * 0.4) * 0.5 + 0.5;
          const dynamicMultiplier = Math.max(0.25, audioLevel * 1.5);
          barHeight = 6 + wave * (height * 0.7) * dynamicMultiplier;
        } else {
          barHeight = 4;
        }

        const y = centerY - barHeight / 2;

        ctx.fillStyle = isActive ? color : "#475569";
        ctx.beginPath();
        // Rounded bar
        ctx.roundRect(x, y, barWidth, Math.max(3, barHeight), 4);
        ctx.fill();
      }

      phase += 0.15;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive, audioLevel, color, barsCount]);

  return (
    <div className="flex items-center justify-center w-full h-12 overflow-hidden px-4">
      <canvas
        ref={canvasRef}
        width={240}
        height={48}
        className="w-full max-w-[280px] h-12"
      />
    </div>
  );
};
