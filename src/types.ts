export type TradingStrategy =
  | "Smart AI"
  | "Trend Following"
  | "Breakout"
  | "Support & Resistance"
  | "Market Structure"
  | "Liquidity / Price Action"
  | "Moving Average"
  | "RSI Confirmation";

export const STRATEGY_LIST: { id: TradingStrategy; label: string; desc: string }[] = [
  { id: "Smart AI", label: "Smart AI", desc: "Adaptive institutional algorithm analyzing all market dynamics" },
  { id: "Trend Following", label: "Trend Following", desc: "Pullback entries in dominant directional momentum" },
  { id: "Breakout", label: "Breakout", desc: "High-momentum expansion through key structural barriers" },
  { id: "Support & Resistance", label: "Support & Resistance", desc: "Mean reversion and bounces off historical price barriers" },
  { id: "Market Structure", label: "Market Structure", desc: "BOS, CHoCH, and institutional swing highs/lows" },
  { id: "Liquidity / Price Action", label: "Liquidity / Price Action", desc: "Order blocks, fair value gaps, and liquidity sweeps" },
  { id: "Moving Average", label: "Moving Average", desc: "Dynamic trend support/resistance and EMA crosses" },
  { id: "RSI Confirmation", label: "RSI Confirmation", desc: "Momentum divergence and overextended cycle reversals" },
];

export interface SignalAnalysis {
  structureBreakdown: string;
  entryReason: string;
  stopLossReason: string;
  takeProfitReason: string;
  riskWarning?: string;
}

export interface KeyLevels {
  support?: string;
  resistance?: string;
  swingHigh?: string;
  swingLow?: string;
}

export interface SignalData {
  id: string;
  timestamp: number;
  chartImage: string; // base64 or object URL
  symbol: string;
  timeframe: string;
  direction: "BUY" | "SELL" | "NEUTRAL";
  strategy: TradingStrategy | string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: string;
  confidence: "High" | "Medium" | "Low";
  currentPrice?: number;
  trend?: string;
  marketStructure?: string;
  keyLevels?: KeyLevels;
  isValidSetup: boolean;
  rejectionReason?: string;
  analysis: SignalAnalysis;
  // Visual alignment on image for verification overlay
  entryYPercent?: number; // 0-100% from top
  slYPercent?: number;    // 0-100% from top
  tpYPercent?: number;    // 0-100% from top
  currentPriceYPercent?: number;
  minVisiblePrice?: number;
  maxVisiblePrice?: number;
}

export type ActiveTab = "scanner" | "history" | "settings";

export interface AppSettings {
  theme: "dark" | "light";
  imageQuality: "original" | "high" | "optimized";
  soundEffects: boolean;
  haptics: boolean;
}
