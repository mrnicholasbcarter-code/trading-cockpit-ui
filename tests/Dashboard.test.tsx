import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../src/pages/index';
import { useTradingStore } from '../src/lib/tradingStore';

jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

describe('Dashboard (Home)', () => {
  beforeEach(() => {
    // Reset global state
    const store = useTradingStore.getState();
    useTradingStore.setState({
      ...store,
      botStatus: 'live',
      latencyMs: 14,
      selectedMarketId: '1',
      markets: [
        { id: '1', venue: 'Kalshi', category: 'Crypto', title: 'Will Bitcoin reach $100k?', change: 4.2, yes: 45.1, no: 55.9, edge: 2.1, confidence: 88, spread: 2, liquidity: '$45K' },
        { id: '2', venue: 'Kalshi', category: 'Macro', title: 'Fed cuts rates in Sept?', change: -1.2, yes: 30.0, no: 70.0, edge: 1.5, confidence: 75, spread: 1, liquidity: '$100K' }
      ],
      risk: { ...store.risk, killSwitch: false },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the header correctly', () => {
    render(<Home />);
    expect(screen.getByText('Kalshi Strategy Command')).toBeInTheDocument();
    expect(screen.getByText('Autonomous live')).toBeInTheDocument();
  });

  it('interacts with the kill switch in header', () => {
    render(<Home />);
    const armKillSwitchButton = screen.getByText('Arm kill switch');
    expect(armKillSwitchButton).toBeInTheDocument();

    fireEvent.click(armKillSwitchButton);

    expect(screen.getByText('Kill switch armed')).toBeInTheDocument();
    expect(screen.getByText('Guarded mode')).toBeInTheDocument(); 
  });

  it('selects a market in the MarketsPanel', () => {
    render(<Home />);
    const market2 = screen.getByText('Fed cuts rates in Sept?');
    fireEvent.click(market2);
    
    // The OrderBookPanel title updates to selected market's title
    const orderBookTitles = screen.getAllByText('Fed cuts rates in Sept?');
    // We expect it to show up once in MarketRow and once in OrderBookPanel
    expect(orderBookTitles.length).toBeGreaterThanOrEqual(2);
  });

  it('toggles bot status continuously', () => {
    render(<Home />);
    const pauseBotButton = screen.getByText('Pause bot');
    fireEvent.click(pauseBotButton);

    expect(screen.getByText('Resume bot')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();

    const resumeBotButton = screen.getByText('Resume bot');
    fireEvent.click(resumeBotButton);

    expect(screen.getByText('Pause bot')).toBeInTheDocument();
    expect(screen.getByText('Autonomous live')).toBeInTheDocument();
  });
});
