
import React, { useState } from 'react';
import { Language, PlayerState } from '../types';
import { TRANSLATIONS } from '../constants';
import { Globe, Terminal, Save, User, BarChart3 } from 'lucide-react';
import { formatNumber } from '../services/gameEngine';

interface SettingsProps {
  lang: Language;
  setLang: (lang: Language) => void;
  player?: PlayerState; 
  onUpdateFunds?: (cash: number, bank: number) => void;
  onUpdateName?: (name: string) => void;
  onUpdateLevel?: (level: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ lang, setLang, player, onUpdateFunds, onUpdateName, onUpdateLevel }) => {
  const t = TRANSLATIONS[lang];
  const [cashInput, setCashInput] = useState(player?.cash.toString() || '0');
  const [bankInput, setBankInput] = useState(player?.bankBalance.toString() || '0');
  const [nameInput, setNameInput] = useState(player?.playerName || 'CryptoWhale');
  const [levelInput, setLevelInput] = useState(player?.level.toString() || '1');

  const languages: { id: Language; name: string; flag: string }[] = [
    { id: 'EN', name: 'English', flag: '🇬🇧' },
    { id: 'TR', name: 'Türkçe', flag: '🇹🇷' },
    { id: 'DE', name: 'Deutsch', flag: '🇩🇪' },
    { id: 'FR', name: 'Français', flag: '🇫🇷' },
  ];

  const handleSaveFunds = () => {
    if (onUpdateFunds) {
      const c = parseFloat(cashInput);
      const b = parseFloat(bankInput);
      if (!isNaN(c) && !isNaN(b)) {
        onUpdateFunds(c, b);
        alert("Funds Updated!");
      }
    }
  };

  const handleSaveProfile = () => {
      if (onUpdateName) {
          onUpdateName(nameInput);
          alert("Profile Name Updated");
      }
  };

  const handleSaveLevel = () => {
      if (onUpdateLevel) {
          const l = parseInt(levelInput);
          if (l > 0) {
              onUpdateLevel(l);
              alert("Level Updated");
          }
      }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      
      {/* Profile Settings */}
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <User className="text-purple-400" /> {t.profile}
      </h2>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
         <div className="flex gap-4 items-end">
             <div className="flex-1">
                 <label className="text-xs text-slate-500 mb-1 block">Display Name</label>
                 <input 
                   type="text"
                   value={nameInput}
                   onChange={(e) => setNameInput(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                 />
             </div>
             <button 
               onClick={handleSaveProfile}
               className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold"
             >
               Save
             </button>
         </div>
      </div>

      {/* Stats */}
      {player && (
        <>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="text-emerald-400" /> {t.statistics}
            </h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-950 p-4 rounded-xl">
                        <p className="text-slate-500 text-xs">{t.totalTrades}</p>
                        <p className="text-xl font-bold text-white">{player.tradeStats.totalTrades}</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl">
                        <p className="text-slate-500 text-xs">{t.wins}</p>
                        <p className="text-xl font-bold text-emerald-400">{player.tradeStats.winningTrades}</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl">
                        <p className="text-slate-500 text-xs">{t.losses}</p>
                        <p className="text-xl font-bold text-rose-400">{player.tradeStats.losingTrades}</p>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl">
                        <p className="text-slate-500 text-xs">{t.winRate}</p>
                        <p className="text-xl font-bold text-amber-400">
                            {player.tradeStats.totalTrades > 0 
                                ? ((player.tradeStats.winningTrades / player.tradeStats.totalTrades) * 100).toFixed(1) 
                                : 0}%
                        </p>
                    </div>
                </div>
                <div className="mt-4 text-center">
                    <p className="text-slate-500 text-xs mb-1">{t.netPnl}</p>
                    <p className={`text-2xl font-mono font-bold ${player.tradeStats.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {player.tradeStats.netPnL >= 0 ? '+' : ''}${formatNumber(player.tradeStats.netPnL, lang)}
                    </p>
                </div>
            </div>
        </>
      )}

      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Globe className="text-indigo-400" /> Language
      </h2>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languages.map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={`p-4 rounded-xl border flex items-center gap-4 transition-all
                ${lang === l.id 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                  : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'}`}
            >
              <span className="text-2xl">{l.flag}</span>
              <span className="font-bold">{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Admin Panel */}
      {player && onUpdateFunds && (
        <>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Terminal className="text-emerald-400" /> {t.devTools}
          </h2>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">{t.liquidCash}</label>
                <input 
                  type="number" 
                  value={cashInput} 
                  onChange={(e) => setCashInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">{t.bankBalance}</label>
                <input 
                  type="number" 
                  value={bankInput} 
                  onChange={(e) => setBankInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Player Level</label>
                <input 
                  type="number" 
                  value={levelInput} 
                  onChange={(e) => setLevelInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white font-mono"
                />
              </div>
            </div>
            <div className="flex gap-4">
                <button 
                  onClick={handleSaveFunds}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  <Save size={18} /> {t.setFunds}
                </button>
                <button 
                  onClick={handleSaveLevel}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  <Terminal size={18} /> {t.setLevel}
                </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Settings;
