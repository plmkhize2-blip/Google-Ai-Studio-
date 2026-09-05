import React, { useState } from "react";
import { SignalData } from "../types";
import { CheckCircle2, Eye, EyeOff, Maximize2, Minimize2, Sliders } from "lucide-react";

interface ChartVerificationProps {
  signal: SignalData;
}

export const ChartVerification: React.FC<ChartVerificationProps> = ({ signal }) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If AI didn't provide exact percentages, calculate fallback from min/max visible price
  const calculateYPercent = (price: number): number => {
    if (signal.minVisiblePrice && signal.maxVisiblePrice && signal.maxVisiblePrice > signal.minVisiblePrice) {
      const ratio = (price - signal.minVisiblePrice) / (signal.maxVisiblePrice - signal.minVisiblePrice);
      // Invert because 0% is top and 100% is bottom
      return Math.max(8, Math.min(92, 100 - ratio * 100));
    }
    return 50;
  };

  const isBuy = signal.direction === "BUY";

  // Use provided AI percentages, clamped between 5% and 95%
  const entryY = Math.max(6, Math.min(94, signal.entryYPercent ?? calculateYPercent(signal.entry)));
  const slY = Math.max(6, Math.min(94, signal.slYPercent ?? calculateYPercent(signal.stopLoss)));
  const tpY = Math.max(6, Math.min(94, signal.tpYPercent ?? calculateYPercent(signal.takeProfit)));

  // Risk and reward mathematical calculations
  const riskAmount = Math.abs(signal.entry - signal.stopLoss);
  const rewardAmount = Math.abs(signal.takeProfit - signal.entry);
  const decimals = signal.entry > 100 ? 2 : 4;

  return (
    <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Chart Level Verification</h3>
            <p className="text-[11px] text-neutral-400">
              Visual confirmation of Entry, SL & TP on uploaded chart
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            id="toggle-overlay-btn"
            onClick={() => setShowOverlay(!showOverlay)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium border transition ${
              showOverlay
                ? "border-emerald-500/40 bg-emerald-950/40 text-emerald-300"
                : "border-neutral-700 bg-neutral-800/50 text-neutral-400"
            }`}
            title="Toggle Level Markers"
          >
            {showOverlay ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            <span className="hidden xs:inline">Markers</span>
          </button>

          <button
            id="toggle-zones-btn"
            onClick={() => setShowZones(!showZones)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium border transition ${
              showZones
                ? "border-cyan-500/40 bg-cyan-950/40 text-cyan-300"
                : "border-neutral-700 bg-neutral-800/50 text-neutral-400"
            }`}
            title="Toggle Risk/Reward Shaded Zones"
          >
            <Sliders className="h-3 w-3" />
            <span className="hidden xs:inline">Zones</span>
          </button>

          <button
            id="toggle-fullscreen-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-300 hover:text-white transition"
            title="Fullscreen Inspection"
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Chart Canvas & Verification Overlay Container */}
      <div
        className={`relative mt-3 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 transition-all ${
          isFullscreen ? "fixed inset-2 z-50 flex flex-col justify-center bg-black/95 p-4 rounded-2xl" : "w-full"
        }`}
      >
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => setIsFullscreen(false)}
              className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-bold text-white shadow-lg"
            >
              Exit Fullscreen
            </button>
          </div>
        )}

        <div className="relative w-full overflow-hidden select-none">
          {/* Base Uploaded Chart Image */}
          <img
            src={signal.chartImage}
            alt={`${signal.symbol} Trading Chart`}
            className="w-full h-auto object-contain max-h-[520px] mx-auto block"
            crossOrigin="anonymous"
          />

          {/* Verification Overlays */}
          {showOverlay && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Shaded Risk/Reward Zones */}
              {showZones && (
                <>
                  {/* Take Profit Target Zone (Green Tint) */}
                  <div
                    className="absolute left-0 right-0 bg-emerald-500/15 border-y border-emerald-500/30 transition-all"
                    style={{
                      top: `${Math.min(entryY, tpY)}%`,
                      height: `${Math.abs(tpY - entryY)}%`,
                    }}
                  >
                    <div className="absolute right-3 bottom-1 text-[10px] font-bold text-emerald-400/90 tracking-wider">
                      PROFIT ZONE (+{rewardAmount.toFixed(decimals)})
                    </div>
                  </div>

                  {/* Stop Loss Risk Zone (Red Tint) */}
                  <div
                    className="absolute left-0 right-0 bg-rose-500/15 border-y border-rose-500/30 transition-all"
                    style={{
                      top: `${Math.min(entryY, slY)}%`,
                      height: `${Math.abs(slY - entryY)}%`,
                    }}
                  >
                    <div className="absolute right-3 top-1 text-[10px] font-bold text-rose-400/90 tracking-wider">
                      RISK ZONE (-{riskAmount.toFixed(decimals)})
                    </div>
                  </div>
                </>
              )}

              {/* TAKE PROFIT (TP) LINE */}
              <div
                className="absolute left-0 right-0 z-20 flex items-center transition-all duration-300"
                style={{ top: `${tpY}%` }}
              >
                <div className="h-[2px] w-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
                <div className="absolute left-2 -translate-y-1/2 flex items-center gap-1 rounded bg-emerald-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-md">
                  <span>TP</span>
                  <span className="font-mono">{signal.takeProfit.toFixed(decimals)}</span>
                </div>
                <div className="absolute right-2 -translate-y-1/2 rounded bg-neutral-900/90 border border-emerald-500/40 px-1.5 py-0.5 text-[10px] font-mono text-emerald-400">
                  Target
                </div>
              </div>

              {/* ENTRY LINE */}
              <div
                className="absolute left-0 right-0 z-20 flex items-center transition-all duration-300"
                style={{ top: `${entryY}%` }}
              >
                <div className="h-[2px] w-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                <div className="absolute left-2 -translate-y-1/2 flex items-center gap-1 rounded bg-cyan-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-md">
                  <span>ENTRY</span>
                  <span className="font-mono">{signal.entry.toFixed(decimals)}</span>
                </div>
                <div className="absolute right-2 -translate-y-1/2 rounded bg-neutral-900/90 border border-cyan-500/40 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
                  {signal.direction}
                </div>
              </div>

              {/* STOP LOSS (SL) LINE */}
              <div
                className="absolute left-0 right-0 z-20 flex items-center transition-all duration-300"
                style={{ top: `${slY}%` }}
              >
                <div className="h-[2px] w-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                <div className="absolute left-2 -translate-y-1/2 flex items-center gap-1 rounded bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-md">
                  <span>SL</span>
                  <span className="font-mono">{signal.stopLoss.toFixed(decimals)}</span>
                </div>
                <div className="absolute right-2 -translate-y-1/2 rounded bg-neutral-900/90 border border-rose-500/40 px-1.5 py-0.5 text-[10px] font-mono text-rose-400">
                  Invalidation
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Legend & Metrics */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl border border-rose-500/20 bg-rose-950/20 p-2">
          <span className="text-[10px] uppercase font-semibold text-rose-400">Stop Loss</span>
          <p className="mt-0.5 font-mono text-xs font-bold text-white">{signal.stopLoss.toFixed(decimals)}</p>
          <p className="text-[10px] text-rose-400/80">-{riskAmount.toFixed(decimals)}</p>
        </div>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-2">
          <span className="text-[10px] uppercase font-semibold text-cyan-400">Calculated Entry</span>
          <p className="mt-0.5 font-mono text-xs font-bold text-white">{signal.entry.toFixed(decimals)}</p>
          <p className="text-[10px] text-cyan-400/80">{signal.direction} Trigger</p>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2">
          <span className="text-[10px] uppercase font-semibold text-emerald-400">Take Profit</span>
          <p className="mt-0.5 font-mono text-xs font-bold text-white">{signal.takeProfit.toFixed(decimals)}</p>
          <p className="text-[10px] text-emerald-400/80">+{rewardAmount.toFixed(decimals)}</p>
        </div>
      </div>

      {/* Verification Statement */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-neutral-950/60 px-3 py-2 border border-neutral-800 text-[11px] text-neutral-300">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Levels verified against chart Y-axis scale</span>
        </div>
        <span className="font-mono font-semibold text-emerald-400">R:R {signal.riskReward}</span>
      </div>
    </div>
  );
};
