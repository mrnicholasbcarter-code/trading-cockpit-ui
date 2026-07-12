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
});
