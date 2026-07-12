/**
 * Mock WebSocket - Simulates real-time trades and orderbook updates
 * Compatible with standard WebSocket class structure
 */
export class MockWebSocket {
  url: string;
  readyState: number = 0; // CONNECTING
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  private intervalId: any = null;

  constructor(url: string) {
    this.url = url;
    // Simulate connection opening after 100ms
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen();
      this.startStreaming();
    }, 100);
  }

  send(data: string) {
    // No-op for mock client send
  }

  close() {
    this.readyState = 3; // CLOSED
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.onclose) this.onclose();
  }

  private startStreaming() {
    let basePrice = 45.0;
    this.intervalId = setInterval(() => {
      if (this.readyState !== 1) return;

      // 1. Randomly decide to send orderbook delta (l2_delta) or trade
      // Send message every 300ms, mostly trades but also orderbook depth changes
      const isTrade = Math.random() > 0.3;

      if (isTrade) {
        // Generate a trade
        const side = Math.random() > 0.5 ? 'buy' : 'sell';
        const priceOffset = (Math.random() - 0.5) * 1.5; // price changes
        const price = Math.max(1, Math.min(99, Math.round((basePrice + priceOffset) * 10) / 10));
        const size = Math.floor(Math.random() * 500) + 10;
        const tradeData = {
          type: 'trade',
          trade: {
            time: Date.now(),
            price,
            size,
            side,
          }
        };
        if (this.onmessage) {
          this.onmessage({ data: JSON.stringify(tradeData) });
        }
        // Update base price
        basePrice = price;
      } else {
        // Generate orderbook delta
        const bids = [];
        const asks = [];
        const currentMid = Math.round(basePrice * 10) / 10;
        
        // Generate 5 bids and asks levels
        for (let i = 1; i <= 5; i++) {
          bids.push({
            price: Math.max(1, currentMid - i * 0.5),
            volume: Math.floor(Math.random() * 5000) + 100
          });
          asks.push({
            price: Math.min(99, currentMid + i * 0.5),
            volume: Math.floor(Math.random() * 5000) + 100
          });
        }
        
        // Sort bids descending, asks ascending
        bids.sort((a, b) => b.price - a.price);
        asks.sort((a, b) => a.price - b.price);

        const l2Data = {
          type: 'l2_delta',
          bids,
          asks
        };
        if (this.onmessage) {
          this.onmessage({ data: JSON.stringify(l2Data) });
        }
      }
    }, 300);
  }
}
