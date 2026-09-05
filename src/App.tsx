import React, { useState, useEffect } from "react";
import { SignalData, ActiveTab, AppSettings } from "./types";
import {
  getAllSignalsFromDB,
  saveSignalToDB,
  deleteSignalFromDB,
  clearAllSignalsFromDB,
  getStorageStats,
} from "./lib/db";
import { Header } from "./components/Header";
import { Navigation } from "./components/Navigation";
import { ScannerScreen } from "./components/ScannerScreen";
import { SignalScreen } from "./components/SignalScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { SplashScreen } from "./components/SplashScreen";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("scanner");
  const [currentSignal, setCurrentSignal] = useState<SignalData | null>(null);
  const [signals, setSignals] = useState<SignalData[]>([]);
  const [storageStats, setStorageStats] = useState({ count: 0, approxSizeBytes: 0 });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem("ai_chart_settings");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      theme: "dark",
      imageQuality: "high",
      soundEffects: true,
      haptics: true,
    };
  });

  // Load persistent signals on startup
  useEffect(() => {
    async function loadData() {
      try {
        const list = await getAllSignalsFromDB();
        setSignals(list);
        const stats = await getStorageStats();
        setStorageStats(stats);
      } catch (err) {
        console.error("Failed to load signals from storage:", err);
      }
    }
    loadData();
  }, []);

  // Sync theme class to <html>
  useEffect(() => {
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("ai_chart_settings", JSON.stringify(settings));
  }, [settings]);

  // Handle analysis completion
  const handleAnalysisComplete = async (signal: SignalData) => {
    setCurrentSignal(signal);

    // Automatically save to persistent local storage
    try {
      await saveSignalToDB(signal);
      const updatedList = await getAllSignalsFromDB();
      setSignals(updatedList);
      const stats = await getStorageStats();
      setStorageStats(stats);
    } catch (e) {
      console.error("Auto-save signal failed:", e);
    }
  };

  // Delete single signal
  const handleDeleteSignal = async (id: string) => {
    try {
      await deleteSignalFromDB(id);
      const updatedList = await getAllSignalsFromDB();
      setSignals(updatedList);
      if (currentSignal?.id === id) {
        setCurrentSignal(null);
      }
      const stats = await getStorageStats();
      setStorageStats(stats);
    } catch (e) {
      console.error("Delete signal failed:", e);
    }
  };

  // Clear all history
  const handleClearAllHistory = async () => {
    try {
      await clearAllSignalsFromDB();
      setSignals([]);
      setCurrentSignal(null);
      setStorageStats({ count: 0, approxSizeBytes: 0 });
    } catch (e) {
      console.error("Clear all failed:", e);
    }
  };

  // Open a saved signal from History tab
  const handleOpenSavedSignal = (signal: SignalData) => {
    setCurrentSignal(signal);
    setActiveTab("scanner");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {/* App Top Header */}
      <Header
        hasActiveSignal={activeTab === "scanner" && !!currentSignal}
        onNewScan={() => setCurrentSignal(null)}
      />

      {/* Main Screen Container */}
      <main className="flex-1 w-full max-w-lg sm:max-w-2xl lg:max-w-4xl mx-auto px-4 pt-3 pb-6">
        {activeTab === "scanner" && (
          <>
            {currentSignal ? (
              <SignalScreen
                signal={currentSignal}
                onBackToScanner={() => setCurrentSignal(null)}
                onScanNew={() => setCurrentSignal(null)}
              />
            ) : (
              <ScannerScreen onAnalysisComplete={handleAnalysisComplete} />
            )}
          </>
        )}

        {activeTab === "history" && (
          <HistoryScreen
            signals={signals}
            onOpenSignal={handleOpenSavedSignal}
            onDeleteSignal={handleDeleteSignal}
            onClearHistory={handleClearAllHistory}
            onStartScanning={() => {
              setCurrentSignal(null);
              setActiveTab("scanner");
            }}
          />
        )}

        {activeTab === "settings" && (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
            onClearAllHistory={handleClearAllHistory}
            historyCount={signals.length}
            storageSizeBytes={storageStats.approxSizeBytes}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        historyCount={signals.length}
      />
    </div>
  );
}
