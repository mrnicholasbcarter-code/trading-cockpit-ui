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

  it('displays risk metrics correctly', () => {
    render(<Home />);
    expect(screen.getByText('Buying power')).toBeInTheDocument();
    expect(screen.getByText('$250,000.00')).toBeInTheDocument();
    expect(screen.getByText('Daily P&L')).toBeInTheDocument();
    expect(screen.getByText('$1,450.00')).toBeInTheDocument();
    expect(screen.getByText('Exposure')).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
    expect(screen.getByText('Fill rate')).toBeInTheDocument();
    expect(screen.getByText('98.4%')).toBeInTheDocument();
  });

  it('displays order book levels correctly', () => {
    render(<Home />);
    expect(screen.getByText('Bid ladder')).toBeInTheDocument();
    expect(screen.getByText('Ask ladder')).toBeInTheDocument();
    // Check for price values that exist in the initial state
    expect(screen.getByText('45.1¢')).toBeInTheDocument();
    expect(screen.getByText('55.9¢')).toBeInTheDocument();
  });

  it('displays positions correctly', () => {
    render(<Home />);
    expect(screen.getByText('Open positions')).toBeInTheDocument();
    expect(screen.getByText('Fed Cut')).toBeInTheDocument();
    expect(screen.getByText('yes')).toBeInTheDocument();
  });

  it('displays activity logs correctly', () => {
    render(<Home />);
    expect(screen.getByText('Decision log')).toBeInTheDocument();
    expect(screen.getByText('Risk Guard')).toBeInTheDocument();
    expect(screen.getByText('Initialized state')).toBeInTheDocument();
  });

  it('displays hero section metrics', () => {
    render(<Home />);
    expect(screen.getByText('Live alpha routing')).toBeInTheDocument();
    expect(screen.getByText('Institutional cockpit for event-market execution, risk, and agent oversight.')).toBeInTheDocument();
    expect(screen.getByText('Best model edge')).toBeInTheDocument();
    expect(screen.getByText('Visible liquidity')).toBeInTheDocument();
  });

  it('handles kill switch correctly', () => {
    render(<Home />);
    const killSwitchButton = screen.getByText('Arm kill switch');
    fireEvent.click(killSwitchButton);
    
    expect(screen.getByText('Kill switch armed')).toBeInTheDocument();
    expect(screen.getByText('Guarded mode')).toBeInTheDocument();
    
    // Click again to un-arm
    fireEvent.click(screen.getByText('Kill switch armed'));
    expect(screen.getByText('Arm kill switch')).toBeInTheDocument();
    expect(screen.getByText('Autonomous live')).toBeInTheDocument();
  });

  it('displays market change indicator correctly', () => {
    render(<Home />);
    // Positive change should show green
    expect(screen.getByText('+4.2%')).toBeInTheDocument();
  });

  it('handles multiple markets correctly', () => {
    render(<Home />);
    // Should display both markets - use getAllByText since text appears multiple times
    const market1Elements = screen.getAllByText('Will Bitcoin reach $100k?');
    const market2Element = screen.getByText('Fed cuts rates in Sept?');
    expect(market1Elements.length).toBeGreaterThanOrEqual(1);
    expect(market2Element).toBeInTheDocument();
  });

  it('displays correct market metrics', () => {
    render(<Home />);
    const yesPrices = screen.getAllByText('45.1¢');
    const noPrices = screen.getAllByText('55.9¢');
    expect(yesPrices.length).toBeGreaterThan(0);
    expect(noPrices.length).toBeGreaterThan(0);
  });
});
