import React from "react";
import { Crosshair, History, Settings } from "lucide-react";
import { ActiveTab } from "../types";

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  historyCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  historyCount,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "scanner", label: "Scanner", icon: Crosshair },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-800/90 bg-neutral-950/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-150 min-h-[44px] ${
                isActive ? "text-emerald-400 font-semibold" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {/* Active ambient glow bar */}
              {isActive && (
                <div className="absolute top-0 h-0.5 w-10 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981]" />
              )}

              <div className="relative">
                <Icon className={`h-5 w-5 transition-transform duration-150 ${isActive ? "scale-110" : ""}`} />
                {tab.id === "history" && historyCount > 0 && (
                  <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold text-neutral-950">
                    {historyCount > 99 ? "99+" : historyCount}
                  </span>
                )}
              </div>

              <span className="mt-1 text-[11px] tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
