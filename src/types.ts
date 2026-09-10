export type LanguageCategory = "POPULAR" | "TAMIL_NADU" | "INDIAN" | "TRIBAL";

export type VoiceRecordingState =
  | "idle"
  | "listening"
  | "user_speaking"
  | "processing"
  | "translating"
  | "speaking"
  | "ready";


export interface Language {
  code: string;
  name: string;
  nativeName: string;
  category: LanguageCategory;
  speechSupport: boolean;
  translationSupport: boolean;
  ttsSupport: boolean;
  ttsNote?: string;
  speechCode?: string;
}

export interface TranslationResult {
  id: string;
  originalText: string;
  detectedSourceLanguage: string;
  detectedSourceCode: string;
  detectionConfidence: number;
  targetLanguage: string;
  targetCode: string;
  translatedText: string;
  romanizedText?: string;
  grammarNote?: string;
  ttsAvailable: boolean;
  ttsNote?: string;
  offlineFallback?: boolean;
  modelUsed?: string;
  timestamp: string;
}

export interface ConversationMessage {
  id: string;
  speaker: "A" | "B";
  speakerName: string;
  sourceLang: string;
  targetLang: string;
  originalText: string;
  translatedText: string;
  romanizedText?: string;
  timestamp: string;
}

export interface VernacularLesson {
  id?: string;
  title: string;
  classGrade: string;
  subject: string;
  topic: string;
  sourceLang: string;
  targetLang: string;
  savedOffline?: boolean;
  createdAt?: string;
  learningObjective: {
    english: string;
    source: string;
    target: string;
  };
  explanation: {
    source: string;
    target: string;
    englishSummary: string;
  };
  vocabulary: Array<{
    termSource: string;
    termTarget: string;
    meaningEnglish: string;
    pronunciation: string;
  }>;
  examples: Array<{
    sourceSentence: string;
    targetSentence: string;
    englishSentence: string;
  }>;
  teacherActivity: string;
  studentActivity: string;
  assessment: Array<{
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  }>;
}

export interface TribalLanguageModule {
  language: string;
  topic: string;
  script: string;
  verificationStatus: "Verified" | "Community-provided" | "AI-assisted linguistic synthesis";
  linguisticNote: string;
  audioAvailability: string;
  greetingsAndPhrases: Array<{
    indigenousPhrase: string;
    phoneticGuide: string;
    englishMeaning: string;
    tamilEquivalent: string;
    culturalContext: string;
  }>;
  vocabularyList: Array<{
    word: string;
    phonetic: string;
    meaning: string;
    category: string;
  }>;
  practiceDialogue: Array<{
    speaker: string;
    indigenousText: string;
    translation: string;
    phonetic: string;
  }>;
}

export interface BilingualWorksheet {
  id?: string;
  worksheetTitle: string;
  instructions: string;
  gradeAndSubject: string;
  classGrade: string;
  subject: string;
  topic: string;
  sourceLang: string;
  targetLang: string;
  difficulty: string;
  savedOffline?: boolean;
  createdAt?: string;
  vocabularySection: Array<{
    sourceWord: string;
    targetWord: string;
    meaning: string;
  }>;
  matchingSection: {
    columnA: string[];
    columnB: string[];
    answers: Record<string, string>;
  };
  fillInBlanks: Array<{
    sentence: string;
    blank: string;
    hint: string;
  }>;
  multipleChoice: Array<{
    question: string;
    options: string[];
    correctOptionIndex: number;
  }>;
  simpleQuestions: Array<{
    question: string;
    sampleAnswer: string;
  }>;
  creativeActivity: string;
  teacherNotes: string;
}

export interface OfflineResourcePack {
  id: string;
  languageName: string;
  code: string;
  sizeMb: number;
  isDownloaded: boolean;
  category: string;
  downloadProgress?: number;
}
