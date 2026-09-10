import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { generateWithFallbackAndRetry, parseJsonSafe, getGeminiClient, transcribeAudioWithGemini } from "./server/geminiService";
import { findOfflineTranslation } from "./server/offlineDictionary";

dotenv.config();

const PORT = 3000;

// Language metadata catalog
export interface LanguageMeta {
  code: string;
  name: string;
  nativeName: string;
  category: "POPULAR" | "TAMIL_NADU" | "INDIAN" | "TRIBAL";
  speechSupport: boolean;
  translationSupport: boolean;
  ttsSupport: boolean;
  ttsNote?: string;
  speechCode?: string; // BCP 47 code for Web Speech API
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  // Tamil Nadu Languages (Special focus)
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    category: "TAMIL_NADU",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: true,
    speechCode: "ta-IN",
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    category: "TAMIL_NADU",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: true,
    speechCode: "ml-IN",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    category: "TAMIL_NADU",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: true,
    speechCode: "te-IN",
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    category: "TAMIL_NADU",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: true,
    speechCode: "kn-IN",
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اُردُو",
    category: "TAMIL_NADU",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: true,
    speechCode: "ur-IN",
  },

  // Popular
  {
    code: "en",
    name: "English",
    nativeName: "English",
    category: "POPULAR",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: true,
    speechCode: "en-IN",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    category: "POPULAR",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: true,
    speechCode: "hi-IN",
  },

  // Indian Languages
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    category: "INDIAN",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: true,
    speechCode: "bn-IN",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    category: "INDIAN",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: true,
    speechCode: "mr-IN",
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    category: "INDIAN",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: true,
    speechCode: "gu-IN",
  },
  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    category: "INDIAN",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: false,
    ttsNote: "Voice output is currently unavailable for this language.",
    speechCode: "or-IN",
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    category: "INDIAN",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: true,
    speechCode: "pa-IN",
  },
  {
    code: "as",
    name: "Assamese",
    nativeName: "অসমীয়া",
    category: "INDIAN",
    speechSupport: true,
    translationSupport: true,
    ttsSupport: false,
    ttsNote: "Voice output is currently unavailable for this language.",
    speechCode: "as-IN",
  },

  // Tribal / Indigenous Languages
  {
    code: "sat",
    name: "Santhali",
    nativeName: "ᱥᱟᱱᱛᱟᱲᱤ / Santhali",
    category: "TRIBAL",
    speechSupport: false,
    translationSupport: true,
    ttsSupport: false,
    ttsNote: "Text translation with authentic Ol Chiki (ᱥᱟᱱᱛᱟᱲᱤ) script & phonetic guide available. Voice output currently in linguistic development.",
  },
  {
    code: "unr",
    name: "Mundari",
    nativeName: "ᱢᱩᱱᱰᱟᱨᱤ / Mundari",
    category: "TRIBAL",
    speechSupport: false,
    translationSupport: true,
    ttsSupport: false,
    ttsNote: "Text translation is available. Voice output is currently unavailable for this language.",
  },
  {
    code: "iru",
    name: "Irula",
    nativeName: "இருளா / Irula",
    category: "TRIBAL",
    speechSupport: false,
    translationSupport: true,
    ttsSupport: false,
    ttsNote: "Text translation is available. Voice output is currently unavailable for this language.",
  },
  {
    code: "tcx",
    name: "Toda",
    nativeName: "தோடா / Toda",
    category: "TRIBAL",
    speechSupport: false,
    translationSupport: false,
    ttsSupport: false,
    ttsNote: "Linguistic documentation in progress. Translation model currently unavailable.",
  },
  {
    code: "kfe",
    name: "Kota",
    nativeName: "கோத்தா / Kota",
    category: "TRIBAL",
    speechSupport: false,
    translationSupport: false,
    ttsSupport: false,
    ttsNote: "Linguistic documentation in progress. Translation model currently unavailable.",
  },
  {
    code: "kfi",
    name: "Kurumba",
    nativeName: "குறும்பா / Kurumba",
    category: "TRIBAL",
    speechSupport: false,
    translationSupport: false,
    ttsSupport: false,
    ttsNote: "Linguistic documentation in progress. Translation model currently unavailable.",
  },
  {
    code: "bfq",
    name: "Badaga",
    nativeName: "படகா / Badaga",
    category: "TRIBAL",
    speechSupport: false,
    translationSupport: true,
    ttsSupport: false,
    ttsNote: "Text translation is available. Voice output is currently unavailable for this language.",
  },
];

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // API 1: Languages Catalog
  app.get("/api/languages", (_req, res) => {
    res.json({
      success: true,
      languages: SUPPORTED_LANGUAGES,
    });
  });

  // API 2: Health Check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      name: "APV",
      engine: "Vernacular Indic Translation Core",
      timestamp: new Date().toISOString(),
    });
  });

  // API 2.5: Real-Time Speech-to-Text Transcription
  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audioBase64, mimeType, languageHint } = req.body;

      if (!audioBase64 || typeof audioBase64 !== "string") {
        return res.status(400).json({
          success: false,
          error: "Valid audio data is required for transcription.",
        });
      }

      const result = await transcribeAudioWithGemini({
        audioBase64,
        mimeType: mimeType || "audio/webm",
        languageHint: languageHint || "Auto-detect",
      });

      return res.json({
        success: true,
        transcript: result.transcript,
        noSpeech: result.noSpeech,
        detectedLanguage: result.detectedLanguage,
        detectedCode: result.detectedCode,
        confidence: result.confidence,
      });
    } catch (err: any) {
      console.error("[APV Transcribe Error]:", err?.message || err);
      return res.status(500).json({
        success: false,
        error: err?.message || "Failed to transcribe microphone audio.",
      });
    }
  });

  // API 3: Real-Time Context-Aware Translation
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, sourceLang, targetLang, mode } = req.body;

      if (!text || typeof text !== "string" || !text.trim()) {
        return res.status(400).json({ error: "Text to translate is required." });
      }

      const cleanText = text.trim();
      const isAuto = !sourceLang || sourceLang === "auto" || sourceLang.toLowerCase() === "auto detect";

      const targetMeta = SUPPORTED_LANGUAGES.find(
        (l) => l.code === targetLang || l.name.toLowerCase() === (targetLang || "").toLowerCase()
      );

      const sourceMeta = isAuto
        ? null
        : SUPPORTED_LANGUAGES.find(
            (l) => l.code === sourceLang || l.name.toLowerCase() === (sourceLang || "").toLowerCase()
          );

      // Check if target language translation is supported
      if (targetMeta && !targetMeta.translationSupport) {
        return res.status(400).json({
          error: `Translation is currently unavailable for ${targetMeta.name}. Linguistic documentation is still in progress.`,
          unsupported: true,
        });
      }

      if (sourceMeta && !sourceMeta.translationSupport) {
        return res.status(400).json({
          error: `Translation is currently unavailable for source language ${sourceMeta.name}.`,
          unsupported: true,
        });
      }

      const ai = getGeminiClient();

      const systemPrompt = `You are the core translation engine of APV (AI-Powered Vernacular Voice Translation & Learning Assistant).
Your primary specialization is Indian regional languages, particularly Tamil Nadu Dravidian languages (Tamil, Malayalam, Telugu, Kannada, Urdu), pan-Indian vernaculars, and indigenous tribal languages (such as Santhali, Mundari, Irula, Badaga).

CRITICAL TRANSLATION RULES:
1. Provide accurate, natural, context-aware vernacular translations. Do NOT default to Hindi or assume Hindi focus.
2. For Tamil -> Malayalam, capture native colloquial and formal nuances perfectly (e.g. "நான் இன்று பள்ளிக்கு செல்கிறேன்." translates naturally into Malayalam as "ഞാൻ ഇന്ന് സ്കൂളിലേക്ക് പോകുന്നു.").
3. For Santhali (Santali / ᱥᱟᱱᱛᱟᱲᱤ), provide authentic native translation using the official Ol Chiki script (ᱚᱞ ᱪᱤᱠᱤ), accompanied by Romanized phonetic pronunciation (e.g. "Johar" for greeting, "Sarhaw" for thank you, "Chet leka menama?" for how are you).
4. For other Tribal languages like Mundari, use genuine Munda vocabulary and morphology. If the sentence cannot be reliably translated with authentic linguistic integrity, clearly say so instead of hallucinating. NEVER generate fake translations.
5. Auto-detect the source language if requested. Detect whether it is Tamil, Malayalam, Telugu, Kannada, Hindi, English, Santhali, etc., with a confidence score between 0.0 and 1.0.
5. Provide:
   - detectedSourceLanguage (Name e.g. "Tamil", "Malayalam")
   - detectedSourceCode (ISO/BCP code e.g. "ta", "ml")
   - detectionConfidence (0.0 to 1.0)
   - targetLanguage (Name e.g. "Malayalam")
   - targetCode (Code e.g. "ml")
   - translatedText (Pure translated text in native script, clean and ready for TTS)
   - romanizedText (English transliteration to help user pronounce it)
   - grammarNote (Brief 1-sentence note on tense or grammatical context)
6. Output MUST strictly be valid JSON adhering to the specified format.`;

      const prompt = `Translate the following user input:
Input Text: "${cleanText}"
Source Language Request: ${isAuto ? "AUTO DETECT" : sourceMeta ? sourceMeta.name : sourceLang}
Target Language Request: ${targetMeta ? targetMeta.name : targetLang || "Tamil"}
Mode: ${mode || "conversational"}`;

      let parsed: any = null;
      let usedOfflineEngine = false;
      let modelUsed = "gemini-3.8-flash";

      // Check verified offline linguistic dictionary
      const offlineMatch = findOfflineTranslation(
        cleanText,
        sourceMeta ? sourceMeta.code : sourceLang || "",
        targetMeta ? targetMeta.code : targetLang || ""
      );

      try {
        const genResult = await generateWithFallbackAndRetry({
          prompt,
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.2,
        });

        modelUsed = genResult.modelUsed;
        parsed = parseJsonSafe(genResult.text, null);
        if (!parsed || !parsed.translatedText) {
          throw new Error("Could not parse structured translation response");
        }
      } catch (cloudErr: any) {
        console.warn("[APV Translation] Cloud models encountered:", cloudErr?.message);
        if (offlineMatch) {
          console.log("[APV Translation] Serving verified offline vernacular translation for:", cleanText);
          parsed = {
            detectedSourceLanguage: sourceMeta ? sourceMeta.name : (offlineMatch.sourceLang === "ta" ? "Tamil" : "Auto"),
            detectedSourceCode: sourceMeta ? sourceMeta.code : offlineMatch.sourceLang,
            detectionConfidence: 1.0,
            targetLanguage: targetMeta ? targetMeta.name : (offlineMatch.targetLang === "ml" ? "Malayalam" : targetLang),
            targetCode: targetMeta ? targetMeta.code : offlineMatch.targetLang,
            translatedText: offlineMatch.translatedText,
            romanizedText: offlineMatch.romanizedText,
            grammarNote: offlineMatch.grammarNote + " (Verified vernacular linguistic engine)",
          };
          usedOfflineEngine = true;
          modelUsed = "offline-vernacular-engine";
        } else {
          return res.status(cloudErr.isHighDemand ? 503 : 500).json({
            error: cloudErr.message || "Translation is temporarily experiencing high demand. Please try again in a few moments.",
            isHighDemand: true,
          });
        }
      }

      // Check TTS availability for the target language
      const targetLangName = parsed.targetLanguage || (targetMeta ? targetMeta.name : "Unknown");
      const matchedTarget = SUPPORTED_LANGUAGES.find(
        (l) => l.name.toLowerCase() === targetLangName.toLowerCase() || l.code === (parsed.targetCode || targetLang)
      );

      const ttsAvailable = matchedTarget ? matchedTarget.ttsSupport : false;
      const ttsNote = !ttsAvailable
        ? matchedTarget?.ttsNote || "Voice output is currently unavailable for this language."
        : null;

      res.json({
        success: true,
        originalText: cleanText,
        detectedSourceLanguage: parsed.detectedSourceLanguage || (sourceMeta ? sourceMeta.name : "Auto"),
        detectedSourceCode: parsed.detectedSourceCode || (sourceMeta ? sourceMeta.code : "auto"),
        detectionConfidence: parsed.detectionConfidence ?? 0.95,
        targetLanguage: targetLangName,
        targetCode: parsed.targetCode || (targetMeta ? targetMeta.code : targetLang),
        translatedText: parsed.translatedText || "",
        romanizedText: parsed.romanizedText || "",
        grammarNote: parsed.grammarNote || "",
        ttsAvailable,
        ttsNote,
        speechCode: matchedTarget?.speechCode || null,
        offlineFallback: usedOfflineEngine,
        modelUsed,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("Translation error:", err);
      res.status(500).json({
        error: err.message || "Failed to process translation. Please check connection and try again.",
      });
    }
  });

  // API 4: Vernacular Learning Module Generation
  app.post("/api/learn/generate-lesson", async (req, res) => {
    try {
      const { classGrade, subject, topic, sourceLang, targetLang } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required for generating vernacular learning material." });
      }

      const prompt = `Generate a comprehensive bilingual vernacular educational lesson for students in Tamil Nadu and Indian regional schools.
Target Parameters:
- Class/Grade: ${classGrade || "Class 3"}
- Subject: ${subject || "Science"}
- Topic: ${topic}
- Source Language (Teaching/Primary): ${sourceLang || "Tamil"}
- Target Language (Bridge/Secondary): ${targetLang || "Malayalam"}

Include all structured elements:
1. Title and Learning Objective (in English, Source language, Target language)
2. Explanation (age-appropriate conceptual explanation provided in both Source and Target languages)
3. Vocabulary (at least 6 core domain words with Source term, Target term, English meaning, and phonetic pronunciation)
4. Real-world Examples (at least 3 bilingual contextual sentences)
5. Teacher Activity (actionable classroom pedagogy instructions)
6. Student Activity (interactive pair or individual task)
7. Assessment (3-4 comprehension check questions with answers and bilingual prompts)

Return strictly valid JSON with keys:
{
  "title": string,
  "learningObjective": { "english": string, "source": string, "target": string },
  "explanation": { "source": string, "target": string, "englishSummary": string },
  "vocabulary": [
    { "termSource": string, "termTarget": string, "meaningEnglish": string, "pronunciation": string }
  ],
  "examples": [
    { "sourceSentence": string, "targetSentence": string, "englishSentence": string }
  ],
  "teacherActivity": string,
  "studentActivity": string,
  "assessment": [
    { "question": string, "options": string[], "answer": string, "explanation": string }
  ]
}`;

      const { text: responseText } = await generateWithFallbackAndRetry({
        prompt,
        responseMimeType: "application/json",
        temperature: 0.3,
      });

      const data = parseJsonSafe(responseText, {});
      res.json({ success: true, lesson: data });
    } catch (err: any) {
      console.error("Lesson generation error:", err);
      res.status(err.isHighDemand ? 503 : 500).json({
        error: err.message || "Failed to generate learning material. Please try again.",
      });
    }
  });

  // API 5: Tribal Language Learning
  app.post("/api/learn/tribal", async (req, res) => {
    try {
      const { language, topic } = req.body;
      const tribalLang = language || "Mundari";
      const tribalTopic = topic || "Basic Greetings";

      const prompt = `Generate an authentic, linguistically respectful educational module for the indigenous/tribal language: ${tribalLang}.
Learning Topic: ${tribalTopic}.

IMPORTANT ACCURACY MANDATE:
- Never fabricate words or grammar.
- For Santhali (Santali / ᱥᱟᱱᱛᱟᱲᱤ, an Austroasiatic Munda language spoken in Jharkhand, Odisha, West Bengal, Assam, Bihar), provide the authentic Ol Chiki script (ᱚᱞ ᱪᱤᱠᱤ) along with standard Roman phonetic pronunciation and English/Tamil meanings. Use authentic Santhali vocabulary (e.g. 'Johar' for greeting, 'Dak'' for water, 'Daka' for cooked food/rice, 'Sengel' for fire, 'Orak'' for house, 'Ato' for village, 'Sarjom' for Sal tree, 'Baha' for flower).
- For Mundari (an Austroasiatic Munda language spoken in Jharkhand, Odisha, West Bengal), use authentic vocabulary (e.g., Johar for greeting, Da: for water, Mandi for food, Sen for walk).
- Clearly denote verification status: "Verified" if based on standard academic lexicons (like Pt. Raghunath Murmu's Ol Chiki works, Rev. J. Hoffmann's Encyclopaedia Mundarica / Central Institute of Indian Languages), "Community-provided", or "AI-assisted linguistic synthesis".
- If TTS is not widely supported, state it explicitly.

Return strictly valid JSON with structure:
{
  "language": "${tribalLang}",
  "topic": "${tribalTopic}",
  "script": string (e.g. Ol Chiki, Devanagari, or Roman phonetic),
  "verificationStatus": "Verified" | "Community-provided" | "AI-assisted linguistic synthesis",
  "linguisticNote": string (origin, language family, e.g. Austroasiatic / South Dravidian),
  "audioAvailability": "Voice output is currently unavailable for this language. Phonetic pronunciation guides provided.",
  "greetingsAndPhrases": [
    {
      "indigenousPhrase": string,
      "phoneticGuide": string,
      "englishMeaning": string,
      "tamilEquivalent": string,
      "culturalContext": string
    }
  ],
  "vocabularyList": [
    {
      "word": string,
      "phonetic": string,
      "meaning": string,
      "category": string
    }
  ],
  "practiceDialogue": [
    { "speaker": string, "indigenousText": string, "translation": string, "phonetic": string }
  ]
}`;

      const { text: responseText } = await generateWithFallbackAndRetry({
        prompt,
        responseMimeType: "application/json",
        temperature: 0.2,
      });

      const data = parseJsonSafe(responseText, {});
      res.json({ success: true, tribalData: data });
    } catch (err: any) {
      console.error("Tribal learning error:", err);
      res.status(err.isHighDemand ? 503 : 500).json({
        error: err.message || "Failed to generate tribal language content. Please try again.",
      });
    }
  });

  // API 6: Bilingual Worksheet Generator
  app.post("/api/worksheets/generate", async (req, res) => {
    try {
      const { classGrade, subject, topic, sourceLang, targetLang, difficulty } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required for worksheet generation." });
      }

      const prompt = `Generate a printable bilingual worksheet for school students.
Parameters:
- Class: ${classGrade || "Class 4"}
- Subject: ${subject || "Environmental Science"}
- Topic: ${topic}
- Source Language: ${sourceLang || "Tamil"}
- Target Language: ${targetLang || "Malayalam"}
- Difficulty Level: ${difficulty || "Medium"}

Include all of the following worksheet sections in bilingual format:
1. Title and Student Header (Name, Date, Score, Instructions)
2. Section A: Vocabulary Focus (Matching or write the bilingual term)
3. Section B: Matching Activity (5 items on Left in Source Language, 5 on Right in Target Language/English)
4. Section C: Fill in the blanks (4 bilingual sentences with word bank)
5. Section D: Multiple Choice Questions (4 questions with 4 options each)
6. Section E: Simple Conceptual Questions (2-3 short descriptive questions)
7. Section F: Creative / Picture-based Activity Prompt (a hands-on drawing or labeling prompt)
8. Answer Key for Teachers

Return strictly valid JSON matching this schema:
{
  "worksheetTitle": string,
  "instructions": string,
  "gradeAndSubject": string,
  "vocabularySection": [
    { "sourceWord": string, "targetWord": string, "meaning": string }
  ],
  "matchingSection": {
    "columnA": string[],
    "columnB": string[],
    "answers": { [key: string]: string }
  },
  "fillInBlanks": [
    { "sentence": string, "blank": string, "hint": string }
  ],
  "multipleChoice": [
    { "question": string, "options": string[], "correctOptionIndex": number }
  ],
  "simpleQuestions": [
    { "question": string, "sampleAnswer": string }
  ],
  "creativeActivity": string,
  "teacherNotes": string
}`;

      const { text: responseText } = await generateWithFallbackAndRetry({
        prompt,
        responseMimeType: "application/json",
        temperature: 0.3,
      });

      const data = parseJsonSafe(responseText, {});
      res.json({ success: true, worksheet: data });
    } catch (err: any) {
      console.error("Worksheet generation error:", err);
      res.status(err.isHighDemand ? 503 : 500).json({
        error: err.message || "Failed to generate worksheet. Please try again.",
      });
    }
  });

  // API 7: Speech Recognition Transcription Fallback (using Gemini Transcribe if browser speech fails)
  app.post("/api/transcribe-audio", async (req, res) => {
    try {
      const { audioBase64, mimeType, languageHint } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: "audioBase64 is required" });
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.5-transcribe",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "audio/webm",
                data: audioBase64,
              },
            },
            {
              text: `Transcribe this Indian vernacular speech exactly into its native script. The speaker is likely speaking ${languageHint || "Tamil or Malayalam or Indian regional language"}. Output ONLY the transcribed text in its native script, nothing else.`,
            },
          ],
        },
      });

      res.json({
        success: true,
        text: (response.text || "").trim(),
      });
    } catch (err: any) {
      console.error("Transcription error:", err);
      res.status(500).json({ error: err.message || "Transcription failed" });
    }
  });

  // Vite middleware in dev, static files in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[APV Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
