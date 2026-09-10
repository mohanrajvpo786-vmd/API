import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  Volume2,
  Trash2,
  Sparkles,
  StopCircle,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { Language, ConversationMessage } from "../types";
import { translateText } from "../services/api";
import { audioService } from "../services/audio";
import { storageService } from "../services/storage";
import { WaveformVisualizer } from "./WaveformVisualizer";

interface ConversationViewProps {
  languages: Language[];
  personALang: Language;
  personBLang: Language;
  onSelectLangA: () => void;
  onSelectLangB: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  languages,
  personALang,
  personBLang,
  onSelectLangA,
  onSelectLangB,
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>(() =>
    storageService.getConversation()
  );
  const [activeSpeaker, setActiveSpeaker] = useState<"A" | "B" | null>(null);
  const [recordingState, setRecordingState] = useState<
    "idle" | "listening" | "user_speaking" | "processing" | "translating" | "speaking"
  >("idle");
  const [continuousMode, setContinuousMode] = useState<boolean>(() =>
    storageService.getSettings().continuousMode
  );
  const [interimText, setInterimText] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedTurn, setLastFailedTurn] = useState<{ speaker: "A" | "B"; text: string } | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const settings = storageService.getSettings();

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, interimText]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      audioService.stopListening();
      audioService.stopSpeaking();
    };
  }, []);

  const handleStartSpeaking = (speaker: "A" | "B") => {
    setErrorMessage(null);
    setActiveSpeaker(speaker);
    setInterimText("");
    audioService.stopSpeaking();

    const srcLang = speaker === "A" ? personALang : personBLang;

    setRecordingState("listening");

    audioService.startListening({
      languageCode: srcLang.code,
      onAudioLevel: (lvl) => setAudioLevel(lvl),
      onSpeechStart: () => {
        setRecordingState("user_speaking");
      },
      onProcessing: () => {
        setRecordingState("processing");
      },
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          setInterimText("");
          setRecordingState("processing");
          handleProcessTurn(speaker, text);
        } else {
          setInterimText(text);
        }
      },
      onError: (err) => {
        setErrorMessage(err);
        setRecordingState("idle");
        setActiveSpeaker(null);
      },
      onEnd: () => {
        if (recordingState === "listening" || recordingState === "user_speaking") {
          setRecordingState("idle");
          setActiveSpeaker(null);
        }
      },
    });
  };

  const handleStopSpeaking = () => {
    audioService.stopListening();
    setRecordingState("idle");
    setActiveSpeaker(null);
  };

  const handleProcessTurn = async (speaker: "A" | "B", text: string) => {
    if (!text.trim()) {
      setRecordingState("idle");
      setActiveSpeaker(null);
      return;
    }

    setRecordingState("translating");
    const srcLang = speaker === "A" ? personALang : personBLang;
    const tgtLang = speaker === "A" ? personBLang : personALang;

    try {
      const translation = await translateText({
        text,
        sourceLang: srcLang.code,
        targetLang: tgtLang.code,
        mode: "conversational-dialogue",
      });

      const newMsg: ConversationMessage = {
        id: "msg_" + Date.now(),
        speaker,
        speakerName: speaker === "A" ? `Person A (${srcLang.name})` : `Person B (${srcLang.name})`,
        sourceLang: srcLang.name,
        targetLang: tgtLang.name,
        originalText: text,
        translatedText: translation.translatedText,
        romanizedText: translation.romanizedText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const updated = [...messages, newMsg];
      setMessages(updated);
      storageService.saveConversation(updated);

      // Play audio automatically
      if (translation.ttsAvailable && settings.autoPlayTts) {
        setRecordingState("speaking");
        await audioService.speakText({
          text: translation.translatedText,
          languageCode: tgtLang.code,
          rate: settings.speechRate,
          onEnd: () => {
            setRecordingState("idle");
            setActiveSpeaker(null);
            // If Continuous Conversation Mode enabled, automatically start listening for the other person
            if (continuousMode) {
              const nextSpeaker = speaker === "A" ? "B" : "A";
              setTimeout(() => {
                handleStartSpeaking(nextSpeaker);
              }, 800);
            }
          },
          onError: () => {
            setRecordingState("idle");
            setActiveSpeaker(null);
          },
        });
      } else {
        setRecordingState("idle");
        setActiveSpeaker(null);
      }
      setLastFailedTurn(null);
    } catch (err: any) {
      console.error("Conversation translation error:", err);
      setErrorMessage(err.message || "Translation failed in conversation turn.");
      setLastFailedTurn({ speaker, text });
      setRecordingState("idle");
      setActiveSpeaker(null);
    }
  };

  const handleReplay = (msg: ConversationMessage) => {
    const tgt = languages.find((l) => l.name === msg.targetLang);
    if (tgt && !tgt.ttsSupport) {
      setErrorMessage(`Voice output is unavailable for ${tgt.name}.`);
      return;
    }

    setRecordingState("speaking");
    audioService.speakText({
      text: msg.translatedText,
      languageCode: tgt?.code || "en",
      rate: settings.speechRate,
      onEnd: () => setRecordingState("idle"),
      onError: () => setRecordingState("idle"),
    });
  };

  const handleClearChat = () => {
    setMessages([]);
    storageService.clearConversation();
    audioService.stopSpeaking();
    audioService.stopListening();
    setRecordingState("idle");
    setActiveSpeaker(null);
  };

  const toggleContinuous = () => {
    const next = !continuousMode;
    setContinuousMode(next);
    storageService.saveSettings({ continuousMode: next });
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 flex flex-col h-[calc(100vh-135px)]">
      {/* Top Conversation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-md space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Bilingual Conversation Mode</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Two speakers talk naturally back-and-forth
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Continuous Mode Toggle Button */}
            <button
              id="toggle-continuous-mode"
              onClick={toggleContinuous}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1.5 transition-colors ${
                continuousMode
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
              title="Listen -> Translate -> Speak -> Listen again automatically"
            >
              <RefreshCw className={`w-3 h-3 ${continuousMode ? "text-emerald-400" : ""}`} />
              <span>{continuousMode ? "Continuous: ON" : "Continuous: OFF"}</span>
            </button>

            {messages.length > 0 && (
              <button
                id="btn-clear-conversation"
                onClick={handleClearChat}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Speakers Selection Chips */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
          <button
            id="person-a-lang-btn"
            onClick={onSelectLangA}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-left hover:bg-slate-800/60 transition-colors"
          >
            <div>
              <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider block">
                PERSON A
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {personALang.name} ({personALang.nativeName})
              </span>
            </div>
          </button>

          <button
            id="person-b-lang-btn"
            onClick={onSelectLangB}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-left hover:bg-slate-800/60 transition-colors"
          >
            <div>
              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                PERSON B
              </span>
              <span className="text-xs font-semibold text-slate-200">
                {personBLang.name} ({personBLang.nativeName})
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="my-2 bg-rose-950/60 border border-rose-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs text-rose-200 shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-tight">{errorMessage}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {lastFailedTurn && (
              <button
                onClick={() => handleProcessTurn(lastFailedTurn.speaker, lastFailedTurn.text)}
                className="px-2 py-0.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-[11px]"
              >
                Retry
              </button>
            )}
            <button onClick={() => setErrorMessage(null)} className="text-xs text-rose-400 hover:text-white px-1">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Chat Transcript Area */}
      <div className="flex-1 overflow-y-auto my-2 space-y-3 pr-1">
        {messages.length === 0 && !interimText && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center text-emerald-400 border border-slate-700">
              <Mic className="w-6 h-6" />
            </div>
            <div className="text-slate-300 font-semibold text-sm">
              Ready for Conversation
            </div>
            <p className="text-xs max-w-xs text-slate-400">
              Tap Person A's microphone to speak {personALang.name}, or Person B's
              microphone to speak {personBLang.name}.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isPersonA = msg.speaker === "A";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isPersonA ? "items-start" : "items-end"}`}
            >
              <div className="text-[10px] text-slate-400 px-2 mb-1 flex items-center gap-1.5">
                <span className={`font-bold ${isPersonA ? "text-teal-400" : "text-amber-400"}`}>
                  {msg.speakerName}
                </span>
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 shadow-md space-y-2 border ${
                  isPersonA
                    ? "bg-slate-900 border-slate-800 text-slate-100 rounded-tl-sm"
                    : "bg-emerald-950/40 border-emerald-800/50 text-emerald-100 rounded-tr-sm"
                }`}
              >
                {/* Original Speech */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    {msg.sourceLang} Speech
                  </span>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">
                    "{msg.originalText}"
                  </p>
                </div>

                <div className="h-px bg-slate-700/50 my-1" />

                {/* Translated Result */}
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold block">
                    {msg.targetLang} Translation
                  </span>
                  <p className="text-sm font-bold text-emerald-300 mt-0.5">
                    "{msg.translatedText}"
                  </p>
                  {msg.romanizedText && (
                    <p className="text-[11px] text-slate-400 mt-0.5 italic">
                      {msg.romanizedText}
                    </p>
                  )}
                </div>

                {/* Replay action */}
                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => handleReplay(msg)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition-colors"
                  >
                    <Volume2 className="w-3 h-3 text-emerald-400" />
                    <span>Replay Voice</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Active Turn Bubble */}
        {activeSpeaker && (
          <div
            className={`flex flex-col ${
              activeSpeaker === "A" ? "items-start" : "items-end"
            }`}
          >
            <div className="text-[10px] text-slate-400 px-2 mb-1 flex items-center gap-1.5">
              <span
                className={`font-bold ${
                  activeSpeaker === "A" ? "text-teal-400" : "text-amber-400"
                }`}
              >
                Person {activeSpeaker} ({activeSpeaker === "A" ? personALang.name : personBLang.name})
              </span>
              <span>• Speaking...</span>
            </div>

            <div className="max-w-[85%] rounded-2xl p-3.5 bg-slate-900 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Listening...
              </div>
              <WaveformVisualizer
                isActive={true}
                audioLevel={audioLevel}
                color={activeSpeaker === "A" ? "#2dd4bf" : "#f59e0b"}
                barsCount={16}
              />
              {interimText && (
                <p className="text-xs text-slate-300 italic">"{interimText}"</p>
              )}
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Dual Speaker Bottom Push-To-Talk Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl shrink-0">
        <div className="grid grid-cols-2 gap-3">
          {/* Person A Mic Button */}
          <div>
            <div className="text-center text-[11px] font-semibold text-teal-400 mb-1.5">
              Speak {personALang.name}
            </div>
            {activeSpeaker === "A" ? (
              <button
                id="person-a-stop-btn"
                onClick={handleStopSpeaking}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <StopCircle className="w-4 h-4" />
                <span>Done</span>
              </button>
            ) : (
              <button
                id="person-a-mic-btn"
                onClick={() => handleStartSpeaking("A")}
                disabled={activeSpeaker !== null}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-950/50 disabled:opacity-40 active:scale-[0.98] transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Person A ({personALang.name})</span>
              </button>
            )}
          </div>

          {/* Person B Mic Button */}
          <div>
            <div className="text-center text-[11px] font-semibold text-amber-400 mb-1.5">
              Speak {personBLang.name}
            </div>
            {activeSpeaker === "B" ? (
              <button
                id="person-b-stop-btn"
                onClick={handleStopSpeaking}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <StopCircle className="w-4 h-4" />
                <span>Done</span>
              </button>
            ) : (
              <button
                id="person-b-mic-btn"
                onClick={() => handleStartSpeaking("B")}
                disabled={activeSpeaker !== null}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 disabled:opacity-40 active:scale-[0.98] transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Person B ({personBLang.name})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
