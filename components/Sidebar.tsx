import React from 'react';
import { ViewState, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { LayoutDashboard, CandlestickChart, TrendingUp, MessageCircle, CalendarDays, Landmark, User, Settings, Pickaxe } from 'lucide-react';

interface SidebarProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  lang: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ view, setView, lang }) => {
  const t = TRANSLATIONS[lang];

  const menuItems = [
    { id: ViewState.DASHBOARD, icon: LayoutDashboard, label: t.dashboard },
    { id: ViewState.MARKET, icon: CandlestickChart, label: t.market },
    { id: ViewState.FUTURES, icon: TrendingUp, label: t.futures },
    { id: ViewState.MINING, icon: Pickaxe, label: t.mining },
    { id: ViewState.NEWS_CALENDAR, icon: CalendarDays, label: t.news },
    { id: ViewState.SOCIAL, icon: MessageCircle, label: t.social },
    { id: ViewState.WHALES, icon: User, label: t.whales },
    { id: ViewState.BANK, icon: Landmark, label: t.bank },
    { id: ViewState.SETTINGS, icon: Settings, label: t.settings },
  ];

  return (
    <div className="w-20 lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 transition-all duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
          CT
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hidden lg:block">
          Tycoon
        </h1>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
            >
              <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'} />
              <span className="font-medium hidden lg:block truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-lg p-3 hidden lg:block">
          <p className="text-xs text-slate-500 mb-1">Game Version</p>
          <p className="text-sm font-mono text-slate-300">v1.5.1 Turkish</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;