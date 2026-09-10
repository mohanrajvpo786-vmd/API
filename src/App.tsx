import React, { useState, useEffect } from "react";
import { Language } from "./types";
import { fetchLanguages } from "./services/api";
import { Header } from "./components/Header";
import { BottomNav, TabType } from "./components/BottomNav";
import { HomeView } from "./components/HomeView";
import { VoiceTranslatorView } from "./components/VoiceTranslatorView";
import { ConversationView } from "./components/ConversationView";
import { LearnView } from "./components/LearnView";
import { HistoryView } from "./components/HistoryView";
import { LanguageSelectModal } from "./components/LanguageSelectModal";
import { OfflineManagerModal } from "./components/OfflineManagerModal";
import { SettingsModal } from "./components/SettingsModal";
import { DemoPreset } from "./components/QuickDemoBar";

// Fallback initial languages list in case of network latency
const DEFAULT_LANGUAGES: Language[] = [
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", category: "TAMIL_NADU", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", category: "TAMIL_NADU", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", category: "TAMIL_NADU", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", category: "TAMIL_NADU", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "ur", name: "Urdu", nativeName: "اردو", category: "TAMIL_NADU", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "en", name: "English", nativeName: "English", category: "POPULAR", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", category: "POPULAR", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", category: "INDIAN", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "mr", name: "Marathi", nativeName: "मराठी", category: "INDIAN", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", category: "INDIAN", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", category: "INDIAN", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", category: "INDIAN", speechSupport: true, translationSupport: true, ttsSupport: true },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", category: "INDIAN", speechSupport: false, translationSupport: true, ttsSupport: false },
  { code: "sat", name: "Santhali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", category: "TRIBAL", speechSupport: false, translationSupport: true, ttsSupport: false, ttsNote: "Santali tribal indigenous language with authentic Ol Chiki (ᱥᱟᱱᱛᱟᱲᱤ) script and phonetic guide. Voice synthesizer in linguistic pipeline." },
  { code: "unr", name: "Mundari", nativeName: "मुण्डारी", category: "TRIBAL", speechSupport: false, translationSupport: true, ttsSupport: false, ttsNote: "Tribal indigenous language with text translation. Voice synthesizer in linguistic pipeline." },
  { code: "iru", name: "Irula", nativeName: "இருளா", category: "TRIBAL", speechSupport: false, translationSupport: true, ttsSupport: false, ttsNote: "Nilgiris indigenous language. Text translation and phonetic transcription available." },
  { code: "tcx", name: "Toda", nativeName: "தோடா", category: "TRIBAL", speechSupport: false, translationSupport: true, ttsSupport: false, ttsNote: "Endangered Nilgiris tribal language preserved in linguistic archive." },
  { code: "kfa", name: "Kota", nativeName: "கோத்தா", category: "TRIBAL", speechSupport: false, translationSupport: true, ttsSupport: false, ttsNote: "Nilgiris indigenous language preserved in linguistic archive." },
  { code: "xub", name: "Kurumba", nativeName: "குறும்பா", category: "TRIBAL", speechSupport: false, translationSupport: true, ttsSupport: false, ttsNote: "Nilgiris forest indigenous language preserved in linguistic archive." },
  { code: "bfq", name: "Badaga", nativeName: "படகா", category: "TRIBAL", speechSupport: false, translationSupport: true, ttsSupport: false, ttsNote: "Nilgiris highland indigenous language." },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Translation pair: default to Tamil -> Malayalam (Primary SIH Demonstration requirement!)
  const [sourceLang, setSourceLang] = useState<any>(DEFAULT_LANGUAGES[0]); // Tamil
  const [targetLang, setTargetLang] = useState<Language>(DEFAULT_LANGUAGES[1]); // Malayalam

  // Conversation pair: Person A (Tamil), Person B (Malayalam)
  const [convLangA, setConvLangA] = useState<Language>(DEFAULT_LANGUAGES[0]); // Tamil
  const [convLangB, setConvLangB] = useState<Language>(DEFAULT_LANGUAGES[1]); // Malayalam

  // Modals state
  const [modalType, setModalType] = useState<"source" | "target" | "convA" | "convB" | null>(null);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Fetch languages on mount
  useEffect(() => {
    async function loadLangs() {
      try {
        const fetched = await fetchLanguages();
        if (fetched && fetched.length > 0) {
          setLanguages(fetched);
          // Set initial if not set
          const ta = fetched.find((l) => l.code === "ta");
          const ml = fetched.find((l) => l.code === "ml");
          if (ta) setSourceLang(ta);
          if (ml) setTargetLang(ml);
          if (ta) setConvLangA(ta);
          if (ml) setConvLangB(ml);
        }
      } catch (e) {
        console.warn("Using default languages due to fetch error", e);
      }
    }
    loadLangs();

    // Online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Swap translation languages
  const handleSwapLanguages = () => {
    if (sourceLang.code === "auto") return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  // Preset selected from Home or QuickDemoBar
  const handleSelectPreset = (preset: DemoPreset) => {
    const src = languages.find((l) => l.code === preset.sourceCode);
    const tgt = languages.find((l) => l.code === preset.targetCode);
    if (src) setSourceLang(src);
    if (tgt) setTargetLang(tgt);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenOfflineManager={() => setIsOfflineModalOpen(true)}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden">
        {activeTab === "home" && (
          <HomeView
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenOfflineManager={() => setIsOfflineModalOpen(true)}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {activeTab === "translate" && (
          <VoiceTranslatorView
            languages={languages}
            onOpenSourceModal={() => setModalType("source")}
            onOpenTargetModal={() => setModalType("target")}
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSwapLanguages={handleSwapLanguages}
            onSetSourceLang={setSourceLang}
            onSetTargetLang={setTargetLang}
          />
        )}

        {activeTab === "conversation" && (
          <ConversationView
            languages={languages}
            personALang={convLangA}
            personBLang={convLangB}
            onSelectLangA={() => setModalType("convA")}
            onSelectLangB={() => setModalType("convB")}
          />
        )}

        {activeTab === "learn" && <LearnView languages={languages} />}

        {activeTab === "history" && <HistoryView languages={languages} />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Language Selection Modal */}
      <LanguageSelectModal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        onSelect={(lang) => {
          if (modalType === "source") setSourceLang(lang);
          else if (modalType === "target") setTargetLang(lang as Language);
          else if (modalType === "convA") setConvLangA(lang as Language);
          else if (modalType === "convB") setConvLangB(lang as Language);
        }}
        selectedCode={
          modalType === "source"
            ? sourceLang.code
            : modalType === "target"
            ? targetLang.code
            : modalType === "convA"
            ? convLangA.code
            : convLangB.code
        }
        languages={languages}
        isSourceSelector={modalType === "source"}
        title={
          modalType === "source"
            ? "Select Source Language"
            : modalType === "target"
            ? "Select Target Language"
            : modalType === "convA"
            ? "Select Person A Language"
            : "Select Person B Language"
        }
      />

      {/* Offline Pack Manager Modal */}
      <OfflineManagerModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
