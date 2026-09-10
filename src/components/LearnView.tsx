import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  FileText,
  Bookmark,
  Sparkles,
  Printer,
  Download,
  CheckCircle2,
  Volume2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Languages,
  Check,
  FolderDown,
  Trash2,
} from "lucide-react";
import {
  Language,
  VernacularLesson,
  TribalLanguageModule,
  BilingualWorksheet,
} from "../types";
import {
  generateLesson,
  fetchTribalModule,
  generateWorksheet,
} from "../services/api";
import { audioService } from "../services/audio";
import { storageService } from "../services/storage";

interface LearnViewProps {
  languages: Language[];
}

type LearnSubTab = "vernacular" | "tribal" | "worksheets" | "offline";

export const LearnView: React.FC<LearnViewProps> = ({ languages }) => {
  const [activeSubTab, setActiveSubTab] = useState<LearnSubTab>("vernacular");

  // Vernacular Module State
  const [vClass, setVClass] = useState("Class 3");
  const [vSubject, setVSubject] = useState("Science");
  const [vTopic, setVTopic] = useState("Parts of a Plant");
  const [vSourceLang, setVSourceLang] = useState("Tamil");
  const [vTargetLang, setVTargetLang] = useState("Malayalam");
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [lesson, setLesson] = useState<VernacularLesson | null>(null);
  const [lessonSaved, setLessonSaved] = useState(false);

  // Tribal Module State
  const [tLanguage, setTLanguage] = useState("Mundari");
  const [tTopic, setTTopic] = useState("Basic Greetings & Daily Life");
  const [isLoadingTribal, setIsLoadingTribal] = useState(false);
  const [tribalData, setTribalData] = useState<TribalLanguageModule | null>(null);

  // Worksheet Generator State
  const [wClass, setWClass] = useState("Class 4");
  const [wSubject, setWSubject] = useState("Environmental Science");
  const [wTopic, setWTopic] = useState("Water Cycle and Conservation");
  const [wSourceLang, setWSourceLang] = useState("Tamil");
  const [wTargetLang, setWTargetLang] = useState("Malayalam");
  const [wDifficulty, setWDifficulty] = useState("Medium");
  const [isGeneratingWorksheet, setIsGeneratingWorksheet] = useState(false);
  const [worksheet, setWorksheet] = useState<BilingualWorksheet | null>(null);
  const [worksheetSaved, setWorksheetSaved] = useState(false);

  // Offline Saved State
  const [savedLessons, setSavedLessons] = useState<VernacularLesson[]>(() =>
    storageService.getSavedLessons()
  );
  const [savedWorksheets, setSavedWorksheets] = useState<BilingualWorksheet[]>(() =>
    storageService.getSavedWorksheets()
  );

  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Generate Vernacular Lesson
  const handleGenerateLesson = async () => {
    setIsGeneratingLesson(true);
    setErrorBanner(null);
    try {
      const res = await generateLesson({
        classGrade: vClass,
        subject: vSubject,
        topic: vTopic,
        sourceLang: vSourceLang,
        targetLang: vTargetLang,
      });
      setLesson(res);
      setLessonSaved(false);
    } catch (err: any) {
      setErrorBanner(err.message || "Failed to generate vernacular lesson.");
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const handleSaveLesson = () => {
    if (!lesson) return;
    storageService.saveLesson(lesson);
    setLessonSaved(true);
    setSavedLessons(storageService.getSavedLessons());
  };

  // Load Tribal Language Module
  const handleLoadTribal = async () => {
    setIsLoadingTribal(true);
    setErrorBanner(null);
    try {
      const res = await fetchTribalModule({
        language: tLanguage,
        topic: tTopic,
      });
      setTribalData(res);
    } catch (err: any) {
      setErrorBanner(err.message || "Failed to load tribal module.");
    } finally {
      setIsLoadingTribal(false);
    }
  };

  // Generate Worksheet
  const handleGenerateWorksheet = async () => {
    setIsGeneratingWorksheet(true);
    setErrorBanner(null);
    try {
      const res = await generateWorksheet({
        classGrade: wClass,
        subject: wSubject,
        topic: wTopic,
        sourceLang: wSourceLang,
        targetLang: wTargetLang,
        difficulty: wDifficulty,
      });
      setWorksheet(res);
      setWorksheetSaved(false);
    } catch (err: any) {
      setErrorBanner(err.message || "Failed to generate worksheet.");
    } finally {
      setIsGeneratingWorksheet(false);
    }
  };

  const handleSaveWorksheet = () => {
    if (!worksheet) return;
    storageService.saveWorksheet(worksheet);
    setWorksheetSaved(true);
    setSavedWorksheets(storageService.getSavedWorksheets());
  };

  const handlePrintWorksheet = () => {
    window.print();
  };

  const playTermAudio = (text: string, langName: string) => {
    const lang = languages.find(
      (l) => l.name.toLowerCase() === langName.toLowerCase()
    );
    if (lang && !lang.ttsSupport) {
      setErrorBanner(`Voice output is unavailable for ${lang.name}.`);
      return;
    }
    audioService.speakText({
      text,
      languageCode: lang?.code || "ta",
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 space-y-4 pb-28">
      {/* Module Title Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              AI Vernacular Learning & Worksheets
            </h2>
            <p className="text-xs text-slate-400">
              Bilingual pedagogy for Tamil Nadu, regional, and indigenous languages
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-slate-800 text-xs">
          <button
            id="subtab-vernacular"
            onClick={() => setActiveSubTab("vernacular")}
            className={`py-2 px-1 rounded-xl font-medium text-center transition-colors truncate ${
              activeSubTab === "vernacular"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-950 text-slate-400 hover:text-slate-200"
            }`}
          >
            Vernacular
          </button>
          <button
            id="subtab-tribal"
            onClick={() => setActiveSubTab("tribal")}
            className={`py-2 px-1 rounded-xl font-medium text-center transition-colors truncate ${
              activeSubTab === "tribal"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-950 text-slate-400 hover:text-slate-200"
            }`}
          >
            Tribal
          </button>
          <button
            id="subtab-worksheets"
            onClick={() => setActiveSubTab("worksheets")}
            className={`py-2 px-1 rounded-xl font-medium text-center transition-colors truncate ${
              activeSubTab === "worksheets"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-950 text-slate-400 hover:text-slate-200"
            }`}
          >
            Worksheets
          </button>
          <button
            id="subtab-offline"
            onClick={() => setActiveSubTab("offline")}
            className={`py-2 px-1 rounded-xl font-medium text-center transition-colors truncate ${
              activeSubTab === "offline"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                : "bg-slate-950 text-slate-400 hover:text-slate-200"
            }`}
          >
            Saved ({savedLessons.length + savedWorksheets.length})
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {errorBanner && (
        <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2 flex-1">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-tight">{errorBanner}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={() => {
                if (activeSubTab === "vernacular") handleGenerateLesson();
                else if (activeSubTab === "tribal") handleLoadTribal();
                else if (activeSubTab === "worksheets") handleGenerateWorksheet();
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-[11px]"
            >
              Retry
            </button>
            <button onClick={() => setErrorBanner(null)} className="text-rose-400 hover:text-white text-xs px-1">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: AI VERNACULAR LEARNING */}
      {activeSubTab === "vernacular" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Configure Bilingual Lesson
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Class / Grade
                </label>
                <select
                  value={vClass}
                  onChange={(e) => setVClass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>Class 1</option>
                  <option>Class 2</option>
                  <option>Class 3</option>
                  <option>Class 4</option>
                  <option>Class 5</option>
                  <option>Class 6</option>
                  <option>Class 7</option>
                  <option>Class 8</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Subject
                </label>
                <select
                  value={vSubject}
                  onChange={(e) => setVSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>Science</option>
                  <option>Mathematics</option>
                  <option>Social Studies</option>
                  <option>Environmental Science</option>
                  <option>Health & Hygiene</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                Topic
              </label>
              <input
                type="text"
                value={vTopic}
                onChange={(e) => setVTopic(e.target.value)}
                placeholder="e.g. Parts of a Plant, Solar System, Water Cycle..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Source Language (Primary)
                </label>
                <select
                  value={vSourceLang}
                  onChange={(e) => setVSourceLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>Tamil</option>
                  <option>Malayalam</option>
                  <option>Telugu</option>
                  <option>Kannada</option>
                  <option>Urdu</option>
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Target Language (Bridge)
                </label>
                <select
                  value={vTargetLang}
                  onChange={(e) => setVTargetLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>Malayalam</option>
                  <option>Tamil</option>
                  <option>Telugu</option>
                  <option>Kannada</option>
                  <option>Hindi</option>
                  <option>English</option>
                </select>
              </div>
            </div>

            <button
              id="btn-generate-lesson"
              onClick={handleGenerateLesson}
              disabled={isGeneratingLesson || !vTopic.trim()}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isGeneratingLesson ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating Bilingual Lesson...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Vernacular Lesson</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Lesson Display */}
          {lesson && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {lesson.classGrade} • {lesson.subject}
                  </span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Bilingual: {lesson.sourceLang} ↔ {lesson.targetLang}
                  </p>
                </div>

                <button
                  id="btn-save-lesson-offline"
                  onClick={handleSaveLesson}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    lessonSaved
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                  }`}
                >
                  {lessonSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved Offline</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Save Offline</span>
                    </>
                  )}
                </button>
              </div>

              {/* 1. Learning Objective */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  1. Learning Objective
                </h4>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1 text-xs">
                  <p className="text-slate-200">
                    <span className="text-slate-400 font-semibold">{lesson.sourceLang}:</span>{" "}
                    {lesson.learningObjective.source}
                  </p>
                  <p className="text-emerald-300">
                    <span className="text-slate-400 font-semibold">{lesson.targetLang}:</span>{" "}
                    {lesson.learningObjective.target}
                  </p>
                  <p className="text-slate-400 text-[11px] italic">
                    English: {lesson.learningObjective.english}
                  </p>
                </div>
              </div>

              {/* 2. Conceptual Explanation */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  2. Conceptual Explanation
                </h4>
                <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">
                      {lesson.sourceLang} Version:
                    </div>
                    <p className="text-slate-100 font-medium leading-relaxed mt-0.5">
                      {lesson.explanation.source}
                    </p>
                  </div>
                  <div className="h-px bg-slate-800" />
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase">
                      {lesson.targetLang} Version:
                    </div>
                    <p className="text-emerald-200 font-medium leading-relaxed mt-0.5">
                      {lesson.explanation.target}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Bilingual Vocabulary */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  3. Key Vocabulary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {lesson.vocabulary.map((v, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-200">
                          {v.termSource} <span className="text-slate-500">→</span>{" "}
                          <span className="text-emerald-400">{v.termTarget}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {v.meaningEnglish} ({v.pronunciation})
                        </div>
                      </div>
                      <button
                        onClick={() => playTermAudio(v.termTarget, lesson.targetLang)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Listen target term"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Real-world Examples */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  4. Bilingual Contextual Examples
                </h4>
                <div className="space-y-2">
                  {lesson.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1"
                    >
                      <p className="text-slate-200 font-medium">"{ex.sourceSentence}"</p>
                      <p className="text-emerald-300 font-bold">"{ex.targetSentence}"</p>
                      <p className="text-[11px] text-slate-400 italic">
                        {ex.englishSentence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Activities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block mb-1">
                    Teacher Activity
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {lesson.teacherActivity}
                  </p>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    Student Activity
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {lesson.studentActivity}
                  </p>
                </div>
              </div>

              {/* 6. Assessment */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  6. Comprehension Assessment
                </h4>
                <div className="space-y-2">
                  {lesson.assessment.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1.5"
                    >
                      <div className="font-semibold text-slate-200">
                        {i + 1}. {item.question}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 pl-2">
                        {item.options.map((opt, oi) => (
                          <div key={oi}>• {opt}</div>
                        ))}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-medium pt-1 border-t border-slate-800/80">
                        Answer: {item.answer} ({item.explanation})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRIBAL LANGUAGE LEARNING */}
      {activeSubTab === "tribal" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Tribal & Indigenous Language Learning
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Dedicated repository for genuine tribal languages (Santhali, Mundari, Irula, Toda, Badaga). Never fabricated.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Tribal Language
                </label>
                <select
                  value={tLanguage}
                  onChange={(e) => setTLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Santhali">Santhali / Santali (Ol Chiki • ᱥᱟᱱᱛᱟᱲᱤ)</option>
                  <option value="Mundari">Mundari (Austroasiatic Munda)</option>
                  <option value="Irula">Irula (Nilgiris Indigenous Dravidian)</option>
                  <option value="Badaga">Badaga (Nilgiris Indigenous)</option>
                  <option value="Toda">Toda (Linguistic Archive)</option>
                  <option value="Kota">Kota (Linguistic Archive)</option>
                  <option value="Kurumba">Kurumba (Linguistic Archive)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Topic
                </label>
                <select
                  value={tTopic}
                  onChange={(e) => setTTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>Basic Greetings & Johar</option>
                  <option>Ol Chiki Script & Common Words</option>
                  <option>Family & Community Words</option>
                  <option>Nature, Forest & Animals (Bir Buru)</option>
                  <option>Daily Conversations</option>
                </select>
              </div>
            </div>

            <button
              id="btn-load-tribal-module"
              onClick={handleLoadTribal}
              disabled={isLoadingTribal}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoadingTribal ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Loading Indigenous Module...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>Explore {tLanguage} Learning Module</span>
                </>
              )}
            </button>
          </div>

          {/* Tribal Data Card */}
          {tribalData && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-100">
                      {tribalData.language}
                    </h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                      {tribalData.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Script: {tribalData.script} • {tribalData.linguisticNote}
                  </p>
                </div>
              </div>

              {/* Explicit Limitation Notice mandated by Prompt */}
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">
                    Voice Limitation Notice:
                  </span>{" "}
                  {tribalData.audioAvailability}
                </div>
              </div>

              {/* Phrases */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Core Phrases & Greetings
                </h4>
                <div className="space-y-2">
                  {tribalData.greetingsAndPhrases.map((phrase, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-emerald-300">
                          {phrase.indigenousPhrase}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          [{phrase.phoneticGuide}]
                        </span>
                      </div>
                      <div className="text-slate-200">
                        Meaning: <span className="font-semibold">{phrase.englishMeaning}</span>
                      </div>
                      {phrase.tamilEquivalent && (
                        <div className="text-[11px] text-teal-400">
                          Tamil: {phrase.tamilEquivalent}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 italic mt-0.5">
                        Context: {phrase.culturalContext}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocabulary */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Authentic Vocabulary
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {tribalData.vocabularyList.map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl"
                    >
                      <div className="font-bold text-slate-100">
                        {item.word}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        Phonetic: {item.phonetic}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.meaning}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dialogue */}
              {tribalData.practiceDialogue.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Interactive Dialogue Practice
                  </h4>
                  <div className="space-y-2">
                    {tribalData.practiceDialogue.map((d, i) => (
                      <div
                        key={i}
                        className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs"
                      >
                        <span className="font-bold text-amber-400">{d.speaker}:</span>{" "}
                        <span className="font-bold text-slate-200">{d.indigenousText}</span>{" "}
                        <span className="text-slate-400">({d.phonetic})</span>
                        <div className="text-[11px] text-emerald-400 mt-0.5 pl-3">
                          → {d.translation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BILINGUAL WORKSHEET GENERATOR */}
      {activeSubTab === "worksheets" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Bilingual Worksheet Generator
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Class / Grade
                </label>
                <select
                  value={wClass}
                  onChange={(e) => setWClass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>Class 3</option>
                  <option>Class 4</option>
                  <option>Class 5</option>
                  <option>Class 6</option>
                  <option>Class 7</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Difficulty
                </label>
                <select
                  value={wDifficulty}
                  onChange={(e) => setWDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                Topic
              </label>
              <input
                type="text"
                value={wTopic}
                onChange={(e) => setWTopic(e.target.value)}
                placeholder="e.g. Water Conservation, Solar System, Farm Animals..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Source Language
                </label>
                <select
                  value={wSourceLang}
                  onChange={(e) => setWSourceLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>Tamil</option>
                  <option>Malayalam</option>
                  <option>Telugu</option>
                  <option>Kannada</option>
                  <option>English</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Target Language
                </label>
                <select
                  value={wTargetLang}
                  onChange={(e) => setWTargetLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option>Malayalam</option>
                  <option>Tamil</option>
                  <option>Telugu</option>
                  <option>Kannada</option>
                  <option>English</option>
                </select>
              </div>
            </div>

            <button
              id="btn-generate-worksheet"
              onClick={handleGenerateWorksheet}
              disabled={isGeneratingWorksheet || !wTopic.trim()}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isGeneratingWorksheet ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating Worksheet...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generate Bilingual Worksheet</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Worksheet Card */}
          {worksheet && (
            <div
              id="printable-worksheet"
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 print:bg-white print:text-black print:border-none"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 print:text-black">
                    {worksheet.worksheetTitle}
                  </h3>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    {worksheet.gradeAndSubject} • Bilingual: {worksheet.sourceLang} ↔ {worksheet.targetLang}
                  </p>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={handlePrintWorksheet}
                    className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                    title="Print / Export PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleSaveWorksheet}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      worksheetSaved
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {worksheetSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Student Header */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400 print:bg-slate-50 print:text-black">
                <div>Student Name: ____________</div>
                <div>Date: ____________</div>
                <div>Score: _____ / 20</div>
              </div>

              {/* Section A: Vocabulary */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider print:text-black">
                  Section A: Vocabulary Focus
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {worksheet.vocabularySection.map((item, i) => (
                    <div
                      key={i}
                      className="p-2 bg-slate-950/60 border border-slate-800 rounded-lg print:border-slate-300 print:bg-white"
                    >
                      <span className="font-bold text-slate-200 print:text-black">
                        {item.sourceWord}
                      </span>{" "}
                      = <span className="text-emerald-400 print:text-slate-800">{item.targetWord}</span>{" "}
                      <span className="text-slate-400">({item.meaning})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section B: Matching */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider print:text-black">
                  Section B: Match Column A with Column B
                </h4>
                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs print:bg-white print:border-slate-300">
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-400">Column A ({worksheet.sourceLang})</span>
                    {worksheet.matchingSection.columnA.map((item, i) => (
                      <div key={i} className="text-slate-200 print:text-black">
                        {i + 1}. {item}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-400">Column B ({worksheet.targetLang})</span>
                    {worksheet.matchingSection.columnB.map((item, i) => (
                      <div key={i} className="text-slate-200 print:text-black">
                        {String.fromCharCode(65 + i)}. {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section C: Fill in the blanks */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider print:text-black">
                  Section C: Fill in the Blanks
                </h4>
                <div className="space-y-2 text-xs">
                  {worksheet.fillInBlanks.map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 print:bg-white print:text-black"
                    >
                      {i + 1}. {item.sentence}{" "}
                      <span className="text-[10px] text-slate-400 italic">
                        (Hint: {item.hint})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section D: Multiple Choice */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider print:text-black">
                  Section D: Multiple Choice
                </h4>
                <div className="space-y-2 text-xs">
                  {worksheet.multipleChoice.map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 print:bg-white print:text-black"
                    >
                      <div className="font-semibold text-slate-200 print:text-black">
                        {i + 1}. {item.question}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 print:text-slate-700 pl-2">
                        {item.options.map((opt, oi) => (
                          <div key={oi}>
                            [ ] {String.fromCharCode(97 + oi)}) {opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section E: Simple Questions & Activity */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider print:text-black">
                  Section E: Hands-on Activity Prompt
                </h4>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 print:bg-white print:text-black">
                  {worksheet.creativeActivity}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SAVED OFFLINE CONTENT */}
      {activeSubTab === "offline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FolderDown className="w-4 h-4 text-emerald-400" />
              Saved Lessons & Worksheets
            </h3>
            <span className="text-xs text-slate-400">
              Offline Cache Ready
            </span>
          </div>

          {savedLessons.length === 0 && savedWorksheets.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">
                No Offline Material Saved Yet
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Generate a bilingual lesson or worksheet above and tap "Save Offline" to access it without internet.
              </p>
            </div>
          )}

          {/* Saved Lessons List */}
          {savedLessons.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Saved Lessons ({savedLessons.length})
              </span>
              {savedLessons.map((l) => (
                <div
                  key={l.id}
                  className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">
                      {l.classGrade} • {l.subject}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                      {l.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {l.sourceLang} ↔ {l.targetLang}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setLesson(l);
                        setActiveSubTab("vernacular");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        if (l.id) {
                          storageService.deleteLesson(l.id);
                          setSavedLessons(storageService.getSavedLessons());
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Saved Worksheets List */}
          {savedWorksheets.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">
                Saved Worksheets ({savedWorksheets.length})
              </span>
              {savedWorksheets.map((w) => (
                <div
                  key={w.id}
                  className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-teal-400 uppercase">
                      {w.gradeAndSubject}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100 mt-0.5">
                      {w.worksheetTitle}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {w.sourceLang} ↔ {w.targetLang} • Difficulty: {w.difficulty}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setWorksheet(w);
                        setActiveSubTab("worksheets");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        if (w.id) {
                          storageService.deleteWorksheet(w.id);
                          setSavedWorksheets(storageService.getSavedWorksheets());
                        }
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
