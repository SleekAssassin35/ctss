
import React, { useState, useEffect } from 'react';
import { Coin, PlayerState, FuturesPosition, Language, FuturesType, TechnicalIndicators } from '../types';
import { TRANSLATIONS, TRADE_LIMITS, FUNDING_PARAMS } from '../constants';
import Chart from './Chart';
import { analyzeCoin, calculateLiquidationPrice, getMaxLeverageForCoin, formatNumber, calculatePriceImpact } from '../services/gameEngine';
import { AlertTriangle, TrendingUp, TrendingDown, Skull, Lock, ShieldCheck, ShieldAlert, Activity, BarChart2, BrainCircuit, History, X, Target, Flag, Info, Settings2, Layers, Box } from 'lucide-react';

interface FuturesProps {
  coins: Coin[];
  player: PlayerState;
  lang: Language;
  onOpenPosition: (coinId: string, type: 'LONG' | 'SHORT', margin: number, leverage: number, marginType: FuturesType, tp?: number, sl?: number) => void;
  onClosePosition: (positionId: string) => void;
  onAddMargin: (positionId: string, amount: number) => void;
}

const Futures: React.FC<FuturesProps> = ({ coins, player, lang, onOpenPosition, onClosePosition, onAddMargin }) => {
  const t = TRANSLATIONS[lang];
  const [selectedCoinId, setSelectedCoinId] = useState(coins[0].id);
  const [margin, setMargin] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(10);
  const [type, setType] = useState<'LONG' | 'SHORT'>('LONG');
  const [marginType, setMarginType] = useState<FuturesType>('CROSS'); 
  const [tp, setTp] = useState<string>('');
  const [sl, setSl] = useState<string>('');
  const [analysis, setAnalysis] = useState<TechnicalIndicators | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const selectedCoin = coins.find(c => c.id === selectedCoinId) || coins[0];
  const isPriceUp = selectedCoin.change24h >= 0;
  const chartColor = isPriceUp ? '#10b981' : '#f43f5e';

  useEffect(() => {
      const result = analyzeCoin(selectedCoin, player.level);
      setAnalysis(result);
    }, [selectedCoin, selectedCoin.history.length, player.level]);

  const estimatedEntry = selectedCoin.price;
  const estimatedMargin = parseFloat(margin) || 0;
  const estimatedSize = estimatedMargin * leverage;
  
  const maxAllowedLeverage = getMaxLeverageForCoin(selectedCoin.symbol, estimatedSize);
  const maxBaseLeverage = getMaxLeverageForCoin(selectedCoin.symbol, 0); 

  useEffect(() => {
    if (leverage > maxAllowedLeverage) {
        setLeverage(maxAllowedLeverage);
    }
  }, [estimatedSize, maxAllowedLeverage]);

  const totalEquity = player.cash + player.positions.filter(p => p.marginType === 'CROSS').reduce((acc, p) => acc + p.pnl, 0);
  const estLiqPrice = calculateLiquidationPrice(
      estimatedEntry, leverage, type, marginType, estimatedSize, 
      marginType === 'CROSS' ? totalEquity : 0 
  );
  
  const priceImpact = calculatePriceImpact(selectedCoin.symbol, estimatedSize, selectedCoin.volume);

  const fundingRate = selectedCoin.currentFundingRate || 0;
  const fundingBand = FUNDING_PARAMS.LIMITS[selectedCoin.symbol as keyof typeof FUNDING_PARAMS.LIMITS];
  const fundingLimit = fundingBand ? Math.max(Math.abs(fundingBand.max), Math.abs(fundingBand.min)) : 0.0005;
  const isFundingExtreme = Math.abs(fundingRate) > fundingLimit;

  const handleOpen = () => {
      const m = parseFloat(margin);
      const tVal = parseFloat(tp);
      const sVal = parseFloat(sl);
      
      if (leverage > maxAllowedLeverage) {
          alert(`Max leverage for this position size ($${estimatedSize.toLocaleString()}) is ${maxAllowedLeverage}x`);
          return;
      }

      onOpenPosition(selectedCoinId, type, m, leverage, marginType, isNaN(tVal) ? undefined : tVal, isNaN(sVal) ? undefined : sVal);
  };

  if (!player.futuresUnlocked) {
    return (
        <div className="flex flex-col items-center justify-center h-full p-10 text-center">
            <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl flex flex-col items-center max-w-md">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <Lock size={40} className="text-slate-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Futures Market Locked</h2>
                <p className="text-slate-400 mb-6">
                    Derivatives trading is risky. You need to reach <strong>Level 2</strong> and complete basic spot trading training to unlock this feature.
                </p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-indigo-600" 
                      style={{ width: `${Math.min(100, (player.xp / 1000) * 100)}%` }}
                   ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    {player.xp} / 1000 XP to unlock
                </p>
            </div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full overflow-y-auto pb-20 p-6 relative">
      
      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h2 className="font-bold text-white">{t.futures} {t.history}</h2>
                    <button onClick={() => setShowHistory(false)}><X size={20} className="text-slate-400"/></button>
                </div>
                <div className="overflow-y-auto p-4 space-y-2">
                    {[...player.transactions]
                        .filter(t => t.type.includes('FUTURES') || t.type === 'LIQUIDATION' || t.type.includes('HIT'))
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map(tx => (
                        <div key={tx.id} className="bg-slate-950 p-3 rounded border border-slate-800 flex justify-between items-center">
                            <div>
                                <span className={`text-xs font-bold px-2 py-1 rounded uppercase 
                                    ${tx.type === 'LIQUIDATION' ? 'bg-rose-600 text-white' : 
                                      tx.type.includes('HIT') ? 'bg-amber-600 text-white' :
                                      tx.type === 'FUTURES_OPEN' ? 'bg-indigo-900 text-indigo-300' : 'bg-slate-800 text-slate-300'}`}>
                                    {tx.type.replace('FUTURES_', '')}
                                </span>
                                <span className="ml-2 font-bold text-white">{tx.coinSymbol}</span>
                                <p className="text-xs text-slate-500 mt-1">{new Date(tx.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-200">{t.size}: ${tx.amount.toLocaleString()}</p>
                                {tx.impact && tx.impact > 0.001 && <p className="text-[10px] text-amber-500">Impact: {(tx.impact*100).toFixed(2)}%</p>}
                                {tx.pnl !== undefined && (
                                    <p className={`text-xs font-bold ${tx.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {tx.pnl >= 0 ? '+' : ''}{tx.pnl.toFixed(2)}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Trade Panel (Left) */}
      <div className="xl:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
            <TrendingUp size={24} /> {t.futures} <span className="text-xs bg-indigo-900 px-2 py-0.5 rounded text-white">v2.0</span>
            </h2>
            <div className="flex gap-2">
                <button onClick={() => setShowHistory(true)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors" title="History">
                    <History size={18} className="text-indigo-400"/>
                </button>
            </div>
        </div>
        
        <div className="mb-4">
          <div className="flex bg-slate-950 p-1 rounded-lg mb-4">
             <button 
                className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-all ${marginType === 'CROSS' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                onClick={() => setMarginType('CROSS')}
             >
                 <Layers size={14}/> CROSS
             </button>
             <button 
                className={`flex-1 py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1 transition-all ${marginType === 'ISOLATED' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                onClick={() => setMarginType('ISOLATED')}
             >
                 <Box size={14}/> ISOLATED
             </button>
          </div>
          
          <label className="block text-xs text-slate-400 mb-2">{t.asset}</label>
          <div className="grid grid-cols-3 gap-2">
            {coins.slice(0, 6).map(coin => (
              <button
                key={coin.id}
                onClick={() => setSelectedCoinId(coin.id)}
                className={`p-2 rounded-lg border text-sm font-bold transition-all
                  ${selectedCoinId === coin.id 
                    ? 'bg-indigo-600 border-indigo-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'}`}
              >
                {coin.symbol}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-2">
             <label className="text-xs text-slate-400">{t.margin} ($)</label>
             <span className="text-xs text-indigo-400 font-mono">Max: ${formatNumber(player.cash, lang)}</span>
          </div>
          <input
            type="number"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:border-indigo-500 outline-none"
            placeholder={t.amount}
          />
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <label className="text-xs text-slate-400">{t.leverage} (Max {maxAllowedLeverage}x)</label>
            <span className="text-lg font-bold text-amber-400">{leverage}x</span>
          </div>
          <input
            type="range"
            min="1"
            max={maxBaseLeverage}
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* New TP/SL Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
                <label className="text-[10px] text-slate-500 uppercase mb-1 block">TP (Optional)</label>
                <input type="number" value={tp} onChange={e => setTp(e.target.value)} placeholder="Price" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-emerald-400" />
            </div>
            <div>
                <label className="text-[10px] text-slate-500 uppercase mb-1 block">SL (Optional)</label>
                <input type="number" value={sl} onChange={e => setSl(e.target.value)} placeholder="Price" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-rose-400" />
            </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
             <span className="text-slate-400">{t.entry}</span>
             <span className="text-white font-mono">${estimatedEntry.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
             <span className="text-slate-400">{t.size}</span>
             <span className="text-white font-mono">${formatNumber(estimatedSize, lang)}</span>
          </div>
          {priceImpact > 0.005 && (
              <div className="flex justify-between text-sm">
                <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={12}/> Price Impact</span>
                <span className="text-amber-500 font-mono">{(priceImpact*100).toFixed(2)}%</span>
              </div>
          )}
          <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
             <span className="text-rose-400 flex items-center gap-1"><Skull size={12}/> {t.liqPrice}</span>
             <span className="text-rose-400 font-mono font-bold">
                {estLiqPrice === 0 && marginType === 'CROSS' && estimatedSize === 0 ? '---' : `$${estLiqPrice.toFixed(2)}`}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setType('LONG')} className={`py-3 rounded-xl font-bold ${type==='LONG' ? 'bg-emerald-600 text-white':'bg-slate-800 text-slate-400'}`}>{t.long}</button>
          <button onClick={() => setType('SHORT')} className={`py-3 rounded-xl font-bold ${type==='SHORT' ? 'bg-rose-600 text-white':'bg-slate-800 text-slate-400'}`}>{t.short}</button>
        </div>
        <button onClick={handleOpen} className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-white shadow-lg shadow-indigo-900/50">Open Position</button>
      </div>

      {/* Chart & Positions */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">{selectedCoin.symbol}/USD</h3>
            <span className={`text-lg font-mono ${isPriceUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${selectedCoin.price.toFixed(2)}
            </span>
          </div>
          <div className="h-[280px]">
            <Chart data={selectedCoin.history} color={chartColor} />
          </div>
        </div>

        {/* Positions List */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-4">{t.openPos}</h2>
          {player.positions.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
              {t.noPos}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {player.positions.map(pos => {
                const coin = coins.find(c => c.id === pos.coinId);
                if (!coin) return null;
                
                const isProfit = pos.netPnl >= 0;
                const roi = (pos.netPnl / pos.margin) * 100;
                const currentLiqPrice = calculateLiquidationPrice(
                    pos.entryPrice, pos.leverage, pos.type, pos.marginType, pos.size,
                    pos.marginType === 'CROSS' ? totalEquity : 0
                );

                return (
                  <div key={pos.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center relative overflow-hidden group hover:border-slate-600 transition-colors gap-4">
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    
                    <div className="flex-1 w-full md:w-auto">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${pos.type === 'LONG' ? 'bg-emerald-900 text-emerald-400' : 'bg-rose-900 text-rose-400'}`}>
                           {pos.type} {pos.leverage}x
                        </span>
                        <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{pos.marginType}</span>
                        <span className="font-bold text-white ml-2">{coin.symbol}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-500 mt-2">
                          <div>
                             <p>{t.entry}</p>
                             <p className="font-mono text-slate-300">${pos.entryPrice.toFixed(2)}</p>
                          </div>
                          <div>
                             <p>{t.mark}</p>
                             <p className="font-mono text-slate-300">${coin.price.toFixed(2)}</p>
                          </div>
                          <div>
                             <p className="text-rose-400">{t.liqPrice}</p>
                             <p className="font-mono text-rose-400">
                                {currentLiqPrice === 0 && pos.marginType === 'CROSS' ? 'Dynamic' : `$${currentLiqPrice.toFixed(2)}`}
                             </p>
                          </div>
                      </div>
                    </div>

                    {/* Added Position Size and Margin Display */}
                    <div className="flex gap-6 text-xs md:text-right w-full md:w-auto justify-between md:justify-end">
                        <div className="text-center md:text-right">
                            <p className="text-slate-500 uppercase text-[10px]">{t.size}</p>
                            <p className="text-white font-mono font-bold">${formatNumber(pos.size, lang)}</p>
                        </div>
                        <div className="text-center md:text-right">
                            <p className="text-slate-500 uppercase text-[10px]">{t.margin}</p>
                            <p className="text-indigo-300 font-mono font-bold">${formatNumber(pos.margin, lang)}</p>
                        </div>
                    </div>

                    <div className="text-right w-full md:w-auto flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end">
                       <p className={`font-mono font-bold text-lg ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {isProfit ? '+' : ''}{pos.netPnl.toFixed(2)} ({roi.toFixed(1)}%)
                       </p>
                       <div className="flex gap-2 justify-end mt-0 md:mt-2">
                           {pos.marginType === 'ISOLATED' && (
                               <button 
                                onClick={() => {
                                    const amount = prompt("Enter margin amount to add:");
                                    if(amount) onAddMargin(pos.id, parseFloat(amount));
                                }}
                                className="text-xs bg-indigo-900 text-indigo-200 px-2 py-1 rounded hover:bg-indigo-800 transition-colors"
                               >
                                   {t.addMargin}
                               </button>
                           )}
                           <button onClick={() => onClosePosition(pos.id)} className="text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded hover:bg-slate-700 text-white transition-colors">
                               {t.close}
                           </button>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Futures;
