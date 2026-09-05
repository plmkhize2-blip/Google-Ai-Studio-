import React, { useState } from "react";
import { SignalData } from "../types";
import { ChartVerification } from "./ChartVerification";
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Copy,
  Check,
  Share2,
  ArrowLeft,
  Layers,
  Target,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SignalScreenProps {
  signal: SignalData;
  onBackToScanner: () => void;
  onScanNew: () => void;
}

export const SignalScreen: React.FC<SignalScreenProps> = ({
  signal,
  onBackToScanner,
  onScanNew,
}) => {
  const [copied, setCopied] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(true);

  const isBuy = signal.direction === "BUY";
  const isNeutral = signal.direction === "NEUTRAL" || !signal.isValidSetup;
  const decimals = signal.entry > 100 ? 2 : 4;

  const handleCopy = () => {
    const text = `🎯 AI CHART SCANNER SIGNAL
━━━━━━━━━━━━━━━━━━━
Direction: ${signal.direction}
Asset: ${signal.symbol} (${signal.timeframe})
Strategy: ${signal.strategy}

ENTRY: ${signal.entry.toFixed(decimals)}
STOP LOSS: ${signal.stopLoss.toFixed(decimals)}
TAKE PROFIT: ${signal.takeProfit.toFixed(decimals)}
RISK / REWARD: ${signal.riskReward}
CONFIDENCE: ${signal.confidence}
━━━━━━━━━━━━━━━━━━━
Analysis: ${signal.analysis?.structureBreakdown || "Verified institutional market structure"}
⚠️ Risk condition: ${signal.analysis?.riskWarning || "Invalidate if candle closes beyond SL"}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Case 1: Unreliable setup / No high quality trade available
  if (!signal.isValidSetup) {
    return (
      <div className="space-y-4 pb-20">
        <button
          onClick={onBackToScanner}
          className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Scanner</span>
        </button>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-white">
            Unable to determine a reliable setup from this chart.
          </h2>

          <p className="mt-2 text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
            {signal.rejectionReason ||
              "The current price action lacks a statistically favorable risk/reward setup or distinct institutional market structure."}
          </p>

          <div className="mt-4 rounded-xl bg-neutral-900/80 p-3 text-left border border-neutral-800 text-xs text-neutral-400">
            <p className="font-semibold text-neutral-300">Detected Attributes:</p>
            <div className="mt-1 grid grid-cols-2 gap-2 text-[11px]">
              <div>Symbol: <span className="font-mono text-white">{signal.symbol || "Unidentified"}</span></div>
              <div>Timeframe: <span className="font-mono text-white">{signal.timeframe || "Unknown"}</span></div>
              <div>Current Price: <span className="font-mono text-white">{signal.currentPrice || "N/A"}</span></div>
              <div>Structure: <span className="text-white">{signal.marketStructure || "Indecision / Range"}</span></div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              onClick={onScanNew}
              className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition active:scale-95"
            >
              Scan Another Chart
            </button>
            <button
              onClick={onBackToScanner}
              className="rounded-xl border border-neutral-700 bg-neutral-800 px-6 py-3 text-sm font-semibold text-neutral-200 hover:bg-neutral-700 transition"
            >
              Try Different Strategy
            </button>
          </div>
        </div>

        {/* Still show uploaded chart for user verification */}
        {signal.chartImage && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <p className="text-xs font-semibold text-neutral-400 mb-2">Uploaded Chart Image:</p>
            <img
              src={signal.chartImage}
              alt="Uploaded chart"
              className="w-full h-auto rounded-xl object-contain max-h-[380px]"
            />
          </div>
        )}
      </div>
    );
  }

  // Case 2: High probability validated signal
  return (
    <div className="space-y-4 pb-24">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToScanner}
          className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>New Scan</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="copy-signal-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-850 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition active:scale-95 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-neutral-400" />
                <span>Copy Setup</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* PREMIUM TRADING SIGNAL CARD */}
      <div
        id="trading-signal-card"
        className={`relative overflow-hidden rounded-3xl border p-5 shadow-2xl transition-all ${
          isBuy
            ? "border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 via-neutral-900/90 to-neutral-950 shadow-emerald-950/30"
            : "border-rose-500/40 bg-gradient-to-b from-rose-950/40 via-neutral-900/90 to-neutral-950 shadow-rose-950/30"
        }`}
      >
        {/* Glow ambient circle */}
        <div
          className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-3xl opacity-20 ${
            isBuy ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />

        {/* Card Header: Direction & Asset */}
        <div className="flex items-start justify-between border-b border-neutral-800/80 pb-4">
          <div>
            {/* BUY / SELL BADGE */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1 text-sm font-black tracking-wider uppercase shadow-md ${
                  isBuy
                    ? "bg-emerald-500 text-neutral-950 shadow-emerald-500/30"
                    : "bg-rose-600 text-white shadow-rose-600/30"
                }`}
              >
                {isBuy ? <TrendingUp className="h-4 w-4 stroke-[3]" /> : <TrendingDown className="h-4 w-4 stroke-[3]" />}
                {signal.direction}
              </span>

              {/* Confidence Badge */}
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase border ${
                  signal.confidence === "High"
                    ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
                    : signal.confidence === "Medium"
                    ? "border-amber-500/40 bg-amber-950/60 text-amber-300"
                    : "border-neutral-700 bg-neutral-800 text-neutral-400"
                }`}
              >
                {signal.confidence} Confidence
              </span>
            </div>

            {/* Symbol · Timeframe */}
            <div className="mt-2.5 flex items-center gap-2">
              <h1 className="font-mono text-2xl font-black tracking-tight text-white">
                {signal.symbol}
              </h1>
              <span className="text-neutral-500 font-bold">·</span>
              <span className="rounded-md bg-neutral-800 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300 border border-neutral-700">
                {signal.timeframe}
              </span>
            </div>
          </div>

          {/* Strategy name badge */}
          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              Strategy
            </span>
            <p className="font-semibold text-xs text-white max-w-[140px] truncate">
              {signal.strategy}
            </p>
          </div>
        </div>

        {/* KEY TRADING METRICS GRID */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* ENTRY */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-3 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              ENTRY
            </span>
            <p className="mt-1 font-mono text-lg font-black text-white tracking-tight">
              {signal.entry.toFixed(decimals)}
            </p>
            <span className="text-[10px] text-neutral-400">Calculated trigger</span>
          </div>

          {/* STOP LOSS */}
          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
              STOP LOSS
            </span>
            <p className="mt-1 font-mono text-lg font-black text-white tracking-tight">
              {signal.stopLoss.toFixed(decimals)}
            </p>
            <span className="text-[10px] text-rose-400/80">Structure invalidation</span>
          </div>

          {/* TAKE PROFIT (ONE ONLY) */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              TAKE PROFIT
            </span>
            <p className="mt-1 font-mono text-lg font-black text-white tracking-tight">
              {signal.takeProfit.toFixed(decimals)}
            </p>
            <span className="text-[10px] text-emerald-400/80">Logical target</span>
          </div>

          {/* RISK / REWARD */}
          <div className="rounded-2xl border border-neutral-700 bg-neutral-800/40 p-3 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              RISK / REWARD
            </span>
            <p className="mt-1 font-mono text-lg font-black text-emerald-400 tracking-tight">
              {signal.riskReward}
            </p>
            <span className="text-[10px] text-neutral-400">Mathematical ratio</span>
          </div>
        </div>

        {/* Additional Market Structure Tags */}
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          {signal.trend && (
            <div className="rounded-lg bg-neutral-900/80 px-2.5 py-1 border border-neutral-800 text-neutral-300">
              <span className="text-neutral-500">Trend: </span>
              <span className="font-semibold text-white">{signal.trend}</span>
            </div>
          )}
          {signal.marketStructure && (
            <div className="rounded-lg bg-neutral-900/80 px-2.5 py-1 border border-neutral-800 text-neutral-300">
              <span className="text-neutral-500">Structure: </span>
              <span className="font-semibold text-white">{signal.marketStructure}</span>
            </div>
          )}
          {signal.currentPrice && (
            <div className="rounded-lg bg-neutral-900/80 px-2.5 py-1 border border-neutral-800 text-neutral-300 font-mono">
              <span className="text-neutral-500">Latest Price: </span>
              <span className="font-bold text-white">{signal.currentPrice.toFixed(decimals)}</span>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: CHART VERIFICATION OVERLAY (MANDATORY REQUIREMENT) */}
      <ChartVerification signal={signal} />

      {/* DETAILED ANALYSIS BREAKDOWN */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-md">
        <button
          onClick={() => setShowFullAnalysis(!showFullAnalysis)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Institutional Analysis Rationale</h3>
          </div>
          {showFullAnalysis ? (
            <ChevronUp className="h-4 w-4 text-neutral-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          )}
        </button>

        {showFullAnalysis && (
          <div className="mt-3 space-y-3 border-t border-neutral-800/80 pt-3 text-xs text-neutral-300">
            {/* Candle Structure */}
            <div>
              <p className="font-semibold text-neutral-200">Market Structure & Candles:</p>
              <p className="mt-0.5 text-neutral-400 leading-relaxed">
                {signal.analysis?.structureBreakdown}
              </p>
            </div>

            {/* Entry Validation */}
            <div>
              <p className="font-semibold text-cyan-300">Entry Validation ↔ Chart Structure:</p>
              <p className="mt-0.5 text-neutral-400 leading-relaxed">
                {signal.analysis?.entryReason}
              </p>
            </div>

            {/* SL Validation */}
            <div>
              <p className="font-semibold text-rose-300">Stop Loss ↔ Relevant Swing / Support / Resistance:</p>
              <p className="mt-0.5 text-neutral-400 leading-relaxed">
                {signal.analysis?.stopLossReason}
              </p>
            </div>

            {/* TP Validation */}
            <div>
              <p className="font-semibold text-emerald-300">Take Profit ↔ Logical Target:</p>
              <p className="mt-0.5 text-neutral-400 leading-relaxed">
                {signal.analysis?.takeProfitReason}
              </p>
            </div>

            {/* Invalidation Warning */}
            {signal.analysis?.riskWarning && (
              <div className="rounded-xl bg-neutral-950 p-2.5 border border-neutral-800 text-[11px]">
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Invalidation Condition:
                </span>
                <p className="mt-0.5 text-neutral-400">
                  {signal.analysis.riskWarning}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="sticky bottom-20 z-30 pt-2">
        <button
          onClick={onScanNew}
          className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-950/60 hover:bg-emerald-500 transition active:scale-[0.98]"
        >
          Scan Another Chart
        </button>
      </div>
    </div>
  );
};
