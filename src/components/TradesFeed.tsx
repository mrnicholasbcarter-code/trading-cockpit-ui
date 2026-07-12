import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Trade } from '../hooks/useOrderBook';

export interface TradesFeedProps {
  trades: Trade[];
}

export function TradesFeed({ trades }: TradesFeedProps) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    // Show newest first
    const trade = trades[index];
    if (!trade) return null;

    const timeStr = new Date(trade.time).toLocaleTimeString();

    return (
      <div
        style={style}
        className="flex items-center justify-between border-b border-white/5 px-4 text-xs font-semibold tabular-nums"
      >
        <span className="text-slate-500">{timeStr}</span>
        <span
          className={
            trade.side === 'buy'
              ? 'text-green-400 font-bold'
              : 'text-red-500 font-bold'
          }
        >
          {trade.side.toUpperCase()}
        </span>
        <span className="text-white">{trade.price.toFixed(1)}¢</span>
        <span className="text-slate-400">{trade.size} contracts</span>
      </div>
    );
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Virtualized stream</p>
          <h2 className="text-lg font-semibold text-white">Live trade execution</h2>
        </div>
        <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">
          Streaming ({trades.length})
        </span>
      </div>
      <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
        {trades.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-xs text-slate-500">
            Awaiting WebSocket trades data...
          </div>
        ) : (
          <List
            height={300}
            itemCount={trades.length}
            itemSize={40}
            width="100%"
          >
            {Row}
          </List>
        )}
      </div>
    </div>
  );
}
