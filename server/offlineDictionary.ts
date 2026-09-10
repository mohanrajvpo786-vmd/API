// Verified Vernacular Offline Translation Dictionary
// Acts as instant fallback during network outages, offline mode, or cloud model high-demand spikes (503s)

export interface OfflineEntry {
  sourceLang: string; // e.g. "ta", "ml", "en", "hi", "te", "kn"
  targetLang: string;
  sourceText: string;
  translatedText: string;
  romanizedText: string;
  grammarNote: string;
}

export const OFFLINE_DICTIONARY: OfflineEntry[] = [
  // Primary SIH Demonstration Phrase
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "நான் இன்று பள்ளிக்கு செல்கிறேன்.",
    translatedText: "ഞാൻ ഇന്ന് സ്കൂളിലേക്ക് പോകുന്നു.",
    romanizedText: "Njan innu schoolilekku pokunnu.",
    grammarNote: "Present continuous / immediate future tense expressing habitual student movement.",
  },
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "நான் இன்று பள்ளிக்கு செல்கிறேன்",
    translatedText: "ഞാൻ ഇന്ന് സ്കൂളിലേക്ക് പോകുന്നു.",
    romanizedText: "Njan innu schoolilekku pokunnu.",
    grammarNote: "Present continuous / immediate future tense expressing habitual student movement.",
  },
  {
    sourceLang: "ml",
    targetLang: "ta",
    sourceText: "ഞാൻ ഇന്ന് സ്കൂളിലേക്ക് പോകുന്നു.",
    translatedText: "நான் இன்று பள்ளிக்கு செல்கிறேன்.",
    romanizedText: "Naan indru pallikku selgiren.",
    grammarNote: "Present continuous motion verb in standard Tamil.",
  },
  {
    sourceLang: "ml",
    targetLang: "ta",
    sourceText: "ഞാൻ ഇന്ന് സ്കൂളിലേക്ക് പോകുന്നു",
    translatedText: "நான் இன்று பள்ளிக்கு செல்கிறேன்.",
    romanizedText: "Naan indru pallikku selgiren.",
    grammarNote: "Present continuous motion verb in standard Tamil.",
  },

  // Tamil -> Malayalam Daily Conversation
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "வணக்கம்",
    translatedText: "നമസ്കാരം",
    romanizedText: "Namaskaram",
    grammarNote: "Traditional respectful Dravidian greeting.",
  },
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "காலை வணக்கம்",
    translatedText: "സുപ്രഭാതം",
    romanizedText: "Suprabhatham",
    grammarNote: "Morning formal greeting.",
  },
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "நீங்கள் எப்படி இருக்கிறீர்கள்?",
    translatedText: "നിങ്ങൾക്ക് സുഖമാണോ?",
    romanizedText: "Ningalkku sukhamaano?",
    grammarNote: "Polite honorific inquiry into someone's health and well-being.",
  },
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "நீங்கள் எப்படி இருக்கிறீர்கள்",
    translatedText: "നിങ്ങൾക്ക് സുഖമാണോ?",
    romanizedText: "Ningalkku sukhamaano?",
    grammarNote: "Polite honorific inquiry into someone's health and well-being.",
  },
  {
    sourceLang: "ml",
    targetLang: "ta",
    sourceText: "നിങ്ങൾക്ക് സുഖമാണോ?",
    translatedText: "நீங்கள் எப்படி இருக்கிறீர்கள்?",
    romanizedText: "Neengal eppadi irukkeergal?",
    grammarNote: "Honorific inquiry.",
  },
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "நான் நன்றாக இருக்கிறேன்",
    translatedText: "എനിക്ക് സുഖമാണ്",
    romanizedText: "Enikku sukhamaanu",
    grammarNote: "Affirmative statement indicating wellness.",
  },
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "நன்றி",
    translatedText: "നന്ദി",
    romanizedText: "Nandi",
    grammarNote: "Expression of gratitude.",
  },
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "மிக்க நன்றி",
    translatedText: "വളരെ നന്ദി",
    romanizedText: "Valare nandi",
    grammarNote: "Intensified expression of gratitude.",
  },
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "உங்கள் பெயர் என்ன?",
    translatedText: "നിങ്ങളുടെ പേരെന്താണ്?",
    romanizedText: "Ningalude perenthaanu?",
    grammarNote: "Polite inquiry asking for someone's name.",
  },
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "பள்ளி எங்கே இருக்கிறது?",
    translatedText: "സ്കൂൾ എവിടെയാണ്?",
    romanizedText: "School evideyaanu?",
    grammarNote: "Locational question asking for directions to a school.",
  },
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "எனக்கு உதவி வேண்டும்",
    translatedText: "എനിക്ക് സഹായം വേണം",
    romanizedText: "Enikku sahayam venam",
    grammarNote: "Direct request for assistance.",
  },
  {
    sourceLang: "ta",
    targetLang: "ml",
    sourceText: "மருத்துவமனை எங்கே இருக்கிறது?",
    translatedText: "ആശുപത്രി എവിടെയാണ്?",
    romanizedText: "Aashupathri evideyaanu?",
    grammarNote: "Emergency directional inquiry to find a hospital.",
  },

  // Tamil -> Telugu
  {
    sourceLang: "ta",
    targetLang: "te",
    sourceText: "வணக்கம்",
    translatedText: "నమస్కారం",
    romanizedText: "Namaskaram",
    grammarNote: "Respectful Telugu greeting.",
  },
  {
    sourceLang: "ta",
    targetLang: "te",
    sourceText: "நான் இன்று பள்ளிக்கு செல்கிறேன்.",
    translatedText: "నేను ఈరోజు పాఠశాలకు వెళ్తున్నాను.",
    romanizedText: "Nenu eeroju paathashaalaku velthunnanu.",
    grammarNote: "Present continuous tense describing going to school.",
  },
  {
    sourceLang: "ta",
    targetLang: "te",
    sourceText: "நீங்கள் எப்படி இருக்கிறீர்கள்?",
    translatedText: "మీరు ఎలా ఉన్నారు?",
    romanizedText: "Meeru ela unnaaru?",
    grammarNote: "Honorific inquiry.",
  },
  {
    sourceLang: "ta",
    targetLang: "te",
    sourceText: "நன்றி",
    translatedText: "ధన్యవాదాలు",
    romanizedText: "Dhanyavaadaalu",
    grammarNote: "Formal thanks.",
  },

  // Tamil -> Kannada
  {
    sourceLang: "ta",
    targetLang: "kn",
    sourceText: "வணக்கம்",
    translatedText: "ನಮಸ್ಕಾರ",
    romanizedText: "Namaskara",
    grammarNote: "Respectful Kannada greeting.",
  },
  {
    sourceLang: "ta",
    targetLang: "kn",
    sourceText: "நான் இன்று பள்ளிக்கு செல்கிறேன்.",
    translatedText: "ನಾನು ಇಂದು ಶಾಲೆಗೆ ಹೋಗುತ್ತಿದ್ದೇನೆ.",
    romanizedText: "Naanu indu shaalege hoguttiddene.",
    grammarNote: "Present continuous motion in Kannada.",
  },
  {
    sourceLang: "ta",
    targetLang: "kn",
    sourceText: "நீங்கள் எப்படி இருக்கிறீர்கள்?",
    translatedText: "ನೀವು ಹೇಗಿದ್ದೀರಿ?",
    romanizedText: "Neevu hegiddiri?",
    grammarNote: "Polite inquiry.",
  },
  {
    sourceLang: "ta",
    targetLang: "kn",
    sourceText: "நன்றி",
    translatedText: "ಧನ್ಯವಾದಗಳು",
    romanizedText: "Dhanyavaadagalu",
    grammarNote: "Expression of gratitude.",
  },

  // Tamil -> Hindi
  {
    sourceLang: "ta",
    targetLang: "hi",
    sourceText: "நான் இன்று பள்ளிக்கு செல்கிறேன்.",
    translatedText: "मैं आज स्कूल जा रहा हूँ।",
    romanizedText: "Main aaj school ja raha hoon.",
    grammarNote: "Present continuous tense in Hindi.",
  },
  {
    sourceLang: "ta",
    targetLang: "hi",
    sourceText: "வணக்கம்",
    translatedText: "नमस्ते",
    romanizedText: "Namaste",
    grammarNote: "Traditional greeting in Hindi.",
  },
  {
    sourceLang: "ta",
    targetLang: "hi",
    sourceText: "நன்றி",
    translatedText: "धन्यवाद",
    romanizedText: "Dhanyavaad",
    grammarNote: "Formal expression of thanks.",
  },

  // Hindi -> Mundari (Tribal demo preset)
  {
    sourceLang: "hi",
    targetLang: "unr",
    sourceText: "नमस्ते, आप कैसे हैं?",
    translatedText: "ᱡᱚᱦᱟᱨ, ᱪᱮᱛ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?",
    romanizedText: "Johar, chet leka menama?",
    grammarNote: "Traditional Munda greeting 'Johar' followed by health inquiry.",
  },
  {
    sourceLang: "ta",
    targetLang: "unr",
    sourceText: "வணக்கம்",
    translatedText: "ᱡᱚᱦᱟᱨ",
    romanizedText: "Johar",
    grammarNote: "Sacred indigenous Munda greeting honoring the divine spirit in nature and all beings.",
  },

  // English -> Tamil
  {
    sourceLang: "en",
    targetLang: "ta",
    sourceText: "I am going to school today.",
    translatedText: "நான் இன்று பள்ளிக்கு செல்கிறேன்.",
    romanizedText: "Naan indru pallikku selgiren.",
    grammarNote: "Present tense action verb in Tamil.",
  },
  {
    sourceLang: "en",
    targetLang: "ta",
    sourceText: "Hello",
    translatedText: "வணக்கம்",
    romanizedText: "Vanakkam",
    grammarNote: "Standard respectful Tamil greeting.",
  },
  {
    sourceLang: "en",
    targetLang: "ta",
    sourceText: "Thank you",
    translatedText: "நன்றி",
    romanizedText: "Nandri",
    grammarNote: "Expression of gratitude.",
  },
  {
    sourceLang: "en",
    targetLang: "ta",
    sourceText: "How are you?",
    translatedText: "நீங்கள் எப்படி இருக்கிறீர்கள்?",
    romanizedText: "Neengal eppadi irukkeergal?",
    grammarNote: "Honorific question.",
  },

  // English -> Malayalam
  {
    sourceLang: "en",
    targetLang: "ml",
    sourceText: "I am going to school today.",
    translatedText: "ഞാൻ ഇന്ന് സ്കൂളിലേക്ക് പോകുന്നു.",
    romanizedText: "Njan innu schoolilekku pokunnu.",
    grammarNote: "Natural Malayalam present continuous.",
  },
  {
    sourceLang: "en",
    targetLang: "ml",
    sourceText: "Hello",
    translatedText: "നമസ്കാരം",
    romanizedText: "Namaskaram",
    grammarNote: "Standard Malayalam greeting.",
  },
  {
    sourceLang: "en",
    targetLang: "ml",
    sourceText: "Thank you",
    translatedText: "നന്ദി",
    romanizedText: "Nandi",
    grammarNote: "Expression of thanks in Malayalam.",
  },

  // English -> Santhali (Tribal Indigenous / Ol Chiki)
  {
    sourceLang: "en",
    targetLang: "sat",
    sourceText: "Hello",
    translatedText: "ᱡᱚᱦᱟᱨ",
    romanizedText: "Johar",
    grammarNote: "Traditional respectful Santhali greeting (Ol Chiki script).",
  },
  {
    sourceLang: "en",
    targetLang: "sat",
    sourceText: "Hello, how are you?",
    translatedText: "ᱡᱚᱦᱟᱨ, ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?",
    romanizedText: "Johar, chet leka menama?",
    grammarNote: "Standard polite greeting and wellness inquiry in Santhali.",
  },
  {
    sourceLang: "en",
    targetLang: "sat",
    sourceText: "How are you?",
    translatedText: "ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?",
    romanizedText: "Chet leka menama?",
    grammarNote: "Wellness inquiry in Santhali.",
  },
  {
    sourceLang: "en",
    targetLang: "sat",
    sourceText: "I am fine",
    translatedText: "ᱤᱧ ᱵᱮᱥ ᱜᱮ ᱢᱤᱱᱟᱹᱧᱟ",
    romanizedText: "Inj bes ge mina'nya",
    grammarNote: "Affirmative statement indicating wellness in Santhali.",
  },
  {
    sourceLang: "en",
    targetLang: "sat",
    sourceText: "Thank you",
    translatedText: "ᱥᱟᱨᱦᱟᱣ",
    romanizedText: "Sarhaw",
    grammarNote: "Expression of gratitude in Santhali.",
  },
  {
    sourceLang: "en",
    targetLang: "sat",
    sourceText: "I am going to school today.",
    translatedText: "ᱤᱧ ᱛᱮᱦᱮᱧ ᱟᱥᱲᱟ ᱥᱮᱱᱚᱜ ᱠᱟᱱᱟᱹᱧ",
    romanizedText: "Inj tehenj asṛa senog kana'nj",
    grammarNote: "Present continuous student movement in authentic Ol Chiki script.",
  },
  {
    sourceLang: "en",
    targetLang: "sat",
    sourceText: "I am going to school today",
    translatedText: "ᱤᱧ ᱛᱮᱦᱮᱧ ᱟᱥᱲᱟ ᱥᱮᱱᱚᱜ ᱠᱟᱱᱟᱹᱧ",
    romanizedText: "Inj tehenj asṛa senog kana'nj",
    grammarNote: "Present continuous student movement in authentic Ol Chiki script.",
  },

  // Tamil -> Santhali (Indigenous Vernacular Bridge)
  {
    sourceLang: "ta",
    targetLang: "sat",
    sourceText: "வணக்கம்",
    translatedText: "ᱡᱚᱦᱟᱨ",
    romanizedText: "Johar",
    grammarNote: "Respectful vernacular greeting in Santhali (Ol Chiki).",
  },
  {
    sourceLang: "ta",
    targetLang: "sat",
    sourceText: "நன்றி",
    translatedText: "ᱥᱟᱨᱦᱟᱣ",
    romanizedText: "Sarhaw",
    grammarNote: "Expression of gratitude in Santhali.",
  },
  {
    sourceLang: "ta",
    targetLang: "sat",
    sourceText: "நீங்கள் எப்படி இருக்கிறீர்கள்?",
    translatedText: "ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?",
    romanizedText: "Chet leka menama?",
    grammarNote: "Wellness inquiry in Santhali.",
  },
  {
    sourceLang: "ta",
    targetLang: "sat",
    sourceText: "நான் நன்றாக இருக்கிறேன்",
    translatedText: "ᱤᱧ ᱵᱮᱥ ᱜᱮ ᱢᱤᱱᱟᱹᱧᱟ",
    romanizedText: "Inj bes ge mina'nya",
    grammarNote: "Affirmative statement indicating wellness in Santhali.",
  },
  {
    sourceLang: "ta",
    targetLang: "sat",
    sourceText: "நான் இன்று பள்ளிக்கு செல்கிறேன்.",
    translatedText: "ᱤᱧ ᱛᱮᱦᱮᱧ ᱟᱥᱲᱟ ᱥᱮᱱᱚᱜ ᱠᱟᱱᱟᱹᱧ",
    romanizedText: "Inj tehenj asṛa senog kana'nj",
    grammarNote: "Habitual student movement in authentic Ol Chiki script.",
  },
  {
    sourceLang: "ta",
    targetLang: "sat",
    sourceText: "நான் இன்று பள்ளிக்கு செல்கிறேன்",
    translatedText: "ᱤᱧ ᱛᱮᱦᱮᱧ ᱟᱥᱲᱟ ᱥᱮᱱᱚᱜ ᱠᱟᱱᱟᱹᱧ",
    romanizedText: "Inj tehenj asṛa senog kana'nj",
    grammarNote: "Habitual student movement in authentic Ol Chiki script.",
  },
];

// Helper to normalize strings for comparison
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:।]/g, "")
    .replace(/\s+/g, " ");
}

// Find offline match
export function findOfflineTranslation(
  text: string,
  sourceLang: string,
  targetLang: string
): OfflineEntry | null {
  const normInput = normalizeText(text);

  // Exact or normalized match
  for (const entry of OFFLINE_DICTIONARY) {
    const isSourceMatch =
      !sourceLang ||
      sourceLang === "auto" ||
      entry.sourceLang === sourceLang;
    const isTargetMatch = entry.targetLang === targetLang;

    if (isTargetMatch && isSourceMatch) {
      if (normalizeText(entry.sourceText) === normInput) {
        return entry;
      }
    }
  }

  // Also check reverse if applicable
  return null;
}
