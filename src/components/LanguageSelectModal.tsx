import React, { useState, useMemo } from "react";
import { Search, X, Check, Volume2, Mic, Globe2, Sparkles } from "lucide-react";
import { Language, LanguageCategory } from "../types";

interface LanguageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (language: Language | { code: "auto"; name: "Auto Detect"; nativeName: "Automatic"; category: "POPULAR"; speechSupport: true; translationSupport: true; ttsSupport: true }) => void;
  selectedCode: string;
  languages: Language[];
  isSourceSelector?: boolean;
  title?: string;
}

const CATEGORY_ORDER: LanguageCategory[] = [
  "POPULAR",
  "TAMIL_NADU",
  "INDIAN",
  "TRIBAL",
];

const CATEGORY_LABELS: Record<LanguageCategory, string> = {
  POPULAR: "POPULAR",
  TAMIL_NADU: "TAMIL NADU LANGUAGES",
  INDIAN: "INDIAN LANGUAGES",
  TRIBAL: "TRIBAL / INDIGENOUS LANGUAGES",
};

export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  selectedCode,
  languages,
  isSourceSelector = false,
  title = "Select Language",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("ALL");

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return languages.filter((lang) => {
      const matchSearch =
        !q ||
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q);
      const matchCategory =
        activeCategoryTab === "ALL" || lang.category === activeCategoryTab;
      return matchSearch && matchCategory;
    });
  }, [languages, searchQuery, activeCategoryTab]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-backdrop"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="language-select-card"
        className="w-full max-w-xl max-h-[85vh] flex flex-col bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-emerald-400" />
              {title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isSourceSelector
                ? "Choose input language or use Auto Detect"
                : "Choose target language for translation and speech"}
            </p>
          </div>
          <button
            id="close-language-modal"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800/80 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="language-search-input"
              type="text"
              placeholder="Search language (e.g. Tamil, Malayalam, Mundari)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setActiveCategoryTab("ALL")}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeCategoryTab === "ALL"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryTab(cat)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  activeCategoryTab === cat
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat === "TAMIL_NADU"
                  ? "Tamil Nadu"
                  : cat === "TRIBAL"
                  ? "Tribal / Indigenous"
                  : cat === "INDIAN"
                  ? "Indian"
                  : "Popular"}
              </button>
            ))}
          </div>
        </div>

        {/* Language List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Auto Detect Option for Source Selector */}
          {isSourceSelector && !searchQuery && activeCategoryTab === "ALL" && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-2 mb-1.5">
                AUTOMATIC DETECTION
              </div>
              <button
                id="select-lang-auto"
                onClick={() => {
                  onSelect({
                    code: "auto",
                    name: "Auto Detect",
                    nativeName: "Automatic",
                    category: "POPULAR",
                    speechSupport: true,
                    translationSupport: true,
                    ttsSupport: true,
                  });
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                  selectedCode === "auto"
                    ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                      Auto Detect
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                        Smart AI
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Speaks any Indian regional or tribal dialect
                    </div>
                  </div>
                </div>
                {selectedCode === "auto" && (
                  <Check className="w-5 h-5 text-emerald-400" />
                )}
              </button>
            </div>
          )}

          {/* Grouped by Categories */}
          {CATEGORY_ORDER.map((category) => {
            const catLangs = filteredLanguages.filter(
              (l) => l.category === category
            );
            if (catLangs.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {catLangs.length} {catLangs.length === 1 ? "language" : "languages"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {catLangs.map((lang) => {
                    const isSelected = selectedCode === lang.code;

                    return (
                      <button
                        key={lang.code}
                        id={`select-lang-${lang.code}`}
                        onClick={() => {
                          onSelect(lang);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left group ${
                          isSelected
                            ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-300"
                            : "bg-slate-950/60 border-slate-800/70 text-slate-200 hover:bg-slate-800/50 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                              isSelected
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                            }`}
                          >
                            {lang.code.toUpperCase().substring(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-100 truncate">
                                {lang.name}
                              </span>
                              <span className="text-xs text-slate-400 font-normal">
                                {lang.nativeName}
                              </span>
                            </div>

                            {/* Technical Capability Indicators required by prompt */}
                            <div className="flex items-center gap-2 mt-1 text-[10px]">
                              {lang.speechSupport ? (
                                <span className="flex items-center gap-0.5 text-emerald-400">
                                  <Mic className="w-2.5 h-2.5" />
                                  ✓ Speech
                                </span>
                              ) : (
                                <span className="text-slate-500">
                                  ○ Speech unavailable
                                </span>
                              )}

                              {lang.translationSupport ? (
                                <span className="flex items-center gap-0.5 text-emerald-400">
                                  <Check className="w-2.5 h-2.5" />
                                  ✓ Translation
                                </span>
                              ) : (
                                <span className="text-amber-400">
                                  ○ In development
                                </span>
                              )}

                              {lang.ttsSupport ? (
                                <span className="flex items-center gap-0.5 text-emerald-400">
                                  <Volume2 className="w-2.5 h-2.5" />
                                  ✓ Voice
                                </span>
                              ) : (
                                <span className="text-amber-300/80">
                                  ○ Voice unavailable
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <Check className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredLanguages.length === 0 && (
            <div className="text-center py-10 px-4">
              <Globe2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <div className="text-slate-300 font-medium text-sm">
                No matching languages found
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Try searching for Tamil, Malayalam, Telugu, Kannada, or Mundari.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Tamil Nadu & Indian Vernacular Translation</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
