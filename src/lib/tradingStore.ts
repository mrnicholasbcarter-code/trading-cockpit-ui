/**
 * Trading Store - Zustand state management for the Kalshi Trading Cockpit
 * @packageDocumentation
 */

import { create } from 'zustand';

/**
 * Represents a trading market on Kalshi
 * @interface Market
 */
export interface Market {
  /** Unique market identifier */
  id: string;
  /** Trading venue (e.g., 'Kalshi') */
  venue: string;
  /** Market category (e.g., 'Crypto', 'Politics') */
  category: string;
  /** Human-readable market title/question */
  title: string;
  /** 24h price change percentage */
  change: number;
  /** YES side price in cents */
  yes: number;
  /** NO side price in cents */
  no: number;
  /** Model edge percentage */
  edge: number;
  /** Model confidence percentage */
  confidence: number;
  /** Bid-ask spread in cents */
  spread: number;
  /** Market liquidity (human-readable) */
  liquidity: string;
}

/**
 * Order book price level
 * @interface OrderBookLevel
 */
export interface OrderBookLevel {
  /** Price in cents */
  price: number;
  /** Volume at this price level */
  volume: number;
}

/**
 * Open position in a market
 * @interface Position
 */
export interface Position {
  /** Market identifier */
  market: string;
  /** Number of contracts held */
  contracts: number;
  /** Average entry price in cents */
  avgPrice: number;
  /** Position side */
  side: 'yes' | 'no';
  /** Unrealized P&L in dollars */
  pnl: number;
  /** Risk percentage of portfolio */
  risk: number;
}

/**
 * Agent decision log entry
 * @interface Log
 */
export interface Log {
  /** Unique log entry ID */
  id: string;
  /** Agent name that generated the log */
  agent: string;
  /** Timestamp in HH:MM:SS format */
  time: string;
  /** Log message */
  message: string;
  /** Log severity level */
  tone: 'info' | 'success' | 'warn' | 'danger';
}

/**
 * Trading bot state interface
 * @interface TradingState
 */
interface TradingState {
  /** Current bot operational status */
  botStatus: 'live' | 'paused' | 'guarded';
  /** Feed latency in milliseconds */
  latencyMs: number;
  /** Available markets */
  markets: Market[];
  /** Currently selected market ID */
  selectedMarketId: string;
  /** Current bid ladder */
  bids: OrderBookLevel[];
  /** Current ask ladder */
  asks: OrderBookLevel[];
  /** Open positions */
  positions: Position[];
  /** Agent decision logs */
  logs: Log[];
  /** Risk metrics */
  risk: {
    /** Available buying power in USD */
    buyingPower: number;
    /** Daily P&L in USD */
    dailyPnl: number;
    /** Portfolio exposure percentage */
    exposure: number;
    /** Deployed capital in USD */
    deployed: number;
    /** Current drawdown percentage */
    drawdown: number;
    /** 95% Value at Risk in USD */
    var95: number;
    /** Kill switch armed status */
    killSwitch: boolean;
  };
  /** Order fill rate percentage */
  fillRate: number;
  /** Toggle bot between live/paused */
  toggleBot: () => void;
  /** Toggle kill switch */
  toggleKillSwitch: () => void;
  /** Select a market by ID */
  selectMarket: (id: string) => void;
  /** Simulate a market tick */
  simulateTick: () => void;
}

/**
 * Format a number as USD currency
 * @param val - Value in dollars
 * @returns Formatted currency string
 */
export const formatCurrency = (val: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

/**
 * Zustand store for trading application state
 * Uses atomic updates to prevent unnecessary re-renders on high-frequency ticks
 * @returns TradingState store instance
 */
export const useTradingStore = create<TradingState>((set) => ({
  botStatus: 'live',
  latencyMs: 14,
  markets: [
    {
      id: '1',
      venue: 'Kalshi',
      category: 'Crypto',
      title: 'Will Bitcoin reach $100k?',
      change: 4.2,
      yes: 45.1,
      no: 55.9,
      edge: 2.1,
      confidence: 88,
      spread: 2,
      liquidity: '$45K',
    },
  ],
  selectedMarketId: '1',
  bids: [
    { price: 44, volume: 1000 },
    { price: 43, volume: 2500 },
    { price: 42, volume: 5000 },
  ],
  asks: [
    { price: 46, volume: 800 },
    { price: 47, volume: 1200 },
    { price: 48, volume: 4000 },
  ],
  positions: [
    { market: 'Fed Cut', contracts: 5000, avgPrice: 12, side: 'yes', pnl: 450, risk: 2.5 },
  ],
  logs: [
    { id: '1', agent: 'Risk Guard', time: '10:42:01', message: 'Initialized state', tone: 'info' },
  ],
  risk: {
    buyingPower: 250000,
    dailyPnl: 1450,
    exposure: 12.5,
    deployed: 45000,
    drawdown: 1.2,
    var95: -4500,
    killSwitch: false,
  },
  fillRate: 98.4,
  toggleBot: () => set((s) => ({ botStatus: s.botStatus === 'live' ? 'paused' : 'live' })),
  toggleKillSwitch: () =>
    set((s) => ({
      risk: { ...s.risk, killSwitch: !s.risk.killSwitch },
      botStatus: !s.risk.killSwitch ? 'guarded' : 'live',
    })),
  selectMarket: (id) => set({ selectedMarketId: id }),
  simulateTick: () => set((_s) => ({ latencyMs: Math.floor(Math.random() * 20) + 5 })),
}));
