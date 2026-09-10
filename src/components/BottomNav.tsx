import React from "react";
import { Home, Mic, MessagesSquare, GraduationCap, History } from "lucide-react";

export type TabType = "home" | "translate" | "conversation" | "learn" | "history";

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "home" as TabType, label: "Home", icon: Home },
    { id: "translate" as TabType, label: "Translate", icon: Mic, highlight: true },
    { id: "conversation" as TabType, label: "Conversation", icon: MessagesSquare },
    { id: "learn" as TabType, label: "Learn", icon: GraduationCap },
    { id: "history" as TabType, label: "History", icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.highlight) {
            return (
              <button
                key={tab.id}
                id={`bottom-nav-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className="relative -top-3 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-200 group-active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-emerald-950/60 ring-2 ring-emerald-400/40"
                      : "bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-slate-950/60"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1 tracking-tight ${
                    isActive ? "text-emerald-400" : "text-slate-400"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-colors ${
                isActive ? "text-emerald-400 font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[11px] font-medium tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
