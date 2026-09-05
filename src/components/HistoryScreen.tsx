import React, { useState, useMemo } from "react";
import { SignalData } from "../types";
import {
  Search,
  Filter,
  Trash2,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Calendar,
  AlertTriangle,
  FolderX,
} from "lucide-react";

interface HistoryScreenProps {
  signals: SignalData[];
  onOpenSignal: (signal: SignalData) => void;
  onDeleteSignal: (id: string) => void;
  onClearHistory: () => void;
  onStartScanning: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  signals,
  onOpenSignal,
  onDeleteSignal,
  onClearHistory,
  onStartScanning,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [directionFilter, setDirectionFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");
  const [confidenceFilter, setConfidenceFilter] = useState<"ALL" | "High" | "Medium">("ALL");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter signals based on search query, direction, and confidence
  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        s.symbol.toLowerCase().includes(query) ||
        s.timeframe.toLowerCase().includes(query) ||
        (typeof s.strategy === "string" && s.strategy.toLowerCase().includes(query)) ||
        (s.marketStructure && s.marketStructure.toLowerCase().includes(query));

      // Direction
      const matchesDirection =
        directionFilter === "ALL" || s.direction === directionFilter;

      // Confidence
      const matchesConfidence =
        confidenceFilter === "ALL" || s.confidence === confidenceFilter;

      return matchesSearch && matchesDirection && matchesConfidence;
    });
  }, [signals, searchQuery, directionFilter, confidenceFilter]);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Signal History</h1>
          <p className="text-xs text-neutral-400">
            {signals.length} {signals.length === 1 ? "setup" : "setups"} saved offline
          </p>
        </div>

        {signals.length > 0 && (
          <button
            id="clear-all-history-btn"
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-900/30 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal for Clear History */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Clear Signal History?</h3>
            <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
              This will permanently delete all {signals.length} saved signals and cached chart images from your device storage.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500"
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      {signals.length > 0 && (
        <div className="space-y-2.5">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search symbol (e.g. XAUUSD, BTC), timeframe, or strategy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <div className="flex items-center rounded-xl bg-neutral-900 p-1 border border-neutral-800">
              {(["ALL", "BUY", "SELL"] as const).map((dir) => (
                <button
                  key={dir}
                  id={`filter-dir-${dir.toLowerCase()}`}
                  onClick={() => setDirectionFilter(dir)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    directionFilter === dir
                      ? dir === "BUY"
                        ? "bg-emerald-500 text-neutral-950"
                        : dir === "SELL"
                        ? "bg-rose-600 text-white"
                        : "bg-neutral-700 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {dir}
                </button>
              ))}
            </div>

            <div className="flex items-center rounded-xl bg-neutral-900 p-1 border border-neutral-800">
              {(["ALL", "High"] as const).map((conf) => (
                <button
                  key={conf}
                  id={`filter-conf-${conf.toLowerCase()}`}
                  onClick={() => setConfidenceFilter(conf)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    confidenceFilter === conf
                      ? "bg-cyan-600 text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {conf === "High" ? "★ High Confidence" : "All Conf"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Signal History List */}
      {signals.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-8 text-center my-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-800/80 text-neutral-400 border border-neutral-700">
            <FolderX className="h-8 w-8 stroke-[1.8]" />
          </div>
          <h2 className="mt-4 text-base font-bold text-white">No Saved Signals Yet</h2>
          <p className="mt-1 text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
            Scan any trading chart with the scanner tab. Every analyzed signal is saved automatically to your offline storage.
          </p>
          <button
            onClick={onStartScanning}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition active:scale-95 shadow-lg shadow-emerald-950/50"
          >
            Go to Scanner
          </button>
        </div>
      ) : filteredSignals.length === 0 ? (
        /* No search results */
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-center text-xs text-neutral-400">
          <p>No signals matched your search "{searchQuery}"</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setDirectionFilter("ALL");
              setConfidenceFilter("ALL");
            }}
            className="mt-2 text-emerald-400 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* CARDS LIST */
        <div className="space-y-3">
          {filteredSignals.map((signal) => {
            const isBuy = signal.direction === "BUY";
            const decimals = signal.entry > 100 ? 2 : 4;

            return (
              <div
                key={signal.id}
                id={`history-card-${signal.id}`}
                className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-3.5 hover:border-neutral-700 transition shadow-lg"
              >
                <div className="flex gap-3.5">
                  {/* Chart Thumbnail */}
                  <div
                    onClick={() => onOpenSignal(signal)}
                    className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 cursor-pointer"
                  >
                    <img
                      src={signal.chartImage}
                      alt={signal.symbol}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1">
                      <span className="text-[9px] font-mono text-neutral-300 truncate">
                        {formatDate(signal.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Signal Info */}
                  <div className="flex flex-1 flex-col justify-between overflow-hidden">
                    <div>
                      {/* Top Bar: BUY/SELL + Symbol + Delete */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              isBuy
                                ? "bg-emerald-500 text-neutral-950"
                                : "bg-rose-600 text-white"
                            }`}
                          >
                            {signal.direction}
                          </span>
                          <span className="font-mono text-sm font-black text-white">
                            {signal.symbol}
                          </span>
                          <span className="rounded bg-neutral-800 px-1 py-0.2 font-mono text-[10px] text-cyan-400 border border-neutral-700">
                            {signal.timeframe}
                          </span>
                        </div>

                        {/* Delete single button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSignal(signal.id);
                          }}
                          className="text-neutral-400 hover:text-rose-400 p-1 transition"
                          title="Delete Signal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Strategy & Confidence */}
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-neutral-400">
                        <span className="truncate max-w-[130px] font-medium text-neutral-300">
                          {signal.strategy}
                        </span>
                        <span>·</span>
                        <span
                          className={`font-semibold ${
                            signal.confidence === "High" ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {signal.confidence} Conf
                        </span>
                      </div>
                    </div>

                    {/* Price Levels Grid */}
                    <div className="mt-2 grid grid-cols-3 gap-1 rounded-xl bg-neutral-950/70 p-1.5 border border-neutral-850 text-[10px]">
                      <div>
                        <span className="text-neutral-400">ENTRY</span>
                        <p className="font-mono font-bold text-cyan-300 truncate">
                          {signal.entry ? signal.entry.toFixed(decimals) : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-400">SL</span>
                        <p className="font-mono font-bold text-rose-400 truncate">
                          {signal.stopLoss ? signal.stopLoss.toFixed(decimals) : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-neutral-400">TP</span>
                        <p className="font-mono font-bold text-emerald-400 truncate">
                          {signal.takeProfit ? signal.takeProfit.toFixed(decimals) : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Open setup CTA */}
                    <button
                      onClick={() => onOpenSignal(signal)}
                      className="mt-2 flex items-center justify-between text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition"
                    >
                      <span>R:R {signal.riskReward}</span>
                      <span className="flex items-center gap-0.5">
                        Open Analysis <ExternalLink className="h-3 w-3" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
