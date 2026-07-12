# AI Agent Constraints & Architectural Context (.claude.md)

**Target Ecosystem:** High-Frequency Trading Telemetry UI
**Language:** TypeScript / React (Next.js)
**Primary Directive:** Zero DOM thrashing under heavy state transitions.

## Data Store Boundaries
- `src/lib/tradingStore.ts`: This is a `Zustand` store. When an agent adds new telemetry metrics (e.g. GPU temps), you MUST map the atomic selector (`useTradingStore(state => state.newMetric)`) directly inside the leaf component rendering it. Do NOT pass rapidly mutating variables through React Context or prop-drill them from `<Header />`.

## Playwright Assertions
When updating the React DOM in `src/pages/index.tsx`, run `npx playwright test` to guarantee the hydration loop does not break the `data-testid` endpoints.
