import React, { useState } from "react";
import { AppSettings } from "../types";
import { usePWAInstall } from "../hooks/usePWAInstall";
import {
  Moon,
  Sun,
  Trash2,
  Image,
  Smartphone,
  Info,
  Shield,
  Download,
  CheckCircle2,
  Database,
  ExternalLink,
  Cpu,
} from "lucide-react";

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onClearAllHistory: () => void;
  historyCount: number;
  storageSizeBytes: number;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onClearAllHistory,
  historyCount,
  storageSizeBytes,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to permanently clear all signal history?")) {
      onClearAllHistory();
      setClearedNotice(true);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-white">App Settings</h1>
        <p className="text-xs text-neutral-400">Configure display, storage, and device preferences</p>
      </div>

      {/* 1. APPEARANCE & THEME */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-md space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Moon className="h-3.5 w-3.5 text-cyan-400" />
          <span>Appearance & Theme</span>
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <button
            id="theme-dark-btn"
            onClick={() => onUpdateSettings({ theme: "dark" })}
            className={`flex items-center justify-between rounded-xl p-3 border transition ${
              settings.theme === "dark"
                ? "border-emerald-500 bg-emerald-950/40 text-white"
                : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-cyan-400" />
              <div className="text-left">
                <span className="block text-xs font-bold">Dark Terminal</span>
                <span className="block text-[10px] text-neutral-400">Pro Trading UI</span>
              </div>
            </div>
            {settings.theme === "dark" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          </button>

          <button
            id="theme-light-btn"
            onClick={() => onUpdateSettings({ theme: "light" })}
            className={`flex items-center justify-between rounded-xl p-3 border transition ${
              settings.theme === "light"
                ? "border-emerald-500 bg-emerald-950/40 text-white"
                : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-400" />
              <div className="text-left">
                <span className="block text-xs font-bold">Light Contrast</span>
                <span className="block text-[10px] text-neutral-400">Daylight mode</span>
              </div>
            </div>
            {settings.theme === "light" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 2. IMAGE QUALITY SETTINGS */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-md space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Image className="h-3.5 w-3.5 text-cyan-400" />
          <span>Image Processing Quality</span>
        </h2>

        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { id: "original", label: "Original", desc: "Full lossless resolution" },
            { id: "high", label: "High (HQ)", desc: "Balanced for mobile 4G" },
            { id: "optimized", label: "Optimized", desc: "Bandwidth saving" },
          ].map((item) => {
            const isSelected = settings.imageQuality === item.id;
            return (
              <button
                key={item.id}
                id={`quality-btn-${item.id}`}
                onClick={() => onUpdateSettings({ imageQuality: item.id as any })}
                className={`rounded-xl p-2.5 text-left border transition ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-950/40 text-white"
                    : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{item.label}</span>
                  {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                </div>
                <span className="mt-1 block text-[10px] text-neutral-400">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PERSISTENT STORAGE & DATA */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-md space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Database className="h-3.5 w-3.5 text-cyan-400" />
          <span>Local Storage & Cache</span>
        </h2>

        <div className="flex items-center justify-between rounded-xl bg-neutral-950 p-3 border border-neutral-800">
          <div>
            <p className="text-xs font-semibold text-white">Saved Signal History</p>
            <p className="text-[11px] text-neutral-400">
              {historyCount} saved records ({formatBytes(storageSizeBytes)})
            </p>
          </div>

          <button
            id="settings-clear-history-btn"
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-900/40 transition active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        {clearedNotice && (
          <p className="text-xs text-emerald-400 font-medium">
            ✓ Local storage and signal history cleared successfully.
          </p>
        )}
      </div>

      {/* 4. INSTALLABLE APP (PWA / ANDROID) */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-md space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Smartphone className="h-3.5 w-3.5 text-cyan-400" />
          <span>Installable Application</span>
        </h2>

        <div className="rounded-xl bg-neutral-950 p-3 border border-neutral-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Home Screen & Standalone App</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Install as a full-screen app on Android, iOS, and desktop without browser bars.
              </p>
            </div>
            {isInstalled && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Installed
              </span>
            )}
          </div>

          {!isInstalled && (
            <div className="mt-3">
              {isInstallable ? (
                <button
                  id="install-pwa-settings-btn"
                  onClick={install}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-cyan-600 py-2.5 text-xs font-bold text-white hover:bg-cyan-500 transition active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Install AI Chart Scanner</span>
                </button>
              ) : isIOS ? (
                <button
                  onClick={() => setShowIOSModal(true)}
                  className="flex items-center justify-center gap-2 w-full rounded-xl border border-neutral-700 bg-neutral-800 py-2 text-xs font-semibold text-neutral-200"
                >
                  <span>Install on iPhone / iPad Guide</span>
                </button>
              ) : (
                <p className="text-[11px] text-neutral-400 italic">
                  Tip: On Android Chrome or Desktop Edge/Chrome, tap menu &gt; "Install app" or "Add to Home screen".
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. APP INFORMATION */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-4 shadow-md space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          <span>App Information</span>
        </h2>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between py-1 border-b border-neutral-800/60">
            <span className="text-neutral-400">Application</span>
            <span className="font-semibold text-white">AI Chart Scanner PRO</span>
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-800/60">
            <span className="text-neutral-400">Version</span>
            <span className="font-mono text-white">v1.0.0 (Production)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-neutral-800/60">
            <span className="text-neutral-400">Vision AI Engine</span>
            <span className="font-mono text-cyan-300">Gemini 3.8 Flash Vision</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-neutral-400">PWA Manifest & Service Worker</span>
            <span className="text-emerald-400 font-semibold">Active & Offline Ready</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 rounded-xl bg-neutral-950 p-2.5 border border-neutral-800/80 text-[10px] text-neutral-400 leading-relaxed">
          <div className="flex items-center gap-1 text-neutral-300 font-semibold mb-1">
            <Shield className="h-3 w-3 text-amber-400" />
            <span>Trading Risk Disclaimer</span>
          </div>
          Trading foreign exchange, cryptocurrencies, stocks, and commodities carries substantial risk of capital loss. AI Chart Scanner is an algorithmic chart structure assistant and does not constitute registered financial advisory services. Always manage risk responsibly.
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white">Install on iPhone / iPad</h3>
            <p className="mt-2 text-xs text-neutral-300 leading-relaxed">
              1. Tap the <strong className="text-white">Share</strong> icon in the Safari navigation bar.<br />
              2. Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.<br />
              3. The app will install with its native trading icon and open in full-screen standalone mode.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full rounded-xl bg-neutral-800 py-2.5 text-xs font-bold text-white hover:bg-neutral-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
