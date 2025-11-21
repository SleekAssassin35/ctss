
import React from 'react';
import { PlayerState, Coin, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Wallet, Building2, TrendingUp, PieChart } from 'lucide-react';
import { formatNumber } from '../services/gameEngine';

interface DashboardProps {
  player: PlayerState;
  coins: Coin[];
  lang: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ player, coins, lang }) => {
  const t = TRANSLATIONS[lang];

  const portfolioValue = player.portfolio.reduce((acc, item) => {
    const coin = coins.find(c => c.id === item.coinId);
    return acc + (item.amount * (coin?.price || 0));
  }, 0);

  const futuresPnl = player.positions.reduce((acc, pos) => acc + pos.pnl, 0);
  const futuresMargin = player.positions.reduce((acc, pos) => acc + pos.margin, 0);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6">{t.dashboard}</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-emerald-500/10 w-24 h-24 rounded-full group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <p className="text-slate-400 text-sm mb-1">{t.netWorth}</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">${formatNumber(player.netWorth, lang)}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-indigo-500/10 w-24 h-24 rounded-full group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={16} className="text-indigo-400" />
              <p className="text-slate-400 text-sm">{t.liquidCash}</p>
            </div>
            <p className="text-2xl font-bold text-white font-mono">${formatNumber(player.cash, lang)}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 bg-amber-500/10 w-24 h-24 rounded-full group-hover:scale-110 transition-transform" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={16} className="text-amber-400" />
              <p className="text-slate-400 text-sm">{t.bankBalance}</p>
            </div>
            <p className="text-2xl font-bold text-white font-mono">${formatNumber(player.bankBalance, lang)}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full group-hover:scale-110 transition-transform ${futuresPnl >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className={futuresPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'} />
              <p className="text-slate-400 text-sm">{t.futuresPnl}</p>
            </div>
            <p className={`text-2xl font-bold font-mono ${futuresPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {futuresPnl >= 0 ? '+' : ''}{formatNumber(futuresPnl, lang)}
            </p>
          </div>
        </div>
      </div>

      {/* Holdings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spot Holdings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-blue-400" /> {t.spotPortfolio}
            <span className="text-sm font-normal text-slate-500 ml-auto">${formatNumber(portfolioValue, lang)}</span>
          </h3>
          <div className="space-y-3">
            {player.portfolio.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No assets.</p>
            ) : (
              player.portfolio.map(item => {
                const coin = coins.find(c => c.id === item.coinId);
                if (!coin) return null;
                const currentValue = item.amount * coin.price;
                const profit = currentValue - (item.amount * item.avgBuyPrice);
                const profitPercent = (profit / (item.amount * item.avgBuyPrice)) * 100;
                
                return (
                  <div key={item.coinId} className="bg-slate-950 p-3 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                        {coin.symbol[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-200">{coin.name}</p>
                        <p className="text-xs text-slate-500">{formatNumber(item.amount, lang)} {coin.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-slate-200">${formatNumber(currentValue, lang)}</p>
                      <p className={`text-xs font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {profit >= 0 ? '+' : ''}{formatNumber(profitPercent, lang)}%
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Futures Overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-purple-400" /> {t.activeFutures}
            <span className="text-sm font-normal text-slate-500 ml-auto">{t.margin}: ${formatNumber(futuresMargin, lang)}</span>
          </h3>
          <div className="space-y-3">
            {player.positions.length === 0 ? (
              <p className="text-slate-500 text-center py-4">{t.noPos}</p>
            ) : (
              player.positions.map(pos => {
                const coin = coins.find(c => c.id === pos.coinId);
                return (
                  <div key={pos.id} className="bg-slate-950 p-3 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${pos.type === 'LONG' ? 'bg-emerald-900 text-emerald-400' : 'bg-rose-900 text-rose-400'}`}>
                        {pos.type} {pos.leverage}x
                      </span>
                      <p className="font-bold text-slate-200">{coin?.symbol}/USD</p>
                    </div>
                    <p className={`font-mono font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {pos.pnl >= 0 ? '+' : ''}${formatNumber(pos.pnl, lang)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
