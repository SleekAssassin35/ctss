
import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Coin, PlayerState, GameTime, NewsItem, CalendarEvent, Language, Entity, FeedItem, MarketState, FuturesType, Transaction, RigType, ExecutionResult, FuturesPosition, ColdWallet } from './types';
import { INITIAL_COINS, INITIAL_PLAYER, TRADE_LIMITS, RIG_TYPES, MINING_LOCATIONS, SPEED_LEVELS, EVENT_CHECK_INTERVALS, GENERATE_INITIAL_CALENDAR, FEE_RATES, FUNDING_PARAMS, WHALE_NEWS_TEMPLATES } from './constants';
import { calculateCorrelatedMovements, checkLiquidations, generateEntities, simulateWhaleActivity, initializeMarketState, updateMarketCycle, generateHistoricalData, calculateLiquidationPrice, calculateMiningRewards, updateMiningDifficulty, generateRandomNews, simulateMiningDisasters, getNewsImpactValue, executeMarketOrder, updateFundingRates, calculatePlayerHazardScore, formatGameTime, calculatePriceImpact } from './services/gameEngine';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Market from './components/Market';
import Futures from './components/Futures';
import NewsCalendar from './components/NewsCalendar';
import SocialMedia from './components/SocialMedia';
import Dashboard from './components/Dashboard';
import Bank from './components/Bank';
import WhaleWatch from './components/WhaleWatch';
import Mining from './components/Mining';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [lang, setLang] = useState<Language>('TR');
  
  const [coins, setCoins] = useState<Coin[]>(INITIAL_COINS);
  
  const [player, setPlayer] = useState<PlayerState>(INITIAL_PLAYER);
  const [gameTime, setGameTime] = useState<GameTime>({ totalMinutes: 480, day: 1, hour: 8, minute: 0, speed: 1 }); 
  
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  
  const [marketState, setMarketState] = useState<MarketState | null>(null);
  
  const lastFrameTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);
  
  const liquidationCheckAccumulatorRef = useRef<number>(0);
  const miningAccumulatorRef = useRef<number>(0);
  const fundingAccumulatorRef = useRef<number>(0);

  useEffect(() => {
    const { coins: histCoins } = generateHistoricalData(INITIAL_COINS, 96 * 90);
    setCoins(histCoins);
    
    const initialMarketState = initializeMarketState();
    initialMarketState.nextFundingTimestamp = 8 * 60; 
    setMarketState(initialMarketState);
    setEntities(generateEntities());
    
    setEvents(GENERATE_INITIAL_CALENDAR(1));

    setFeed([{
      id: 'init',
      author: 'System',
      handle: '@GameEngine',
      avatarColor: 'bg-slate-600',
      content: `Simulation Initialized. Day 1.`,
      timestamp: 480, // Game Minute
      likes: 0,
      comments: 0,
      type: 'NEWS'
    }]);
  }, []);

  useEffect(() => {
      if (player.xp >= player.xpToNextLevel) {
          setPlayer(prev => ({
              ...prev,
              level: prev.level + 1,
              xp: 0,
              xpToNextLevel: Math.floor(prev.xpToNextLevel * 1.5),
          }));
      }
  }, [player.xp]);

  useEffect(() => {
     const playerBtc = player.portfolio.find(p => p.coinId === 'bitcoin')?.amount || 0;
     const coldWalletEntities: Entity[] = player.coldWallets.map(w => ({
         id: `cold-${w.id}`,
         name: `${w.name} (You)`,
         type: 'WHALE',
         btcHoldings: w.balanceBTC,
         ethHoldings: w.balanceETH,
         solHoldings: w.balanceSOL,
         sentiment: 'HODL',
         tradeFrequency: 0,
         tradeSizeMultiplier: 0
     }));

     setEntities(prev => {
         const others = prev.filter(e => e.id !== 'player-whale' && !e.id.startsWith('cold-'));
         const myEntities = [...coldWalletEntities];
         
         if (playerBtc > 1000) {
             myEntities.push({
                 id: 'player-whale',
                 name: `${player.playerName} (Exchange)`,
                 type: 'WHALE',
                 btcHoldings: playerBtc,
                 ethHoldings: 0, solHoldings: 0,
                 sentiment: 'BULLISH',
                 tradeFrequency: 0,
                 tradeSizeMultiplier: 1
             });
         }
         return [...others, ...myEntities].sort((a, b) => b.btcHoldings - a.btcHoldings);
     });
  }, [player.portfolio, player.playerName, player.coldWallets]);

  // --- MAIN GAME LOOP (PHYSICS ENGINE) ---
  const updateGame = (timestamp: number) => {
    if (!lastFrameTimeRef.current) lastFrameTimeRef.current = timestamp;
    
    const deltaTimeMS = timestamp - lastFrameTimeRef.current;
    lastFrameTimeRef.current = timestamp;

    if (gameTime.speed === 0 || !marketState) {
        requestRef.current = requestAnimationFrame(updateGame);
        return;
    }

    const multiplier = SPEED_LEVELS[gameTime.speed] || 1;
    const gameMinutesDelta = (deltaTimeMS / 1000) * multiplier;
    
    setGameTime(prevGT => {
        const newTotalMinutes = prevGT.totalMinutes + gameMinutesDelta;
        const d = Math.floor(newTotalMinutes / 1440) + 1;
        const m = Math.floor(newTotalMinutes % 1440);
        const h = Math.floor(m / 60);
        const min = Math.floor(m % 60);
        return { ...prevGT, totalMinutes: newTotalMinutes, day: d, hour: h, minute: min };
    });

    const currentTotalMinutes = gameTime.totalMinutes + gameMinutesDelta;

    liquidationCheckAccumulatorRef.current += gameMinutesDelta;
    miningAccumulatorRef.current += gameMinutesDelta;
    fundingAccumulatorRef.current += gameMinutesDelta;

    const d = Math.floor(currentTotalMinutes / 1440) + 1;

    // --- INFINITE CALENDAR GENERATION ---
    if (events.length > 0) {
        const lastEventStr = events[events.length - 1].date;
        const lastEventDay = parseInt(lastEventStr.replace(/[^0-9]/g, '')) || 60;
        
        if (d > lastEventDay - 30) {
             const newEvents = GENERATE_INITIAL_CALENDAR(lastEventDay + 1);
             setEvents(prev => [...prev, ...newEvents]);
        }
    }

    // --- EVENT CHECK & CLEANUP ---
    setEvents(prevEvents => {
         let updated = false;
         const nextEvents = prevEvents.filter(event => {
             const eventDay = parseInt(event.date.replace(/[^0-9]/g, ''));
             if (d >= eventDay) {
                 if (!event.applied) {
                     const sentiment = event.actualDirection;
                     const impact = getNewsImpactValue(event.impact, sentiment);
                     setMarketState(curr => {
                         if(!curr) return null;
                         return { ...curr, newsSentimentBias: curr.newsSentimentBias + impact };
                     });
                     
                     setFeed(curr => [{
                         id: Date.now().toString(),
                         author: "Economic Calendar",
                         handle: "@EventBot",
                         avatarColor: "bg-indigo-800",
                         content: `EVENT APPLIED: ${event.title}. Market reacting ${sentiment}.`,
                         timestamp: currentTotalMinutes,
                         likes: 0,
                         comments: 0,
                         type: 'NEWS' as const
                     }, ...curr]);
                     updated = true;
                     return false; 
                 }
                 return false; 
             }
             return true; 
         });
         return updated ? nextEvents : prevEvents;
    });

    // --- LIQUIDATION HUNT LOGIC ---
    let huntTarget: { coinId: string, direction: 'UP' | 'DOWN' } | undefined;
    
    const hazardScore = calculatePlayerHazardScore(player, coins);
    if (hazardScore > 1.8) {
        const chance = 0.18 + (hazardScore / 100); 
        const tickChance = chance * (gameMinutesDelta / 10000); 

        if (Math.random() < tickChance) {
             const riskyPos = player.positions.reduce((prev, current) => {
                 return (current.size * current.leverage) > (prev.size * prev.leverage) ? current : prev;
             }, player.positions[0]);

             if (riskyPos) {
                 const huntDir = riskyPos.type === 'LONG' ? 'DOWN' : 'UP';
                 huntTarget = { coinId: riskyPos.coinId, direction: huntDir };
                 
                 const template = WHALE_NEWS_TEMPLATES.find(t => t.type === (huntDir === 'DOWN' ? 'HUNT_LONG' : 'HUNT_SHORT'));
                 if (template) {
                      const coinSymbol = coins.find(c => c.id === riskyPos.coinId)?.symbol || 'Asset';
                      setFeed(curr => [{
                          id: Date.now().toString(),
                          author: "Market Maker",
                          handle: "@WhaleHunter",
                          avatarColor: "bg-rose-950",
                          content: `⚡ ${template.title.replace('{coin}', coinSymbol)}. ${template.desc.replace('{coin}', coinSymbol)}`,
                          timestamp: currentTotalMinutes,
                          likes: 666,
                          comments: 0,
                          type: 'ALERT' as const
                      }, ...curr]);
                 }
             }
        }
    }

    // --- MARKET PHYSICS ---
    // Pass 'lang' here to generate cycle news in correct language
    let { newState: updatedMarketState, news: cycleNews } = updateMarketCycle(marketState, gameMinutesDelta / 1440, currentTotalMinutes, lang);
    
    if (cycleNews) {
        const sentiment = cycleNews.content.includes('Accum') || cycleNews.content.includes('BULL') ? 'BULLISH' : 'BEARISH';
        const impact = getNewsImpactValue('HIGH', sentiment);
        updatedMarketState.newsSentimentBias += impact;
        setFeed(prev => [cycleNews!, ...prev]);
    }

    const { newCoins } = calculateCorrelatedMovements(
        coins, events, updatedMarketState, currentTotalMinutes, gameMinutesDelta, huntTarget
    );

    // --- FUNDING ENGINE (Every 8 hours) ---
    if (fundingAccumulatorRef.current >= (FUNDING_PARAMS.INTERVAL_HOURS * 60)) {
        const coinsWithNewRates = updateFundingRates(newCoins, updatedMarketState.phase);
        newCoins.splice(0, newCoins.length, ...coinsWithNewRates); 
        
        setPlayer(prev => {
            let walletChange = 0;
            const updatedPositions = prev.positions.map(pos => {
                 const coin = newCoins.find(c => c.id === pos.coinId);
                 if (!coin) return pos;
                 const rate = coin.currentFundingRate || 0;
                 const notional = pos.size; 
                 const fee = notional * rate;
                 let feeAmount = 0;
                 if (pos.type === 'LONG') feeAmount = fee;
                 else feeAmount = -fee;
                 
                 // Deduct funding from Cash (for Cross) or Margin (for Isolated? No, usually wallet)
                 // Simplifying: Always deduct from Wallet (Cash)
                 walletChange -= feeAmount; 
                 return { ...pos, fundingFees: pos.fundingFees + feeAmount };
            });
            
            if (Math.abs(walletChange) > 10) {
                 setFeed(curr => [{
                    id: Date.now().toString(), author: "Funding System", handle: "@BitMexBot", avatarColor: "bg-slate-700",
                    content: `Funding Paid/Received: $${(-walletChange).toFixed(2)}`, timestamp: currentTotalMinutes, likes: 0, comments: 0, type: 'ALERT' as const
                 }, ...curr]);
            }
            return { ...prev, cash: prev.cash + walletChange, positions: updatedPositions }
        });
        fundingAccumulatorRef.current = 0;
    }

    // --- MINING & OTHER ENGINES ---
    const btcPrice = newCoins.find(c => c.id === 'bitcoin')?.price || 45000;
    
    setPlayer(prev => {
        const newDiff = updateMiningDifficulty(prev.miningStats.networkDifficulty, btcPrice, 0);
        const { btcMined, powerUsage, maintenanceCost, mineTokenReward } = calculateMiningRewards(prev.miningFarms, newDiff, btcPrice, gameMinutesDelta);
        
        let totalPeriodCost = maintenanceCost;
        prev.miningFarms.forEach(farm => {
            if (farm.status === 'ACTIVE') {
              const loc = MINING_LOCATIONS.find(l => l.id === farm.countryId);
              let rate = loc?.costKwh || 0.10;
              if (farm.energySource === 'SOLAR') rate = 0; 
              if (farm.energySource === 'NUCLEAR') rate = 0.01;
              const hoursPassed = gameMinutesDelta / 60;
              totalPeriodCost += (farm.totalPower / 1000) * hoursPassed * rate; 
            }
        });

        let newPortfolio = [...prev.portfolio];
        const btcIndex = newPortfolio.findIndex(p => p.coinId === 'bitcoin');
        if (btcIndex >= 0) {
            newPortfolio[btcIndex].amount += btcMined;
        } else if (btcMined > 0) {
            newPortfolio.push({ coinId: 'bitcoin', amount: btcMined, avgBuyPrice: 0 });
        }

        const projectedDailyRev = (btcMined / gameMinutesDelta) * 1440;
        return {
            ...prev,
            cash: prev.cash - totalPeriodCost,
            portfolio: newPortfolio,
            miningStats: {
                ...prev.miningStats,
                dailyRevenue: projectedDailyRev || prev.miningStats.dailyRevenue,
                dailyCost: (totalPeriodCost / gameMinutesDelta) * 1440 || prev.miningStats.dailyCost,
                dailyProfit: (projectedDailyRev * btcPrice) - ((totalPeriodCost / gameMinutesDelta) * 1440),
                btcMinedLast24h: prev.miningStats.btcMinedLast24h + btcMined,
                mineTokens: prev.miningStats.mineTokens + mineTokenReward
            }
        };
    });

    // Liquidation Hunts (Whale Activity)
    if (liquidationCheckAccumulatorRef.current >= EVENT_CHECK_INTERVALS.LIQUIDATION_HUNT_MINS) {
        const { updatedEntities, newsUpdates, feedUpdates, volumeAdd } = simulateWhaleActivity(
            entities, updatedMarketState, newCoins, 
            liquidationCheckAccumulatorRef.current,
            currentTotalMinutes,
            lang // Pass lang
        );
        newsUpdates.forEach(n => {
             const impact = getNewsImpactValue(n.impact, n.sentiment);
             updatedMarketState.newsSentimentBias += impact;
        });
        setEntities(updatedEntities);
        if (newsUpdates.length > 0) setNews(prev => [...prev, ...newsUpdates].slice(-50));
        if (feedUpdates.length > 0) setFeed(prev => [...prev, ...feedUpdates].slice(-50));
        
        newCoins.forEach(c => { if (c.id === 'bitcoin') c.volume += volumeAdd; });
        liquidationCheckAccumulatorRef.current = 0;
    }

    if (miningAccumulatorRef.current >= 60) {
        setPlayer(prev => {
            const { updatedFarms, alert } = simulateMiningDisasters(prev.miningFarms, lang); // Pass lang
            if (alert) {
                 setFeed(prevFeed => [{ id: Date.now().toString(), author: 'Mining Alert', handle: '@SysAdmin', avatarColor: 'bg-amber-600', content: alert!, timestamp: currentTotalMinutes, likes: 0, comments: 0, type: 'ALERT' as const }, ...prevFeed]);
            }
            return { ...prev, miningFarms: updatedFarms };
        });
        miningAccumulatorRef.current = 0;
    }
    
    setMarketState(updatedMarketState);
    setCoins(newCoins);

    // Check Liquidations & TP/SL
    setPlayer(prevPlayer => {
        // The checkLiquidations now properly calculates equity for Cross positions using Cash + Unrealized PnL
        const { active, liquidated, hitStopTp, remainingCash } = checkLiquidations(prevPlayer.positions, newCoins, prevPlayer.cash);
        
        let newTransactions: Transaction[] = [];
        let netPnLChange = 0;
        let totalReturnedCash = 0;

        if (liquidated.length > 0) {
             const liqTxns: Transaction[] = liquidated.map(l => ({
                 id: Date.now().toString() + Math.random(), timestamp: Date.now(), type: 'LIQUIDATION', coinSymbol: coins.find(c => c.id === l.coinId)?.symbol || '???', amount: l.size, price: l.liquidationPrice, pnl: -l.margin
             }));
             newTransactions = [...newTransactions, ...liqTxns];
             // If isolated, cash doesn't change (margin lost). If Cross, cash absorbs the hit in checkLiquidations return?
             // Actually checkLiquidations doesn't auto-deduct realized loss from 'remainingCash' if it was a cross liquidation that wiped account
             // But simpler model: Liquidation = Margin lost.
             setFeed(prev => [...prev, { id: Date.now().toString(), author: "Liquidation Bot", handle: "@RektCity", avatarColor: "bg-rose-900", content: `💀 REKT! Positions liquidated.`, timestamp: currentTotalMinutes, likes: 999, comments: 50, type: 'ALERT' as const }]);
        }

        if (hitStopTp.length > 0) {
            hitStopTp.forEach(pos => {
                const coin = coins.find(c => c.id === pos.coinId);
                const exitPrice = coin?.price || pos.entryPrice; 
                const txType = pos.netPnl > 0 ? 'TP_HIT' : 'SL_HIT';
                newTransactions.push({ id: Date.now().toString() + Math.random(), timestamp: Date.now(), type: txType, coinSymbol: coin?.symbol || '???', amount: pos.size, price: exitPrice, pnl: pos.netPnl });
                
                // Return Margin + PnL
                totalReturnedCash += (pos.margin + pos.netPnl);
                netPnLChange += pos.netPnl;
            });
            setFeed(prev => [...prev, { id: Date.now().toString(), author: "Trade Bot", handle: "@RiskManager", avatarColor: "bg-blue-600", content: `🎯 TP/SL Hit! ${hitStopTp.length} position(s) closed.`, timestamp: currentTotalMinutes, likes: 50, comments: 0, type: 'ALERT' as const }]);
        }

        if (liquidated.length > 0 || hitStopTp.length > 0) {
             return { ...prevPlayer, cash: remainingCash + totalReturnedCash, positions: active, transactions: [...prevPlayer.transactions, ...newTransactions], tradeStats: { ...prevPlayer.tradeStats, netPnL: prevPlayer.tradeStats.netPnL + netPnLChange } };
        }
        return { ...prevPlayer, cash: remainingCash, positions: active };
    });
    
    const prevDay = Math.floor(gameTime.totalMinutes / 1440) + 1;
    if (d > prevDay) {
         const randomNews = generateRandomNews(updatedMarketState.phase, currentTotalMinutes, lang); // Pass lang
         if (randomNews) {
             setNews(prev => [randomNews, ...prev].slice(-50));
             const impact = getNewsImpactValue(randomNews.impact, randomNews.sentiment);
             setMarketState(curr => { if(!curr) return null; return { ...curr, newsSentimentBias: curr.newsSentimentBias + impact }; });
         }
         setPlayer(prev => ({ ...prev, miningStats: { ...prev.miningStats, btcMinedLast24h: 0 } }));
    }

    requestRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
      requestRef.current = requestAnimationFrame(updateGame);
      return () => cancelAnimationFrame(requestRef.current);
  }, [gameTime.speed, marketState, coins, entities, lang]); // Added lang to dependency
  
  const canTrade = () => {
      const now = Date.now();
      if (now - player.lastTradeTime < TRADE_LIMITS.COOLDOWN_MS) {
          return false;
      }
      return true;
  };

  const broadcastPlayerTrade = (type: string, symbol: string, amountUSD: number, price: number) => {
      const btcPrice = coins.find(c => c.id === 'bitcoin')?.price || 1;
      const estimatedBtcAmount = symbol === 'BTC' ? (amountUSD / price) : (amountUSD / btcPrice);
      const feedContent = `🐋 PLAYER ${type} ${estimatedBtcAmount.toFixed(2)} BTC worth of ${symbol} @ $${price.toFixed(2)}`;
      let impact = 0;
      if (estimatedBtcAmount >= 1000) {
          const sentiment = type.includes('BUY') || type.includes('LONG') ? 'BULLISH' : 'BEARISH';
          const newsItem = { id: Date.now().toString() + Math.random(), title: `Whale Alert: Player ${type} ${symbol}`, description: feedContent, impact: 'MEDIUM' as any, sentiment: sentiment as any, timestamp: gameTime.totalMinutes };
          setNews(prev => [newsItem, ...prev].slice(-50));
          impact = getNewsImpactValue('MEDIUM', sentiment);
      }
      if (estimatedBtcAmount >= 5000) {
           setFeed(prev => [{ id: Date.now().toString(), author: player.playerName, handle: '@You', avatarColor: 'bg-indigo-600', content: feedContent + " !!!", timestamp: gameTime.totalMinutes, likes: Math.floor(Math.random() * 1000), comments: 50, type: 'USER' as const }, ...prev].slice(-50));
      }
      if (impact !== 0) { setMarketState(prev => { if (!prev) return null; return { ...prev, newsSentimentBias: prev.newsSentimentBias + impact }; }); }
  };

  const handleBuySpot = (coinId: string, amountUSD: number) => {
    if (!canTrade()) return;
    if (amountUSD <= 0 || player.cash < amountUSD) return;
    const coin = coins.find(c => c.id === coinId);
    if (!coin) return;
    const execution = executeMarketOrder(coin, 'BUY', amountUSD / coin.price, entities);
    setCoins(prev => prev.map(c => c.id === coinId ? { ...c, price: execution.finalPrice, marketCap: execution.finalPrice * c.circulatingSupply } : c));
    const txn: Transaction = { id: Date.now().toString(), timestamp: Date.now(), type: 'SPOT_BUY', coinSymbol: coin.symbol, amount: execution.filledSize, price: execution.vwapPrice, slippage: execution.slippagePct };
    broadcastPlayerTrade('BOUGHT', coin.symbol, amountUSD, execution.vwapPrice);
    setPlayer(prev => {
      const existing = prev.portfolio.find(p => p.coinId === coinId);
      const newPortfolio = existing ? prev.portfolio.map(p => p.coinId === coinId ? { ...p, amount: p.amount + execution.filledSize } : p) : [...prev.portfolio, { coinId, amount: execution.filledSize, avgBuyPrice: execution.vwapPrice }];
      return { ...prev, cash: prev.cash - amountUSD, portfolio: newPortfolio, xp: prev.xp + 10, transactions: [...prev.transactions, txn], lastTradeTime: Date.now() };
    });
  };

  const handleSellSpot = (coinId: string, amountCoin: number) => {
    if (!canTrade()) return;
    const holding = player.portfolio.find(p => p.coinId === coinId);
    if (!holding || holding.amount < amountCoin) return;
    const coin = coins.find(c => c.id === coinId);
    if (!coin) return;
    const execution = executeMarketOrder(coin, 'SELL', amountCoin, entities);
    const realizedUSD = amountCoin * execution.vwapPrice;
    setCoins(prev => prev.map(c => c.id === coinId ? { ...c, price: execution.finalPrice, marketCap: execution.finalPrice * c.circulatingSupply } : c));
    const txn: Transaction = { id: Date.now().toString(), timestamp: Date.now(), type: 'SPOT_SELL', coinSymbol: coin.symbol, amount: amountCoin, price: execution.vwapPrice, slippage: execution.slippagePct };
    broadcastPlayerTrade('SOLD', coin.symbol, realizedUSD, execution.vwapPrice);
    setPlayer(prev => {
      const newPortfolio = prev.portfolio.map(p => p.coinId === coinId ? { ...p, amount: p.amount - amountCoin } : p).filter(p => p.amount > 0.000001);
      return { ...prev, cash: prev.cash + realizedUSD, portfolio: newPortfolio, xp: prev.xp + 10, transactions: [...prev.transactions, txn], lastTradeTime: Date.now() };
    });
  };
  
  // --- FUTURES V2 LOGIC ---
  const handleOpenPosition = (coinId: string, type: 'LONG' | 'SHORT', margin: number, leverage: number, marginType: FuturesType, tp?: number, sl?: number) => {
     if (!canTrade()) return;
     if (margin > player.cash) {
         alert("Insufficient funds in Exchange Wallet.");
         return;
     }
     
     const coin = coins.find(c => c.id === coinId);
     if (!coin) return;

     const positionSize = margin * leverage;
     const approxCoinAmt = positionSize / coin.price;
     
     // 1. Calculate & Apply Price Impact IMMEDIATELY (Simulating large market order)
     const impactPct = calculatePriceImpact(coin.symbol, positionSize, coin.volume);
     const impactFactor = type === 'LONG' ? (1 + impactPct) : (1 - impactPct);
     const executionPrice = coin.price * impactFactor;
     
     // Update Coin Price State immediately
     setCoins(prev => prev.map(c => c.id === coinId ? { ...c, price: executionPrice } : c));
     
     const tradingFee = positionSize * FEE_RATES.TAKER;

     setPlayer(prev => {
         let newPositions = [...prev.positions];
         let updatedCash = prev.cash;
         let newTxn: Transaction | null = null;
         
         // --- ISOLATED MARGIN ---
         if (marginType === 'ISOLATED') {
             updatedCash -= (margin + tradingFee);
             const liquidationPrice = calculateLiquidationPrice(executionPrice, leverage, type, marginType, positionSize, 0);
             const newPosition: FuturesPosition = { 
                 id: Math.random().toString(36).substr(2, 9), 
                 coinId, type, marginType, leverage, 
                 entryPrice: executionPrice, margin, size: positionSize, liquidationPrice, 
                 pnl: 0, realizedPnl: 0, tradingFees: tradingFee, fundingFees: 0, netPnl: -tradingFee, 
                 tp, sl 
             };
             newPositions.push(newPosition);
             newTxn = { id: Date.now().toString(), timestamp: Date.now(), type: 'FUTURES_OPEN', coinSymbol: coin.symbol, amount: positionSize, price: executionPrice, slippage: impactPct * 100, impact: impactPct };
         } 
         // --- CROSS MARGIN ---
         else {
             // Check for existing Cross position for this coin
             const existingIndex = newPositions.findIndex(p => p.coinId === coinId && p.marginType === 'CROSS');
             
             updatedCash -= tradingFee; // Fee is always paid upfront from wallet
             
             if (existingIndex === -1) {
                 // Case A: New Cross Position
                 // Note: For Cross, 'margin' field is just for tracking initial cost basis, doesn't lock funds like isolated
                 // But we deduct from cash to simulate "putting money into the position" logic or keep it simple?
                 // Prompt says: "initial_margin kadar tutar cross_balance’tan “kullanılan marjin” gibi işaretleniyor"
                 // Simplest implementation: Deduct from cash, add to position.margin. 
                 // Liquidation check uses (Remaining Cash + Position Margins + PnL) vs Maintenance.
                 updatedCash -= margin;
                 
                 const liquidationPrice = calculateLiquidationPrice(executionPrice, leverage, type, marginType, positionSize, updatedCash); // Liq depends on total equity
                 newPositions.push({ 
                    id: Math.random().toString(36).substr(2, 9), 
                    coinId, type, marginType, leverage, 
                    entryPrice: executionPrice, margin, size: positionSize, liquidationPrice, 
                    pnl: 0, realizedPnl: 0, tradingFees: tradingFee, fundingFees: 0, netPnl: -tradingFee, 
                    tp, sl 
                 });
                 newTxn = { id: Date.now().toString(), timestamp: Date.now(), type: 'FUTURES_OPEN', coinSymbol: coin.symbol, amount: positionSize, price: executionPrice, slippage: impactPct * 100, impact: impactPct };

             } else {
                 const existing = newPositions[existingIndex];
                 
                 if (existing.type === type) {
                     // Case B: Merge (Same Direction)
                     const totalSize = existing.size + positionSize;
                     const newEntry = ((existing.entryPrice * existing.size) + (executionPrice * positionSize)) / totalSize;
                     
                     // Recalculate effective leverage or maintain?
                     // Prompt: leverage = new_notional / total_margin
                     const totalMargin = existing.margin + margin;
                     const newLeverage = totalSize / totalMargin;
                     
                     updatedCash -= margin;

                     newPositions[existingIndex] = { 
                         ...existing, 
                         size: totalSize, 
                         margin: totalMargin, 
                         entryPrice: newEntry, 
                         leverage: newLeverage, // Update leverage based on new weighted avg
                         tradingFees: existing.tradingFees + tradingFee 
                     };
                     
                     newTxn = { id: Date.now().toString(), timestamp: Date.now(), type: 'FUTURES_OPEN', coinSymbol: coin.symbol, amount: positionSize, price: executionPrice, slippage: impactPct * 100, impact: impactPct };

                 } else {
                     // Case C: Reduce / Flip (Opposite Direction)
                     // Close existing first
                     if (positionSize <= existing.size) {
                         // Partial Close
                         const closeRatio = positionSize / existing.size;
                         const closeMargin = existing.margin * closeRatio;
                         
                         // PnL Calculation
                         const pnl = existing.type === 'LONG' 
                             ? (executionPrice - existing.entryPrice) * (positionSize / existing.entryPrice) 
                             : (existing.entryPrice - executionPrice) * (positionSize / existing.entryPrice);
                         
                         // Return Margin + PnL to Cash
                         updatedCash += (closeMargin + pnl);
                         
                         if (positionSize === existing.size) {
                             // Full Close
                             newPositions.splice(existingIndex, 1);
                         } else {
                             // Reduce
                             newPositions[existingIndex] = { 
                                 ...existing, 
                                 size: existing.size - positionSize, 
                                 margin: existing.margin - closeMargin, 
                                 realizedPnl: existing.realizedPnl + pnl, 
                                 tradingFees: existing.tradingFees + tradingFee 
                             };
                         }
                         newTxn = { id: Date.now().toString(), timestamp: Date.now(), type: 'FUTURES_CLOSE', coinSymbol: coin.symbol, amount: positionSize, price: executionPrice, pnl: pnl, slippage: impactPct * 100 };

                     } else {
                         // Flip Position (Close Old -> Open New)
                         const pnl = existing.type === 'LONG' 
                             ? (executionPrice - existing.entryPrice) * (existing.size / existing.entryPrice) 
                             : (existing.entryPrice - executionPrice) * (existing.size / existing.entryPrice);
                         
                         updatedCash += (existing.margin + pnl); // Refund old position
                         
                         // Open New Remaining
                         const remainingSize = positionSize - existing.size;
                         const remainingMargin = (remainingSize / positionSize) * margin;
                         
                         updatedCash -= remainingMargin; // Deduct new margin
                         
                         newPositions[existingIndex] = { 
                             ...existing, 
                             type: type, // Flip type
                             size: remainingSize, 
                             entryPrice: executionPrice, 
                             margin: remainingMargin, 
                             leverage: leverage,
                             realizedPnl: existing.realizedPnl + pnl, 
                             tradingFees: existing.tradingFees + tradingFee, 
                             fundingFees: 0 
                         };
                         
                         newTxn = { id: Date.now().toString(), timestamp: Date.now(), type: 'FUTURES_OPEN', coinSymbol: coin.symbol, amount: remainingSize, price: executionPrice, slippage: impactPct * 100 };
                     }
                 }
             }
         }
         
         const transactions = newTxn ? [...prev.transactions, newTxn] : prev.transactions;
         return { 
             ...prev, 
             cash: updatedCash, 
             positions: newPositions, 
             xp: prev.xp + 50, 
             transactions, 
             lastTradeTime: Date.now() 
         };
     });
     
     broadcastPlayerTrade(`OPENED ${type} ${leverage}x`, coin.symbol, positionSize, executionPrice);
  };
  
  const handleClosePosition = (positionId: string) => {
    if (!canTrade()) return;
    let executionData: ExecutionResult | null = null;
    let closedPnl = 0;
    let closeFee = 0;
    let netPnlFinal = 0;
    setPlayer(prev => {
      const pos = prev.positions.find(p => p.id === positionId);
      if (!pos) return prev;
      const coin = coins.find(c => c.id === pos.coinId);
      if (!coin) return prev;
      const closeSide = pos.type === 'LONG' ? 'SELL' : 'BUY';
      const coinAmount = pos.size / coin.price; 
      
      // Apply impact on close too
      const impactPct = calculatePriceImpact(coin.symbol, pos.size, coin.volume);
      // Update price locally for calculation
      const impactFactor = closeSide === 'BUY' ? (1 + impactPct) : (1 - impactPct);
      const closePrice = coin.price * impactFactor;
      
      closeFee = pos.size * FEE_RATES.TAKER;
      closedPnl = pos.type === 'LONG' ? (closePrice - pos.entryPrice) * (pos.size / pos.entryPrice) : (pos.entryPrice - closePrice) * (pos.size / pos.entryPrice);
      netPnlFinal = closedPnl - pos.tradingFees - closeFee - pos.fundingFees;
      const returnedCash = pos.margin + closedPnl - closeFee;
      const txn: Transaction = { id: Date.now().toString(), timestamp: Date.now(), type: 'FUTURES_CLOSE', coinSymbol: coin.symbol, amount: pos.size, price: closePrice, pnl: netPnlFinal, slippage: impactPct * 100 };
      const isWin = netPnlFinal > 0;
      
      return { ...prev, cash: prev.cash + returnedCash, positions: prev.positions.filter(p => p.id !== positionId), xp: prev.xp + (isWin ? 100 : 10), transactions: [...prev.transactions, txn], tradeStats: { totalTrades: prev.tradeStats.totalTrades + 1, winningTrades: prev.tradeStats.winningTrades + (isWin ? 1 : 0), losingTrades: prev.tradeStats.losingTrades + (isWin ? 0 : 1), netPnL: prev.tradeStats.netPnL + netPnlFinal }, lastTradeTime: Date.now() };
    });
  };

  const handleAddMargin = (positionId: string, amount: number) => {
      if (amount <= 0 || player.cash < amount) return;
      setPlayer(prev => {
          const posIndex = prev.positions.findIndex(p => p.id === positionId);
          if (posIndex === -1) return prev;
          const newPositions = [...prev.positions];
          const pos = newPositions[posIndex];
          if (pos.marginType !== 'ISOLATED') return prev;
          pos.margin += amount;
          const maintenanceMarginRate = 0.005; 
          const liqDist = ((pos.margin / pos.size) - maintenanceMarginRate) * pos.entryPrice;
          pos.liquidationPrice = pos.type === 'LONG' ? pos.entryPrice - liqDist : pos.entryPrice + liqDist;
          return { ...prev, cash: prev.cash - amount, positions: newPositions };
      });
  };

  const handleCreateFarm = (locationId: string, name: string) => {
      if(player.cash < 5000) return;
      setPlayer(prev => ({ ...prev, cash: prev.cash - 5000, miningFarms: [...prev.miningFarms, { id: Date.now().toString(), countryId: locationId, name, rigs: [], totalHashrate: 0, totalPower: 0, dailyCost: 0, status: 'ACTIVE', disaster: { type: 'NONE', costToFix: 0 }, mode: 'LEGAL', energySource: 'GRID', solarCapacity: 0 }] }));
  };
  
  const handleRepairFarm = (farmId: string) => {
      setPlayer(prev => {
          const farm = prev.miningFarms.find(f => f.id === farmId);
          if (!farm || farm.status !== 'STOPPED') return prev;
          const cost = farm.disaster.costToFix;
          if (prev.cash < cost) { alert("Not enough cash to repair!"); return prev; }
          return { ...prev, cash: prev.cash - cost, miningFarms: prev.miningFarms.map(f => f.id === farmId ? { ...f, status: 'ACTIVE', disaster: { type: 'NONE', costToFix: 0 } } : f) };
      });
  };

  const handleBuyRig = (rigType: RigType, farmId: string) => {
      const specKey = Object.keys(RIG_TYPES).find(k => RIG_TYPES[k as keyof typeof RIG_TYPES].type === rigType);
      if(!specKey) return;
      const specs = RIG_TYPES[specKey as keyof typeof RIG_TYPES];
      if(player.cash < specs.cost) return;
      setPlayer(prev => {
          const newFarms = prev.miningFarms.map(f => {
              if(f.id === farmId) {
                  return { ...f, rigs: [...f.rigs, { id: Date.now().toString(), model: specs.name, type: rigType, hashrate: specs.hashrate, power: specs.power, efficiency: 1, purchaseDate: Date.now() }], totalHashrate: f.totalHashrate + specs.hashrate, totalPower: f.totalPower + specs.power };
              }
              return f;
          });
          return { ...prev, cash: prev.cash - specs.cost, miningFarms: newFarms, miningStats: { ...prev.miningStats, totalHashrate: prev.miningStats.totalHashrate + specs.hashrate } };
      });
  };

  const handleDeposit = (amount: number) => setPlayer(prev => ({ ...prev, bankBalance: prev.bankBalance - amount, cash: prev.cash + amount }));
  const handleWithdraw = (amount: number) => setPlayer(prev => ({ ...prev, cash: prev.cash - amount, bankBalance: prev.bankBalance + amount, taxDue: prev.taxDue + (amount * 0.10) }));
  
  const handleCreateColdWallet = (name: string) => { setPlayer(prev => ({ ...prev, coldWallets: [...prev.coldWallets, { id: Date.now().toString(), name, balanceBTC: 0, balanceETH: 0, balanceSOL: 0 }] })); };

  const handleTransferToCold = (walletId: string, coinSymbol: 'BTC'|'ETH'|'SOL', amount: number) => {
      setPlayer(prev => {
          const pItem = prev.portfolio.find(p => p.coinId === (coinSymbol === 'BTC' ? 'bitcoin' : coinSymbol === 'ETH' ? 'ethereum' : 'solana'));
          if (!pItem || pItem.amount < amount) return prev;
          const newPortfolio = prev.portfolio.map(p => p.coinId === pItem.coinId ? { ...p, amount: p.amount - amount } : p);
          const newWallets = prev.coldWallets.map(w => {
              if (w.id === walletId) { return { ...w, balanceBTC: coinSymbol === 'BTC' ? w.balanceBTC + amount : w.balanceBTC, balanceETH: coinSymbol === 'ETH' ? w.balanceETH + amount : w.balanceETH, balanceSOL: coinSymbol === 'SOL' ? w.balanceSOL + amount : w.balanceSOL }; }
              return w;
          });
          return { ...prev, portfolio: newPortfolio, coldWallets: newWallets };
      });
  };

  const handleTweet = (text: string, coinId: string, type: 'PUMP' | 'FUD' | 'ANALYSIS') => {
    setPlayer(prev => ({ ...prev, xp: prev.xp + 20, reputation: prev.reputation + 1 }));
    setFeed(prev => [{ id: Date.now().toString(), author: `${player.playerName}`, handle: '@You', avatarColor: 'bg-indigo-600', content: text, timestamp: gameTime.totalMinutes, likes: 0, comments: 0, type: 'USER' as const }, ...prev]);
  };

  const handleUpdateFunds = (newCash: number, newBank: number) => { setPlayer(prev => ({ ...prev, cash: newCash, bankBalance: newBank })); };
  const handleUpdateName = (name: string) => setPlayer(prev => ({ ...prev, playerName: name }));
  const handleUpdateLevel = (lvl: number) => setPlayer(prev => ({ ...prev, level: lvl }));

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Sidebar view={view} setView={setView} lang={lang} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header player={player} gameTime={gameTime} setSpeed={(s) => setGameTime(prev => ({ ...prev, speed: s }))} lang={lang} />
        <main className="flex-1 overflow-hidden relative bg-slate-950">
          {view === ViewState.DASHBOARD && <Dashboard player={player} coins={coins} lang={lang} />}
          {view === ViewState.MARKET && <Market coins={coins} player={player} onBuy={handleBuySpot} onSell={handleSellSpot} lang={lang} />}
          {view === ViewState.FUTURES && <Futures coins={coins} player={player} lang={lang} onOpenPosition={handleOpenPosition} onClosePosition={handleClosePosition} onAddMargin={handleAddMargin} />}
          {view === ViewState.MINING && <Mining player={player} lang={lang} onBuyRig={handleBuyRig} onCreateFarm={handleCreateFarm} onRepairFarm={handleRepairFarm} />}
          {view === ViewState.NEWS_CALENDAR && <NewsCalendar news={news} events={events} player={player} lang={lang} />}
          {view === ViewState.SOCIAL && <SocialMedia player={player} coins={coins} lang={lang} feed={feed} onTweet={handleTweet} />}
          {view === ViewState.BANK && <Bank player={player} lang={lang} onDeposit={handleDeposit} onWithdraw={handleWithdraw} onCreateColdWallet={handleCreateColdWallet} onTransferToCold={handleTransferToCold} />}
          {view === ViewState.WHALES && <WhaleWatch entities={entities} lang={lang} />}
          {view === ViewState.SETTINGS && <Settings lang={lang} setLang={setLang} player={player} onUpdateFunds={handleUpdateFunds} onUpdateName={handleUpdateName} onUpdateLevel={handleUpdateLevel} />}
        </main>
      </div>
    </div>
  );
};

export default App;
