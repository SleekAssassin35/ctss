
import React, { useState } from 'react';
import { PlayerState, Coin, Language, FeedItem } from '../types';
import { TRANSLATIONS } from '../constants';
import { MessageCircle, Send, Heart, MessageSquare, Repeat } from 'lucide-react';
import { formatGameTime } from '../services/gameEngine';

interface SocialMediaProps {
  player: PlayerState;
  coins: Coin[];
  lang: Language;
  feed: FeedItem[];
  onTweet: (text: string, coinId: string, type: 'PUMP' | 'FUD' | 'ANALYSIS') => void;
}

const SocialMedia: React.FC<SocialMediaProps> = ({ player, coins, lang, feed, onTweet }) => {
  const t = TRANSLATIONS[lang];
  const [tweetText, setTweetText] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(coins[0].id);
  const [selectedType, setSelectedType] = useState<'PUMP' | 'FUD' | 'ANALYSIS'>('ANALYSIS');
  const [isSending, setIsSending] = useState(false);

  const handleSend = () => {
    if (!tweetText.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      onTweet(tweetText, selectedCoin, selectedType);
      setTweetText('');
      setIsSending(false);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 pb-20 overflow-hidden p-6">
      {/* Create Post */}
      <div className="w-full lg:w-1/3 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6 h-fit">
        <div className="text-center pb-6 border-b border-slate-800">
           <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full mx-auto mb-4 p-1">
             <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
               <span className="text-2xl font-bold text-white">You</span>
             </div>
           </div>
           <h2 className="text-xl font-bold text-white">@{player.playerName}</h2>
           <div className="grid grid-cols-2 gap-2 mt-4">
             <div className="bg-slate-800 p-2 rounded-lg text-center">
               <p className="text-xs text-slate-500">{t.followers}</p>
               <p className="font-bold text-white">{(player.reputation * 1540).toLocaleString()}</p>
             </div>
             <div className="bg-slate-800 p-2 rounded-lg text-center">
               <p className="text-xs text-slate-500">{t.rep}</p>
               <p className="font-bold text-emerald-400">{player.reputation}</p>
             </div>
           </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase">{t.tweet}</h3>
          
          <textarea 
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 h-32 resize-none"
            placeholder="What's happening in the market?"
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">{t.asset}</label>
              <select 
                value={selectedCoin} 
                onChange={(e) => setSelectedCoin(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              >
                {coins.map(c => <option key={c.id} value={c.id}>{c.symbol}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">{t.tone}</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
              >
                <option value="ANALYSIS">{t.analysis}</option>
                <option value="PUMP">{t.hype} (Bullish)</option>
                <option value="FUD">{t.fud} (Bearish)</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleSend}
            disabled={isSending || !tweetText}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-auto transition-all
              ${selectedType === 'PUMP' ? 'bg-emerald-600 hover:bg-emerald-500' :
                selectedType === 'FUD' ? 'bg-rose-600 hover:bg-rose-500' :
                'bg-indigo-600 hover:bg-indigo-500'}`}
          >
            {isSending ? 'Posting...' : <><Send size={18} /> {t.send}</>}
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageCircle size={24} className="text-blue-400"/> CryptoNet Feed
          </h2>
          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded animate-pulse">● LIVE</span>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {feed.length === 0 && <p className="text-center text-slate-500">Waiting for network activity...</p>}
          {/* feed already sorted in App.tsx usually, but ensure we map correctly */}
          {feed.map((item) => (
             <div key={item.id} className="bg-slate-950 rounded-xl p-4 border border-slate-800 transition-all hover:border-slate-700">
               <div className="flex items-start gap-3">
                 <div className={`w-10 h-10 ${item.avatarColor} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
                   {item.author[0]}
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                     <p className="font-bold text-slate-200 truncate">{item.author}</p>
                     <p className="text-xs text-slate-500 truncate">{item.handle}</p>
                     <p className="text-[10px] text-slate-600 ml-auto">{formatGameTime(item.timestamp)}</p>
                     {item.type === 'ALERT' && <span className="text-[10px] bg-red-900 text-red-300 px-1 rounded">ALERT</span>}
                   </div>
                   <p className="text-slate-300 text-sm mb-3 whitespace-pre-wrap">{item.content}</p>
                   
                   {/* Social Actions */}
                   <div className="flex items-center gap-6 border-t border-slate-800 pt-2">
                      <button className="flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors text-xs">
                        <Heart size={14} /> {item.likes}
                      </button>
                      <button className="flex items-center gap-1 text-slate-500 hover:text-blue-400 transition-colors text-xs">
                        <MessageSquare size={14} /> {item.comments}
                      </button>
                      <button className="flex items-center gap-1 text-slate-500 hover:text-emerald-400 transition-colors text-xs">
                        <Repeat size={14} /> {Math.floor(item.likes / 3)}
                      </button>
                   </div>
                 </div>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialMedia;
