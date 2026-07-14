import { create } from 'zustand';

export interface Market { id: string; venue: string; category: string; title: string; change: number; yes: number; no: number; edge: number; confidence: number; spread: number; liquidity: string; }
export interface OrderBookLevel { price: number; volume: number; }
export interface Position { market: string; contracts: number; avgPrice: number; side: 'yes'|'no'; pnl: number; risk: number; }
export interface Log { id: string; agent: string; time: string; message: string; tone: 'info'|'success'|'warn'|'danger'; }

interface TradingState {
  botStatus: 'live' | 'paused' | 'guarded';
  latencyMs: number;
  markets: Market[];
  selectedMarketId: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  positions: Position[];
  logs: Log[];
  risk: { buyingPower: number; dailyPnl: number; exposure: number; deployed: number; drawdown: number; var95: number; killSwitch: boolean; };
  fillRate: number;
  toggleBot: () => void;
  toggleKillSwitch: () => void;
  selectMarket: (id: string) => void;
  simulateTick: () => void;
}

export const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);


// 10,000 level orderbook for stress fixture
const mockBids = Array.from({ length: 5000 }, (_, i) => ({
  price: 44 - (i * 0.01),
  volume: Math.floor(Math.random() * 5000) + 100
}));

const mockAsks = Array.from({ length: 5000 }, (_, i) => ({
  price: 46 + (i * 0.01),
  volume: Math.floor(Math.random() * 5000) + 100
}));

export const useTradingStore = create<TradingState>((set) => ({
  botStatus: 'live', latencyMs: 14,
  markets: [
    { id: '1', venue: 'Kalshi', category: 'Crypto', title: 'Will Bitcoin reach $100k?', change: 4.2, yes: 45.1, no: 55.9, edge: 2.1, confidence: 88, spread: 2, liquidity: '$45K' }
  ],
  selectedMarketId: '1',
  bids: mockBids,
  asks: mockAsks,
  positions: [{ market: 'Fed Cut', contracts: 5000, avgPrice: 12, side: 'yes', pnl: 450, risk: 2.5 }],
  logs: [{ id: '1', agent: 'Risk Guard', time: '10:42:01', message: 'Initialized state', tone: 'info' }],
  risk: { buyingPower: 250000, dailyPnl: 1450, exposure: 12.5, deployed: 45000, drawdown: 1.2, var95: -4500, killSwitch: false },
  fillRate: 98.4,
  toggleBot: () => set((s) => ({ botStatus: s.botStatus === 'live' ? 'paused' : 'live' })),
  toggleKillSwitch: () => set((s) => ({ risk: { ...s.risk, killSwitch: !s.risk.killSwitch }, botStatus: !s.risk.killSwitch ? 'guarded' : 'live' })),
  selectMarket: (id) => set({ selectedMarketId: id }),
  simulateTick: () => set((s) => ({ latencyMs: Math.floor(Math.random() * 20) + 5 }))
}));
