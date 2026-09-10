import React from "react";
import { Settings, Wifi, DownloadCloud, Sparkles } from "lucide-react";

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenOfflineManager: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenOfflineManager,
  isOnline,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-950/40 border border-emerald-400/30">
            <span className="font-extrabold text-white text-base tracking-tight">APV</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight leading-none">
                APV
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Tamil Nadu & Vernacular Core
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-none mt-1">
              AI Vernacular Voice Translation & Learning
            </p>
          </div>
        </div>

        {/* Action icons & status */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Status Indicator */}
          <button
            id="btn-offline-status"
            onClick={onOpenOfflineManager}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-medium text-slate-300 transition-colors"
            title="Manage offline vernacular resources"
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden xs:inline">ONLINE</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="hidden xs:inline">OFFLINE</span>
              </>
            )}
            <DownloadCloud className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Settings / Profile Icon */}
          <button
            id="btn-open-settings"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 transition-colors"
            aria-label="Settings"
            title="Settings & Diagnostics"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
