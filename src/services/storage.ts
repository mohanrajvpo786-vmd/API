import {
  TranslationResult,
  VernacularLesson,
  BilingualWorksheet,
  OfflineResourcePack,
  ConversationMessage,
} from "../types";

const HISTORY_KEY = "apv_translation_history";
const LESSONS_KEY = "apv_saved_lessons";
const WORKSHEETS_KEY = "apv_saved_worksheets";
const PACKS_KEY = "apv_offline_packs";
const SETTINGS_KEY = "apv_app_settings";
const CONV_KEY = "apv_conversation_history";

export interface AppSettings {
  autoPlayTts: boolean;
  speechRate: number;
  continuousMode: boolean;
  hapticFeedback: boolean;
  highContrast: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoPlayTts: true,
  speechRate: 0.95,
  continuousMode: false,
  hapticFeedback: true,
  highContrast: false,
};

const INITIAL_PACKS: OfflineResourcePack[] = [
  { id: "pack-ta", languageName: "Tamil", code: "ta", sizeMb: 42, isDownloaded: true, category: "TAMIL_NADU" },
  { id: "pack-ml", languageName: "Malayalam", code: "ml", sizeMb: 38, isDownloaded: true, category: "TAMIL_NADU" },
  { id: "pack-te", languageName: "Telugu", code: "te", sizeMb: 40, isDownloaded: false, category: "TAMIL_NADU" },
  { id: "pack-kn", languageName: "Kannada", code: "kn", sizeMb: 39, isDownloaded: false, category: "TAMIL_NADU" },
  { id: "pack-ur", languageName: "Urdu", code: "ur", sizeMb: 36, isDownloaded: false, category: "TAMIL_NADU" },
  { id: "pack-hi", languageName: "Hindi", code: "hi", sizeMb: 45, isDownloaded: false, category: "POPULAR" },
  { id: "pack-en", languageName: "English", code: "en", sizeMb: 30, isDownloaded: true, category: "POPULAR" },
  { id: "pack-unr", languageName: "Mundari", code: "unr", sizeMb: 14, isDownloaded: true, category: "TRIBAL" },
  { id: "pack-iru", languageName: "Irula", code: "iru", sizeMb: 8, isDownloaded: false, category: "TRIBAL" },
];

export const storageService = {
  // History
  getHistory(): TranslationResult[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveHistoryItem(item: TranslationResult): void {
    try {
      const list = this.getHistory();
      const updated = [item, ...list.filter((x) => x.id !== item.id)].slice(0, 100);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save history item", e);
    }
  },

  deleteHistoryItem(id: string): void {
    try {
      const list = this.getHistory();
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list.filter((x) => x.id !== id)));
    } catch (e) {
      console.error("Failed to delete history item", e);
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error("Failed to clear history", e);
    }
  },

  // Conversation history
  getConversation(): ConversationMessage[] {
    try {
      const data = localStorage.getItem(CONV_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveConversation(messages: ConversationMessage[]): void {
    try {
      localStorage.setItem(CONV_KEY, JSON.stringify(messages.slice(-50)));
    } catch (e) {
      console.error("Failed to save conversation", e);
    }
  },

  clearConversation(): void {
    try {
      localStorage.removeItem(CONV_KEY);
    } catch (e) {
      console.error("Failed to clear conversation", e);
    }
  },

  // Saved Lessons
  getSavedLessons(): VernacularLesson[] {
    try {
      const data = localStorage.getItem(LESSONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveLesson(lesson: VernacularLesson): void {
    try {
      const list = this.getSavedLessons();
      const updated = [{ ...lesson, savedOffline: true }, ...list.filter((l) => l.id !== lesson.id)];
      localStorage.setItem(LESSONS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save lesson", e);
    }
  },

  deleteLesson(id: string): void {
    try {
      const list = this.getSavedLessons();
      localStorage.setItem(LESSONS_KEY, JSON.stringify(list.filter((l) => l.id !== id)));
    } catch (e) {
      console.error("Failed to delete lesson", e);
    }
  },

  // Saved Worksheets
  getSavedWorksheets(): BilingualWorksheet[] {
    try {
      const data = localStorage.getItem(WORKSHEETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveWorksheet(worksheet: BilingualWorksheet): void {
    try {
      const list = this.getSavedWorksheets();
      const updated = [{ ...worksheet, savedOffline: true }, ...list.filter((w) => w.id !== worksheet.id)];
      localStorage.setItem(WORKSHEETS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save worksheet", e);
    }
  },

  deleteWorksheet(id: string): void {
    try {
      const list = this.getSavedWorksheets();
      localStorage.setItem(WORKSHEETS_KEY, JSON.stringify(list.filter((w) => w.id !== id)));
    } catch (e) {
      console.error("Failed to delete worksheet", e);
    }
  },

  // Offline Language Resource Packs
  getOfflinePacks(): OfflineResourcePack[] {
    try {
      const data = localStorage.getItem(PACKS_KEY);
      return data ? JSON.parse(data) : INITIAL_PACKS;
    } catch {
      return INITIAL_PACKS;
    }
  },

  togglePackDownload(id: string, isDownloaded: boolean): OfflineResourcePack[] {
    const packs = this.getOfflinePacks();
    const updated = packs.map((p) => (p.id === id ? { ...p, isDownloaded } : p));
    localStorage.setItem(PACKS_KEY, JSON.stringify(updated));
    return updated;
  },

  // Settings
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  },
};
