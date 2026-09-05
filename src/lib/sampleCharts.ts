export interface SampleChart {
  id: string;
  name: string;
  symbol: string;
  timeframe: string;
  description: string;
  expectedDirection: "BUY" | "SELL";
  dataUrl: string;
}

// Generate realistic candlestick charts as base64 images
export function generateSampleChartImage(config: {
  symbol: string;
  timeframe: string;
  minPrice: number;
  maxPrice: number;
  candles: { o: number; h: number; l: number; c: number; v: number }[];
  maPeriods?: number[];
  watermark?: string;
}): string {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 540;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Dark trading terminal background
  ctx.fillStyle = "#0c1017";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const paddingLeft = 30;
  const paddingRight = 90; // Price axis space
  const paddingTop = 60;   // Header space
  const paddingBottom = 50;// Time axis & volume
  const chartWidth = canvas.width - paddingLeft - paddingRight;
  const chartHeight = canvas.height - paddingTop - paddingBottom;

  // Header Title Bar
  ctx.fillStyle = "#131b26";
  ctx.fillRect(0, 0, canvas.width, 46);
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 46);
  ctx.lineTo(canvas.width, 46);
  ctx.stroke();

  // Symbol text
  ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(config.symbol, 24, 28);

  // Timeframe pill
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.roundRect(24 + ctx.measureText(config.symbol).width + 12, 12, 44, 24, 4);
  ctx.fill();

  ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.fillStyle = "#38bdf8";
  ctx.fillText(config.timeframe, 24 + ctx.measureText(config.symbol).width + 20, 28);

  // Watermark
  ctx.font = "bold 56px sans-serif";
  ctx.fillStyle = "rgba(30, 41, 59, 0.25)";
  ctx.textAlign = "center";
  ctx.fillText(config.watermark || config.symbol, canvas.width / 2 - 30, canvas.height / 2 + 30);
  ctx.textAlign = "left";

  // Grid lines (horizontal & vertical)
  const priceSteps = 6;
  ctx.strokeStyle = "#16202e";
  ctx.lineWidth = 1;

  for (let i = 0; i <= priceSteps; i++) {
    const y = paddingTop + (chartHeight * i) / priceSteps;
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(canvas.width - paddingRight, y);
    ctx.stroke();

    // Price label on right axis
    const priceVal = config.maxPrice - ((config.maxPrice - config.minPrice) * i) / priceSteps;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px 'JetBrains Mono', monospace, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(priceVal.toFixed(config.minPrice > 100 ? 2 : 4), canvas.width - paddingRight + 12, y + 4);
  }

  // Right Y-axis background border
  ctx.strokeStyle = "#1e293b";
  ctx.beginPath();
  ctx.moveTo(canvas.width - paddingRight, paddingTop);
  ctx.lineTo(canvas.width - paddingRight, canvas.height - paddingBottom);
  ctx.stroke();

  // Price conversion helper
  const priceToY = (p: number) => {
    const ratio = (p - config.minPrice) / (config.maxPrice - config.minPrice);
    return paddingTop + chartHeight * (1 - ratio);
  };

  const candleCount = config.candles.length;
  const candleSpacing = chartWidth / candleCount;
  const candleWidth = Math.max(3, candleSpacing * 0.65);

  // Draw Candlesticks
  config.candles.forEach((c, idx) => {
    const x = paddingLeft + idx * candleSpacing + candleSpacing / 2;
    const isBull = c.c >= c.o;
    const color = isBull ? "#10b981" : "#f43f5e";

    const yOpen = priceToY(c.o);
    const yClose = priceToY(c.c);
    const yHigh = priceToY(c.h);
    const yLow = priceToY(c.l);

    // Wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, yHigh);
    ctx.lineTo(x, yLow);
    ctx.stroke();

    // Body
    ctx.fillStyle = color;
    const bodyTop = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));
    ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);

    // Volume bar
    const maxVol = Math.max(...config.candles.map((k) => k.v));
    const volHeight = (c.v / maxVol) * 45;
    const volY = canvas.height - paddingBottom - volHeight;
    ctx.fillStyle = isBull ? "rgba(16, 185, 129, 0.25)" : "rgba(244, 63, 94, 0.25)";
    ctx.fillRect(x - candleWidth / 2, volY, candleWidth, volHeight);
  });

  // Current price tag on right axis
  const lastCandle = config.candles[config.candles.length - 1];
  const lastY = priceToY(lastCandle.c);
  const lastPriceColor = lastCandle.c >= lastCandle.o ? "#10b981" : "#f43f5e";

  // Horizontal dashed line to price
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = lastPriceColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(paddingLeft, lastY);
  ctx.lineTo(canvas.width - paddingRight, lastY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Tag badge
  ctx.fillStyle = lastPriceColor;
  ctx.fillRect(canvas.width - paddingRight, lastY - 11, paddingRight - 8, 22);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px 'JetBrains Mono', monospace, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(lastCandle.c.toFixed(config.minPrice > 100 ? 2 : 4), canvas.width - paddingRight + 6, lastY + 4);

  return canvas.toDataURL("image/jpeg", 0.92);
}

// Generate the 4 default sample datasets
export function getSampleCharts(): SampleChart[] {
  // Chart 1: XAUUSD 15M Bullish Market Structure Breakout
  const xauCandles = [
    { o: 2344.2, h: 2346.5, l: 2343.0, c: 2345.8, v: 120 },
    { o: 2345.8, h: 2347.1, l: 2344.5, c: 2346.9, v: 140 },
    { o: 2347.0, h: 2349.5, l: 2346.0, c: 2348.8, v: 210 },
    { o: 2348.9, h: 2351.2, l: 2347.8, c: 2350.5, v: 195 },
    { o: 2350.5, h: 2351.0, l: 2346.2, c: 2347.4, v: 160 },
    { o: 2347.5, h: 2348.0, l: 2344.8, c: 2345.5, v: 130 },
    { o: 2345.5, h: 2348.2, l: 2345.0, c: 2347.9, v: 155 },
    { o: 2348.0, h: 2352.0, l: 2347.5, c: 2351.6, v: 280 },
    { o: 2351.6, h: 2355.0, l: 2351.0, c: 2354.2, v: 340 },
    { o: 2354.2, h: 2356.5, l: 2353.5, c: 2355.8, v: 390 },
    { o: 2355.8, h: 2356.0, l: 2352.8, c: 2353.9, v: 180 },
    { o: 2353.9, h: 2355.2, l: 2353.2, c: 2354.8, v: 220 },
  ];

  const xauImg = generateSampleChartImage({
    symbol: "XAUUSD",
    timeframe: "15M",
    minPrice: 2340.0,
    maxPrice: 2362.0,
    candles: xauCandles,
    watermark: "GOLD · 15M",
  });

  // Chart 2: BTCUSDT 1H Liquidity Sweep & Bullish Reversal
  const btcCandles = [
    { o: 65200, h: 65650, l: 65100, c: 65500, v: 450 },
    { o: 65500, h: 65800, l: 65300, c: 65400, v: 380 },
    { o: 65400, h: 65450, l: 64800, c: 64950, v: 620 },
    { o: 64950, h: 65100, l: 64250, c: 64300, v: 910 },
    { o: 64300, h: 64400, l: 63850, c: 64150, v: 1450 }, // Liquidity sweep wick low
    { o: 64150, h: 64850, l: 64100, c: 64750, v: 1120 }, // Strong hammer bounce
    { o: 64750, h: 65300, l: 64650, c: 65200, v: 880 },
    { o: 65200, h: 65600, l: 65050, c: 65450, v: 750 },
    { o: 65450, h: 65850, l: 65350, c: 65700, v: 820 },
  ];

  const btcImg = generateSampleChartImage({
    symbol: "BTCUSDT",
    timeframe: "1H",
    minPrice: 63500,
    maxPrice: 66500,
    candles: btcCandles,
    watermark: "BTC · 1H",
  });

  // Chart 3: EURUSD 4H Bearish Breakdown & Retest
  const eurCandles = [
    { o: 1.092, h: 1.0935, l: 1.091, c: 1.0915, v: 240 },
    { o: 1.0915, h: 1.0922, l: 1.0885, c: 1.089, v: 350 },
    { o: 1.089, h: 1.0898, l: 1.0865, c: 1.087, v: 490 },
    { o: 1.087, h: 1.0875, l: 1.084, c: 1.0845, v: 580 },
    { o: 1.0845, h: 1.0868, l: 1.084, c: 1.0862, v: 210 }, // Pullback into resistance
    { o: 1.0862, h: 1.087, l: 1.0852, c: 1.0858, v: 190 },  // Rejection
    { o: 1.0858, h: 1.0861, l: 1.0842, c: 1.0848, v: 270 },
  ];

  const eurImg = generateSampleChartImage({
    symbol: "EURUSD",
    timeframe: "4H",
    minPrice: 1.082,
    maxPrice: 1.095,
    candles: eurCandles,
    watermark: "EURUSD · 4H",
  });

  return [
    {
      id: "sample_xauusd",
      name: "Gold (XAUUSD)",
      symbol: "XAUUSD",
      timeframe: "15M",
      description: "Bullish structure breakout at 2354.80 resistance retest",
      expectedDirection: "BUY",
      dataUrl: xauImg,
    },
    {
      id: "sample_btcusdt",
      name: "Bitcoin (BTCUSDT)",
      symbol: "BTCUSDT",
      timeframe: "1H",
      description: "Liquidity sweep of 64k lows with strong buyer reaction",
      expectedDirection: "BUY",
      dataUrl: btcImg,
    },
    {
      id: "sample_eurusd",
      name: "Euro / US Dollar",
      symbol: "EURUSD",
      timeframe: "4H",
      description: "Bearish trend breakdown with clean retest of 1.0860 supply",
      expectedDirection: "SELL",
      dataUrl: eurImg,
    },
  ];
}
