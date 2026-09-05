import React, { useEffect, useState } from "react";
import { Zap } from "lucide-react";

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 900);

    const endTimer = setTimeout(() => {
      onFinish();
    }, 1250);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 transition-opacity duration-300 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Radar Ring Glow */}
        <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />

        {/* Icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 text-emerald-400 shadow-2xl shadow-emerald-950">
          <Zap className="h-10 w-10 stroke-[2.2] animate-bounce" />
        </div>

        {/* Title */}
        <h1 className="mt-5 font-black text-xl tracking-tight text-white">
          AI Chart Scanner
        </h1>
        <p className="mt-1 text-xs text-neutral-400 font-mono tracking-wider uppercase">
          Institutional Vision Engine
        </p>

        {/* Loading bar */}
        <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-neutral-800">
          <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-cyan-400 animate-[pulse_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};
