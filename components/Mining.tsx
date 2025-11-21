
import React, { useState } from 'react';
import { PlayerState, Language, MiningFarm, RigType, MiningMode, EnergySource } from '../types';
import { TRANSLATIONS, MINING_LOCATIONS, RIG_TYPES, MINING_MODES, ENERGY_SOURCES } from '../constants';
import { Pickaxe, Zap, Coins, Factory, Plus, X, AlertTriangle, Wrench, Sun, Atom } from 'lucide-react';
import { formatNumber } from '../services/gameEngine';

interface MiningProps {
  player: PlayerState;
  lang: Language;
  onBuyRig: (rigType: RigType, farmId: string) => void;
  onCreateFarm: (locationId: string, name: string) => void;
  onRepairFarm?: (farmId: string) => void; 
}

const Mining: React.FC<MiningProps> = ({ player, lang, onBuyRig, onCreateFarm, onRepairFarm }) => {
  const t = TRANSLATIONS[lang];
  const [showCreateFarm, setShowCreateFarm] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(MINING_LOCATIONS[0].id);
  const [activeFarmId, setActiveFarmId] = useState<string | null>(player.miningFarms.length > 0 ? player.miningFarms[0].id : null);

  const activeFarm = player.miningFarms.find(f => f.id === activeFarmId);

  const handleCreate = () => {
      if(!farmName) return;
      onCreateFarm(selectedLocation, farmName);
      setShowCreateFarm(false);
      setFarmName('');
  };

  const getModeStyle = (mode: MiningMode) => {
      switch(mode) {
          case 'LEGAL': return 'bg-emerald-900/30 text-emerald-400 border-emerald-700';
          case 'OFFSHORE': return 'bg-amber-900/30 text-amber-400 border-amber-700';
          case 'ILLEGAL': return 'bg-rose-900/30 text-rose-400 border-rose-700';
          default: return '';
      }
  };

  return (
    <div className="p-6 h-full overflow-y-auto pb-20">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute right-0 top-0 p-4 opacity-10"><Pickaxe size={64}/></div>
             <p className="text-slate-400 text-xs uppercase">{t.totalHashrate}</p>
             <p className="text-2xl font-bold text-white font-mono">{formatNumber(player.miningStats.totalHashrate, lang)} <span className="text-xs text-slate-500">TH/s</span></p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute right-0 top-0 p-4 opacity-10"><Coins size={64}/></div>
             <p className="text-slate-400 text-xs uppercase">{t.mined24h}</p>
             <p className="text-2xl font-bold text-emerald-400 font-mono">{formatNumber(player.miningStats.btcMinedLast24h, lang)} <span className="text-xs text-slate-500">BTC</span></p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute right-0 top-0 p-4 opacity-10"><Zap size={64}/></div>
             <p className="text-slate-400 text-xs uppercase">{t.dailyProfit}</p>
             <p className={`text-2xl font-bold font-mono ${player.miningStats.dailyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                 ${formatNumber(player.miningStats.dailyProfit, lang)}
             </p>
          </div>
          <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute right-0 top-0 p-4 opacity-10"><Factory size={64}/></div>
             <p className="text-indigo-300 text-xs uppercase">{t.mineToken}</p>
             <p className="text-2xl font-bold text-indigo-400 font-mono">{formatNumber(player.miningStats.mineTokens, lang)}</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Farm List & Management */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Factory size={20}/> {t.myFarms}</h2>
                  <button onClick={() => setShowCreateFarm(true)} className="bg-indigo-600 p-2 rounded-lg hover:bg-indigo-500 text-white"><Plus size={16}/></button>
              </div>
              
              {player.miningFarms.length === 0 ? (
                  <p className="text-slate-500 text-center py-10">{t.noFarms}</p>
              ) : (
                  <div className="space-y-3">
                      {player.miningFarms.map(farm => (
                          <div 
                            key={farm.id} 
                            onClick={() => setActiveFarmId(farm.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-colors relative overflow-hidden
                                ${activeFarmId === farm.id ? 'bg-slate-800 border-indigo-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                          >
                              {farm.status === 'STOPPED' && (
                                  <div className="absolute inset-0 bg-rose-900/50 flex items-center justify-center backdrop-blur-sm z-10">
                                      <div className="bg-slate-900 p-3 rounded-lg border border-rose-500 text-center shadow-xl">
                                          <div className="flex items-center justify-center gap-2 text-rose-400 font-bold mb-2">
                                              <AlertTriangle size={18}/> {farm.disaster.type}
                                          </div>
                                          <p className="text-xs text-slate-300 mb-2">{t.productionHalted}</p>
                                          {onRepairFarm && (
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); onRepairFarm(farm.id); }}
                                                className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded flex items-center gap-1 mx-auto hover:bg-emerald-500"
                                              >
                                                  <Wrench size={12}/> {t.repair} (${formatNumber(farm.disaster.costToFix, lang)})
                                              </button>
                                          )}
                                      </div>
                                  </div>
                              )}
                              <div className="flex justify-between mb-2">
                                  <h3 className="font-bold text-white">{farm.name}</h3>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getModeStyle(farm.mode)}`}>
                                      {t[farm.mode.toLowerCase() as keyof typeof t] || farm.mode}
                                  </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                                  <div>Hash: {formatNumber(farm.totalHashrate, lang)} TH/s</div>
                                  <div>Rigs: {farm.rigs.length}</div>
                                  <div className="flex items-center gap-1">
                                      {farm.energySource === 'SOLAR' && <Sun size={10} className="text-amber-400"/>}
                                      {farm.energySource === 'NUCLEAR' && <Atom size={10} className="text-blue-400"/>}
                                      {farm.energySource === 'GRID' && <Zap size={10} className="text-slate-400"/>}
                                      {t[farm.energySource.toLowerCase() as keyof typeof t] || farm.energySource}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          {/* Rig Shop */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Pickaxe size={20}/> {t.rigShop}</h2>
              
              {activeFarm ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(RIG_TYPES).map(([key, rig]) => {
                           const canAfford = player.cash >= rig.cost;
                           return (
                               <div key={key} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col">
                                   <div className="flex justify-between items-start mb-2">
                                       <div>
                                           <h3 className="font-bold text-white">{rig.name}</h3>
                                           <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">{rig.type}</span>
                                       </div>
                                       <p className="text-amber-400 font-bold font-mono">${formatNumber(rig.cost, lang)}</p>
                                   </div>
                                   
                                   <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-4">
                                       <div className="flex items-center gap-1"><Pickaxe size={12}/> {rig.hashrate} TH/s</div>
                                       <div className="flex items-center gap-1"><Zap size={12}/> {rig.power} W</div>
                                   </div>
                                   
                                   <button 
                                     onClick={() => onBuyRig(rig.type as RigType, activeFarm.id)}
                                     disabled={!canAfford || activeFarm.status === 'STOPPED'}
                                     className={`mt-auto w-full py-2 rounded-lg font-bold transition-colors
                                         ${canAfford && activeFarm.status !== 'STOPPED' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                   >
                                       {activeFarm.status === 'STOPPED' ? t.fixFarmFirst : `${t.buyFor} ${activeFarm.name}`}
                                   </button>
                               </div>
                           );
                      })}
                  </div>
              ) : (
                  <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                      Select or Create a Farm to buy equipment.
                  </div>
              )}
          </div>
      </div>

      {/* Create Farm Modal */}
      {showCreateFarm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-white">{t.createFarm}</h2>
                      <button onClick={() => setShowCreateFarm(false)}><X size={20} className="text-slate-400"/></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs text-slate-500 block mb-1">{t.farmName}</label>
                          <input 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                            value={farmName}
                            onChange={(e) => setFarmName(e.target.value)}
                            placeholder="e.g. Texas Mega Mine"
                          />
                      </div>
                      <div>
                          <label className="text-xs text-slate-500 block mb-1">{t.location}</label>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                              {MINING_LOCATIONS.map(loc => (
                                  <div 
                                    key={loc.id}
                                    onClick={() => setSelectedLocation(loc.id)}
                                    className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center
                                        ${selectedLocation === loc.id ? 'bg-indigo-900/20 border-indigo-500' : 'bg-slate-950 border-slate-800'}`}
                                  >
                                      <div>
                                          <p className="font-bold text-slate-200">{loc.name}</p>
                                          <span className={`text-[10px] px-1.5 rounded ${
                                              loc.regulation === 'LOW' ? 'bg-emerald-900 text-emerald-400' : 
                                              loc.regulation === 'BANNED' ? 'bg-rose-900 text-rose-400' : 'bg-amber-900 text-amber-400'
                                          }`}>{loc.regulation} REGULATION</span>
                                      </div>
                                      <div className="text-right">
                                          <p className="font-mono text-white">${loc.costKwh}/kWh</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      
                      <div className="bg-amber-900/20 p-3 rounded-lg border border-amber-500/30 text-xs text-amber-200">
                          <p className="font-bold mb-1"><AlertTriangle size={12} className="inline"/> {t.miningModesInfo}</p>
                          <p>{t.miningModesDesc}</p>
                      </div>

                      <button 
                        onClick={handleCreate}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-4"
                      >
                          {t.establishFarm}
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Mining;
