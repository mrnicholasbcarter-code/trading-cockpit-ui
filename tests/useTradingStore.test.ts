import { renderHook, act } from '@testing-library/react';
import { useTradingStore } from '../src/lib/tradingStore';

describe('useTradingStore', () => {
  beforeEach(() => {
    // Reset the store to initial state if needed, but since it's global, we can just reset specific values or re-initialize
    const store = useTradingStore.getState();
    useTradingStore.setState({
      botStatus: 'live',
      latencyMs: 14,
      selectedMarketId: '1',
      risk: { ...store.risk, killSwitch: false },
    });
  });

  it('toggles kill switch and updates bot status', () => {
    const { result } = renderHook(() => useTradingStore());

    expect(result.current.risk.killSwitch).toBe(false);
    expect(result.current.botStatus).toBe('live');

    act(() => {
      result.current.toggleKillSwitch();
    });

    expect(result.current.risk.killSwitch).toBe(true);
    expect(result.current.botStatus).toBe('guarded');

    act(() => {
      result.current.toggleKillSwitch();
    });

    expect(result.current.risk.killSwitch).toBe(false);
    expect(result.current.botStatus).toBe('live');
  });

  it('simulates tick by updating latency', () => {
    const { result } = renderHook(() => useTradingStore());

    const initialLatency = result.current.latencyMs;

    act(() => {
      // Mock math.random to return 0.5 to ensure deterministic output
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      result.current.simulateTick();
    });

    const expectedLatency = Math.floor(0.5 * 20) + 5;
    expect(result.current.latencyMs).toBe(expectedLatency);
    expect(result.current.latencyMs).not.toBe(initialLatency); // Usually it will change

    jest.restoreAllMocks();
  });

  it('selects market', () => {
    const { result } = renderHook(() => useTradingStore());

    expect(result.current.selectedMarketId).toBe('1');

    act(() => {
      result.current.selectMarket('2');
    });

    expect(result.current.selectedMarketId).toBe('2');
  });

  it('toggles bot status correctly', () => {
    const { result } = renderHook(() => useTradingStore());

    expect(result.current.botStatus).toBe('live');

    act(() => {
      result.current.toggleBot();
    });

    expect(result.current.botStatus).toBe('paused');

    act(() => {
      result.current.toggleBot();
    });

    expect(result.current.botStatus).toBe('live');
  });

  it('simulates tick with random latency', () => {
    const { result } = renderHook(() => useTradingStore());

    const initialLatency = result.current.latencyMs;
    act(() => {
      jest.spyOn(Math, 'random').mockReturnValue(0.8);
      result.current.simulateTick();
    });

    // Latency should be between 5 and 24 (Math.random() * 20 + 5)
    expect(result.current.latencyMs).toBeGreaterThanOrEqual(5);
    expect(result.current.latencyMs).toBeLessThanOrEqual(24);
    expect(result.current.latencyMs).not.toBe(initialLatency);
  });

  it('maintains initial state correctly', () => {
    const { result } = renderHook(() => useTradingStore());

    expect(result.current.botStatus).toBe('live');
    expect(result.current.latencyMs).toBe(14);
    expect(result.current.fillRate).toBe(98.4);
    expect(result.current.selectedMarketId).toBe('1');
    expect(result.current.markets).toHaveLength(1);
    expect(result.current.positions).toHaveLength(1);
    expect(result.current.logs).toHaveLength(1);
  });

  it('handles kill switch state transitions', () => {
    const { result } = renderHook(() => useTradingStore());

    // Initial state
    expect(result.current.risk.killSwitch).toBe(false);
    expect(result.current.botStatus).toBe('live');

    // Arm kill switch
    act(() => {
      result.current.toggleKillSwitch();
    });

    expect(result.current.risk.killSwitch).toBe(true);
    expect(result.current.botStatus).toBe('guarded');

    // Un-arm kill switch
    act(() => {
      result.current.toggleKillSwitch();
    });

    expect(result.current.risk.killSwitch).toBe(false);
    expect(result.current.botStatus).toBe('live');
  });

  it('updates market data correctly', () => {
    const { result } = renderHook(() => useTradingStore());

    const newMarket = {
      id: '3',
      venue: 'Kalshi',
      category: 'Tech',
      title: 'New Market Test',
      change: 2.5,
      yes: 35.0,
      no: 65.0,
      edge: 1.8,
      confidence: 82,
      spread: 1,
      liquidity: '$75K'
    };

    act(() => {
      useTradingStore.setState({
        markets: [...result.current.markets, newMarket]
      });
    });

    expect(result.current.markets).toHaveLength(2);
    expect(result.current.markets[1].title).toBe('New Market Test');
  });

  it('handles latency simulation edge cases', () => {
    const { result } = renderHook(() => useTradingStore());

    // Test multiple simulations
    const latencies: number[] = [];
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.simulateTick();
      });
      latencies.push(result.current.latencyMs);
    }

    // All latencies should be in valid range
    latencies.forEach(latency => {
      expect(latency).toBeGreaterThanOrEqual(5);
      expect(latency).toBeLessThanOrEqual(24);
    });
  });

  it('maintains state immutability on updates', () => {
    const { result } = renderHook(() => useTradingStore());

    const initialState = useTradingStore.getState();

    act(() => {
      result.current.toggleBot();
    });

    const newState = useTradingStore.getState();

    // Bot status should change
    expect(newState.botStatus).toBe('paused');
    expect(initialState.botStatus).toBe('live');

    // Other state should remain the same
    expect(newState.latencyMs).toBe(initialState.latencyMs);
    expect(newState.fillRate).toBe(initialState.fillRate);
  });
});
