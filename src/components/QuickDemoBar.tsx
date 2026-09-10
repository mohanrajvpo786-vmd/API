import React from "react";
import { Sparkles, Play } from "lucide-react";

export interface DemoPreset {
  id: string;
  sourceCode: string;
  sourceName: string;
  targetCode: string;
  targetName: string;
  sampleSpeech: string;
  sampleEnglish: string;
  badge: string;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "sih-primary",
    sourceCode: "ta",
    sourceName: "Tamil",
    targetCode: "ml",
    targetName: "Malayalam",
    sampleSpeech: "நான் இன்று பள்ளிக்கு செல்கிறேன்.",
    sampleEnglish: "I am going to school today.",
    badge: "Primary SIH Demo",
  },
  {
    id: "ta-te",
    sourceCode: "ta",
    sourceName: "Tamil",
    targetCode: "te",
    targetName: "Telugu",
    sampleSpeech: "நீங்கள் எப்படி இருக்கிறீர்கள்?",
    sampleEnglish: "How are you?",
    badge: "Tamil Nadu",
  },
  {
    id: "ta-kn",
    sourceCode: "ta",
    sourceName: "Tamil",
    targetCode: "kn",
    targetName: "Kannada",
    sampleSpeech: "என் பெயர் அருண்.",
    sampleEnglish: "My name is Arun.",
    badge: "Tamil Nadu",
  },
  {
    id: "ta-hi",
    sourceCode: "ta",
    sourceName: "Tamil",
    targetCode: "hi",
    targetName: "Hindi",
    sampleSpeech: "வணக்கம், எனக்கு உதவி தேவை.",
    sampleEnglish: "Hello, I need help.",
    badge: "Pan-Indian",
  },
  {
    id: "en-ta",
    sourceCode: "en",
    sourceName: "English",
    targetCode: "ta",
    targetName: "Tamil",
    sampleSpeech: "Where are you going?",
    sampleEnglish: "Where are you going?",
    badge: "Bridge",
  },
  {
    id: "hi-unr",
    sourceCode: "hi",
    sourceName: "Hindi",
    targetCode: "unr",
    targetName: "Mundari",
    sampleSpeech: "आप कैसे हैं?",
    sampleEnglish: "How are you? (Tribal indigenous)",
    badge: "Tribal Mundari",
  },
  {
    id: "ta-sat",
    sourceCode: "ta",
    sourceName: "Tamil",
    targetCode: "sat",
    targetName: "Santhali",
    sampleSpeech: "வணக்கம், நீங்கள் எப்படி இருக்கிறீர்கள்?",
    sampleEnglish: "Hello, how are you? (Tribal Santhali)",
    badge: "Tribal Santhali",
  },
];

interface QuickDemoBarProps {
  onSelectPreset: (preset: DemoPreset, runImmediately: boolean) => void;
  activePresetId?: string;
}

export const QuickDemoBar: React.FC<QuickDemoBarProps> = ({
  onSelectPreset,
  activePresetId,
}) => {
  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Demonstrations (SIH Showcase)</span>
        </div>
        <span className="text-[10px] text-slate-400">Tap to load & test</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DEMO_PRESETS.map((preset) => {
          const isPrimary = preset.id === "sih-primary";
          const isCurrent = activePresetId === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset, true)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-left border transition-all ${
                isPrimary
                  ? "bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border-emerald-500/50 text-emerald-200 hover:border-emerald-400 shadow-sm"
                  : isCurrent
                  ? "bg-slate-800 border-slate-600 text-white"
                  : "bg-slate-950/70 border-slate-800/90 text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Play className="w-3 h-3 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-100">
                    {preset.sourceName} → {preset.targetName}
                  </span>
                  {isPrimary && (
                    <span className="text-[9px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                      SIH 1st
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                  "{preset.sampleSpeech}"
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
