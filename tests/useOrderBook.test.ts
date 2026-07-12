import { renderHook, act } from '@testing-library/react';
import { useOrderBookStore, useMarketWebsocket } from '../src/hooks/useOrderBook';

describe('useOrderBookStore', () => {
  it('updates bids and asks', () => {
    const { result } = renderHook(() => useOrderBookStore());
    
    expect(result.current.bids).toEqual([]);
    expect(result.current.asks).toEqual([]);
    expect(result.current.lastUpdateTs).toBe(0);

    act(() => {
      result.current.updateBook([{ price: 50, volume: 100 }], [{ price: 51, volume: 200 }]);
    });

    expect(result.current.bids).toEqual([{ price: 50, volume: 100 }]);
    expect(result.current.asks).toEqual([{ price: 51, volume: 200 }]);
    expect(result.current.lastUpdateTs).toBeGreaterThan(0);
  });
});

describe('useMarketWebsocket', () => {
  let mockWebSocket: any;

  beforeEach(() => {
    mockWebSocket = {
      send: jest.fn(),
      close: jest.fn(),
    };
    (global as any).WebSocket = jest.fn(() => mockWebSocket);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('connects to websocket and receives messages', () => {
    const { result } = renderHook(() => useMarketWebsocket('test-market-123'));
    
    expect((global as any).WebSocket).toHaveBeenCalledWith('wss://api.internal/v1/stream?market=test-market-123');
    expect(result.current.status).toBe('connecting');

    act(() => {
      if (mockWebSocket.onopen) mockWebSocket.onopen();
    });

    expect(result.current.status).toBe('connected');

    act(() => {
      if (mockWebSocket.onmessage) {
        mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'l2_delta',
            bids: [{ price: 10, volume: 1 }],
            asks: [{ price: 11, volume: 2 }]
          })
        });
      }
    });

    const store = useOrderBookStore.getState();
    expect(store.bids).toEqual([{ price: 10, volume: 1 }]);
    expect(store.asks).toEqual([{ price: 11, volume: 2 }]);
  });

  it('handles websocket errors and reconnection on close', () => {
    const { result } = renderHook(() => useMarketWebsocket('test-market-123'));
    
    act(() => {
      if (mockWebSocket.onerror) mockWebSocket.onerror();
    });

    expect(result.current.status).toBe('error');

    act(() => {
      if (mockWebSocket.onclose) mockWebSocket.onclose();
    });

    expect(result.current.status).toBe('connecting');
    
    expect((global as any).WebSocket).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect((global as any).WebSocket).toHaveBeenCalledTimes(2);
  });
});
