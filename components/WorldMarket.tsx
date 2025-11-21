import React from 'react';
import { WorldAsset, IndexData, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import Chart from './Chart';
import { Globe, TrendingUp, TrendingDown, DollarSign, Box } from 'lucide-react';

interface WorldMarketProps {
  assets: WorldAsset[];
  indices: IndexData[];
  lang: Language;
}

const WorldMarket: React.FC<WorldMarketProps> = ({ assets, indices, lang }) => {
  const t = TRANSLATIONS[lang];

  const stocks = assets.filter(a => a.type === 'STOCK' || a.id === 'sp500');
  const commodities = assets.filter(a => a.type === 'COMMODITY');

  const renderCard = (title: string, items: (WorldAsset | IndexData)[], icon: React.ReactNode) => (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, idx) => {
          // Determine ID safely
          const id = 'id' in item ? item.id : item.name;
          const isUp = item.change24h >= 0;
          // Determine Value safely
          const val = 'price' in item ? item.price : item.value;

          return (
            <div key={id} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                   <h4 className="font-bold text-slate-200">{'symbol' in item ? item.symbol : item.name}</h4>
                   <p className="text-xs text-slate-500">{'name' in item ? item.name : 'Index'}</p>
                </div>
                <div className="text-right">
                   <p className="font-mono text-white">${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                   <p className={`text-xs font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'} flex items-center justify-end gap-1`}>
                     {isUp ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
                     {Math.abs(item.change24h).toFixed(2)}%
                   </p>
                </div>
              </div>
              <div className="h-24">
                 <Chart data={item.history} color={isUp ? '#10b981' : '#f43f5e'} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-6 h-full overflow-y-auto pb-20">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Globe className="text-indigo-400" /> {t.worldMarket}
      </h2>

      {renderCard(t.indices, indices, <TrendingUp size={20} className="text-blue-400"/>)}
      {renderCard(t.stocks, stocks, <DollarSign size={20} className="text-emerald-400"/>)}
      {renderCard(t.commodities, commodities, <Box size={20} className="text-amber-400"/>)}
      
      <div className="bg-indigo-900/20 border border-indigo-900/50 p-4 rounded-xl mt-6">
        <h4 className="font-bold text-indigo-300 mb-2">Market Correlation Logic</h4>
        <p className="text-sm text-indigo-200/80">
          Global markets are interconnected. A crash in the S&P 500 often triggers a risk-off event in Crypto. 
          Gold usually acts inversely to stocks. BTC drives the TOTAL crypto index, which in turn pulls altcoins.
          Watch the world market to predict crypto movements!
        </p>
      </div>
    </div>
  );
};

export default WorldMarket;