import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please configure it in AI Studio Secrets.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

export interface GeminiCallOptions {
  prompt: string;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}

// Models to try in sequence when encountering 503 (model experiencing high demand) or 429
// gemini-3.1-flash-lite provides ultra-low latency, high capacity, and avoids 503 demand spikes
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
];

function isTransientError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.code || (err.error && err.error.code);
  const message = (err.message || "") + (err.error?.message || "");

  // 503 UNAVAILABLE / high demand, 429 RESOURCE_EXHAUSTED / rate limit, 500 INTERNAL
  if (status === 503 || status === 429 || status === "UNAVAILABLE" || status === 500) {
    return true;
  }

  if (
    message.includes("high demand") ||
    message.includes("UNAVAILABLE") ||
    message.includes("503") ||
    message.includes("temporarily overloaded") ||
    message.includes("Resource has been exhausted")
  ) {
    return true;
  }

  return false;
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function generateWithFallbackAndRetry(
  options: GeminiCallOptions
): Promise<{ text: string; modelUsed: string }> {
  const ai = getGeminiClient();
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    // Up to 2 attempts per model with short backoff
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) {
          // Wait before retry
          await delay(600 * attempt);
        }

        const response = await ai.models.generateContent({
          model,
          contents: options.prompt,
          config: {
            systemInstruction: options.systemInstruction,
            responseMimeType: options.responseMimeType,
            temperature: options.temperature ?? 0.2,
          },
        });

        const text = response.text || "";
        if (text) {
          return { text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        console.log(`[APV Resilience] Model ${model} (attempt ${attempt + 1}) unavailable, trying alternative...`);

        // If not transient (e.g. invalid argument), don't retry same model
        if (!isTransientError(err)) {
          break;
        }
      }
    }
  }

  // If all candidate models and retries failed, parse a clean error message
  const rawMsg = lastError?.message || JSON.stringify(lastError || "");
  let cleanMessage = "The AI translation model is temporarily experiencing high demand. Please tap 'Retry' in a moment.";

  if (rawMsg.includes("high demand") || rawMsg.includes("503") || rawMsg.includes("UNAVAILABLE")) {
    cleanMessage = "The model is currently experiencing high demand. Automatic fallback was attempted. Please tap 'Retry' or use offline phrases.";
  } else if (rawMsg.includes("GEMINI_API_KEY")) {
    cleanMessage = "GEMINI_API_KEY is not configured or invalid.";
  }

  const enhancedError: any = new Error(cleanMessage);
  enhancedError.originalError = lastError;
  enhancedError.isHighDemand = isTransientError(lastError);
  throw enhancedError;
}

export function parseJsonSafe<T = any>(rawText: string, fallback: T): T {
  if (!rawText) return fallback;
  try {
    return JSON.parse(rawText);
  } catch {
    // Try to extract JSON from markdown code block or curly braces
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        // continue
      }
    }

    const curlyMatch = rawText.match(/\{[\s\S]*\}/);
    if (curlyMatch) {
      try {
        return JSON.parse(curlyMatch[0]);
      } catch {
        // continue
      }
    }

    return fallback;
  }
}

export interface AudioTranscriptionOptions {
  audioBase64: string;
  mimeType: string;
  languageHint?: string;
}

export interface AudioTranscriptionResult {
  transcript: string;
  noSpeech: boolean;
  detectedLanguage?: string;
  detectedCode?: string;
  confidence?: number;
}

export async function transcribeAudioWithGemini(
  options: AudioTranscriptionOptions
): Promise<AudioTranscriptionResult> {
  const ai = getGeminiClient();
  const mimeType = options.mimeType || "audio/webm";

  const systemInstruction = `You are the core Speech Recognition (STT) engine of APV (AI-Powered Vernacular Voice Translation & Learning Assistant).
Your primary specialization is Indian regional languages (Tamil, Kannada, Malayalam, Telugu, Hindi, English, Urdu, Gujarati, Marathi, Bengali, Odia, Punjabi) and indigenous tribal languages.

TASK:
1. Listen carefully to the user's recorded microphone audio.
2. Determine if real human speech is present.
   - If the audio is silent, background static, breathing, clicking, or contains NO coherent spoken words, respond strictly with:
     {"transcript": "", "noSpeech": true, "detectedLanguage": "", "detectedCode": "", "confidence": 0}
   - NEVER output fake text or timestamps (e.g. "00:00" or "[BLANK_AUDIO]").
3. If real speech is spoken, transcribe the EXACT words spoken in their true native script:
   - Tamil speech -> Tamil script (e.g., "நீங்கள் எப்படி இருக்கிறீர்கள்?")
   - Kannada speech -> Kannada script (e.g., "ನಿಮ್ಮ ಹೆಸರೇನು?")
   - Malayalam speech -> Malayalam script (e.g., "ഞാൻ ഇന്ന് സ്കൂളിലേക്ക് പോകുന്നു.")
   - Telugu speech -> Telugu script (e.g., "మీ పేరు ఏమిటి?")
   - English speech -> English text (e.g., "What is your name?")
   - Hindi speech -> Devanagari script (e.g., "आपका नाम क्या है?")
   - Any other language -> Native script or authentic phonetic script.
4. Do NOT translate. Transcribe verbatim.
5. Return strictly valid JSON adhering to:
   {"transcript": "<exact words>", "noSpeech": false, "detectedLanguage": "<language name>", "detectedCode": "<code>", "confidence": 0.95}`;

  const promptText = `Transcribe this audio recording from the device microphone.
Language Hint: ${options.languageHint || "Auto-detect"}`;

  let lastErr: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            inlineData: {
              mimeType,
              data: options.audioBase64,
            },
          },
          promptText,
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      });

      const parsed = parseJsonSafe<any>(response.text || "{}", null);
      if (parsed) {
        let transcript = (parsed.transcript || "").trim();
        // Check for common silence markers
        if (
          !transcript ||
          transcript === "00:00" ||
          /^\d\d:\d\d$/.test(transcript) ||
          transcript.toLowerCase().includes("no speech") ||
          transcript.toLowerCase().includes("blank_audio")
        ) {
          return {
            transcript: "",
            noSpeech: true,
            detectedLanguage: "",
            detectedCode: "",
            confidence: 0,
          };
        }

        return {
          transcript,
          noSpeech: Boolean(parsed.noSpeech),
          detectedLanguage: parsed.detectedLanguage || "",
          detectedCode: parsed.detectedCode || "",
          confidence: parsed.confidence || 0.95,
        };
      }
    } catch (err: any) {
      lastErr = err;
      console.warn(`[APV STT] Model ${model} encountered:`, err?.message);
    }
  }

  throw new Error("Speech recognition service is temporarily unavailable. Please try speaking again.");
}

