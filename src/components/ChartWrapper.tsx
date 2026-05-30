import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Ensure Chart.js is properly registered
Chart.register(...registerables);

interface ChartWrapperProps {
  config: ChartConfiguration;
  className?: string;
}

export default function ChartWrapper({ config, className = "" }: ChartWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing instance to prevent registration conflict or canvas overlays
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Spawn new chart instance safely
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      chartInstanceRef.current = new Chart(ctx, config);
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [config]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
}
