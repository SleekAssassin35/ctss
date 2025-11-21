
import { Coin, MarketState, CalendarEvent, FeedItem, FuturesPosition, FuturesType, TechnicalIndicators, Candle, TimeFrame, Entity, MiningFarm, NewsItem, SupportResistance, PatternResult, OrderBook, OrderBookLevel, ExecutionResult, PlayerState, Language, MiningMode } from '../types';
import { INSTANT_NEWS_POOL, INSTANT_NEWS_POOL_TR, ENTITY_NAMES, MINING_EVENTS, RIG_TYPES, COIN_PROFILES, PHASE_PARAMS, PATTERN_DATASET, LIQUIDITY_PROFILES, WHALE_ORDER_STYLES, LEVERAGE_TIERS, DEFAULT_LEVERAGE_TIERS, FUNDING_PARAMS, PRICE_CAPS, NEWS_THRESHOLDS, WHALE_NEWS_TEMPLATES, WHALE_NEWS_TEMPLATES_TR, MINING_MODES, LIQUIDITY_IMPACT_FACTORS } from '../constants';

// --- Utility ---
const gaussianRandom = (mean = 0, stdev = 1) => {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
};

export const getLevelTitle = (level: number): string => {
  if (level < 5) return "Shrimp 🦐";
  if (level < 10) return "Crab 🦀";
  if (level < 20) return "Fish 🐟";
  if (level < 35) return "Dolphin 🐬";
  if (level < 50) return "Shark 🦈";
  return "Whale 🐋";
};

// Helper for Game Time formatting (Day X HH:MM)
export const formatGameTime = (totalMinutes: number): string => {
    if (!totalMinutes && totalMinutes !== 0) return "Day 1 00:00";
    const safeMinutes = totalMinutes > 1000000000000 ? totalMinutes / 60000 : totalMinutes;
    
    const d = Math.floor(safeMinutes / 1440) + 1;
    const m = Math.floor(safeMinutes % 1440);
    const h = Math.floor(m / 60);
    const min = Math.floor(m % 60);
    return `Day ${d} ${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
};

export const formatNumber = (amount: number, lang: Language = 'EN'): string => {
    const locale = lang === 'TR' || lang === 'DE' ? 'tr-TR' : 'en-US';
    return amount.toLocaleString(locale);
};

export const resampleCandles = (history: Candle[], timeFrame: TimeFrame): Candle[] => {
  if (!history || history.length === 0) return [];
  
  let candlesPerBar = 1; 
  if (timeFrame === '15m') candlesPerBar = 1;
  else if (timeFrame === '1H') candlesPerBar = 4; 
  else if (timeFrame === '4H') candlesPerBar = 16; 
  else if (timeFrame === '1D') candlesPerBar = 96; 
  else if (timeFrame === '1W') candlesPerBar = 96 * 7;
  else if (timeFrame === '1M') candlesPerBar = 96 * 30;

  const result: Candle[] = [];
  let current: Candle | null = null;
  let count = 0;

  for (let i = 0; i < history.length; i++) {
    const c = history[i];
    if (!current) {
      current = { ...c };
      count = 1;
    } else {
      current.high = Math.max(current.high, c.high);
      current.low = Math.min(current.low, c.low);
      current.close = c.close; 
      current.volume += c.volume;
      current.timestamp = c.timestamp; 
      current.time = c.time; 
      count++;
    }

    if (count >= candlesPerBar) {
      result.push(current);
      current = null;
      count = 0;
    }
  }
  if (current) result.push(current);
  
  return result;
};

// --- HAZARD & RISK ENGINES ---

export const calculatePlayerHazardScore = (player: PlayerState, coins: Coin[]): number => {
    if (player.positions.length === 0) return 0;

    const equity = player.cash + player.positions.reduce((acc, p) => acc + p.margin + p.pnl, 0);
    if (equity <= 0) return 5; 

    let maxPosScore = 0;

    player.positions.forEach(pos => {
        const coin = coins.find(c => c.id === pos.coinId);
        if (!coin) return;
        
        const notionalUSD = pos.size;
        const effectiveLeverage = notionalUSD / equity;
        
        const currentPrice = coin.price;
        const distPct = Math.abs(currentPrice - pos.liquidationPrice) / currentPrice;
        const distFactor = Math.max(0, 1 - distPct); 

        const score = (effectiveLeverage * 1.3) + (pos.leverage / 10) + (distFactor * 1.2);
        maxPosScore = Math.max(maxPosScore, score);
    });

    return maxPosScore;
};

const checkWhaleConflict = (entities: Entity[], coin: Coin): { conflict: boolean, winner?: 'BULL' | 'BEAR' } => {
    let bullPressure = 0;
    let bearPressure = 0;

    entities.forEach(e => {
        if (e.type !== 'WHALE') return;
        const hazard = 2 + (Math.random() * 3);
        if (e.sentiment === 'BULLISH') bullPressure += hazard;
        else if (e.sentiment === 'BEARISH') bearPressure += hazard;
    });

    if (bullPressure > 10 && bearPressure > 10) {
        const diff = Math.abs(bullPressure - bearPressure);
        if (diff < 5) return { conflict: true }; 
    }
    return { conflict: false };
};

// --- PRICE IMPACT ---
export const calculatePriceImpact = (coinSymbol: string, orderValueUSD: number, marketVolume24h: number): number => {
  const liquidityFactor = LIQUIDITY_IMPACT_FACTORS[coinSymbol] || 0.5;
  
  // Logic: Impact grows as orderValue approaches a significant fraction of volume/liquidity
  // A $1M order on PEPE moves price more than on BTC
  const impactRatio = orderValueUSD / (marketVolume24h * liquidityFactor * 0.01); // * 0.01 is arbitrary scaling
  
  // Non-linear curve: k1 * ratio ^ k2
  // Example: 
  // BTC ($25B vol), $100M order -> ratio = 100M / (25B * 1.0 * 0.01) = 0.4
  // PEPE ($500M vol), $100M order -> ratio = 100M / (500M * 0.3 * 0.01) = 66.6 !!
  
  // Dampening
  const dampenedRatio = Math.min(impactRatio, 20); // Cap max impact calculation base
  
  // Resulting shift percentage
  // e.g., ratio 0.4 -> 0.0016 (0.16%)
  // ratio 66 -> huge
  const impactPct = 0.004 * Math.pow(dampenedRatio, 0.8);
  
  return impactPct;
};


// --- ORDER BOOK & EXECUTION ENGINE ---
// (Kept largely same, skipping verbose parts for brevity in this specific file update where not needed, 
// but ensure full function is here for safety)
const generateSyntheticOrderBook = (coin: Coin): OrderBook => {
    const profile = LIQUIDITY_PROFILES[coin.symbol] || LIQUIDITY_PROFILES[coin.volatilityTag] || LIQUIDITY_PROFILES['BTC'];
    const currentPrice = coin.price;
    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];
    const levels = 50;
    const stepPct = 0.0005; 
    for (let i = 1; i <= levels; i++) {
        const distancePct = i * stepPct;
        const bidPrice = currentPrice * (1 - distancePct);
        const bps = distancePct * 10000;
        const depthUSD = profile.baseDepth * Math.exp(-profile.decayFactor * (bps / 100));
        const noisyDepth = depthUSD * (0.8 + Math.random() * 0.4);
        const bidSize = noisyDepth / bidPrice;
        bids.push({ price: bidPrice, size: bidSize, total: 0, source: 'MARKET_MAKER' });
        const askPrice = currentPrice * (1 + distancePct);
        const askSize = (noisyDepth / askPrice);
        asks.push({ price: askPrice, size: askSize, total: 0, source: 'MARKET_MAKER' });
    }
    return { bids, asks };
};

const injectEntityOrders = (book: OrderBook, coin: Coin, entities: Entity[]) => {
    entities.forEach(entity => {
        if (entity.id === 'player-whale') return; 
        const style = WHALE_ORDER_STYLES[entity.type as keyof typeof WHALE_ORDER_STYLES];
        if (!style) return;
        const holdings = entity.type === 'WHALE' 
            ? (coin.symbol === 'BTC' ? entity.btcHoldings : coin.symbol === 'ETH' ? entity.ethHoldings : coin.symbol === 'SOL' ? entity.solHoldings : 0)
            : (coin.symbol === 'BTC' ? entity.btcHoldings : 0); 
        if (holdings <= 0) return;
        if (entity.sentiment === 'BULLISH') {
             const totalBuyPower = holdings * 0.10; 
             const layerSize = totalBuyPower / style.layers;
             for (let i = 1; i <= style.layers; i++) {
                 const price = coin.price * (1 - (style.spread * i));
                 book.bids.push({ price: price, size: layerSize * (coin.price / price), total: 0, source: 'WHALE' });
             }
        } 
        else if (entity.sentiment === 'BEARISH') {
            const totalSellSize = holdings * 0.10; 
            const layerSize = totalSellSize / style.layers;
            for (let i = 1; i <= style.layers; i++) {
                const price = coin.price * (1 + (style.spread * i));
                book.asks.push({ price: price, size: layerSize, total: 0, source: 'WHALE' });
            }
        }
    });
    book.bids.sort((a, b) => b.price - a.price); 
    book.asks.sort((a, b) => a.price - b.price); 
};

export const executeMarketOrder = (coin: Coin, side: 'BUY' | 'SELL', amountCoin: number, entities: Entity[]): ExecutionResult => {
    const book = generateSyntheticOrderBook(coin);
    injectEntityOrders(book, coin, entities);
    let remainingSize = amountCoin;
    let totalCost = 0;
    let finalPrice = coin.price;
    const filledLevels: OrderBookLevel[] = [];
    const levels = side === 'BUY' ? book.asks : book.bids;
    for (const level of levels) {
        if (remainingSize <= 0) break;
        const takeSize = Math.min(remainingSize, level.size);
        totalCost += takeSize * level.price;
        remainingSize -= takeSize;
        finalPrice = level.price;
        filledLevels.push({ ...level, size: takeSize }); 
    }
    if (remainingSize > 0) {
        const penaltyFactor = side === 'BUY' ? 1.1 : 0.9;
        finalPrice = finalPrice * penaltyFactor;
        totalCost += remainingSize * finalPrice;
        filledLevels.push({ price: finalPrice, size: remainingSize, total: 0, source: 'MARKET_MAKER' });
    }
    const totalFilled = amountCoin;
    const vwapPrice = totalCost / totalFilled;
    const rawImpact = Math.abs((finalPrice - coin.price) / coin.price);
    const cushionedImpact = rawImpact * 0.5; 
    const slippagePct = Math.abs((vwapPrice - coin.price) / coin.price) * 100;
    return {
        vwapPrice,
        finalPrice: coin.price * (1 + (side === 'BUY' ? cushionedImpact : -cushionedImpact)), 
        filledSize: totalFilled,
        slippagePct,
        impact: side === 'SELL' ? -cushionedImpact : cushionedImpact,
        filledLevels
    };
};

// --- ANALYSIS ---
const detectSupportResistance = (history: Candle[]): SupportResistance[] => {
    // ... (unchanged logic)
    const pivots: number[] = [];
    for(let i=2; i<history.length-2; i++) {
        const prev = history[i-1].close;
        const curr = history[i].close;
        const next = history[i+1].close;
        if(curr > prev && curr > next) pivots.push(curr);
        if(curr < prev && curr < next) pivots.push(curr);
    }
    const levels: SupportResistance[] = [];
    pivots.forEach(p => {
        const existing = levels.find(l => Math.abs(l.price - p) / p < 0.02);
        if(existing) { existing.touches++; existing.strength = Math.min(1, existing.strength + 0.1); } 
        else { levels.push({ price: p, type: 'SUPPORT', strength: 0.2, touches: 1 }); }
    });
    return levels.sort((a, b) => b.strength - a.strength).slice(0, 5);
};

const analyzePatterns = (history: Candle[], coinSymbol: string): PatternResult | undefined => {
    // ... (unchanged logic)
    if (history.length < 30) return undefined;
    const recent = history.slice(-48); 
    const high = Math.max(...recent.map(c => c.high));
    const low = Math.min(...recent.map(c => c.low));
    const current = recent[recent.length - 1].close;
    const dropPct = ((low - high) / high) * 100;
    const recoveryPct = ((current - low) / low) * 100;
    const validPatterns = PATTERN_DATASET.filter(p => (p.coin === coinSymbol || p.coin === 'BTC'));
    for (const pattern of validPatterns) {
        if (pattern.formasyon_adi.includes('TOBO') && dropPct < 0 && recoveryPct > 0) {
             return { name: pattern.formasyon_adi, confidence: 75, direction: pattern.yön === 'yükseliş' ? 'BULLISH' : 'BEARISH', targetRange: `${pattern.breakout_pct.min} to ${pattern.breakout_pct.max}`, fakeoutProb: pattern.fake_break.olasılık, fakeoutTarget: pattern.fake_break.hareket, indicators: pattern.indikator_sartlari.basari.MACD, failureCondition: pattern.indikator_sartlari.basarisizlik.sentiment };
        }
    }
    return undefined;
};

export const analyzeCoin = (coin: Coin, playerLevel: number): TechnicalIndicators => {
  const history = coin.history.slice(-50); 
  let rsi = 50;
  if (history.length > 14) {
     const rsiPeriod = history.slice(-14);
     const changes = rsiPeriod.map((h, i) => i === 0 ? 0 : h.close - rsiPeriod[i-1].close).slice(1);
     const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0);
     const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0));
     if (losses === 0) rsi = 100;
     else { const rs = gains / losses; rsi = 100 - (100 / (1 + rs)); }
  }
  const fearGreed = (rsi + (coin.trend > 0 ? 20 : -20));
  let signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL' = 'NEUTRAL';
  if (rsi < 30) signal = 'STRONG_BUY'; else if (rsi < 45) signal = 'BUY'; else if (rsi > 70) signal = 'STRONG_SELL'; else if (rsi > 55) signal = 'SELL';
  return { rsi, macd: { macdLine: (Math.random() * 10) - 5, signalLine: (Math.random() * 10) - 5, histogram: (Math.random() * 4) - 2 }, fearGreed: Math.max(0, Math.min(100, fearGreed)), signal, srLevels: detectSupportResistance(history), pattern: analyzePatterns(history, coin.symbol) };
};

export const initializeMarketState = (): MarketState => {
    return { phase: 'ACCUMULATION', phaseDay: 0, phaseTotalDays: 45, globalSentiment: 40, volatilityIndex: 15, globalMomentum: 0, newsSentimentBias: 0, nextFundingTimestamp: 0 };
};

export const getNewsImpactValue = (impact: 'HIGH' | 'MEDIUM' | 'LOW', sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'): number => {
    let mag = 0;
    switch(impact) { case 'HIGH': mag = 0.08; break; case 'MEDIUM': mag = 0.04; break; case 'LOW': mag = 0.01; break; }
    if (sentiment === 'BEARISH') mag *= -1; if (sentiment === 'NEUTRAL') mag = 0;
    return mag;
}

export const updateMarketCycle = (state: MarketState, fractionalDayIncrease: number, gameTimeTotalMinutes: number, lang: Language = 'EN'): { newState: MarketState, news?: FeedItem } => {
    let newState = { ...state };
    newState.phaseDay += fractionalDayIncrease;
    
    if (newState.phaseDay >= newState.phaseTotalDays) {
        let nextPhase: MarketState['phase'] = 'ACCUMULATION';
        let nextDuration = 30;
        // Simplified Logic for brevity, cycling through phases
        if (newState.phase === 'ACCUMULATION') nextPhase = 'BULL_RUN';
        else if (newState.phase === 'BULL_RUN') nextPhase = 'DISTRIBUTION';
        else if (newState.phase === 'DISTRIBUTION') nextPhase = 'BEAR_MARKET';
        
        newState.phase = nextPhase;
        newState.phaseDay = 0;
        newState.phaseTotalDays = 45;

        const content = lang === 'TR' 
            ? `DÖNGÜ DEĞİŞİMİ: ${nextPhase} evresine giriliyor.` 
            : `CYCLE SHIFT: Entering ${nextPhase} phase.`;

        return {
            newState,
            news: { id: Date.now().toString(), author: 'Macro Cycle Bot', handle: '@CycleWatch', avatarColor: 'bg-purple-600', content: content, timestamp: gameTimeTotalMinutes, likes: 500, comments: 100, type: 'NEWS' }
        };
    }
    return { newState };
};

export const updateFundingRates = (coins: Coin[], phase: string): Coin[] => {
    // ... (unchanged funding logic)
    return coins.map(c => {
        const params = FUNDING_PARAMS;
        const limit = params.LIMITS[c.symbol as keyof typeof params.LIMITS] || 0.0005;
        let trendBias = c.change24h > 5 ? 0.0001 : c.change24h < -5 ? -0.0001 : 0;
        if (phase === 'BULL_RUN') trendBias += 0.00005;
        if (phase === 'BEAR_MARKET') trendBias -= 0.00005;
        let newRate = c.currentFundingRate + trendBias + ((Math.random() - 0.5) * 0.0001);
        newRate = Math.max(-0.0025, Math.min(0.0025, newRate));
        if (Math.abs(newRate) > limit * 1.5) newRate = newRate * 0.9;
        return { ...c, currentFundingRate: newRate, fundingExtremeDuration: Math.abs(newRate) > limit ? c.fundingExtremeDuration + 8 : 0 };
    });
};

export const calculateCorrelatedMovements = (coins: Coin[], events: CalendarEvent[], marketState: MarketState, totalGameMinutes: number, deltaMinutes: number, huntTarget?: { coinId: string, direction: 'UP' | 'DOWN' }): { newCoins: Coin[] } => {
    // ... (unchanged movement logic)
    const fractionOfDay = deltaMinutes / 1440;
    const params = PHASE_PARAMS[marketState.phase];
    marketState.newsSentimentBias *= Math.pow(0.99, deltaMinutes);
    const adjustedMean = params.mean + marketState.newsSentimentBias;
    const btcFinalReturn = gaussianRandom(adjustedMean * fractionOfDay, params.sigma * Math.sqrt(fractionOfDay));
    
    const newCoins = coins.map(coin => {
        const profile = COIN_PROFILES[coin.symbol] || COIN_PROFILES['BTC'];
        const betaMove = btcFinalReturn * profile.beta;
        const noise = gaussianRandom(0, (params.sigma * Math.sqrt(fractionOfDay) * profile.beta) * 0.5);
        let totalReturn = betaMove + noise;
        
        if (huntTarget && huntTarget.coinId === coin.id) {
            totalReturn += (huntTarget.direction === 'DOWN' ? -0.10 : 0.10) * (deltaMinutes / 15); 
        }
        
        let newPrice = coin.price * Math.exp(totalReturn);
        if (newPrice <= 0.000001) newPrice = 0.000001;

        let newHistory = [...coin.history];
        const lastCandle = newHistory[newHistory.length - 1];
        const currentCandleIndex = Math.floor(totalGameMinutes / 15);
        const timeString = formatGameTime(totalGameMinutes);
        
        if (!lastCandle || (lastCandle.candleIndex !== undefined && lastCandle.candleIndex < currentCandleIndex)) {
            newHistory.push({ time: timeString, timestamp: Date.now(), open: coin.price, high: Math.max(coin.price, newPrice), low: Math.min(coin.price, newPrice), close: newPrice, volume: coin.volume * fractionOfDay, candleIndex: currentCandleIndex });
        } else {
            lastCandle.close = newPrice;
            lastCandle.high = Math.max(lastCandle.high, newPrice);
            lastCandle.low = Math.min(lastCandle.low, newPrice);
            lastCandle.volume += (coin.volume * fractionOfDay); 
            lastCandle.time = timeString; 
        }
        if (newHistory.length > 1000) newHistory = newHistory.slice(-1000);
        return { ...coin, price: newPrice, change24h: ((newPrice - (newHistory[0]?.close || newPrice)) / (newHistory[0]?.close || 1)) * 100, marketCap: newPrice * coin.circulatingSupply, history: newHistory };
    });
    return { newCoins };
};

export const simulateInstitutionalActivity = (entities: Entity[], marketState: MarketState, coins: Coin[], timeFactor: number, gameTimeTotalMinutes: number, lang: Language = 'EN'): { updatedEntities: Entity[], newsUpdates: NewsItem[], feedUpdates: FeedItem[], volumeAdd: number } => {
    
    const updatedEntities = [...entities];
    const newsUpdates: NewsItem[] = [];
    const feedUpdates: FeedItem[] = [];
    let volumeAdd = 0;

    updatedEntities.forEach(e => {
        if (e.id === 'player-whale') return;
        if (e.lastPostTime && (gameTimeTotalMinutes - e.lastPostTime) < 240) return; 

        e.btcHoldings += 0.05 * timeFactor; 
        if (Math.random() > 0.002 * timeFactor) return; 

        const action = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const targetSymbol = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'ETH' : 'SOL') : 'BTC';
        const targetCoin = coins.find(c => c.symbol === targetSymbol);
        if (!targetCoin) return;

        const amount = Math.floor(e.btcHoldings * 0.05);
        if (amount < 1) return;

        if (action === 'BUY') e.btcHoldings += amount; else e.btcHoldings -= amount;
        volumeAdd += amount * targetCoin.price;

        const impactValue = amount * targetCoin.price;
        const threshold = NEWS_THRESHOLDS[targetSymbol] || 10_000_000;

        if (impactValue > threshold) {
             const actionText = lang === 'TR' ? (action === 'BUY' ? 'Topladı' : 'Boşalttı') : (action === 'BUY' ? 'Accumulated' : 'Dumped');
             const desc = `${e.name} ${actionText} ${amount.toFixed(2)} ${targetSymbol} ($${(impactValue/1000000).toFixed(1)}M)`;
             
             const template = lang === 'TR' 
                ? [`🚨 BÜYÜK HAREKET: ${desc}`, `🐋 Balina Alarmı: ${desc}`]
                : [`🚨 HUGE MOVE: ${desc}`, `🐋 Whale Alert: ${desc}`];

             const selectedTemplate = template[Math.floor(Math.random() * template.length)];

             feedUpdates.push({
                id: Date.now().toString() + Math.random(), author: e.name, handle: e.type === 'WHALE' ? '@WhaleAlert' : '@Institutional',
                avatarColor: action === 'BUY' ? 'bg-emerald-600' : 'bg-rose-600',
                content: selectedTemplate, timestamp: gameTimeTotalMinutes, likes: 2000, comments: 200, type: 'WHALE'
             });
             
             if (impactValue > threshold * 3) {
                newsUpdates.push({
                    id: Date.now().toString() + Math.random(), title: `${e.name} Activity`, description: desc,
                    impact: 'MEDIUM', sentiment: action === 'BUY' ? 'BULLISH' : 'BEARISH', timestamp: gameTimeTotalMinutes
                });
             }
             e.lastPostTime = gameTimeTotalMinutes; 
        }
    });

    if (Math.random() < 0.05) {
        const btc = coins.find(c => c.symbol === 'BTC');
        if (btc) {
            const { conflict } = checkWhaleConflict(updatedEntities, btc);
            if (conflict) {
                // Use TR or EN templates
                const templates = lang === 'TR' ? WHALE_NEWS_TEMPLATES_TR : WHALE_NEWS_TEMPLATES;
                const template = templates[0]; 
                newsUpdates.push({
                    id: Date.now().toString() + Math.random(),
                    title: template.title.replace('{coin}', 'BTC'),
                    description: template.desc.replace('{whaleA}', lang==='TR'?'Boğa Balinaları':'Bull Whales').replace('{whaleB}', lang==='TR'?'Ayı Balinaları':'Bear Whales').replace('{coin}', 'BTC'),
                    impact: 'HIGH', sentiment: 'NEUTRAL', timestamp: gameTimeTotalMinutes
                });
            }
        }
    }
    return { updatedEntities, newsUpdates, feedUpdates, volumeAdd };
};

export const simulateWhaleActivity = simulateInstitutionalActivity;

export const generateHistoricalData = (initialCoins: Coin[], periods: number) => {
    const coins = JSON.parse(JSON.stringify(initialCoins)) as Coin[];
    let price = 45000;
    const minutesPerTick = 15;
    const startMinute = - (periods * minutesPerTick); 
    for (let i = 0; i < periods; i++) {
        const currentMinute = startMinute + (i * minutesPerTick);
        const timeString = formatGameTime(currentMinute + (periods * minutesPerTick)); 
        const change = (Math.random() - 0.5) * 0.005; 
        price = price * (1 + change);
        coins.forEach(c => {
             const cPrice = c.price * (1 + change * c.correlationBeta + (Math.random()-0.5)*0.002);
             c.price = cPrice;
             c.history.push({ time: timeString, timestamp: Date.now() - ((periods - i) * 900000), open: cPrice, high: cPrice*1.002, low: cPrice*0.998, close: cPrice, volume: Math.random()*200000, candleIndex: Math.floor(currentMinute / 15) });
        });
    }
    return { coins };
};

export const calculateLiquidationPrice = (entryPrice: number, leverage: number, type: 'LONG' | 'SHORT', marginType: FuturesType, size: number, collateral: number): number => {
    let liqPrice = 0;
    if (marginType === 'CROSS') {
        if (collateral <= 0) return type === 'LONG' ? entryPrice : 0; // Already rekt logic handled elsewhere
        
        // Logic: Equity = Maintenance Margin
        // Equity = Collateral + PnL
        // PnL (Long) = (Mark - Entry) * (Size/Entry) roughly or (Mark - Entry) * Contracts
        // Let's use simplified model: PnL = Value - NotionalCost
        // Long: Value = Size * (Mark/Entry). Short: Value = Size * (2 - Mark/Entry)
        
        // Standard formula:
        // Long: Liq = Entry * (1 - (Collateral - MaintMargin) / Size)
        
        const maintMargin = size * 0.005; // 0.5% maintenance
        const availableForLoss = collateral - maintMargin;
        const lossRatio = availableForLoss / size;
        
        if (type === 'LONG') {
            liqPrice = entryPrice * (1 - lossRatio);
        } else {
            liqPrice = entryPrice * (1 + lossRatio);
        }

    } else {
        const maintenanceMarginRate = 0.005;
        // Isolated: Collateral is just the margin assigned to this position
        // Liq = Entry * (1 - (1/Lev) + Maint)
        if (type === 'LONG') liqPrice = entryPrice * (1 - (1/leverage) + maintenanceMarginRate);
        else liqPrice = entryPrice * (1 + (1/leverage) - maintenanceMarginRate);
    }
    return Math.max(0, liqPrice);
};

export const generateEntities = (): Entity[] => {
    const entities: Entity[] = [];
    ENTITY_NAMES.COUNTRIES.forEach((name, i) => {
        entities.push({ id: `country-${i}`, name, type: 'COUNTRY', btcHoldings: 10000 + Math.floor(Math.random() * 50000), ethHoldings: 0, solHoldings: 0, sentiment: 'BULLISH', tradeFrequency: 0.1, tradeSizeMultiplier: 1 });
    });
    ENTITY_NAMES.COMPANIES.forEach((name, i) => {
        entities.push({ id: `company-${i}`, name, type: 'COMPANY', btcHoldings: 5000 + Math.floor(Math.random() * 150000), ethHoldings: 10000, solHoldings: 50000, sentiment: 'HODL', tradeFrequency: 0.05, tradeSizeMultiplier: 1 });
    });
    for(let i=0; i<10; i++) {
        entities.push({ id: `whale-${i}`, name: `${ENTITY_NAMES.WHALES_PREFIXES[i % ENTITY_NAMES.WHALES_PREFIXES.length]}`, type: 'WHALE', btcHoldings: 1000 + Math.floor(Math.random() * 10000), ethHoldings: 5000, solHoldings: 100000, sentiment: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH', tradeFrequency: 0.2, tradeSizeMultiplier: 2 });
    }
    return entities.sort((a,b) => b.btcHoldings - a.btcHoldings);
};

export const checkLiquidations = (positions: FuturesPosition[], coins: Coin[], playerCash: number): { active: FuturesPosition[], liquidated: FuturesPosition[], hitStopTp: FuturesPosition[], remainingCash: number } => {
    let active: FuturesPosition[] = [];
    let liquidated: FuturesPosition[] = [];
    let hitStopTp: FuturesPosition[] = [];
    let remainingCash = playerCash;

    // 1. Calculate PnL for all positions first
    positions.forEach(pos => {
        const coin = coins.find(c => c.id === pos.coinId);
        if (!coin) return;
        const currentPrice = coin.price;
        let pnl = pos.type === 'LONG' ? (currentPrice - pos.entryPrice) * (pos.size / pos.entryPrice) : (pos.entryPrice - currentPrice) * (pos.size / pos.entryPrice);
        pos.pnl = pnl;
        pos.netPnl = pos.realizedPnl + pos.pnl - pos.tradingFees - pos.fundingFees;
    });

    // 2. Calculate Cross Equity
    const crossPositions = positions.filter(p => p.marginType === 'CROSS');
    const crossUnrealizedPnL = crossPositions.reduce((acc, p) => acc + p.pnl, 0);
    // Cross Equity = Cash Balance + Unrealized PnL of all cross positions
    // Note: realized PnL is already added to playerCash when closed
    const totalCrossEquity = playerCash + crossUnrealizedPnL;
    
    const totalCrossMaintenance = crossPositions.reduce((acc, p) => acc + (p.size * 0.005), 0); 
    const isCrossLiquidated = crossPositions.length > 0 && totalCrossEquity <= totalCrossMaintenance;

    positions.forEach(pos => {
        const coin = coins.find(c => c.id === pos.coinId);
        if (!coin) { active.push(pos); return; }
        const currentPrice = coin.price;
        
        let isLiquidated = false;
        if (pos.marginType === 'CROSS') { 
            if (isCrossLiquidated) isLiquidated = true; 
        } else { 
            // Isolated Liq Check
            // Equity = Margin + PnL
            const isolatedEquity = pos.margin + pos.pnl;
            const maintMargin = pos.size * 0.005; 
            if (isolatedEquity <= maintMargin) isLiquidated = true; 
        }

        if (isLiquidated) {
            liquidated.push(pos); 
            // If isolated, cash isn't touched (already deducted). 
            // If cross, the "cash" used for margin is gone, plus the loss.
            // Since we use 'cash' as the master cross balance, handled in App.tsx return logic
        } else {
            // TP/SL Check (Only if not liquidated)
            let hitExit = false;
            if (pos.tp && ((pos.type === 'LONG' && currentPrice >= pos.tp) || (pos.type === 'SHORT' && currentPrice <= pos.tp))) hitExit = true;
            if (pos.sl && ((pos.type === 'LONG' && currentPrice <= pos.sl) || (pos.type === 'SHORT' && currentPrice >= pos.sl))) hitExit = true;
            
            if (hitExit) {
                 hitStopTp.push(pos); 
            } else {
                 active.push(pos);
            }
        }
    });
    return { active, liquidated, hitStopTp, remainingCash };
};

export const simulateMiningDisasters = (farms: MiningFarm[], lang: Language = 'EN'): { updatedFarms: MiningFarm[], alert?: string } => {
    let alert: string | undefined;
    const updatedFarms = farms.map((farm): MiningFarm => {
        if (farm.status === 'STOPPED' && farm.disaster.type !== 'NONE') return farm;
        let riskMultiplier = 1.0;
        if (farm.mode === 'OFFSHORE') riskMultiplier = 2.0; if (farm.mode === 'ILLEGAL') riskMultiplier = 5.0; if (farm.energySource === 'NUCLEAR') riskMultiplier *= 1.5;

        const disasterRoll = Math.random();
        const disaster = MINING_EVENTS.find(evt => disasterRoll < evt.chance * riskMultiplier);
        if (disaster) {
             const msg = lang === 'TR' ? `⚠️ ${farm.name} tesisinde KAZA! Üretim durdu.` : `⚠️ ${disaster.desc} at ${farm.name}! Production stopped.`;
             alert = msg;
             const cost = 5000 + (farm.totalHashrate * 1000); 
             return { ...farm, status: 'STOPPED', disaster: { type: disaster.type as any, costToFix: Math.floor(cost) } };
        }
        return farm;
    });
    return { updatedFarms, alert };
};

export const calculateMiningRewards = (farms: MiningFarm[], networkDifficulty: number, btcPrice: number, gameMinutesPassed: number) => {
    let totalHashrate = 0;
    let totalPower = 0;
    farms.forEach(f => { if(f.status === 'ACTIVE') { const modeConfig = MINING_MODES[f.mode] || MINING_MODES.LEGAL; totalHashrate += f.totalHashrate * modeConfig.outputBonus; totalPower += f.totalPower; } });
    const dailyReward = (totalHashrate / 500000) * (Math.random() * 0.5 + 0.8);
    const periodReward = dailyReward * (gameMinutesPassed / 1440);
    const maintenanceCost = farms.length * 100; 
    const periodCost = maintenanceCost * (gameMinutesPassed / 1440);
    const mineTokenReward = (totalHashrate * 1) * (gameMinutesPassed / 1440);
    return { btcMined: periodReward, powerUsage: totalPower, maintenanceCost: periodCost, mineTokenReward }; 
};

export const updateMiningDifficulty = (currentDiff: number, btcPrice: number, drift: number): number => {
    if (btcPrice > 40000) return currentDiff * 1.0001;
    return currentDiff;
};

export const generateRandomNews = (marketPhase: string, gameTimeTotalMinutes: number, lang: Language = 'EN'): NewsItem | null => {
    if (Math.random() > 0.05) return null;
    const pool = lang === 'TR' ? INSTANT_NEWS_POOL_TR : INSTANT_NEWS_POOL;
    const template = pool[Math.floor(Math.random() * pool.length)];
    let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
    const roll = Math.random();
    if (marketPhase === 'BEAR_MARKET' || marketPhase === 'DISTRIBUTION') { sentiment = roll < 0.6 ? 'BEARISH' : (roll < 0.9 ? 'BULLISH' : 'NEUTRAL'); } 
    else { sentiment = roll < 0.6 ? 'BULLISH' : (roll < 0.9 ? 'BEARISH' : 'NEUTRAL'); }
    return { id: Date.now().toString(), title: template.title, description: template.title, impact: template.impact as any, sentiment: sentiment as any, timestamp: gameTimeTotalMinutes };
};

export const getDeterministicForecast = (eventId: string, actualDirection: 'BULLISH'|'BEARISH', level: number): 'BULLISH'|'BEARISH'|'UNCLEAR' => {
    const accuracy = 0.5 + (level * 0.01);
    if (Math.random() < accuracy) return actualDirection;
    if (Math.random() > 0.5) return 'UNCLEAR';
    return actualDirection === 'BULLISH' ? 'BEARISH' : 'BULLISH';
};

export const getMaxLeverageForCoin = (symbol: string, notionalValue: number): number => {
    const tiers = LEVERAGE_TIERS[symbol] || DEFAULT_LEVERAGE_TIERS;
    const tier = tiers.find(t => notionalValue <= t.maxNotional);
    return tier ? tier.maxLeverage : tiers[tiers.length - 1].maxLeverage;
};
