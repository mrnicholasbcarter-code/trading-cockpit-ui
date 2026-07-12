import Head from 'next/head';
import { useEffect } from 'react';
import { formatCurrency, Market, OrderBookLevel, useTradingStore } from '@/lib/tradingStore';

const statusCopy = {
  live: 'Autonomous live',
  paused: 'Paused',
  guarded: 'Guarded mode',
};

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function Metric({ label, value, accent, subtext }: { label: string; value: string; accent?: 'green' | 'red' | 'violet' | 'amber'; subtext?: string }) {
  const accentClass = { green: 'text-green-400', red: 'text-red-400', violet: 'text-violet-300', amber: 'text-amber-400' }[accent ?? 'green'];

  return (
    <div className="metric-card">
      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{label}</div>
      <div className={classNames('mt-3 text-2xl font-semibold tabular-nums', accentClass)}>{value}</div>
      {subtext ? <div className="mt-1 text-xs text-slate-500">{subtext}</div> : null}
    </div>
  );
}

function Header() {
  const botStatus = useTradingStore((state) => state.botStatus);
  const toggleBot = useTradingStore((state) => state.toggleBot);
  const risk = useTradingStore((state) => state.risk);
  const toggleKillSwitch = useTradingStore((state) => state.toggleKillSwitch);
  const latencyMs = useTradingStore((state) => state.latencyMs);

  return (
    <header className="flex flex-col gap-5 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Kalshi Execution Command</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-300">
          Feed latency <span className="font-semibold text-green-400 tabular-nums">{latencyMs}ms</span>
        </div>
        <button onClick={toggleBot} className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white">
          {botStatus === 'live' ? 'Pause Bot' : 'Resume'}
        </button>
        <button onClick={toggleKillSwitch} className={classNames('rounded-full px-4 py-2 text-sm font-bold', risk.killSwitch ? 'bg-red-500 text-white' : 'bg-white text-black')}>
          {risk.killSwitch ? 'System Killed' : 'Arm Kill Switch'}
        </button>
      </div>
    </header>
  );
}

export default function Home() {
  const simulateTick = useTradingStore((state) => state.simulateTick);

  useEffect(() => {
    const timer = window.setInterval(simulateTick, 1400);
    return () => window.clearInterval(timer);
  }, [simulateTick]);

  return (
    <>
      <Head><title>Trading Cockpit</title></Head>
      <main className="min-h-screen bg-slate-900">
        <Header />
        <div className="p-8">
          <Metric label="Test Metric" value="Verified Load" />
        </div>
      </main>
    </>
  );
}
