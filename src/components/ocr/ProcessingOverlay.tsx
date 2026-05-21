"use client";

import React from "react";
import type { ProcessingState } from "@/types";

interface ProcessingOverlayProps {
  state: ProcessingState;
}

export function ProcessingOverlay({ state }: ProcessingOverlayProps) {
  if (state.status !== "processing" && state.status !== "loading") return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center
      bg-ink-900/80 backdrop-blur-sm rounded-xl">
      <div className="text-center space-y-5 px-8">
        {/* Scanning animation */}
        <div className="relative w-16 h-20 mx-auto">
          <div className="absolute inset-0 border-2 border-paper-400/30 rounded" />
          <div className="absolute inset-0 border-t-2 border-accent-red rounded animate-scan" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-paper-400/20" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-paper-400/20" />
        </div>

        <div className="space-y-2">
          <p className="text-paper-200 font-display font-bold text-sm tracking-widest uppercase">
            {state.status === "loading" ? "Loading" : "Scanning"}
          </p>
          <p className="text-ink-300 text-xs">{state.message}</p>
        </div>

        {/* Progress bar */}
        <div className="w-48 mx-auto">
          <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-paper-400 to-accent-red rounded-full transition-all duration-300"
              style={{ width: `${state.progress}%` }}
            />
          </div>
          <p className="text-ink-500 text-[10px] mt-1.5 text-right">{state.progress}%</p>
        </div>
      </div>
    </div>
  );
}
