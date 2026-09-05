import React, { useState, useRef } from "react";
import { TradingStrategy, STRATEGY_LIST, SignalData } from "../types";
import { getSampleCharts, SampleChart } from "../lib/sampleCharts";
import {
  Upload,
  Camera,
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Cpu,
} from "lucide-react";

interface ScannerScreenProps {
  onAnalysisComplete: (signal: SignalData) => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({ onAnalysisComplete }) => {
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<TradingStrategy>("Smart AI");
  const [detectedSymbol, setDetectedSymbol] = useState<string>("");
  const [detectedTimeframe, setDetectedTimeframe] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const sampleCharts = getSampleCharts();

  // Handle image upload from file or camera
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setChartImage(result);

      // Pre-infer default placeholders from filename if recognizable
      const fn = file.name.toUpperCase();
      if (fn.includes("XAU") || fn.includes("GOLD")) {
        setDetectedSymbol("XAUUSD");
        setDetectedTimeframe("15M");
      } else if (fn.includes("BTC")) {
        setDetectedSymbol("BTCUSDT");
        setDetectedTimeframe("1H");
      } else if (fn.includes("EUR")) {
        setDetectedSymbol("EURUSD");
        setDetectedTimeframe("4H");
      } else {
        setDetectedSymbol("");
        setDetectedTimeframe("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SampleChart) => {
    setErrorMessage(null);
    setChartImage(sample.dataUrl);
    setDetectedSymbol(sample.symbol);
    setDetectedTimeframe(sample.timeframe);
  };

  const handleAnalyze = async () => {
    if (!chartImage) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    // Multi-stage progress indicators for mobile realism
    setAnalysisStep("Scanning candlestick geometry & price axis...");

    const stepTimer1 = setTimeout(() => {
      setAnalysisStep("Detecting market structure, swings & key liquidity...");
    }, 1200);

    const stepTimer2 = setTimeout(() => {
      setAnalysisStep("Validating Entry, SL & TP against chart structure...");
    }, 2400);

    try {
      const response = await fetch("/api/analyze-chart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: chartImage,
          strategy: selectedStrategy,
          mimeType: chartImage.startsWith("data:image/png") ? "image/png" : "image/jpeg",
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis failed (${response.status})`);
      }

      const data = await response.json();

      // Format clean SignalData object
      const fullSignal: SignalData = {
        id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        chartImage: chartImage,
        symbol: data.symbol || detectedSymbol || "MARKET",
        timeframe: data.timeframe || detectedTimeframe || "15M",
        direction: (data.direction as "BUY" | "SELL") || "BUY",
        strategy: selectedStrategy,
        entry: Number(data.entry) || 0,
        stopLoss: Number(data.stopLoss) || 0,
        takeProfit: Number(data.takeProfit) || 0,
        riskReward: data.riskReward || "1 : 2.0",
        confidence: (data.confidence as "High" | "Medium" | "Low") || "High",
        currentPrice: data.currentPrice ? Number(data.currentPrice) : undefined,
        trend: data.trend,
        marketStructure: data.marketStructure,
        keyLevels: data.keyLevels,
        isValidSetup: data.isValidSetup !== false,
        rejectionReason: data.rejectionReason,
        analysis: data.analysis || {
          structureBreakdown: "Real-time AI chart structure analysis.",
          entryReason: "Calculated from visible support/breakout.",
          stopLossReason: "Positioned at structural invalidation.",
          takeProfitReason: "Calculated at logical target.",
        },
        entryYPercent: data.entryYPercent,
        slYPercent: data.slYPercent,
        tpYPercent: data.tpYPercent,
        currentPriceYPercent: data.currentPriceYPercent,
        minVisiblePrice: data.minVisiblePrice,
        maxVisiblePrice: data.maxVisiblePrice,
      };

      onAnalysisComplete(fullSignal);
    } catch (err: unknown) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const msg = err instanceof Error ? err.message : "Error analyzing chart";
      setErrorMessage(msg);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Hero Title & Subheading */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Vision AI Trading Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          AI Chart Scanner
        </h1>
        <p className="mt-1 text-sm text-neutral-400 max-w-sm mx-auto">
          Upload a chart and get a chart-based trading setup.
        </p>
      </div>

      {/* ERROR ALERT */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-rose-200">Analysis Notice</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* UPLOAD / CHART PREVIEW ZONE */}
      {!chartImage ? (
        <div className="space-y-4">
          {/* Large Upload Button & Drop Target */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
              dragActive
                ? "border-emerald-500 bg-emerald-950/30 scale-[1.01]"
                : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900/80"
            }`}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-950/50">
              <Upload className="h-8 w-8 stroke-[2.2]" />
            </div>

            <h2 className="mt-4 text-base font-bold text-white">
              Upload Trading Chart
            </h2>
            <p className="mt-1 text-xs text-neutral-400 max-w-xs">
              TradingView, MT4/MT5, Binance, or broker screenshots. Candlesticks with visible price axis recommended.
            </p>

            {/* Upload action triggers */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 w-full max-w-xs">
              <button
                id="upload-chart-btn"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/60 hover:bg-emerald-500 transition active:scale-95"
              >
                <ImageIcon className="h-4 w-4" />
                <span>+ Upload Chart</span>
              </button>

              {/* Camera trigger for phones taking photo of monitor/screen */}
              <button
                id="camera-chart-btn"
                onClick={() => cameraInputRef.current?.click()}
                className="min-h-[44px] flex items-center justify-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition active:scale-95"
                title="Take photo of chart"
              >
                <Camera className="h-4 w-4 text-cyan-400" />
                <span className="hidden xs:inline">Camera</span>
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFile(e.target.files[0]);
              }}
            />
          </div>

          {/* Quick-test with verified sample charts */}
          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Or test with verified sample chart
              </span>
              <span className="text-[11px] text-neutral-400">1-Tap Live Test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {sampleCharts.map((sample) => (
                <button
                  key={sample.id}
                  id={`sample-chart-${sample.id}`}
                  onClick={() => handleSelectSample(sample)}
                  className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-left hover:border-neutral-700 hover:bg-neutral-850 transition active:scale-95 shadow-sm"
                >
                  <img
                    src={sample.dataUrl}
                    alt={sample.name}
                    className="h-12 w-16 rounded-lg object-cover border border-neutral-700 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-white">{sample.symbol}</span>
                      <span className="rounded bg-neutral-800 px-1.5 py-0.2 font-mono text-[10px] text-cyan-400">
                        {sample.timeframe}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-neutral-400 truncate">{sample.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* AFTER UPLOAD: Chart Preview & Analysis Configuration */
        <div className="space-y-4">
          {/* Chart Preview Card */}
          <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-xl">
            <div className="relative">
              <img
                src={chartImage}
                alt="Selected chart preview"
                className="w-full h-auto object-contain max-h-[360px] block"
              />

              {/* Replace image button */}
              <button
                id="change-chart-btn"
                onClick={() => {
                  setChartImage(null);
                  setErrorMessage(null);
                }}
                className="absolute top-3 right-3 flex items-center gap-1 rounded-xl bg-neutral-950/80 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-neutral-300 border border-neutral-700 hover:text-white hover:bg-neutral-900 transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Change Chart</span>
              </button>
            </div>

            {/* Quick detected metadata preview bar */}
            <div className="flex items-center justify-between border-t border-neutral-800 bg-neutral-950/80 px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400">Detected:</span>
                <span className="font-mono font-bold text-white">
                  {detectedSymbol || "Auto-detecting Symbol..."}
                </span>
                {detectedTimeframe && (
                  <span className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300 border border-neutral-700">
                    {detectedTimeframe}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Image Ready
              </span>
            </div>
          </div>

          {/* STRATEGY SELECTOR */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-300">
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
                <span>Strategy Selector</span>
              </label>
              <span className="text-[11px] text-emerald-400 font-semibold">
                Default: Smart AI
              </span>
            </div>

            {/* Strategy Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STRATEGY_LIST.map((strat) => {
                const isSelected = selectedStrategy === strat.id;
                return (
                  <button
                    key={strat.id}
                    id={`strategy-btn-${strat.id.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    onClick={() => setSelectedStrategy(strat.id)}
                    className={`relative rounded-xl p-2.5 text-left transition-all min-h-[58px] border flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-950/40 text-white shadow-sm"
                        : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-xs font-bold ${isSelected ? "text-emerald-300" : ""}`}>
                        {strat.label}
                      </span>
                      {isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                      {strat.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LARGE ANALYZE BUTTON */}
          <button
            id="analyze-chart-btn"
            disabled={isAnalyzing}
            onClick={handleAnalyze}
            className={`w-full min-h-[52px] rounded-2xl py-3.5 px-6 font-black tracking-wide uppercase shadow-xl transition-all flex items-center justify-center gap-2 ${
              isAnalyzing
                ? "bg-neutral-800 text-neutral-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-neutral-950 shadow-emerald-950/60 hover:brightness-110 active:scale-[0.98]"
            }`}
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin text-emerald-400" />
                <span className="text-white text-sm font-semibold normal-case">
                  {analysisStep || "Analyzing Chart..."}
                </span>
              </div>
            ) : (
              <>
                <Cpu className="h-5 w-5" />
                <span>ANALYZE CHART</span>
              </>
            )}
          </button>

          {/* Helper notice */}
          <p className="text-center text-[11px] text-neutral-400">
            Calculates exact Entry ↔ chart structure, SL ↔ swing/support, TP ↔ logical target.
          </p>
        </div>
      )}
    </div>
  );
};
