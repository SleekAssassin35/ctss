
import React from 'react';
import { PlayerState, GameTime, Language } from '../types';
import { TRANSLATIONS, HISTORY_DAYS } from '../constants';
import { getLevelTitle } from '../services/gameEngine';
import { Wallet, Trophy, Clock, Pause, Play, Building2, Zap } from 'lucide-react';

interface HeaderProps {
  player: PlayerState;
  gameTime: GameTime;
  setSpeed: (speed: number) => void;
  lang: Language;
}

const Header: React.FC<HeaderProps> = ({ player, gameTime, setSpeed, lang }) => {
  const levelTitle = getLevelTitle(player.level);
  const t = TRANSLATIONS[lang];

  // Derive display values from absolute totalMinutes
  const totalMinutes = gameTime.totalMinutes;
  // Day 1 starts at minute 0 (or whatever base you choose, typically 0)
  // prompt says "Day 1 - 11:00". 
  // If we start at Day 1, day = floor(totalMinutes / 1440) + 1
  const displayDay = Math.floor(totalMinutes / 1440) + 1;
  const minutesInDay = Math.floor(totalMinutes % 1440);
  const displayHour = Math.floor(minutesInDay / 60);
  const displayMinute = Math.floor(minutesInDay % 60);

  // Speed levels 1-8
  const speedLevels = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-6">
        
        {/* Exchange Balance */}
        <div className="flex items-center gap-3">
           <div className="bg-indigo-900/30 p-2 rounded-lg border border-indigo-500/30">
             <Wallet size={18} className="text-indigo-400" />
           </div>
           <div className="flex flex-col">
             <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.liquidCash}</span>
             <span className="text-lg font-bold text-white font-mono">${player.cash.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
           </div>
        </div>

        <div className="hidden md:block h-8 w-px bg-slate-800"></div>

        {/* Bank Balance */}
        <div className="hidden md:flex items-center gap-3">
           <div className="bg-amber-900/30 p-2 rounded-lg border border-amber-500/30">
             <Building2 size={18} className="text-amber-400" />
           </div>
           <div className="flex flex-col">
             <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{t.bankBalance}</span>
             <span className="text-lg font-bold text-slate-200 font-mono">${player.bankBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
           </div>
        </div>
      </div>

      {/* Time Controls */}
      <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700">
        {/* Play/Pause Toggle */}
        <button 
          onClick={() => setSpeed(gameTime.speed === 0 ? 1 : 0)} 
          className={`p-1.5 rounded-md transition-colors mr-1 ${gameTime.speed === 0 ? 'bg-rose-600 text-white shadow-sm' : 'text-emerald-400 hover:bg-slate-700'}`}
          title={gameTime.speed === 0 ? "Resume" : "Pause"}
        >
          {gameTime.speed === 0 ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
        </button>

        {/* Speed Levels 1-8 */}
        <div className="flex gap-0.5">
          {speedLevels.map((level) => {
            const isActive = gameTime.speed === level;
            return (
              <button
                key={level}
                onClick={() => setSpeed(level)}
                className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold transition-all
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-md scale-105' 
                    : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                title={`Speed Level ${level}`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-3 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700">
           <Clock size={14} className="text-amber-400" />
           <span className="text-xs font-medium text-slate-300">
             {t.day} {displayDay} <span className="text-slate-500 mx-1">|</span> {displayHour.toString().padStart(2, '0')}:{displayMinute.toString().padStart(2, '0')}
           </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
             <p className="text-sm font-bold text-indigo-300">{levelTitle} <span className="text-slate-500 text-xs">(Lvl {player.level})</span></p>
             <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden ml-auto">
               <div 
                 className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                 style={{ width: `${(player.xp / player.xpToNextLevel) * 100}%` }}
               ></div>
             </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
             <Trophy size={16} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
