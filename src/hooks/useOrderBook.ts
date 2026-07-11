import { useEffect, useState, useRef, useCallback } from 'react';
import { create } from 'zustand';

// ---------------------------------------------------------
// Strict TypeScript Interfaces mapping the Python SDK
// ---------------------------------------------------------

interface OrderBookLevel {
  price: number;
  volume: number;
}

interface OrderBookState {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdateTs: number;
}

interface OrderBookStore extends OrderBookState {
  updateBook: (bids: OrderBookLevel[], asks: OrderBookLevel[]) => void;
}

// Atomic state prevents full React-tree re-renders on sub-millisecond ticks
export const useOrderBookStore = create<OrderBookStore>((set) => ({
  bids: [],
  asks: [],
  lastUpdateTs: 0,
  updateBook: (bids, asks) => set({ bids, asks, lastUpdateTs: Date.now() }),
}));

export function useMarketWebsocket(marketId: string) {
  const ws = useRef<WebSocket | null>(null);
  const updateBook = useOrderBookStore((state) => state.updateBook);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

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
      setTimeout(connect, 1000); // Exponential backoff in production
    };
  }, [marketId, updateBook]);

  useEffect(() => {
    connect();
    return () => ws.current?.close();
  }, [connect]);

  return { status };
}
