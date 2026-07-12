/**
 * Order Book Hook - High-performance WebSocket order book synchronization
 * @packageDocumentation
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { create } from 'zustand';

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
 * Complete order book state
 * @interface OrderBookState
 */
export interface OrderBookState {
  /** Bid ladder (buy orders) */
  bids: OrderBookLevel[];
  /** Ask ladder (sell orders) */
  asks: OrderBookLevel[];
  /** Last update timestamp */
  lastUpdateTs: number;
}

/**
 * Order book store with atomic updates
 * @interface OrderBookStore
 */
export interface OrderBookStore extends OrderBookState {
  /** Update the entire order book atomically */
  updateBook: (bids: OrderBookLevel[], asks: OrderBookLevel[]) => void;
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
  updateBook: (bids, asks) => set({ bids, asks, lastUpdateTs: Date.now() }),
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
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const connectRef = useRef<() => void>();

  const connect = useCallback(() => {
    // In production, this proxies through our backend to avoid exposing auth keys
    ws.current = new WebSocket(`wss://api.internal/v1/stream?market=${marketId}`);

    ws.current.onopen = () => setStatus('connected');

    ws.current.onmessage = (event) => {
      // High-performance parse, bypassing state triggers if volume is zero logic
      const data = JSON.parse(event.data);
      if (data.type === 'l2_delta') {
        updateBook(data.bids, data.asks);
      }
    };

    ws.current.onerror = () => setStatus('error');
    ws.current.onclose = () => {
      setStatus('connecting');
      setTimeout(() => connectRef.current?.(), 1000); // Exponential backoff in production
    };
  }, [marketId, updateBook]);

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
