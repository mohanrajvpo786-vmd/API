import React, { useState } from "react";
import {
  Settings,
  X,
  Volume2,
  Mic,
  Trash2,
  Check,
  RefreshCw,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { storageService, AppSettings } from "../services/storage";
import { audioService } from "../services/audio";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [settings, setSettings] = useState<AppSettings>(() =>
    storageService.getSettings()
  );
  const [testAudioPlaying, setTestAudioPlaying] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const updated = storageService.saveSettings({ [key]: value });
    setSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 1500);
  };

  const handleTestTTS = () => {
    setTestAudioPlaying(true);
    audioService.speakText({
      text: "வணக்கம், APV குரல் மொழிபெயர்ப்பு தயாராக உள்ளது.",
      languageCode: "ta",
      rate: settings.speechRate,
      onEnd: () => setTestAudioPlaying(false),
      onError: () => setTestAudioPlaying(false),
    });
  };

  const handleResetHistory = () => {
    if (window.confirm("Do you want to clear all translation and conversation history?")) {
      storageService.clearHistory();
      storageService.clearConversation();
      alert("History cleared successfully.");
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
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                APV Settings
              </h2>
              <p className="text-xs text-slate-400">
                Audio preferences & system configuration
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {savedSuccess && (
            <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Settings updated</span>
            </div>
          )}

          {/* Setting 1: Auto Play TTS */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-100 block">
                Auto-play Voice Output
              </span>
              <span className="text-xs text-slate-400">
                Automatically speak translation once processing finishes
              </span>
            </div>

            <button
              onClick={() => updateSetting("autoPlayTts", !settings.autoPlayTts)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.autoPlayTts ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.autoPlayTts ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Setting 2: Speech Pace Slider */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-100">
                Voice Speech Rate (Pace)
              </span>
              <span className="text-emerald-400 font-bold">
                {settings.speechRate.toFixed(2)}x
              </span>
            </div>

            <input
              type="range"
              min="0.75"
              max="1.25"
              step="0.05"
              value={settings.speechRate}
              onChange={(e) =>
                updateSetting("speechRate", parseFloat(e.target.value))
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Slower (0.75x)</span>
              <span>Natural (1.0x)</span>
              <span>Faster (1.25x)</span>
            </div>
          </div>

          {/* Setting 3: Test Audio */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-100 block">
                Voice Output Diagnostics
              </span>
              <span className="text-xs text-slate-400">
                Test Tamil audio synthesis engine
              </span>
            </div>

            <button
              onClick={handleTestTTS}
              disabled={testAudioPlaying}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Volume2 className={`w-3.5 h-3.5 text-emerald-400 ${testAudioPlaying ? "animate-spin" : ""}`} />
              <span>{testAudioPlaying ? "Playing..." : "Test Audio"}</span>
            </button>
          </div>

          {/* Setting 4: Reset Cache */}
          <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-100 block">
                Clear Saved History
              </span>
              <span className="text-xs text-slate-400">
                Erase local voice recordings and chat logs
              </span>
            </div>

            <button
              onClick={handleResetHistory}
              className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>

          {/* Architecture Badge */}
          <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>APV Production Core v1.0</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Native English UI Architecture • Tamil Nadu Vernacular Priority • Gemini Multilingual Intelligence
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
