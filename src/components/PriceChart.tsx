import React, { useEffect, useRef } from 'react';
import { createChart, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { Trade } from '../hooks/useOrderBook';

export interface PriceChartProps {
  trades: Trade[];
}

export function PriceChart({ trades }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0b0f19' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth || 600,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: true,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    });

    candlestickSeriesRef.current = candlestickSeries;
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!candlestickSeriesRef.current || trades.length === 0) return;

    // Group trades by 5-second intervals to form Candlestick data (OHLC)
    const candlesMap = new Map<number, { open: number; high: number; low: number; close: number }>();
    
    trades.forEach((t) => {
      // Group by 5 seconds
      const candleTime = Math.floor(t.time / 5000) * 5;
      const current = candlesMap.get(candleTime);
      if (!current) {
        candlesMap.set(candleTime, {
          open: t.price,
          high: t.price,
          low: t.price,
          close: t.price
        });
      } else {
        current.high = Math.max(current.high, t.price);
        current.low = Math.min(current.low, t.price);
        current.close = t.price;
      }
    });

    const data = Array.from(candlesMap.entries())
      .map(([time, candle]) => ({
        time: time as UTCTimestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));

    candlestickSeriesRef.current.setData(data);
  }, [trades]);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950 p-4">
      <div className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-500">Live Price Feed (Candlesticks)</div>
      <div ref={chartContainerRef} className="h-[300px] w-full" />
    </div>
  );
}
