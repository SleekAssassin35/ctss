
import React from 'react';
import { CalendarEvent, NewsItem, PlayerState } from '../types';
import { getDeterministicForecast, getLevelTitle, formatGameTime } from '../services/gameEngine';
import { CalendarDays, Newspaper, HelpCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface NewsCalendarProps {
  news: NewsItem[];
  events: CalendarEvent[];
  player: PlayerState;
}

const NewsCalendar: React.FC<NewsCalendarProps> = ({ news, events, player }) => {
  // Note: This component also needs 'lang' to translate static texts, but I'll rely on props updates if I missed it.
  // Assuming I update App.tsx to pass lang to NewsCalendar if I add it.
  // But wait, the user only complained about "Forecast" and "HIGH IMPACT" which are English in the screenshot.
  // I will just hardcode simple English/Turkish switch or better: check the existing props.
  // App.tsx currently passes: news, events, player. It DOES NOT pass lang.
  // I will update App.tsx to pass lang.
  return null;
}

// Rewriting file with lang prop
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface NewsCalendarPropsWithLang {
  news: NewsItem[];
  events: CalendarEvent[];
  player: PlayerState;
  lang: Language;
}

const NewsCalendarComponent: React.FC<NewsCalendarPropsWithLang> = ({ news, events, player, lang }) => {
  const rank = getLevelTitle(player.level);
  const t = TRANSLATIONS[lang];

  const renderForecast = (event: CalendarEvent) => {
    const forecast = getDeterministicForecast(event.id, event.actualDirection, player.level);
    
    if (forecast === 'UNCLEAR') {
      return <span className="flex items-center gap-1 text-slate-500"><HelpCircle size={14}/> Unclear</span>;
    }

    const isBull = forecast === 'BULLISH';
    return (
      <span className={`flex items-center gap-1 font-bold ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isBull ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} 
        {isBull ? 'Bullish' : 'Bearish'}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto pb-20">
      
      {/* Recent News Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
          <Newspaper size={24} /> {t.globalNews}
        </h2>
        <div className="space-y-4">
          {news.length === 0 && <p className="text-slate-500 text-center py-10">No recent news.</p>}
          {/* Sorted newest first */}
          {news.map(item => (
             <div key={item.id} className="border-l-2 border-slate-700 pl-4 py-1 relative">
                <div className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full 
                  ${item.impact === 'HIGH' ? 'bg-rose-500 animate-pulse' : item.impact === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'}`} 
                />
                <p className="text-xs text-slate-500 mb-1">{formatGameTime(item.timestamp)}</p> 
                <h4 className="font-bold text-slate-200 text-sm">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase mt-1 inline-block
                  ${item.sentiment === 'BULLISH' ? 'border-emerald-500 text-emerald-500' : 
                    item.sentiment === 'BEARISH' ? 'border-rose-500 text-rose-500' : 'border-slate-500 text-slate-500'}`}>
                  {item.sentiment}
                </span>
             </div>
          ))}
        </div>
      </div>

      {/* Economic Calendar & Forecast */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
             <CalendarDays size={24} /> Economic Calendar
           </h2>
           <div className="text-right">
             <p className="text-xs text-slate-500">Analyst Rank</p>
             <p className="text-sm font-bold text-indigo-300">{rank}</p>
           </div>
        </div>

        <div className="space-y-4 flex-1">
          {events.length === 0 && (
            <div className="text-center text-slate-500 py-10 border border-dashed border-slate-800 rounded-xl">
              No upcoming major events.
            </div>
          )}
          {events.map(event => (
            <div key={event.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="text-xs font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{event.date}</span>
                   {event.impact === 'HIGH' && <span className="text-[10px] font-bold bg-rose-900/50 text-rose-400 px-1.5 rounded border border-rose-900">{t.highImpact}</span>}
                 </div>
                 <h3 className="font-bold text-slate-200">{event.title}</h3>
               </div>
               
               <div className="text-right min-w-[100px]">
                 <p className="text-[10px] text-slate-500 uppercase mb-1">{t.forecast}</p>
                 <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-sm">
                   {renderForecast(event)}
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsCalendarComponent;
