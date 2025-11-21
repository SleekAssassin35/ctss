
import React from 'react';
import { Entity, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { User, Building2, Flag, Crown } from 'lucide-react';
import { formatNumber } from '../services/gameEngine';

interface WhaleWatchProps {
  entities: Entity[];
  lang: Language;
}

const WhaleWatch: React.FC<WhaleWatchProps> = ({ entities, lang }) => {
  const t = TRANSLATIONS[lang];

  const getIcon = (type: string, rank: number) => {
    switch (type) {
      case 'COUNTRY': return <Flag size={18} className="text-blue-400" />;
      case 'COMPANY': return <Building2 size={18} className="text-amber-400" />;
      case 'WHALE': 
        return rank < 5 ? <Crown size={18} className="text-amber-400" /> : <User size={18} className="text-purple-400" />;
      default: return <User size={18} className="text-purple-400" />;
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <User className="text-indigo-400" /> {t.whales}
      </h2>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="w-1/12 text-center">#</div>
          <div className="w-4/12">{t.entities}</div>
          <div className="w-3/12 text-right">{t.holdings} (BTC)</div>
          <div className="w-4/12 text-right">{t.status}</div>
        </div>
        
        <div className="divide-y divide-slate-800">
          {entities.map((entity, idx) => {
             const isPlayer = entity.id === 'player-whale' || entity.id.startsWith('cold-');
             return (
                <div key={entity.id} className={`p-4 flex items-center transition-colors ${isPlayer ? 'bg-indigo-900/40 border-l-4 border-indigo-500' : 'hover:bg-slate-800/50 border-l-4 border-transparent'}`}>
                <div className="w-1/12 text-center text-slate-600 font-mono text-xs">{idx + 1}</div>
                <div className="w-4/12 flex items-center gap-3">
                    <div className={`w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center ${idx < 3 ? 'shadow-lg shadow-amber-500/20 border border-amber-500/30' : ''}`}>
                    {getIcon(entity.type, idx)}
                    </div>
                    <div>
                    <p className={`font-bold text-sm ${isPlayer ? 'text-indigo-300' : 'text-slate-200'}`}>{entity.name}</p>
                    <p className="text-[10px] text-slate-500">{entity.type}</p>
                    </div>
                </div>
                
                <div className="w-3/12 text-right font-mono text-slate-300">
                    {formatNumber(entity.btcHoldings, lang)} BTC
                </div>

                <div className="w-4/12 flex flex-col items-end">
                    <span className={`text-[10px] px-2 py-1 rounded font-bold 
                    ${entity.sentiment === 'BULLISH' ? 'bg-emerald-900 text-emerald-400' : 
                        entity.sentiment === 'BEARISH' ? 'bg-rose-900 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                    {entity.sentiment}
                    </span>
                </div>
                </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default WhaleWatch;
