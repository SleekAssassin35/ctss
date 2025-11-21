
import React, { useState, useEffect } from 'react';
import { Coin, PlayerState, TechnicalIndicators } from '../types';
import { SPOT_LIMITS } from '../constants';
import { TRANSLATIONS } from '../constants';
import Chart from './Chart';
import { analyzeCoin, formatNumber } from '../services/gameEngine';
import { TrendingUp, TrendingDown, DollarSign, History, X } from 'lucide-react';

interface MarketProps {
  coins: Coin[];
  player: PlayerState;
  onBuy: (coinId: string, amount: number) => void;
  onSell: (coinId: string, amount: number) => void;
}

const Market: React.FC<MarketProps> = ({ coins, player, onBuy, onSell }) => {
  // Infer language from somewhere or pass it in. Assuming it's available via props or context. 
  // For now, we need to update the component signature to accept lang if not already there.
  // Looking at App.tsx, <Market> does NOT take lang. I need to update App.tsx too, but I can infer it from TRANSLATIONS usage if I pass it.
  // To stick to the plan, I will update App.tsx to pass lang.
  // Wait, App.tsx passes 'lang' to Settings, Bank, etc. but NOT to Market in the previous file. I need to update App.tsx to pass it.
  // I will update the props interface here first.
  
  // Actually, looking at the file I generated for App.tsx previously, it was:
  // <Market coins={coins} player={player} onBuy={handleBuySpot} onSell={handleSellSpot} />
  // I need to add `lang` to this component.
  return null; 
}
// Re-writing full file content with `lang` prop.

import { Language } from '../types';

interface MarketPropsWithLang {
  coins: Coin[];
  player: PlayerState;
  onBuy: (coinId: string, amount: number) => void;
  onSell: (coinId: string, amount: number) => void;
  lang: Language;
}

const MarketComponent: React.FC<MarketPropsWithLang> = ({ coins, player, onBuy, onSell, lang }) => {
  const t = TRANSLATIONS[lang];
  const [selectedCoinId, setSelectedCoinId] = useState(coins[0].id);
  const [tradeAmountUSD, setTradeAmountUSD] = useState<string>('');
  const [sellAmountUSD, setSellAmountUSD] = useState<string>(''); 
  const [analysis, setAnalysis] = useState<TechnicalIndicators | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const selectedCoin = coins.find(c => c.id === selectedCoinId) || coins[0];
  const playerHolding = player.portfolio.find(p => p.coinId === selectedCoinId);
  
  const isPriceUp = selectedCoin.change24h >= 0;
  const color = isPriceUp ? '#10b981' : '#f43f5e';

  useEffect(() => {
    const result = analyzeCoin(selectedCoin, player.level);
    setAnalysis(result);
  }, [selectedCoin, selectedCoin.history.length, player.level]);

  const handleQuickBuy = (percent: number) => {
    setTradeAmountUSD((player.cash * percent).toFixed(2));
  };

  const handleQuickSell = (percent: number) => {
    if (!playerHolding) return;
    const valueUSD = playerHolding.amount * selectedCoin.price;
    setSellAmountUSD((valueUSD * percent).toFixed(2));
  };

  const handleBuy = () => {
    const amount = parseFloat(tradeAmountUSD);
    const limit = SPOT_LIMITS[selectedCoin.symbol] || 10_000_000;
    if (amount > limit) {
        alert(`Maximum spot buy for ${selectedCoin.symbol} is $${limit.toLocaleString()}`);
        return;
    }
    onBuy(selectedCoinId, amount);
  };

  const handleSell = () => {
      const usd = parseFloat(sellAmountUSD);
      if (usd > 0) {
          const coinAmt = usd / selectedCoin.price;
          onSell(selectedCoinId, coinAmt);
      }
  };

  const sellPreviewCoin = parseFloat(sellAmountUSD) / selectedCoin.price || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full overflow-y-auto pb-20 relative p-4">
      
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="font-bold text-white">Spot {t.history}</h2>
                    <button onClick={() => setShowHistory(false)}><X size={20} className="text-slate-400"/></button>
                </div>
                <div className="overflow-y-auto p-4 space-y-2">
                    {[...player.transactions]
                        .filter(t => t.type.includes('SPOT'))
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map(tx => (
                        <div key={tx.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                            <div>
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${tx.type === 'SPOT_BUY' ? 'bg-emerald-900 text-emerald-400' : 'bg-rose-900 text-rose-400'}`}>
                                    {tx.type.replace('SPOT_', '')}
                                </span>
                                <span className="ml-2 font-bold text-white">{tx.coinSymbol}</span>
                                <p className="text-xs text-slate-500 mt-1">{new Date(tx.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-200">{tx.amount.toFixed(6)} units</p>
                                <p className="text-xs text-slate-400">@ ${tx.price.toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                    {player.transactions.filter(t => t.type.includes('SPOT')).length === 0 && (
                        <p className="text-center text-slate-500 py-10">{t.noTrades}</p>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Coin List (Compact) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[480px]">
        <div className="p-3 border-b border-slate-800 font-bold text-slate-200 text-sm flex justify-between items-center">
            <span>{t.marketOverview}</span>
            <button onClick={() => setShowHistory(true)} className="p-1 hover:bg-slate-800 rounded-lg transition-colors" title="History">
                <History size={16} className="text-indigo-400"/>
            </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {coins.map(coin => (
            <div 
              key={coin.id}
              onClick={() => setSelectedCoinId(coin.id)}
              className={`p-3 border-b border-slate-800 cursor-pointer transition-colors hover:bg-slate-800 flex justify-between items-center
                ${selectedCoinId === coin.id ? 'bg-slate-800/80 border-l-2 border-l-indigo-500' : 'border-l-2 border-l-transparent'}
              `}
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-300">
                  {coin.symbol[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">{coin.symbol}</h3>
                  <p className="text-[10px] text-slate-500">{coin.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium text-slate-200 text-sm">${coin.price.toFixed(coin.price < 1 ? 6 : 2)}</p>
                <p className={`text-[10px] font-bold ${coin.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart & Trade Actions */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Chart Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-[400px] flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {selectedCoin.name} <span className="text-slate-500 text-sm">/ USD</span>
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-mono text-white">${selectedCoin.price.toFixed(selectedCoin.price < 1 ? 8 : 2)}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-bold flex items-center ${isPriceUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {isPriceUp ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
                  {selectedCoin.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-500 uppercase">{t.vol24h}</p>
              <p className="font-mono text-slate-300 text-xs">${(selectedCoin.volume / 1000000).toFixed(2)}M</p>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <Chart data={selectedCoin.history} color={color} />
          </div>
        </div>

        {/* Trading Interface */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buy Side */}
            <div>
              <h3 className="text-sm font-bold text-emerald-400 mb-2">{t.buySpot} {selectedCoin.symbol}</h3>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>{t.balance}</span>
                <span className="text-white font-mono">${player.cash.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
              </div>
              
              <div className="relative mb-2">
                <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="number" 
                  value={tradeAmountUSD}
                  onChange={(e) => setTradeAmountUSD(e.target.value)}
                  placeholder={t.usdAmount}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              
              <div className="flex gap-2 mb-2">
                {[0.25, 0.5, 1].map(pct => (
                  <button 
                    key={pct}
                    onClick={() => handleQuickBuy(pct)}
                    className="flex-1 py-1 bg-slate-800 text-[10px] text-slate-400 rounded hover:bg-slate-700 transition-colors"
                  >
                    {pct * 100}%
                  </button>
                ))}
              </div>

              <button 
                onClick={handleBuy}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 text-sm rounded-lg transition-colors shadow-lg shadow-emerald-900/20 active:scale-95 transform"
              >
                {t.buy}
              </button>
            </div>

            {/* Sell Side */}
            <div>
              <h3 className="text-sm font-bold text-rose-400 mb-2">{t.sell} {selectedCoin.symbol}</h3>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>{t.held}</span>
                <span className="text-white font-mono">{playerHolding ? playerHolding.amount.toFixed(4) : '0.0000'}</span>
              </div>

              <div className="relative mb-2">
                <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="number" 
                  value={sellAmountUSD}
                  onChange={(e) => setSellAmountUSD(e.target.value)}
                  placeholder={t.usdAmount}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              
              <div className="text-[10px] text-slate-500 mb-2 text-right">
                  ≈ {sellPreviewCoin.toFixed(6)} {selectedCoin.symbol}
              </div>

              <div className="flex gap-2 mb-2">
                {[0.25, 0.5, 1].map(pct => (
                  <button 
                    key={pct}
                    onClick={() => handleQuickSell(pct)}
                    className="flex-1 py-1 bg-slate-800 text-[10px] text-slate-400 rounded hover:bg-slate-700 transition-colors"
                  >
                    {pct === 1 ? 'MAX' : `${pct * 100}%`}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleSell}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 text-sm rounded-lg transition-colors shadow-lg shadow-rose-900/20 active:scale-95 transform"
                disabled={!playerHolding || playerHolding.amount <= 0}
              >
                {t.sell}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketComponent;
