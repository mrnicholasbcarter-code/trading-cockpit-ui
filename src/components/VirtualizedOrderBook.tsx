import React, { CSSProperties } from 'react';
import { FixedSizeList as List } from 'react-window';
import { OrderBookLevel } from '@/lib/tradingStore';

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function VirtualizedOrderBookSide({ title, levels, side, maxVolume }: { title: string; levels: OrderBookLevel[]; side: 'bid' | 'ask'; maxVolume: number }) {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => {
    const level = levels[index];
    if (!level) return null;
    return (
      <div style={style} className="pr-2">
        <div className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.035] px-3 py-2 flex items-center h-full">
          <div className={classNames('absolute inset-y-0 right-0', side === 'bid' ? 'bg-green-500/10' : 'bg-red-500/10')} style={{ width: `${(level.volume / maxVolume) * 100}%` }} />
          <div className="relative w-full flex justify-between text-sm tabular-nums">
            <span className={side === 'bid' ? 'text-green-400' : 'text-red-500'}>{level.price.toFixed(1)}¢</span>
            <span className="text-slate-300">{level.volume.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2 h-[400px]">
      <div className="flex justify-between px-1 text-xs uppercase tracking-[0.2em] text-slate-500"><span>{title}</span><span>Volume</span></div>
      <List
        height={370}
        itemCount={levels.length}
        itemSize={44}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}
