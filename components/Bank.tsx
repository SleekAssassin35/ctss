
import React, { useState } from 'react';
import { PlayerState, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Landmark, Snowflake, Plus, Building } from 'lucide-react';
import { formatNumber } from '../services/gameEngine';

interface BankProps {
  player: PlayerState;
  lang: Language;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  onTransferToCold?: (walletId: string, coin: 'BTC'|'ETH'|'SOL', amount: number) => void;
  onCreateColdWallet?: (name: string) => void;
}

const Bank: React.FC<BankProps> = ({ player, lang, onDeposit, onWithdraw, onTransferToCold, onCreateColdWallet }) => {
  const t = TRANSLATIONS[lang];
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState<'DEPOSIT' | 'WITHDRAW' | 'COLD'>('WITHDRAW');
  const [newWalletName, setNewWalletName] = useState('');
  const [selectedColdWallet, setSelectedColdWallet] = useState(player.coldWallets?.[0]?.id || '');
  const [transferCoin, setTransferCoin] = useState<'BTC'|'ETH'|'SOL'>('BTC');

  const handleAction = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    if (mode === 'DEPOSIT') {
      onDeposit(val);
    } else if (mode === 'WITHDRAW') {
      onWithdraw(val);
    } else if (mode === 'COLD') {
        if (onTransferToCold && selectedColdWallet) {
            onTransferToCold(selectedColdWallet, transferCoin, val);
        }
    }
    setAmount('');
  };

  const handleCreateWallet = () => {
      if (onCreateColdWallet && newWalletName) {
          onCreateColdWallet(newWalletName);
          setNewWalletName('');
      }
  };

  return (
    <div className="p-6 h-full overflow-y-auto pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bank Interface */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Landmark className="text-amber-400" /> {t.bank}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-500 uppercase mb-1">{t.bankBalance}</p>
              <p className="text-2xl font-bold text-white font-mono">${formatNumber(player.bankBalance, lang)}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-500 uppercase mb-1">{t.liquidCash}</p>
              <p className="text-2xl font-bold text-emerald-400 font-mono">${formatNumber(player.cash, lang)}</p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex gap-2 mb-6">
               <button 
                 onClick={() => setMode('WITHDRAW')}
                 className={`flex-1 py-3 rounded-lg font-bold transition-all text-xs sm:text-sm ${mode === 'WITHDRAW' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
               >
                 {t.withdraw}
               </button>
               <button 
                 onClick={() => setMode('DEPOSIT')}
                 className={`flex-1 py-3 rounded-lg font-bold transition-all text-xs sm:text-sm ${mode === 'DEPOSIT' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
               >
                 {t.deposit}
               </button>
               <button 
                 onClick={() => setMode('COLD')}
                 className={`flex-1 py-3 rounded-lg font-bold transition-all text-xs sm:text-sm flex items-center justify-center gap-1 ${mode === 'COLD' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400'}`}
               >
                 <Snowflake size={14}/> {t.coldWallet}
               </button>
            </div>

            {mode === 'COLD' ? (
                <div className="space-y-4">
                    {player.coldWallets.length === 0 ? (
                        <div className="text-center py-4 text-slate-500">No Cold Wallets created yet.</div>
                    ) : (
                        <>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">{t.selectWallet}</label>
                                <select 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                    value={selectedColdWallet}
                                    onChange={(e) => setSelectedColdWallet(e.target.value)}
                                >
                                    {player.coldWallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">{t.asset}</label>
                                <select 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                    value={transferCoin}
                                    onChange={(e) => setTransferCoin(e.target.value as any)}
                                >
                                    <option value="BTC">Bitcoin (BTC)</option>
                                    <option value="ETH">Ethereum (ETH)</option>
                                    <option value="SOL">Solana (SOL)</option>
                                </select>
                            </div>
                            <div className="relative">
                              <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={t.amount}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-4 pr-4 text-xl font-mono text-white focus:outline-none focus:border-cyan-500"
                              />
                            </div>
                            <button 
                              onClick={handleAction}
                              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
                            >
                              <Snowflake size={18}/> {t.freezeAssets}
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <div className="relative mb-6">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={t.amount}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-4 pl-8 pr-4 text-xl font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <button 
                      onClick={handleAction}
                      className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
                    >
                      {t.confirmTx}
                    </button>
                </>
            )}
          </div>
        </div>

        {/* Cold Wallet Manager & Tax */}
        <div className="space-y-6">
            {/* Cold Wallets */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Snowflake className="text-cyan-400" /> {t.coldWalletManager}
                </h2>
                
                <div className="flex gap-2 mb-4">
                    <input 
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm"
                        placeholder={t.walletName}
                        value={newWalletName}
                        onChange={(e) => setNewWalletName(e.target.value)}
                    />
                    <button onClick={handleCreateWallet} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-500"><Plus size={20}/></button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {player.coldWallets.map(w => (
                        <div key={w.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                            <div className="flex justify-between mb-1">
                                <span className="font-bold text-slate-200">{w.name}</span>
                                <span className="text-xs text-slate-500">Cold Storage</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-400">
                                <div>{formatNumber(w.balanceBTC, lang)} BTC</div>
                                <div>{formatNumber(w.balanceETH, lang)} ETH</div>
                                <div>{formatNumber(w.balanceSOL, lang)} SOL</div>
                            </div>
                        </div>
                    ))}
                    {player.coldWallets.length === 0 && <p className="text-slate-500 text-sm text-center italic">{t.secureAssets}</p>}
                </div>
            </div>

            {/* Tax Office */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Building className="text-rose-400" /> {t.tax}
              </h2>

              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 p-6 bg-rose-900/10 rounded-2xl border border-rose-900/30 border-dashed">
                 <h3 className="text-lg font-bold text-rose-200">{t.unpaidLiability}</h3>
                 <p className="text-3xl font-bold text-rose-500 font-mono">
                   ${formatNumber(player.taxDue, lang)}
                 </p>
                 <button className="px-6 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg mt-4 text-sm">
                   {t.payTax}
                 </button>
              </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Bank;
