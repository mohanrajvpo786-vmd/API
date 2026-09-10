import React, { useState } from "react";
import {
  History,
  Volume2,
  Copy,
  Trash2,
  Check,
  RotateCcw,
  ArrowRight,
  Download,
  Search,
} from "lucide-react";
import { TranslationResult, Language } from "../types";
import { storageService } from "../services/storage";
import { audioService } from "../services/audio";

interface HistoryViewProps {
  languages: Language[];
  onSelectTranslation?: (item: TranslationResult) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  languages,
  onSelectTranslation,
}) => {
  const [historyItems, setHistoryItems] = useState<TranslationResult[]>(() =>
    storageService.getHistory()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const filteredItems = historyItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      item.originalText.toLowerCase().includes(q) ||
      item.translatedText.toLowerCase().includes(q) ||
      item.detectedSourceLanguage.toLowerCase().includes(q) ||
      item.targetLanguage.toLowerCase().includes(q)
    );
  });

  const handleReplay = (item: TranslationResult) => {
    if (!item.ttsAvailable) return;
    setSpeakingId(item.id);
    audioService.speakText({
      text: item.translatedText,
      languageCode: item.targetCode,
      onEnd: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
    });
  };

  const handleCopy = (item: TranslationResult) => {
    navigator.clipboard.writeText(item.translatedText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleDelete = (id: string) => {
    storageService.deleteHistoryItem(id);
    setHistoryItems(storageService.getHistory());
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all translation history?")) {
      storageService.clearHistory();
      setHistoryItems([]);
    }
  };

  const handleExportHistory = () => {
    const jsonStr = JSON.stringify(historyItems, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `apv_translation_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-4 pb-28">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            Translation History
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Locally persisted vernacular speech sessions ({historyItems.length})
          </p>
        </div>

        {historyItems.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              id="btn-export-history"
              onClick={handleExportHistory}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              title="Export JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              id="btn-clear-history-all"
              onClick={handleClearAll}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400"
              title="Clear All History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Search Filter */}
      {historyItems.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search through previous translations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* History List */}
      <div className="space-y-3">
        {filteredItems.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <History className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-sm font-semibold text-slate-300">
              No History Records
            </div>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your voice translations will automatically be preserved here for offline replay and study.
            </p>
          </div>
        )}

        {filteredItems.map((item) => {
          const dateFormatted = new Date(item.timestamp).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md space-y-3 transition-colors"
            >
              {/* Top metadata */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-slate-200 font-bold">
                    {item.detectedSourceLanguage}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-emerald-400 font-bold">
                    {item.targetLanguage}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">{dateFormatted}</span>
              </div>

              {/* Speech & Translation */}
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                    Original
                  </span>
                  <p className="text-sm font-medium text-slate-200 leading-snug">
                    "{item.originalText}"
                  </p>
                </div>

                <div className="h-px bg-slate-800/80" />

                <div>
                  <span className="text-[10px] text-emerald-500 font-semibold uppercase block">
                    Translation
                  </span>
                  <p className="text-base font-bold text-emerald-300 leading-snug">
                    "{item.translatedText}"
                  </p>
                  {item.romanizedText && (
                    <p className="text-[11px] text-slate-400 italic mt-0.5">
                      {item.romanizedText}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleReplay(item)}
                  disabled={!item.ttsAvailable || speakingId === item.id}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold disabled:opacity-40 transition-colors"
                >
                  <Volume2 className={`w-3.5 h-3.5 text-emerald-400 ${speakingId === item.id ? "animate-spin" : ""}`} />
                  <span>{speakingId === item.id ? "Playing..." : "Replay"}</span>
                </button>

                <button
                  onClick={() => handleCopy(item)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{copiedId === item.id ? "Copied" : "Copy"}</span>
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Delete Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
