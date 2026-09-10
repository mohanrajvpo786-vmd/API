import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  ArrowLeftRight,
  Volume2,
  Copy,
  RotateCcw,
  Trash2,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Check,
  Languages,
  StopCircle,
  Keyboard,
  Info,
} from "lucide-react";
import { Language, TranslationResult } from "../types";
import { translateText } from "../services/api";
import { audioService } from "../services/audio";
import { storageService } from "../services/storage";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { QuickDemoBar, DemoPreset } from "./QuickDemoBar";

interface VoiceTranslatorViewProps {
  languages: Language[];
  onOpenSourceModal: () => void;
  onOpenTargetModal: () => void;
  sourceLang: Language | { code: "auto"; name: "Auto Detect"; nativeName: "Automatic"; category: "POPULAR"; speechSupport: true; translationSupport: true; ttsSupport: true };
  targetLang: Language;
  onSwapLanguages: () => void;
  onSetSourceLang: (l: any) => void;
  onSetTargetLang: (l: Language) => void;
}

type RecordingState =
  | "idle"
  | "listening"
  | "user_speaking"
  | "processing"
  | "translating"
  | "speaking"
  | "ready";

export const VoiceTranslatorView: React.FC<VoiceTranslatorViewProps> = ({
  languages,
  onOpenSourceModal,
  onOpenTargetModal,
  sourceLang,
  targetLang,
  onSwapLanguages,
  onSetSourceLang,
  onSetTargetLang,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [spokenText, setSpokenText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [manualText, setManualText] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeDemoId, setActiveDemoId] = useState<string | undefined>("sih-primary");

  const settings = storageService.getSettings();

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      audioService.stopListening();
      audioService.stopSpeaking();
    };
  }, []);

  // Handle Voice Recording
  const handleStartSpeaking = () => {
    setErrorMessage(null);
    setInterimText("");
    audioService.stopSpeaking();

    // Check if source language supports speech recognition
    if (sourceLang.code !== "auto" && !("speechSupport" in sourceLang && sourceLang.speechSupport)) {
      setErrorMessage(`Speech recognition is currently unavailable for ${sourceLang.name}. Please enter text manually.`);
      setShowManualInput(true);
      return;
    }

    setRecordingState("listening");

    audioService.startListening({
      languageCode: sourceLang.code,
      onAudioLevel: (lvl) => setAudioLevel(lvl),
      onSpeechStart: () => {
        setRecordingState("user_speaking");
      },
      onProcessing: () => {
        setRecordingState("processing");
      },
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          setSpokenText(text);
          setManualText(text);
          setInterimText("");
          setRecordingState("processing");
          // Proceed to translate automatically
          setTimeout(() => {
            handleTranslate(text);
          }, 150);
        } else {
          setInterimText(text);
          setSpokenText(text);
        }
      },
      onError: (err) => {
        setErrorMessage(err);
        setRecordingState("idle");
      },
      onEnd: () => {
        setRecordingState((prev) =>
          prev === "listening" || prev === "user_speaking" ? "idle" : prev
        );
      },
    });
  };

  const handleStopSpeaking = () => {
    audioService.stopListening();
    if (interimText || spokenText) {
      const textToUse = (interimText || spokenText).trim();
      setSpokenText(textToUse);
      setManualText(textToUse);
      setInterimText("");
      handleTranslate(textToUse);
    } else {
      setRecordingState("idle");
    }
  };

  const handleStopAudio = () => {
    audioService.stopSpeaking();
    setRecordingState("ready");
  };

  // Execute Translation
  const handleTranslate = async (textToTranslate: string) => {
    if (!textToTranslate.trim()) {
      setRecordingState("idle");
      return;
    }

    setRecordingState("translating");
    setErrorMessage(null);

    try {
      const translation = await translateText({
        text: textToTranslate,
        sourceLang: sourceLang.code,
        targetLang: targetLang.code,
      });

      setResult(translation);
      storageService.saveHistoryItem(translation);

      // Automatic TTS Playback as requested
      if (translation.ttsAvailable && settings.autoPlayTts) {
        setRecordingState("speaking");
        await audioService.speakText({
          text: translation.translatedText,
          languageCode: translation.targetCode,
          rate: settings.speechRate,
          onEnd: () => setRecordingState("ready"),
          onError: () => setRecordingState("ready"),
        });
      } else {
        setRecordingState("ready");
      }
    } catch (err: any) {
      console.error("Translation failed:", err);
      setErrorMessage(err.message || "Translation failed. Please try again.");
      setRecordingState("idle");
    }
  };

  // Replay Target Audio
  const handlePlayTranslation = () => {
    if (!result) return;
    if (!result.ttsAvailable) {
      setErrorMessage(result.ttsNote || "Voice output is currently unavailable for this language.");
      return;
    }

    setRecordingState("speaking");
    audioService.speakText({
      text: result.translatedText,
      languageCode: result.targetCode,
      rate: settings.speechRate,
      onEnd: () => setRecordingState("ready"),
      onError: () => setRecordingState("ready"),
    });
  };

  // Quick Demo Preset Selection (Especially SIH Tamil -> Malayalam!)
  const handleSelectPreset = async (preset: DemoPreset, runImmediately: boolean) => {
    setActiveDemoId(preset.id);
    const src = languages.find((l) => l.code === preset.sourceCode);
    const tgt = languages.find((l) => l.code === preset.targetCode);

    if (src) onSetSourceLang(src);
    if (tgt) onSetTargetLang(tgt);

    setSpokenText(preset.sampleSpeech);
    setManualText(preset.sampleSpeech);

    if (runImmediately) {
      await handleTranslate(preset.sampleSpeech);
    }
  };

  // Copy translated text
  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clear current translation
  const handleClear = () => {
    setResult(null);
    setSpokenText("");
    setInterimText("");
    setManualText("");
    setErrorMessage(null);
    audioService.stopSpeaking();
    audioService.stopListening();
    setRecordingState("idle");
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-4 pb-28">
      {/* SIH Showcase Quick Demo Bar */}
      <QuickDemoBar
        onSelectPreset={handleSelectPreset}
        activePresetId={activeDemoId}
      />

      {/* Language Selector Bar (Top Bar) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg flex items-center justify-between gap-2">
        {/* Source Language Button */}
        <button
          id="source-language-btn"
          onClick={onOpenSourceModal}
          className="flex-1 flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors group"
        >
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              SOURCE LANGUAGE
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-semibold text-slate-100 truncate">
                {sourceLang.name}
              </span>
              <span className="text-xs text-slate-400 font-normal">
                {sourceLang.nativeName}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 shrink-0 ml-1" />
        </button>

        {/* Swap Button */}
        <button
          id="swap-languages-btn"
          onClick={onSwapLanguages}
          disabled={sourceLang.code === "auto"}
          className={`p-2.5 rounded-xl border transition-all ${
            sourceLang.code === "auto"
              ? "bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed"
              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30 active:scale-95"
          }`}
          title={sourceLang.code === "auto" ? "Cannot swap with Auto Detect" : "Swap Languages"}
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        {/* Target Language Button */}
        <button
          id="target-language-btn"
          onClick={onOpenTargetModal}
          className="flex-1 flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors group"
        >
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              TARGET LANGUAGE
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-semibold text-emerald-400 truncate">
                {targetLang.name}
              </span>
              <span className="text-xs text-slate-400 font-normal">
                {targetLang.nativeName}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-200 shrink-0 ml-1" />
        </button>
      </div>

      {/* Target Language TTS Limitation Notice if applicable (e.g. Mundari) */}
      {!targetLang.ttsSupport && (
        <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-300">
              Linguistic Voice Notice: {targetLang.name}
            </div>
            <p className="text-amber-200/90 mt-0.5">
              {targetLang.ttsNote || "Text translation is available. Voice output is currently unavailable for this language."}
            </p>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-rose-200">
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {(spokenText || manualText) && (
              <button
                onClick={() => handleTranslate(spokenText || manualText)}
                className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-[11px] transition-colors"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white px-1.5 py-1 text-xs"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Mic Stage */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
        {/* Status Indicator */}
        <div className="mb-4 text-center">
          {recordingState === "listening" && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              🔴 Listening... Speak naturally
            </div>
          )}

          {recordingState === "user_speaking" && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/50 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              🎙️ Capturing Voice...
            </div>
          )}

          {recordingState === "processing" && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Processing Speech...
            </div>
          )}

          {recordingState === "translating" && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Translating Contextually...
            </div>
          )}

          {recordingState === "speaking" && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-semibold">
              <Volume2 className="w-3.5 h-3.5 animate-bounce" />
              Speaking {targetLang.name} Voice...
            </div>
          )}

          {recordingState === "ready" && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Translation Ready
            </div>
          )}

          {recordingState === "idle" && (
            <span className="text-xs text-slate-400 font-medium">
              Tap microphone to translate voice in real-time
            </span>
          )}
        </div>

        {/* Live Waveform Canvas */}
        <WaveformVisualizer
          isActive={recordingState === "listening" || recordingState === "user_speaking" || recordingState === "speaking"}
          audioLevel={audioLevel}
          color={recordingState === "listening" || recordingState === "user_speaking" ? "#f43f5e" : "#10b981"}
        />

        {/* Dynamic Transcript during speech */}
        {(interimText || spokenText) && (
          <div className="w-full text-center px-4 py-2 mt-2">
            <p className="text-sm font-medium text-slate-200 italic">
              "{interimText || spokenText}"
            </p>
          </div>
        )}

        {/* Large Central Microphone Button */}
        <div className="my-4 relative">
          {recordingState === "listening" || recordingState === "user_speaking" ? (
            <button
              id="mic-stop-btn"
              onClick={handleStopSpeaking}
              className="w-24 h-24 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex flex-col items-center justify-center shadow-xl shadow-rose-950/60 ring-4 ring-rose-500/30 active:scale-95 transition-all"
              aria-label="Stop Listening"
            >
              <StopCircle className="w-10 h-10" />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                Done
              </span>
            </button>
          ) : recordingState === "speaking" ? (
            <button
              id="mic-stop-audio-btn"
              onClick={handleStopAudio}
              className="w-24 h-24 rounded-full bg-rose-700 hover:bg-rose-600 text-white flex flex-col items-center justify-center shadow-xl shadow-rose-950/60 ring-4 ring-rose-500/30 active:scale-95 transition-all"
              aria-label="Stop Audio"
            >
              <StopCircle className="w-10 h-10" />
              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                Stop
              </span>
            </button>
          ) : recordingState === "processing" || recordingState === "translating" ? (
            <div
              className="w-24 h-24 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30 flex flex-col items-center justify-center shadow-xl shadow-emerald-950/40 ring-4 ring-emerald-500/20"
            >
              <Sparkles className="w-10 h-10 animate-spin text-emerald-400" />
              <span className="text-[9px] font-bold mt-1 tracking-tight text-emerald-300 uppercase">
                AI Engine
              </span>
            </div>
          ) : (
            <button
              id="mic-speak-btn"
              onClick={handleStartSpeaking}
              className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 hover:from-emerald-500 hover:to-teal-300 text-white flex flex-col items-center justify-center shadow-xl shadow-emerald-950/70 ring-4 ring-emerald-500/20 active:scale-95 transition-all group"
              aria-label="Tap to Speak"
            >
              <Mic className="w-10 h-10 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold mt-1 tracking-tight">
                Tap to Speak
              </span>
            </button>
          )}
        </div>

        {/* Quick keyboard typing toggle */}
        <button
          onClick={() => setShowManualInput(!showManualInput)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 mt-1 py-1 px-3 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>{showManualInput ? "Hide Text Box" : "Type Sentence Instead"}</span>
        </button>

        {/* Optional Text Input Box */}
        {showManualInput && (
          <div className="w-full mt-3 p-3 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2 animate-in fade-in duration-150">
            <textarea
              id="manual-sentence-input"
              rows={2}
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={`Enter text in ${sourceLang.name} (e.g. நான் இன்று பள்ளிக்கு செல்கிறேன்)...`}
              className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
              <button
                onClick={() => setManualText("")}
                className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1"
              >
                Clear
              </button>
              <button
                onClick={() => handleTranslate(manualText)}
                disabled={!manualText.trim() || recordingState === "translating"}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow disabled:opacity-40"
              >
                Translate Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TRANSLATION RESULT CARD (Section 9 Requirement) */}
      {result && (
        <div
          id="translation-result-card"
          className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in duration-200"
        >
          {/* YOU SAID BLOCK */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  YOU SAID
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {result.detectedSourceLanguage}
                </span>
              </div>
              {result.detectionConfidence && (
                <span className="text-[10px] text-emerald-400 font-medium">
                  {Math.round(result.detectionConfidence * 100)}% Match
                </span>
              )}
            </div>

            <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed font-vernacular">
              "{result.originalText}"
            </p>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent my-1" />

          {/* TRANSLATION BLOCK */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                  TRANSLATION
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {result.targetLanguage}
                </span>
                {result.offlineFallback && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    Offline Engine
                  </span>
                )}
              </div>
              {result.ttsAvailable ? (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <Volume2 className="w-3 h-3" />
                  Voice Ready
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 font-medium">
                  Voice Unavailable
                </span>
              )}
            </div>

            <p className="text-lg sm:text-xl font-bold text-emerald-300 leading-relaxed font-vernacular">
              "{result.translatedText}"
            </p>

            {/* Phonetic Pronunciation Guide */}
            {result.romanizedText && (
              <p className="text-xs text-slate-400 mt-1 italic">
                Phonetic: {result.romanizedText}
              </p>
            )}

            {/* Grammar / Context Note */}
            {result.grammarNote && (
              <p className="text-[11px] text-slate-500 mt-1">
                Context: {result.grammarNote}
              </p>
            )}
          </div>

          {/* PRIMARY ACTION: PLAY / STOP TRANSLATION */}
          <div className="pt-2">
            {recordingState === "speaking" ? (
              <button
                id="btn-stop-translation"
                onClick={handleStopAudio}
                className="w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg transition-all bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50 active:scale-[0.99]"
              >
                <StopCircle className="w-4 h-4" />
                <span>Stop Voice Output</span>
              </button>
            ) : (
              <button
                id="btn-play-translation"
                onClick={handlePlayTranslation}
                disabled={!result.ttsAvailable}
                className={`w-full py-3 px-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg transition-all ${
                  result.ttsAvailable
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50 active:scale-[0.99]"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>
                  {result.ttsAvailable
                    ? `Play ${result.targetLanguage} Voice`
                    : "Voice Output Unavailable"}
                </span>
              </button>
            )}
          </div>

          {/* ACTION BUTTONS (Section 9: Speak Again, Replay, Copy, Swap, Clear) */}
          <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-800 text-xs">
            <button
              id="btn-speak-again"
              onClick={handleStartSpeaking}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Speak Again"
            >
              <Mic className="w-4 h-4 mb-1 text-emerald-400" />
              <span className="text-[10px] font-medium">Speak Again</span>
            </button>

            <button
              id="btn-replay"
              onClick={handlePlayTranslation}
              disabled={!result.ttsAvailable}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors disabled:opacity-40"
              title="Replay Audio"
            >
              <RotateCcw className="w-4 h-4 mb-1 text-teal-400" />
              <span className="text-[10px] font-medium">Replay</span>
            </button>

            <button
              id="btn-copy"
              onClick={handleCopy}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Copy Translation"
            >
              {copied ? (
                <Check className="w-4 h-4 mb-1 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 mb-1 text-slate-400" />
              )}
              <span className="text-[10px] font-medium">{copied ? "Copied!" : "Copy"}</span>
            </button>

            <button
              id="btn-swap-languages"
              onClick={onSwapLanguages}
              disabled={sourceLang.code === "auto"}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors disabled:opacity-40"
              title="Swap Languages"
            >
              <ArrowLeftRight className="w-4 h-4 mb-1 text-amber-400" />
              <span className="text-[10px] font-medium">Swap</span>
            </button>

            <button
              id="btn-clear"
              onClick={handleClear}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear Card"
            >
              <Trash2 className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-medium">Clear</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
