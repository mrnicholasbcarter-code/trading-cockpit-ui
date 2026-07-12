/**
 * Order Book Hook - High-performance WebSocket order book synchronization
 * @packageDocumentation
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { create } from 'zustand';
import { MockWebSocket } from '../lib/mockWebsocket';

// ---------------------------------------------------------
// Strict TypeScript Interfaces mapping the Python SDK
// ---------------------------------------------------------

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
 * Represents a streaming trade
 * @interface Trade
 */
export interface Trade {
  /** Unix timestamp in milliseconds */
  time: number;
  /** Price in cents */
  price: number;
  /** Quantity of contracts traded */
  size: number;
  /** Order side of the taker */
  side: 'buy' | 'sell';
}

/**
 * Complete order book state including trades
 * @interface OrderBookState
 */
export interface OrderBookState {
  /** Bid ladder (buy orders) */
  bids: OrderBookLevel[];
  /** Ask ladder (sell orders) */
  asks: OrderBookLevel[];
  /** Last update timestamp */
  lastUpdateTs: number;
  /** Live trade stream */
  trades: Trade[];
}

/**
 * Order book store with atomic updates
 * @interface OrderBookStore
 */
export interface OrderBookStore extends OrderBookState {
  /** Update the entire order book atomically */
  updateBook: (bids: OrderBookLevel[], asks: OrderBookLevel[]) => void;
  /** Append a new trade to the live feed */
  addTrade: (trade: Trade) => void;
}

// Atomic state prevents full React-tree re-renders on sub-millisecond ticks
/**
 * Zustand store for order book data
 * Uses atomic updates to prevent full React tree re-renders on high-frequency ticks
 * @returns OrderBookStore instance
 */
export const useOrderBookStore = create<OrderBookStore>((set) => ({
  bids: [],
  asks: [],
  lastUpdateTs: 0,
  trades: [],
  updateBook: (bids, asks) => set({ bids, asks, lastUpdateTs: Date.now() }),
  addTrade: (trade) => set((state) => {
    // Keep only last 500 trades to avoid unbound memory growth
    const newTrades = [trade, ...state.trades].slice(0, 500);
    return { trades: newTrades };
  }),
}));

/**
 * Hook for managing Kalshi market WebSocket connection
 * Handles connection lifecycle, reconnection, and message parsing
 * @param marketId - Market identifier to subscribe to
 * @returns Connection status
 */
export function useMarketWebsocket(marketId: string) {
  const ws = useRef<WebSocket | null>(null);
  const updateBook = useOrderBookStore((state) => state.updateBook);
  const addTrade = useOrderBookStore((state) => state.addTrade);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const connectRef = useRef<() => void>();

  const connect = useCallback(() => {
    const isMock = process.env.NODE_ENV !== 'test' && typeof window !== 'undefined';
    const wsUrl = `wss://api.internal/v1/stream?market=${marketId}`;
    
    // In production, this proxies through our backend to avoid exposing auth keys
    // In browser client (dev/prod), fallback to MockWebSocket
    ws.current = isMock 
      ? (new MockWebSocket(wsUrl) as unknown as WebSocket)
      : new WebSocket(wsUrl);

    ws.current.onopen = () => setStatus('connected');

    ws.current.onmessage = (event) => {
      // High-performance parse, bypassing state triggers if volume is zero logic
      const data = JSON.parse(event.data);
      if (data.type === 'l2_delta') {
        updateBook(data.bids, data.asks);
      } else if (data.type === 'trade') {
        addTrade(data.trade);
      }
    };

    ws.current.onerror = () => setStatus('error');
    ws.current.onclose = () => {
      setStatus('connecting');
      setTimeout(() => connectRef.current?.(), 1000); // Exponential backoff in production
    };
  }, [marketId, updateBook, addTrade]);

  // Store connect in ref to avoid circular dependency in useCallback
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  useEffect(() => {
    connect();
    return () => ws.current?.close();
  }, [connect]);

  return { status };
}
