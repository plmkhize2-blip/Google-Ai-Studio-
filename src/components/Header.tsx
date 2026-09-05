import React from "react";
import { Zap, Wifi, WifiOff, Download, RefreshCw } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

interface HeaderProps {
  onNewScan?: () => void;
  hasActiveSignal?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNewScan, hasActiveSignal }) => {
  const { isInstallable, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4 sm:max-w-2xl lg:max-w-4xl">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-950/50">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">AI Chart Scanner</span>
              <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/25">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-none">Institutional Price Action</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium border ${
              isOnline
                ? "border-emerald-500/20 bg-emerald-950/40 text-emerald-400"
                : "border-amber-500/30 bg-amber-950/50 text-amber-300"
            }`}
            title={isOnline ? "Online: AI Vision Ready" : "Offline: Cached Signals Only"}
          >
            {isOnline ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="hidden xs:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Install Button (if available) */}
          {(isInstallable || isIOS) && (
            <button
              id="install-pwa-header-btn"
              onClick={install}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40 transition active:scale-95"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Quick new scan button if viewing a signal */}
          {hasActiveSignal && (
            <button
              id="new-scan-header-btn"
              onClick={onNewScan}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition active:scale-95"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Scan</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
