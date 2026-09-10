import {
  Language,
  TranslationResult,
  VernacularLesson,
  TribalLanguageModule,
  BilingualWorksheet,
} from "../types";

function cleanErrorMessage(raw: string): string {
  if (!raw) return "An error occurred. Please try again.";
  try {
    const jsonStart = raw.indexOf("{");
    if (jsonStart !== -1) {
      const parsed = JSON.parse(raw.substring(jsonStart));
      if (parsed && parsed.error && parsed.error.message) {
        if (parsed.error.code === 503 || parsed.error.status === "UNAVAILABLE" || parsed.error.message.includes("high demand")) {
          return "The AI translation model is temporarily experiencing high demand. Please try again in a few moments.";
        }
        return parsed.error.message;
      }
    }
  } catch {
    // Not valid JSON string, continue with string analysis
  }

  if (raw.includes("high demand") || raw.includes("UNAVAILABLE") || raw.includes("503")) {
    return "The AI translation model is temporarily experiencing high demand. Please try again in a few moments.";
  }
  return raw;
}

export async function fetchLanguages(): Promise<Language[]> {
  try {
    const res = await fetch("/api/languages");
    if (!res.ok) throw new Error(`Failed to load languages: ${res.statusText}`);
    const data = await res.json();
    return data.languages || [];
  } catch (err) {
    console.error("fetchLanguages error:", err);
    return getFallbackLanguages();
  }
}

export async function translateText(payload: {
  text: string;
  sourceLang: string;
  targetLang: string;
  mode?: string;
}): Promise<TranslationResult> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(cleanErrorMessage(data.error || "Translation request failed."));
  }

  return {
    id: "tx_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
    originalText: data.originalText,
    detectedSourceLanguage: data.detectedSourceLanguage,
    detectedSourceCode: data.detectedSourceCode,
    detectionConfidence: data.detectionConfidence,
    targetLanguage: data.targetLanguage,
    targetCode: data.targetCode,
    translatedText: data.translatedText,
    romanizedText: data.romanizedText,
    grammarNote: data.grammarNote,
    ttsAvailable: data.ttsAvailable,
    ttsNote: data.ttsNote,
    offlineFallback: data.offlineFallback,
    modelUsed: data.modelUsed,
    timestamp: data.timestamp || new Date().toISOString(),
  };
}

export async function transcribeAudioApi(payload: {
  audioBase64: string;
  mimeType?: string;
  languageHint?: string;
}): Promise<{
  transcript: string;
  noSpeech: boolean;
  detectedLanguage?: string;
  detectedCode?: string;
}> {
  const res = await fetch("/api/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(cleanErrorMessage(data.error || "Speech transcription failed."));
  }

  return {
    transcript: data.transcript || "",
    noSpeech: Boolean(data.noSpeech),
    detectedLanguage: data.detectedLanguage,
    detectedCode: data.detectedCode,
  };
}

export async function generateLesson(payload: {
  classGrade: string;
  subject: string;
  topic: string;
  sourceLang: string;
  targetLang: string;
}): Promise<VernacularLesson> {
  const res = await fetch("/api/learn/generate-lesson", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(cleanErrorMessage(data.error || "Failed to generate vernacular lesson."));
  }

  return {
    ...data.lesson,
    id: "les_" + Date.now(),
    classGrade: payload.classGrade,
    subject: payload.subject,
    topic: payload.topic,
    sourceLang: payload.sourceLang,
    targetLang: payload.targetLang,
    createdAt: new Date().toISOString(),
  };
}

export async function fetchTribalModule(payload: {
  language: string;
  topic: string;
}): Promise<TribalLanguageModule> {
  const res = await fetch("/api/learn/tribal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(cleanErrorMessage(data.error || "Failed to load tribal language module."));
  }

  return data.tribalData;
}

export async function generateWorksheet(payload: {
  classGrade: string;
  subject: string;
  topic: string;
  sourceLang: string;
  targetLang: string;
  difficulty: string;
}): Promise<BilingualWorksheet> {
  const res = await fetch("/api/worksheets/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(cleanErrorMessage(data.error || "Failed to generate worksheet."));
  }

  return {
    ...data.worksheet,
    id: "ws_" + Date.now(),
    classGrade: payload.classGrade,
    subject: payload.subject,
    topic: payload.topic,
    sourceLang: payload.sourceLang,
    targetLang: payload.targetLang,
    difficulty: payload.difficulty,
    createdAt: new Date().toISOString(),
  };
}

export async function transcribeAudio(audioBase64: string, mimeType: string, languageHint?: string): Promise<string> {
  const res = await fetch("/api/transcribe-audio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64, mimeType, languageHint }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Speech transcription failed.");
  }

  return data.text || "";
}

function getFallbackLanguages(): Language[] {
  return [
    { code: "ta", name: "Tamil", nativeName: "தமிழ்", category: "TAMIL_NADU", speechSupport: true, translationSupport: true, ttsSupport: true, speechCode: "ta-IN" },
    { code: "ml", name: "Malayalam", nativeName: "മലയാളം", category: "TAMIL_NADU", speechSupport: true, translationSupport: true, ttsSupport: true, speechCode: "ml-IN" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు", category: "TAMIL_NADU", speechSupport: true, translationSupport: true, ttsSupport: true, speechCode: "te-IN" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", category: "TAMIL_NADU", speechSupport: true, translationSupport: true, ttsSupport: true, speechCode: "kn-IN" },
    { code: "ur", name: "Urdu", nativeName: "اُردُو", category: "TAMIL_NADU", speechSupport: true, translationSupport: true, ttsSupport: true, speechCode: "ur-IN" },
    { code: "en", name: "English", nativeName: "English", category: "POPULAR", speechSupport: true, translationSupport: true, ttsSupport: true, speechCode: "en-IN" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी", category: "POPULAR", speechSupport: true, translationSupport: true, ttsSupport: true, speechCode: "hi-IN" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা", category: "INDIAN", speechSupport: true, translationSupport: true, ttsSupport: true, speechCode: "bn-IN" },
    { code: "mr", name: "Marathi", nativeName: "मराठी", category: "INDIAN", speechSupport: true, translationSupport: true, ttsSupport: true, speechCode: "mr-IN" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", category: "INDIAN", speechSupport: true, translationSupport: true, ttsSupport: true, speechCode: "gu-IN" },
    { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", category: "INDIAN", speechSupport: true, translationSupport: true, ttsSupport: false, ttsNote: "Voice output is currently unavailable for this language.", speechCode: "or-IN" },
    { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", category: "INDIAN", speechSupport: true, translationSupport: true, ttsSupport: true, speechCode: "pa-IN" },
    { code: "as", name: "Assamese", nativeName: "অসমীয়া", category: "INDIAN", speechSupport: true, translationSupport: true, ttsSupport: false, ttsNote: "Voice output is currently unavailable for this language.", speechCode: "as-IN" },
    { code: "sat", name: "Santhali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ / Santhali", category: "TRIBAL", speechSupport: false, translationSupport: true, ttsSupport: false, ttsNote: "Text translation with authentic Ol Chiki (ᱥᱟᱱᱛᱟᱲᱤ) script & phonetic guide available. Voice output currently in linguistic development." },
    { code: "unr", name: "Mundari", nativeName: "ᱢᱩᱱᱰᱟᱨᱤ / Mundari", category: "TRIBAL", speechSupport: false, translationSupport: true, ttsSupport: false, ttsNote: "Text translation is available. Voice output is currently unavailable for this language." },
    { code: "iru", name: "Irula", nativeName: "இருளா / Irula", category: "TRIBAL", speechSupport: false, translationSupport: true, ttsSupport: false, ttsNote: "Text translation is available. Voice output is currently unavailable for this language." },
    { code: "tcx", name: "Toda", nativeName: "தோடா / Toda", category: "TRIBAL", speechSupport: false, translationSupport: false, ttsSupport: false, ttsNote: "Linguistic documentation in progress. Translation model currently unavailable." },
    { code: "kfe", name: "Kota", nativeName: "கோத்தா / Kota", category: "TRIBAL", speechSupport: false, translationSupport: false, ttsSupport: false, ttsNote: "Linguistic documentation in progress. Translation model currently unavailable." },
    { code: "kfi", name: "Kurumba", nativeName: "குறும்பா / Kurumba", category: "TRIBAL", speechSupport: false, translationSupport: false, ttsSupport: false, ttsNote: "Linguistic documentation in progress. Translation model currently unavailable." },
    { code: "bfq", name: "Badaga", nativeName: "படகா / Badaga", category: "TRIBAL", speechSupport: false, translationSupport: true, ttsSupport: false, ttsNote: "Text translation is available. Voice output is currently unavailable for this language." },
  ];
}
