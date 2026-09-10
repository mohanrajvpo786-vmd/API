import React from "react";
import {
  Mic,
  MessagesSquare,
  GraduationCap,
  ShieldCheck,
  DownloadCloud,
  History,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle,
} from "lucide-react";
import { TabType } from "./BottomNav";
import { QuickDemoBar, DemoPreset } from "./QuickDemoBar";

interface HomeViewProps {
  onNavigate: (tab: TabType) => void;
  onOpenOfflineManager: () => void;
  onSelectPreset: (preset: DemoPreset) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onOpenOfflineManager,
  onSelectPreset,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-4 pb-28">
      {/* Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 rounded-3xl p-5 shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tamil Nadu & Indian Regional Core</span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight leading-tight">
              APV
            </h2>
            <p className="text-sm font-semibold text-emerald-300 mt-0.5">
              "Speak Your Language. Hear It in Any Language."
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-md">
              Real-time vernacular voice-to-voice translation, continuous two-way conversation, and AI bilingual education designed for Tamil Nadu, regional languages, and indigenous tribal heritage.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="pt-1">
            <button
              id="hero-start-translating"
              onClick={() => onNavigate("translate")}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 active:scale-95 transition-all"
            >
              <Mic className="w-5 h-5" />
              <span>Start Voice Translation</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* SIH Showcase Demonstrations */}
      <QuickDemoBar
        onSelectPreset={(preset) => {
          onSelectPreset(preset);
          onNavigate("translate");
        }}
      />

      {/* 6 Core Functional Cards (Section 7 Mandate) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Core Vernacular Capabilities
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">
            6 Specialized Modules
          </span>
        </div>

        {/* 1. Real-Time Voice Translator */}
        <button
          id="home-card-translator"
          onClick={() => onNavigate("translate")}
          className="w-full text-left bg-gradient-to-r from-slate-900 to-slate-900/90 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl p-4 shadow-md transition-all group flex items-start justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  Real-Time Voice Translator
                </h3>
                <span className="text-[9px] bg-emerald-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">
                  Primary
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Speak naturally without typing. Automatic speech recognition, vernacular translation, and target voice synthesis.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </button>

        {/* 2. Conversation Mode */}
        <button
          id="home-card-conversation"
          onClick={() => onNavigate("conversation")}
          className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md transition-all group flex items-start justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessagesSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-teal-300 transition-colors">
                Bilingual Conversation Mode
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Two-way live conversation between different regional speakers with turn-taking and continuous dialogue mode.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </button>

        {/* 3. AI Vernacular Learning */}
        <button
          id="home-card-learning"
          onClick={() => onNavigate("learn")}
          className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md transition-all group flex items-start justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                AI Vernacular Learning & Worksheets
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Bilingual lessons, pronunciation guides, activities, and printable multilingual worksheets.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </button>

        {/* 4. Tribal Language Learning */}
        <button
          id="home-card-tribal"
          onClick={() => onNavigate("learn")}
          className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md transition-all group flex items-start justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  Tribal & Indigenous Languages
                </h3>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                  Preservation
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Dedicated learning repository for Mundari, Irula, Toda, and Badaga with authentic terminology and linguistic notes.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </button>

        {/* 5. Offline Language Packs */}
        <button
          id="home-card-offline"
          onClick={onOpenOfflineManager}
          className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md transition-all group flex items-start justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                Offline Language Packs
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Download neural translation weights and offline regional packages for low-connectivity rural classrooms.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </button>

        {/* 6. Translation History */}
        <button
          id="home-card-history"
          onClick={() => onNavigate("history")}
          className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-md transition-all group flex items-start justify-between"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-slate-200 transition-colors">
                Translation History
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Replay previous speech sessions, copy translations, and export conversational logs.
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
        </button>
      </div>

      {/* Language Architecture Footer Note */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-400 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-slate-300">
            Regional Vernacular Priority:
          </span>{" "}
          APV operates with primary priority for Tamil Nadu (Tamil, Malayalam, Telugu, Kannada, Urdu) and tribal heritage, avoiding standard Hindi bias.
        </div>
      </div>
    </div>
  );
};
