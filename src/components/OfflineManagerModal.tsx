import React, { useState } from "react";
import {
  DownloadCloud,
  X,
  Check,
  HardDrive,
  Trash2,
  AlertCircle,
  Download,
  Layers,
} from "lucide-react";
import { OfflineResourcePack } from "../types";
import { storageService } from "../services/storage";

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [packs, setPacks] = useState<OfflineResourcePack[]>(() =>
    storageService.getOfflinePacks()
  );
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalUsedMb = packs
    .filter((p) => p.isDownloaded)
    .reduce((acc, curr) => acc + curr.sizeMb, 0);

  const handleToggle = (pack: OfflineResourcePack) => {
    if (pack.isDownloaded) {
      const updated = storageService.togglePackDownload(pack.id, false);
      setPacks(updated);
    } else {
      setDownloadingId(pack.id);
      setTimeout(() => {
        const updated = storageService.togglePackDownload(pack.id, true);
        setPacks(updated);
        setDownloadingId(null);
      }, 900);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg max-h-[85vh] flex flex-col bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DownloadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Offline Language Packs
              </h2>
              <p className="text-xs text-slate-400">
                Local neural packs for rural & low-connectivity zones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Summary */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>
              Device Storage Used: <strong className="text-white">{totalUsedMb} MB</strong>
            </span>
          </div>
          <span className="text-emerald-400 font-medium">
            {packs.filter((p) => p.isDownloaded).length} packs installed
          </span>
        </div>

        {/* Packs list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {packs.map((pack) => {
            const isBusy = downloadingId === pack.id;

            return (
              <div
                key={pack.id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      pack.isDownloaded
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {pack.code.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">
                        {pack.languageName}
                      </span>
                      {pack.category === "TRIBAL" && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-medium">
                          Tribal
                        </span>
                      )}
                      {pack.category === "TAMIL_NADU" && (
                        <span className="text-[9px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded font-medium">
                          TN Core
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {pack.sizeMb} MB • {pack.isDownloaded ? "Installed & Offline Ready" : "Available to download"}
                    </span>
                  </div>
                </div>

                <div>
                  {pack.isDownloaded ? (
                    <button
                      onClick={() => handleToggle(pack)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-medium border border-slate-700 transition-colors"
                      title="Uninstall Pack"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggle(pack)}
                      disabled={isBusy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow transition-all disabled:opacity-50"
                    >
                      <Download className={`w-3.5 h-3.5 ${isBusy ? "animate-bounce" : ""}`} />
                      <span>{isBusy ? "Downloading..." : "Download"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 max-w-xs">
            Downloaded packs allow translation even when device is disconnected from the internet.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
