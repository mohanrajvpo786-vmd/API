// Audio and Speech Service for APV Vernacular Translation Engine
import { transcribeAudioApi } from "./api";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// BCP-47 Speech Recognition and Synthesis code map
export const SPEECH_LANG_MAP: Record<string, string> = {
  ta: "ta-IN", // Tamil
  ml: "ml-IN", // Malayalam
  te: "te-IN", // Telugu
  kn: "kn-IN", // Kannada
  ur: "ur-IN", // Urdu
  en: "en-IN", // English (India)
  hi: "hi-IN", // Hindi
  bn: "bn-IN", // Bengali
  mr: "mr-IN", // Marathi
  gu: "gu-IN", // Gujarati
  pa: "pa-IN", // Punjabi
  or: "or-IN", // Odia
  as: "as-IN", // Assamese
};

// Keyword hints for matching system voices
const LANG_VOICE_KEYWORDS: Record<string, string[]> = {
  ta: ["tamil", "ta-in", "ta_in", "tam"],
  kn: ["kannada", "kn-in", "kn_in", "kan"],
  ml: ["malayalam", "ml-in", "ml_in", "mal"],
  te: ["telugu", "te-in", "te_in", "tel"],
  ur: ["urdu", "ur-in", "ur_in", "urd"],
  hi: ["hindi", "hi-in", "hi_in", "hin"],
  en: ["english", "en-in", "en_in", "en-us", "en-gb", "eng"],
  bn: ["bengali", "bangla", "bn-in", "ben"],
  mr: ["marathi", "mr-in", "mar"],
  gu: ["gujarati", "gu-in", "guj"],
  pa: ["punjabi", "pa-in", "pan"],
  or: ["odia", "oriya", "or-in"],
  as: ["assamese", "as-in"],
};

function getSupportedMimeType(): string {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "audio/webm";
  }
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/wav",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) {
      return c;
    }
  }
  return "";
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const commaIdx = dataUrl.indexOf(",");
      if (commaIdx !== -1) {
        resolve(dataUrl.substring(commaIdx + 1));
      } else {
        resolve(dataUrl);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export class APVAudioService {
  private recognition: any = null;
  private isRecognizing = false;
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private supportedMimeType = "";
  private hasDetectedSpeech = false;
  private maxAudioLevel = 0;
  private silenceTimer: any = null;
  private maxDurationTimer: any = null;
  private animationFrameId: number | null = null;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.cachedVoices = window.speechSynthesis.getVoices() || [];
    }
  }

  // Check speech recognition capability
  isSpeechRecognitionSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
    );
  }

  // Check TTS capability
  isTtsSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  // Check microphone hardware access capability
  isMicrophoneSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    );
  }

  // Start Voice Recognition with real microphone capture, VAD, and fallback
  async startListening(options: {
    languageCode: string;
    onTranscript: (text: string, isFinal: boolean) => void;
    onSpeechStart?: () => void;
    onProcessing?: () => void;
    onError: (err: string) => void;
    onEnd: () => void;
    onAudioLevel?: (level: number) => void;
  }): Promise<void> {
    if (this.isRecognizing) {
      this.stopListening();
    }

    this.stopSpeaking();
    this.isRecognizing = true;
    this.hasDetectedSpeech = false;
    this.maxAudioLevel = 0;
    this.audioChunks = [];

    // Step 1: Check microphone hardware API
    if (!this.isMicrophoneSupported()) {
      this.isRecognizing = false;
      options.onError("Microphone access is not supported in this browser.");
      options.onEnd();
      return;
    }

    // Step 2: Request real device microphone access
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err: any) {
      this.isRecognizing = false;
      console.warn("Microphone access error:", err);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError" ||
        err.message?.includes("Permission denied")
      ) {
        options.onError("Microphone permission is required for voice translation. Please allow microphone access in your browser settings.");
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        options.onError("Microphone not found or unavailable on this device.");
      } else {
        options.onError(`Microphone permission or access error: ${err.message || err.name || "Denied"}`);
      }
      options.onEnd();
      return;
    }

    // Step 3: Setup AudioContext & AnalyserNode for Real-Time Volume & Voice Activity Detection (VAD)
    try {
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.3;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      let consecutiveSpeechFrames = 0;
      let silenceFrames = 0;

      const monitorAudio = () => {
        if (!this.isRecognizing || !this.analyser) return;

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, avg / 128);

        if (normalized > this.maxAudioLevel) {
          this.maxAudioLevel = normalized;
        }

        options.onAudioLevel?.(normalized);

        // Voice Activity Detection (VAD)
        if (normalized > 0.04) {
          consecutiveSpeechFrames++;
          silenceFrames = 0;
          if (consecutiveSpeechFrames >= 2 && !this.hasDetectedSpeech) {
            this.hasDetectedSpeech = true;
            options.onSpeechStart?.();
          }

          // Clear any active silence auto-stop timer if voice resumes
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        } else {
          consecutiveSpeechFrames = 0;
          if (this.hasDetectedSpeech) {
            silenceFrames++;
            // If user has spoken, and silence persists for ~1.6 seconds, trigger automatic stop
            if (!this.silenceTimer && silenceFrames > 20) {
              this.silenceTimer = setTimeout(() => {
                if (this.isRecognizing) {
                  this.stopListening();
                }
              }, 1600);
            }
          }
        }

        this.animationFrameId = requestAnimationFrame(monitorAudio);
      };

      this.animationFrameId = requestAnimationFrame(monitorAudio);
    } catch (analysisErr) {
      console.warn("Could not attach audio analyser:", analysisErr);
    }

    // Step 4: Setup MediaRecorder to capture real audio for guaranteed Gemini multimodal fallback
    this.supportedMimeType = getSupportedMimeType();
    try {
      const recorderOptions: MediaRecorderOptions = {};
      if (this.supportedMimeType) {
        recorderOptions.mimeType = this.supportedMimeType;
      }
      this.mediaRecorder = new MediaRecorder(this.mediaStream, recorderOptions);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      this.mediaRecorder.start(100);
    } catch (recErr) {
      console.warn("MediaRecorder initialization warning:", recErr);
    }

    // Step 5: Setup Browser Web Speech Recognition (for instant streaming interim transcripts)
    let webSpeechFinalTranscript = "";
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const speechCode =
      SPEECH_LANG_MAP[options.languageCode] ||
      (options.languageCode === "auto" ? "ta-IN" : "en-IN");

    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = speechCode;

        this.recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              webSpeechFinalTranscript += transcript;
            } else {
              interim += transcript;
            }
          }

          if (webSpeechFinalTranscript) {
            this.hasDetectedSpeech = true;
            options.onTranscript(webSpeechFinalTranscript, false);
          } else if (interim) {
            this.hasDetectedSpeech = true;
            options.onTranscript(interim, false);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.log("[WebSpeech Info] Speech recognition note:", event.error);
          // Do not fail immediately if MediaRecorder is capturing real audio,
          // as Gemini audio transcription will process the actual microphone audio.
        };

        this.recognition.onend = () => {
          // If speech recognition ended naturally, stop recording to finalize
          if (this.isRecognizing && this.hasDetectedSpeech) {
            this.stopListening();
          }
        };

        this.recognition.start();
      } catch (err) {
        console.warn("WebSpeech start note:", err);
      }
    }

    // Safety timeout: stop recording after 18 seconds max
    this.maxDurationTimer = setTimeout(() => {
      if (this.isRecognizing) {
        this.stopListening();
      }
    }, 18000);

    // Store completion handler to be executed on recording stop
    (this as any)._onStopRecording = async () => {
      // 1. If WebSpeech API produced a solid transcript, use it immediately
      if (webSpeechFinalTranscript && webSpeechFinalTranscript.trim()) {
        options.onTranscript(webSpeechFinalTranscript.trim(), true);
        options.onEnd();
        return;
      }

      // 2. Check if user spoke anything at all
      if (!this.hasDetectedSpeech && this.maxAudioLevel < 0.035) {
        options.onError("No speech detected. Please speak clearly into the microphone.");
        options.onEnd();
        return;
      }

      // 3. Multimodal Audio Fallback via Server Gemini Speech-to-Text
      if (this.audioChunks.length > 0) {
        try {
          options.onProcessing?.();
          const recordedBlob = new Blob(this.audioChunks, {
            type: this.supportedMimeType || "audio/webm",
          });
          const base64Data = await blobToBase64(recordedBlob);

          const result = await transcribeAudioApi({
            audioBase64: base64Data,
            mimeType: this.supportedMimeType || "audio/webm",
            languageHint: options.languageCode,
          });

          if (result.noSpeech || !result.transcript || !result.transcript.trim()) {
            options.onError("No speech detected. Please speak clearly into the microphone.");
          } else {
            options.onTranscript(result.transcript.trim(), true);
          }
        } catch (sttErr: any) {
          console.error("Audio transcription error:", sttErr);
          options.onError(
            sttErr.message || "Failed to transcribe speech. Please try speaking again or type your sentence."
          );
        }
      } else {
        options.onError("No audio captured from microphone. Please try again.");
      }

      options.onEnd();
    };
  }

  // Stop listening and finalize recording
  stopListening(): void {
    if (!this.isRecognizing) return;
    this.isRecognizing = false;

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.recognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // ignore
      }
    }

    // Stop microphone tracks immediately so device mic turns off
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }

    if (this.audioCtx && this.audioCtx.state !== "closed") {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.analyser = null;

    // Trigger the finalized callback
    const onStop = (this as any)._onStopRecording;
    if (onStop) {
      (this as any)._onStopRecording = null;
      // Slight delay to allow mediaRecorder.ondataavailable to finish flushing
      setTimeout(() => {
        onStop();
      }, 100);
    }
  }

  // Text-To-Speech Playback using SpeechSynthesis with Vernacular Voice Matching
  speakText(options: {
    text: string;
    languageCode: string;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: string) => void;
  }): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isTtsSupported()) {
        options.onError?.("Voice output is unavailable on this device.");
        resolve();
        return;
      }

      // Stop any existing speech and unpause if hung
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      if (!options.text || !options.text.trim()) {
        resolve();
        return;
      }

      const cleanText = options.text.trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const speechCode = SPEECH_LANG_MAP[options.languageCode] || "en-IN";
      utterance.lang = speechCode;
      utterance.rate = options.rate || 0.95;
      utterance.pitch = options.pitch || 1.0;

      // Locate best voice match
      if (this.cachedVoices.length === 0) {
        this.loadVoices();
      }

      const voices = this.cachedVoices;
      const langCodeLower = options.languageCode.toLowerCase();
      const speechCodeLower = speechCode.toLowerCase();
      const keywords = LANG_VOICE_KEYWORDS[langCodeLower] || [langCodeLower];

      // 1. Exact BCP-47 match (e.g. kn-IN, ta-IN, ml-IN)
      let matchedVoice = voices.find(
        (v) => v.lang.replace("_", "-").toLowerCase() === speechCodeLower
      );

      // 2. Prefix match (e.g. ta, kn, ml)
      if (!matchedVoice) {
        matchedVoice = voices.find(
          (v) =>
            v.lang.replace("_", "-").toLowerCase().startsWith(langCodeLower + "-") ||
            v.lang.toLowerCase() === langCodeLower
        );
      }

      // 3. Name or language keyword match (e.g. "Kannada", "Tamil", "Malayalam")
      if (!matchedVoice) {
        matchedVoice = voices.find((v) => {
          const vName = v.name.toLowerCase();
          const vLang = v.lang.toLowerCase();
          return keywords.some((kw) => vName.includes(kw) || vLang.includes(kw));
        });
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      let hasEnded = false;
      const finish = () => {
        if (!hasEnded) {
          hasEnded = true;
          options.onEnd?.();
          resolve();
        }
      };

      utterance.onstart = () => {
        options.onStart?.();
      };

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = (e) => {
        console.warn("TTS playback note:", e);
        finish();
      };

      // Watchdog timer in case browser fails to fire onend
      const estimatedDuration = Math.max(2500, (cleanText.length / 8) * 1000);
      setTimeout(() => {
        if (!hasEnded) {
          finish();
        }
      }, estimatedDuration + 3000);

      window.speechSynthesis.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (this.isTtsSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioService = new APVAudioService();
