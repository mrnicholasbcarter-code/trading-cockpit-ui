/**
 * Kalshi Trading Cockpit - Main Dashboard Page
 * @packageDocumentation
 */

import Head from 'next/head';
import { useEffect } from 'react';
import { formatCurrency, Market, OrderBookLevel, useTradingStore } from '@/lib/tradingStore';
import dynamic from 'next/dynamic';
import { useMarketWebsocket, useOrderBookStore } from '@/hooks/useOrderBook';

const PriceChart = dynamic(
  () => import('../components/PriceChart').then((mod) => mod.PriceChart),
  { ssr: false }
);

const TradesFeed = dynamic(
  () => import('../components/TradesFeed').then((mod) => mod.TradesFeed),
  { ssr: false }
);

const statusCopy = {
  live: 'Autonomous live',
  paused: 'Paused',
  guarded: 'Guarded mode',
};

/**
 * Utility to conditionally join class names
 * @param classes - Array of class names or falsy values
 * @returns Filtered and joined class string
 */
function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Metric display component
 * @param label - Metric label
 * @param value - Metric value
 * @param accent - Accent color variant
 * @param subtext - Optional subtext
 * @returns JSX.Element
 */
function Metric({
  label,
  value,
  accent,
  subtext,
}: {
  label: string;
  value: string;
  accent?: 'green' | 'red' | 'violet' | 'amber';
  subtext?: string;
}) {
  const accentClass = {
    green: 'text-green-400',
    red: 'text-red-500',
    violet: 'text-violet-400',
    amber: 'text-amber-400',
  }[accent ?? 'green'];

  return (
    <div className="metric-card">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className={classNames('mt-3 text-2xl font-semibold tabular-nums', accentClass)}>
        {value}
      </div>
      {subtext ? <div className="mt-1 text-xs text-slate-500">{subtext}</div> : null}
    </div>
  );
}

/**
 * Header component with bot controls and status
 * @returns JSX.Element
 */
function Header() {
  const botStatus = useTradingStore((state) => state.botStatus);
  const toggleBot = useTradingStore((state) => state.toggleBot);
  const risk = useTradingStore((state) => state.risk);
  const toggleKillSwitch = useTradingStore((state) => state.toggleKillSwitch);
  const latencyMs = useTradingStore((state) => state.latencyMs);

  return (
    <header className="flex flex-col gap-5 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="shadow-glow grid h-11 w-11 place-items-center rounded-2xl border border-green-500/30 bg-green-500/10">
            <span className="text-xl font-black text-green-400">K</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
              Quantitative Trading Cockpit
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Kalshi Strategy Command
            </h1>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-300">
          Feed latency{' '}
          <span className="font-semibold tabular-nums text-green-400">{latencyMs}ms</span>
        </div>
        <div
          className={classNames(
            'rounded-full border px-4 py-2 text-sm font-medium',
            botStatus === 'live'
              ? 'border-green-500/30 bg-green-500/10 text-green-400'
              : botStatus === 'guarded'
                ? 'border-amber-400/30 bg-amber-400/10 text-amber-400'
                : 'border-slate-500/30 bg-slate-500/10 text-slate-300'
          )}
        >
          {statusCopy[botStatus]}
        </div>
        <button
          onClick={toggleBot}
          className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
        >
          {botStatus === 'live' ? 'Pause bot' : 'Resume bot'}
        </button>
        <button
          onClick={toggleKillSwitch}
          className={classNames(
            'rounded-full px-4 py-2 text-sm font-bold transition',
            risk.killSwitch ? 'bg-red-600 text-white' : 'bg-white text-slate-900 hover:bg-slate-200'
          )}
        >
          {risk.killSwitch ? 'Kill switch armed' : 'Arm kill switch'}
        </button>
      </div>
    </header>
  );
}

/**
 * Individual market row component
 * @param market - Market data
 * @param selected - Whether this market is selected
 * @returns JSX.Element
 */
function MarketRow({ market, selected }: { market: Market; selected: boolean }) {
  const selectMarket = useTradingStore((state) => state.selectMarket);
  return (
    <button
      onClick={() => selectMarket(market.id)}
      className={classNames(
        'w-full rounded-2xl border p-4 text-left transition',
        selected
          ? 'shadow-glow border-green-500/40 bg-green-500/[0.08]'
          : 'border-white/10 bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
            <span>{market.venue}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span>{market.category}</span>
          </div>
          <h3 className="mt-2 line-clamp-2 font-semibold text-white">{market.title}</h3>
        </div>
        <div
          className={classNames(
            'rounded-full px-2.5 py-1 text-xs font-bold tabular-nums',
            market.change >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'
          )}
        >
          {market.change >= 0 ? '+' : ''}
          {market.change}%
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-slate-500">YES</p>
          <p className="font-semibold tabular-nums text-green-400">{market.yes.toFixed(1)}¢</p>
        </div>
        <div>
          <p className="text-slate-500">NO</p>
          <p className="font-semibold tabular-nums text-red-500">{market.no.toFixed(1)}¢</p>
        </div>
        <div>
          <p className="text-slate-500">Edge</p>
          <p className="font-semibold tabular-nums text-white">{market.edge.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-slate-500">Conf.</p>
          <p className="font-semibold tabular-nums text-white">{market.confidence}%</p>
        </div>
      </div>
    </button>
  );
}

/**
 * Markets panel - displays available trading markets
 * @returns JSX.Element
 */
function MarketsPanel() {
  const markets = useTradingStore((state) => state.markets);
  const selectedMarketId = useTradingStore((state) => state.selectedMarketId);
  return (
    <section className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Opportunity scanner</p>
          <h2 className="text-lg font-semibold text-white">Top live markets</h2>
        </div>
        <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300">
          4 signals
        </span>
      </div>
      <div className="space-y-3">
        {markets.map((market) => (
          <MarketRow key={market.id} market={market} selected={market.id === selectedMarketId} />
        ))}
      </div>
    </section>
  );
}

/**
 * Order book side (bids or asks) display component
 * @param title - Side title
 * @param levels - Price levels
 * @param side - 'bid' or 'ask'
 * @returns JSX.Element
 */
function OrderBookSide({
  title,
  levels,
  side,
}: {
  title: string;
  levels: OrderBookLevel[];
  side: 'bid' | 'ask';
}) {
  const maxVolume = Math.max(...levels.map((level) => level.volume), 1);
  return (
    <div className="space-y-2">
      <div className="flex justify-between px-1 text-xs uppercase tracking-[0.2em] text-slate-500">
        <span>{title}</span>
        <span>Volume</span>
      </div>
      {levels.map((level) => (
        <div
          key={`${side}-${level.price}`}
          className="relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.035] px-3 py-2"
        >
          <div
            className={classNames(
              'absolute inset-y-0 right-0',
              side === 'bid' ? 'bg-green-500/10' : 'bg-red-500/10'
            )}
            style={{ width: `${(level.volume / maxVolume) * 100}%` }}
          />
          <div className="relative flex justify-between text-sm tabular-nums">
            <span className={side === 'bid' ? 'text-green-400' : 'text-red-500'}>
              {level.price.toFixed(1)}¢
            </span>
            <span className="text-slate-300">{level.volume.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Order book panel - displays market depth
 * @returns JSX.Element
 */
function OrderBookPanel() {
  const wsBids = useOrderBookStore((state) => state.bids);
  const wsAsks = useOrderBookStore((state) => state.asks);
  const storeBids = useTradingStore((state) => state.bids);
  const storeAsks = useTradingStore((state) => state.asks);

  const bids = wsBids.length > 0 ? wsBids : storeBids;
  const asks = wsAsks.length > 0 ? wsAsks : storeAsks;

  const market = useTradingStore((state) =>
    state.markets.find((candidate) => candidate.id === state.selectedMarketId)
  );
  return (
    <section className="glass-panel p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Depth and microstructure
          </p>
          <h2 className="text-xl font-semibold text-white">{market?.title}</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right">
          <p className="text-xs text-slate-500">Quoted spread</p>
          <p className="text-lg font-semibold tabular-nums text-white">{market?.spread ?? 1}¢</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <OrderBookSide title="Bid ladder" levels={bids} side="bid" />
        <OrderBookSide title="Ask ladder" levels={asks} side="ask" />
      </div>
    </section>
  );
}

/**
 * Risk panel - displays portfolio risk metrics
 * @returns JSX.Element
 */
function RiskPanel() {
  const risk = useTradingStore((state) => state.risk);
  const fillRate = useTradingStore((state) => state.fillRate);
  return (
    <section className="glass-panel p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Risk authority</p>
        <h2 className="text-lg font-semibold text-white">Portfolio guardrails</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="Buying power"
          value={formatCurrency(risk.buyingPower)}
          subtext="Available capital"
        />
        <Metric
          label="Daily P&L"
          value={formatCurrency(risk.dailyPnl)}
          accent={risk.dailyPnl >= 0 ? 'green' : 'red'}
          subtext="Net realized + unrealized"
        />
        <Metric
          label="Exposure"
          value={`${risk.exposure.toFixed(1)}%`}
          accent="violet"
          subtext={`${formatCurrency(risk.deployed)} deployed`}
        />
        <Metric
          label="Fill rate"
          value={`${fillRate.toFixed(1)}%`}
          accent="amber"
          subtext="Last 100 orders"
        />
      </div>
      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">Drawdown</span>
            <span className="tabular-nums text-white">{risk.drawdown.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-green-400 to-amber-400"
              style={{ width: `${risk.drawdown * 9}%` }}
            />
          </div>
        </div>
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">95% VaR</span>
            <span className="tabular-nums text-white">{formatCurrency(risk.var95)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-red-500"
              style={{ width: '38%' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Positions panel - displays open positions
 * @returns JSX.Element
 */
function PositionsPanel() {
  const positions = useTradingStore((state) => state.positions);
  return (
    <section className="glass-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Inventory</p>
          <h2 className="text-lg font-semibold text-white">Open positions</h2>
        </div>
        <span className="text-sm text-slate-400">{positions.length} active</span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Market</th>
              <th className="px-4 py-3">Side</th>
              <th className="px-4 py-3 text-right">P&L</th>
              <th className="px-4 py-3 text-right">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {positions.map((position) => (
              <tr key={position.market} className="bg-white/[0.02]">
                <td className="px-4 py-3 text-white">
                  <div className="font-medium">{position.market}</div>
                  <div className="text-xs text-slate-500">
                    {position.contracts.toLocaleString()} @ {position.avgPrice}¢
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={classNames(
                      'rounded-full px-2 py-1 text-xs font-bold uppercase',
                      position.side === 'yes'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-500'
                    )}
                  >
                    {position.side}
                  </span>
                </td>
                <td
                  className={classNames(
                    'px-4 py-3 text-right font-semibold tabular-nums',
                    position.pnl >= 0 ? 'text-green-400' : 'text-red-500'
                  )}
                >
                  {formatCurrency(position.pnl)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-300">
                  {position.risk}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * Activity panel - displays agent decision logs
 * @returns JSX.Element
 */
function ActivityPanel() {
  const logs = useTradingStore((state) => state.logs);
  const toneClass = {
    info: 'bg-violet-400',
    success: 'bg-green-400',
    warn: 'bg-amber-400',
    danger: 'bg-red-500',
  };
  return (
    <section className="glass-panel p-5">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Agent telemetry</p>
        <h2 className="text-lg font-semibold text-white">Decision log</h2>
      </div>
      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3"
          >
            <span className={classNames('mt-1 h-2.5 w-2.5 rounded-full', toneClass[log.tone])} />
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold text-white">{log.agent}</span>
                <span className="text-xs text-slate-500">{log.time}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-slate-300">{log.message}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Hero section with key metrics
 * @returns JSX.Element
 */
function Hero() {
  const markets = useTradingStore((state) => state.markets);
  const bestEdge = Math.max(...markets.map((market) => market.edge));
  const totalLiquidity = markets.reduce(
    (sum, market) => sum + Number(market.liquidity.replace(/[$K]/g, '')),
    0
  );
  return (
    <section className="grid gap-4 lg:grid-cols-4">
      <div className="glass-panel relative overflow-hidden p-6 lg:col-span-2">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-green-500/20 blur-3xl" />
        <p className="text-xs uppercase tracking-[0.3em] text-green-400">Live alpha routing</p>
        <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white">
          Institutional cockpit for event-market execution, risk, and agent oversight.
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Monitor market depth, strategy confidence, risk authority telemetry, and live autonomous
          bot decisions from one production-grade interface.
        </p>
      </div>
      <Metric
        label="Best model edge"
        value={`${bestEdge.toFixed(1)}%`}
        subtext="Across active scanner"
      />
      <Metric
        label="Visible liquidity"
        value={`$${totalLiquidity.toFixed(0)}K`}
        accent="violet"
        subtext="Top opportunities"
      />
    </section>
  );
}

/**
 * Main home page component
 * @returns JSX.Element
 */
export default function Home() {
  const simulateTick = useTradingStore((state) => state.simulateTick);
  const selectedMarketId = useTradingStore((state) => state.selectedMarketId);
  
  // Establish streaming WebSocket feed
  useMarketWebsocket(selectedMarketId);
  
  const trades = useOrderBookStore((state) => state.trades);

  useEffect(() => {
    const timer = window.setInterval(simulateTick, 1400);
    return () => window.clearInterval(timer);
  }, [simulateTick]);

  return (
    <>
      <Head>
        <title>Kalshi Trading Cockpit</title>
        <meta
          name="description"
          content="High-tier Next.js trading cockpit for prediction markets and autonomous strategy telemetry."
        />
      </Head>
      <main className="min-h-screen bg-slate-950">
        <Header />
        <div className="mx-auto max-w-[1800px] space-y-5 px-4 py-5 sm:px-6 lg:px-8">
          <Hero />
          <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)_420px]">
            <MarketsPanel />
            <div className="space-y-5">
              <PriceChart trades={trades} />
              <OrderBookPanel />
              <TradesFeed trades={trades} />
              <PositionsPanel />
            </div>
            <div className="space-y-5">
              <RiskPanel />
              <ActivityPanel />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
