
import { Coin, PlayerState, TimeFrame, VolatilityTag, PatternDefinition, CalendarEvent, LiquidityProfile } from './types';

export const HISTORY_DAYS = 90; 

export const TRADE_LIMITS = {
  MAX_LEVERAGE: 125, // Absolute max ceiling
  COOLDOWN_MS: 200 
};

// Spot Maximum Buy Limits per Transaction (in USD)
export const SPOT_LIMITS: Record<string, number> = {
  'BTC': 100_000_000,
  'ETH': 50_000_000,
  'SOL': 25_000_000,
  'DOGE': 20_000_000,
  'PEPE': 15_000_000
};

export const LIQUIDITY_IMPACT_FACTORS: Record<string, number> = {
  'BTC': 1.0,   // Highest liquidity, least impact
  'ETH': 0.8,
  'SOL': 0.6,
  'DOGE': 0.5,
  'PEPE': 0.3   // Lowest liquidity, highest impact
};

export const FEE_RATES = {
  MAKER: 0.0002, // 0.02%
  TAKER: 0.0004  // 0.04%
};

// Price Caps per Cycle (Max Multiplier from Cycle Low/Start)
export const PRICE_CAPS: Record<string, number> = {
    'BTC': 8.0,   // Max 8x per bull run
    'ETH': 12.0,  // Max 12x
    'SOL': 15.0,
    'DOGE': 25.0,
    'PEPE': 40.0
};

export const NEWS_THRESHOLDS: Record<string, number> = {
    'BTC': 50_000_000,
    'ETH': 10_000_000,
    'SOL': 5_000_000,
    'DOGE': 2_000_000,
    'PEPE': 500_000
};

export const FUNDING_PARAMS = {
  INTERVAL_HOURS: 8,
  // Limits where funding is considered "Extreme"
  LIMITS: {
    'BTC': 0.00025,  // 0.025%
    'ETH': 0.00035,
    'SOL': 0.00045,
    'DOGE': 0.00060,
    'PEPE': 0.00080
  },
  // Reaction when limit is breached (Wick Size)
  WICK_IMPACT: {
    'BTC': 0.035, // 3.5%
    'ETH': 0.045,
    'SOL': 0.05,
    'DOGE': 0.06,
    'PEPE': 0.07
  },
  // Micro pressure per hour if it stays extreme
  PRESSURE_BIAS: {
    'BTC': 0.004, // 0.4% per hour drift against trend
    'ETH': 0.005,
    'SOL': 0.006,
    'DOGE': 0.007,
    'PEPE': 0.008
  }
};

export const FEED_THRESHOLDS = {
  SOCIAL_NET_MIN_BTC: 5000, 
  NEWS_FEED_MIN_BTC: 1000,  
};

// --- LEVERAGE TIERS ---
export const LEVERAGE_TIERS: Record<string, { maxNotional: number; maxLeverage: number }[]> = {
  'BTC': [
    { maxNotional: 250_000, maxLeverage: 125 },
    { maxNotional: 1_000_000, maxLeverage: 100 },
    { maxNotional: 5_000_000, maxLeverage: 50 },
    { maxNotional: 20_000_000, maxLeverage: 20 },
    { maxNotional: Infinity, maxLeverage: 10 }
  ],
  'ETH': [
    { maxNotional: 500_000, maxLeverage: 125 },
    { maxNotional: 2_000_000, maxLeverage: 100 },
    { maxNotional: 10_000_000, maxLeverage: 50 },
    { maxNotional: 50_000_000, maxLeverage: 20 },
    { maxNotional: Infinity, maxLeverage: 10 }
  ],
  'SOL': [
    { maxNotional: 1_000_000, maxLeverage: 100 },
    { maxNotional: 5_000_000, maxLeverage: 75 },
    { maxNotional: 20_000_000, maxLeverage: 50 },
    { maxNotional: 100_000_000, maxLeverage: 20 },
    { maxNotional: Infinity, maxLeverage: 10 }
  ],
  'DOGE': [
    { maxNotional: 500_000, maxLeverage: 75 },
    { maxNotional: 2_000_000, maxLeverage: 50 },
    { maxNotional: 10_000_000, maxLeverage: 25 },
    { maxNotional: 50_000_000, maxLeverage: 10 },
    { maxNotional: Infinity, maxLeverage: 5 }
  ],
  'PEPE': [
    { maxNotional: 250_000, maxLeverage: 50 },
    { maxNotional: 1_000_000, maxLeverage: 40 },
    { maxNotional: 5_000_000, maxLeverage: 20 },
    { maxNotional: 20_000_000, maxLeverage: 10 },
    { maxNotional: Infinity, maxLeverage: 5 }
  ]
};

// Fallback for other alts
export const DEFAULT_LEVERAGE_TIERS = [
  { maxNotional: 100_000, maxLeverage: 50 },
  { maxNotional: 500_000, maxLeverage: 25 },
  { maxNotional: 2_000_000, maxLeverage: 10 },
  { maxNotional: Infinity, maxLeverage: 5 }
];

// --- TIME & SPEED CONFIGURATION ---
export const SPEED_LEVELS: Record<number, number> = {
  1: 1,     // 1x
  2: 5,     // 5x (Removed 2x)
  3: 10,    // 10x
  4: 25,    // 25x
  5: 50,    // 50x
  6: 100,   // 100x
  7: 500,   // 500x
  8: 1000   // 1000x
};

export const EVENT_CHECK_INTERVALS = {
  LIQUIDATION_HUNT_MINS: 5, 
  MINING_UPDATE_MINS: 60,   
  FLASH_CRASH_HOURS: 4      
};

export const VISIBLE_CANDLES: Record<TimeFrame, number> = {
  '15m': 300, 
  '1H': 300,  
  '4H': 100,  
  '1D': 90,   
  '1W': 60,   
  '1M': 50    
};

export const COIN_PROFILES: Record<VolatilityTag | string, { beta: number, maxDailyMove: number, parabolicFactor: number }> = {
  'BTC': { beta: 1.0, maxDailyMove: 0.08, parabolicFactor: 1.0 },
  'ETH': { beta: 1.3, maxDailyMove: 0.12, parabolicFactor: 1.2 }, 
  'SOL': { beta: 1.8, maxDailyMove: 0.18, parabolicFactor: 1.4 }, 
  'DOGE': { beta: 2.3, maxDailyMove: 0.25, parabolicFactor: 1.6 }, 
  'PEPE': { beta: 3.0, maxDailyMove: 0.35, parabolicFactor: 2.0 }, 
  'BIG_ALT': { beta: 1.5, maxDailyMove: 0.15, parabolicFactor: 1.3 },
  'SMALL_ALT': { beta: 2.3, maxDailyMove: 0.25, parabolicFactor: 1.6 },
  'MEME': { beta: 3.0, maxDailyMove: 0.35, parabolicFactor: 2.0 }
};

export const LIQUIDITY_PROFILES: Record<string, LiquidityProfile> = {
  'BTC':  { baseDepth: 150_000_000, decayFactor: 0.10 }, 
  'ETH':  { baseDepth: 80_000_000, decayFactor: 0.12 },
  'SOL':  { baseDepth: 30_000_000,  decayFactor: 0.18 },
  'DOGE': { baseDepth: 15_000_000,  decayFactor: 0.20 },
  'PEPE': { baseDepth: 5_000_000,   decayFactor: 0.25 }
};

export const WHALE_ORDER_STYLES = {
  COUNTRY: { layers: 5, spread: 0.02, sizePct: 0.05 },
  COMPANY: { layers: 3, spread: 0.05, sizePct: 0.03 },
  WHALE:   { layers: 2, spread: 0.08, sizePct: 0.10 }
};

export const PHASE_PARAMS = {
  ACCUMULATION: { mean: 0.001, sigma: 0.01, range: [30, 60] },
  BULL_RUN:     { mean: 0.005, sigma: 0.018, range: [45, 90] },
  DISTRIBUTION: { mean: 0.000, sigma: 0.025, range: [20, 45] },
  BEAR_MARKET:  { mean: -0.004, sigma: 0.02, range: [60, 120] }
};

// --- PATTERN DATASET ---
export const PATTERN_DATASET: PatternDefinition[] = [
  {
    "formasyon_adi": "TOBO (Inverse Head & Shoulders)",
    "yön": "yükseliş",
    "coin": "BTC",
    "ortalama_süre_saat": 32,
    "fiyat_oluşum_pct": { "düşüş": "-3% to -9%", "geri_toplanma": "+1% to +6%" },
    "breakout_pct": { "min": "+4%", "max": "+11%", "ortalama": "+7%" },
    "fake_break": { "olasılık": "18%", "hareket": "-2% to -6%" },
    "indikator_sartlari": {
      "basari": { "sentiment": "nötr-pozitif", "RSI14": "47-63", "fear_greed": "45-68", "MACD": "kesişim yukarı, momentum artan" },
      "basarisizlik": { "sentiment": "aşırı pozitif", "RSI14": ">70", "fear_greed": ">78", "MACD": "pozitif uyumsuzluk" }
    }
  },
];

// --- MINING CONSTANTS ---

export const MINING_LOCATIONS = [
  { id: 'usa', name: 'USA (Texas)', costKwh: 0.12, regulation: 'MEDIUM', stability: 'HIGH' },
  { id: 'germany', name: 'Germany', costKwh: 0.35, regulation: 'HIGH', stability: 'HIGH' },
  { id: 'elsalvador', name: 'El Salvador', costKwh: 0.05, regulation: 'LOW', stability: 'MEDIUM' },
  { id: 'china', name: 'China (Underground)', costKwh: 0.04, regulation: 'BANNED', stability: 'LOW' },
  { id: 'iceland', name: 'Iceland', costKwh: 0.06, regulation: 'LOW', stability: 'HIGH' }
];

export const RIG_TYPES = {
  GPU_RIG: { name: 'Nvidia Rig X8', hashrate: 0.0005, power: 1200, cost: 3500, type: 'GPU' }, 
  ASIC_S19: { name: 'Antminer S19', hashrate: 0.1, power: 3250, cost: 1500, type: 'ASIC' }, 
  ASIC_S21: { name: 'Antminer S21', hashrate: 0.2, power: 3500, cost: 4500, type: 'ASIC' }, 
  HELIUM: { name: 'Helium IoT Miner', hashrate: 0.01, power: 15, cost: 500, type: 'HELIUM' }, 
  LIQUID: { name: 'Hydro Immersive X', hashrate: 0.5, power: 4000, cost: 12000, type: 'LIQUID' }, 
  NUCLEAR: { name: 'Micro Reactor Core', hashrate: 2.5, power: 5000, cost: 150000, type: 'NUCLEAR' }, 
  SPACE: { name: 'Starlink Sat Miner', hashrate: 10.0, power: 0, cost: 2500000, type: 'SPACE' }, 
  QUANTUM_X: { name: 'Quantum Miner X', hashrate: 50.0, power: 8000, cost: 5000000, type: 'NEXT_GEN' } 
};

export const MINING_MODES = {
    LEGAL: { risk: 0, outputBonus: 1.0, desc: 'Legal' },
    OFFSHORE: { risk: 0.05, outputBonus: 1.3, desc: 'Offshore' },
    ILLEGAL: { risk: 0.20, outputBonus: 1.75, desc: 'Illegal Bunker' }
};

export const ENERGY_SOURCES = {
    GRID: { capex: 0, costMult: 1.0, desc: 'Grid' },
    SOLAR: { capex: 50000, costMult: 0, desc: 'Solar' },
    NUCLEAR: { capex: 500000, costMult: 0.05, desc: 'Nuclear' }
};

export const MINING_EVENTS = [
  { type: 'FIRE', costPct: 0.10, chance: 0.0001, desc: 'Fire broke out in cooling system!' },
  { type: 'FLOOD', costPct: 0.15, cost: 0, chance: 0.00005, desc: 'Flooding damaged equipment!' },
  { type: 'RAID', costPct: 0.25, chance: 0.00002, desc: 'Authorities raided the facility!' },
  { type: 'RADIATION', costPct: 0.50, chance: 0.00005, desc: 'Radiation leak detected! Reactor shutdown.' }
];

export const INITIAL_MINING_STATS = {
  totalHashrate: 0,
  dailyRevenue: 0,
  dailyCost: 0,
  dailyProfit: 0,
  networkDifficulty: 60000000, 
  networkHashrate: 600000,
  btcMinedLast24h: 0,
  mineTokens: 0
};

export const INITIAL_COINS: Coin[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 45000,
    intrinsicValue: 45000,
    change24h: 0,
    volume: 25000000000,
    marketCap: 850000000000,
    circulatingSupply: 19600000,
    totalSupply: 21000000,
    history: [],
    volatility: 0.015,
    trend: 0.02,
    correlationBeta: 1,
    volatilityProfile: 'LOW',
    volatilityTag: 'BTC',
    consecutiveCandles: 0,
    daysSinceLastParabolic: 0,
    openLeverageRisk: 0.1,
    currentFundingRate: 0.0001,
    fundingExtremeDuration: 0
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    price: 2400,
    intrinsicValue: 2400,
    change24h: 0,
    volume: 12000000000,
    marketCap: 280000000000,
    circulatingSupply: 120000000,
    totalSupply: 120000000,
    history: [],
    volatility: 0.025,
    trend: 0.02,
    correlationBeta: 1.3,
    volatilityProfile: 'MEDIUM',
    volatilityTag: 'BIG_ALT',
    consecutiveCandles: 0,
    daysSinceLastParabolic: 0,
    openLeverageRisk: 0.2,
    currentFundingRate: 0.0001,
    fundingExtremeDuration: 0
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    price: 110,
    intrinsicValue: 110,
    change24h: 0,
    volume: 3000000000,
    marketCap: 45000000000,
    circulatingSupply: 440000000,
    totalSupply: 570000000,
    history: [],
    volatility: 0.04,
    trend: 0.05,
    correlationBeta: 1.8,
    volatilityProfile: 'HIGH',
    volatilityTag: 'BIG_ALT',
    consecutiveCandles: 0,
    daysSinceLastParabolic: 0,
    openLeverageRisk: 0.3,
    currentFundingRate: 0.0002,
    fundingExtremeDuration: 0
  },
  {
    id: 'doge',
    symbol: 'DOGE',
    name: 'Dogecoin',
    price: 0.12,
    intrinsicValue: 0.12,
    change24h: 0,
    volume: 1000000000,
    marketCap: 16000000000,
    circulatingSupply: 140000000000,
    totalSupply: 140000000000,
    history: [],
    volatility: 0.06,
    trend: 0,
    correlationBeta: 2.3,
    volatilityProfile: 'HIGH',
    volatilityTag: 'SMALL_ALT',
    consecutiveCandles: 0,
    daysSinceLastParabolic: 0,
    openLeverageRisk: 0.5,
    currentFundingRate: 0.0001,
    fundingExtremeDuration: 0
  },
  {
    id: 'pepe',
    symbol: 'PEPE',
    name: 'Pepe',
    price: 0.0000015,
    intrinsicValue: 0.0000015,
    change24h: 0,
    volume: 500000000,
    marketCap: 600000000,
    circulatingSupply: 420690000000000,
    totalSupply: 420690000000000,
    history: [],
    volatility: 0.08,
    trend: 0.1,
    correlationBeta: 3.0,
    volatilityProfile: 'EXTREME',
    volatilityTag: 'MEME',
    consecutiveCandles: 0,
    daysSinceLastParabolic: 0,
    openLeverageRisk: 0.6,
    currentFundingRate: 0.0004,
    fundingExtremeDuration: 0
  },
];

export const INITIAL_PLAYER: PlayerState = {
  playerName: 'CryptoWhale',
  cash: 0, 
  bankBalance: 1000, 
  netWorth: 1000,
  level: 1,
  xp: 0,
  xpToNextLevel: 1000,
  reputation: 0,
  taxDue: 0,
  futuresUnlocked: true, 
  portfolio: [],
  positions: [],
  inventory: [],
  transactions: [],
  tradeStats: { totalTrades: 0, winningTrades: 0, losingTrades: 0, netPnL: 0 },
  lastTradeTime: 0,
  miningFarms: [],
  miningStats: INITIAL_MINING_STATS,
  coldWallets: []
};

export const TIME_FRAMES: TimeFrame[] = ['15m', '1H', '4H', '1D', '1W', '1M'];

export const INSTANT_NEWS_POOL = [
  { title: "Major Exchange Hack", impact: "MEDIUM", sentiment: "BEARISH" },
  { title: "Whale Wallet Movement (Inflow)", impact: "LOW", sentiment: "BEARISH" },
  { title: "Whale Wallet Movement (Outflow)", impact: "LOW", sentiment: "BULLISH" },
  { title: "Tech Upgrade in Ethereum", impact: "MEDIUM", sentiment: "BULLISH" },
  { title: "Country X Adopts Bitcoin", impact: "HIGH", sentiment: "BULLISH" },
  { title: "Meme Coin Trend Viral", impact: "LOW", sentiment: "BULLISH" },
  { title: "Regulatory Crackdown Rumors", impact: "MEDIUM", sentiment: "BEARISH" },
  { title: "Stablecoin Depeg Scare", impact: "HIGH", sentiment: "BEARISH" },
  { title: "New Institutional ETF Approved", impact: "HIGH", sentiment: "BULLISH" },
];

export const INSTANT_NEWS_POOL_TR = [
  { title: "Büyük Borsa Hacklendi", impact: "MEDIUM", sentiment: "BEARISH" },
  { title: "Balina Cüzdan Hareketi (Borsaya Giriş)", impact: "LOW", sentiment: "BEARISH" },
  { title: "Balina Cüzdan Hareketi (Borsadan Çıkış)", impact: "LOW", sentiment: "BULLISH" },
  { title: "Ethereum Teknik Güncellemesi", impact: "MEDIUM", sentiment: "BULLISH" },
  { title: "Bir Ülke Bitcoin'i Kabul Etti", impact: "HIGH", sentiment: "BULLISH" },
  { title: "Meme Coin Trendi Viral Oldu", impact: "LOW", sentiment: "BULLISH" },
  { title: "Regülasyon Baskısı Söylentileri", impact: "MEDIUM", sentiment: "BEARISH" },
  { title: "Stablecoin Depeg Korkusu", impact: "HIGH", sentiment: "BEARISH" },
  { title: "Yeni Kurumsal ETF Onaylandı", impact: "HIGH", sentiment: "BULLISH" },
];

export const WHALE_NEWS_TEMPLATES = [
  {
    type: 'CLASH',
    title: 'Whale Clash on {coin}',
    desc: '{whaleA} and {whaleB} entered opposite high-leverage positions. Liquidity war detected in the order books.',
    impact: 'MEDIUM',
    sentiment: 'NEUTRAL'
  },
  {
    type: 'CLASH',
    title: 'Liquidity Battle Intensifies',
    desc: 'Aggressive bids from {whaleA} are being absorbed by heavy sell walls from {whaleB} on {coin}. Volatility expected.',
    impact: 'MEDIUM',
    sentiment: 'NEUTRAL'
  },
  {
    type: 'HUNT_LONG',
    title: 'Whales Target Overleveraged Longs',
    desc: 'Multiple large sell orders just pushed {coin} down. Liquidation clusters are being cleared.',
    impact: 'HIGH',
    sentiment: 'BEARISH'
  },
  {
    type: 'HUNT_LONG',
    title: 'Stop Run Below Key Support',
    desc: 'A sudden wick on {coin} flushed out late buyers. Mass long liquidations on derivatives platforms.',
    impact: 'MEDIUM',
    sentiment: 'BEARISH'
  },
  {
    type: 'HUNT_SHORT',
    title: 'Short Squeeze Engine Started',
    desc: 'Aggressive market buys forced {coin} up. Early data shows cascading short liquidations.',
    impact: 'HIGH',
    sentiment: 'BULLISH'
  },
  {
    type: 'HUNT_SHORT',
    title: 'Bear Trap Detected',
    desc: '{coin} broke below key support but was quickly reclaimed. Trapped shorts fueling the bounce.',
    impact: 'MEDIUM',
    sentiment: 'BULLISH'
  }
];

export const WHALE_NEWS_TEMPLATES_TR = [
  {
    type: 'CLASH',
    title: '{coin} Üzerinde Balina Savaşı',
    desc: '{whaleA} ve {whaleB} ters yönlü yüksek kaldıraçlı pozisyonlar açtı. Emir defterlerinde likidite savaşı tespit edildi.',
    impact: 'MEDIUM',
    sentiment: 'NEUTRAL'
  },
  {
    type: 'CLASH',
    title: 'Likidite Savaşı Kızışıyor',
    desc: '{whaleA} tarafından gelen agresif alışlar, {coin} üzerinde {whaleB} satış duvarları tarafından emiliyor. Volatilite bekleniyor.',
    impact: 'MEDIUM',
    sentiment: 'NEUTRAL'
  },
  {
    type: 'HUNT_LONG',
    title: 'Balinalar Long Pozisyonları Avlıyor',
    desc: 'Büyük satış emirleri {coin} fiyatını aşağı itti. Likidasyon kümeleri temizleniyor.',
    impact: 'HIGH',
    sentiment: 'BEARISH'
  },
  {
    type: 'HUNT_LONG',
    title: 'Kilit Destek Altında Stop Patlatma',
    desc: '{coin} üzerindeki ani bir iğne geç alıcıları temizledi. Türev borsalarında toplu long likidasyonları.',
    impact: 'MEDIUM',
    sentiment: 'BEARISH'
  },
  {
    type: 'HUNT_SHORT',
    title: 'Short Squeeze (Sıkıştırma) Başladı',
    desc: 'Agresif piyasa alımları {coin} fiyatını yukarı zorladı. Erken veriler zincirleme short likidasyonlarını gösteriyor.',
    impact: 'HIGH',
    sentiment: 'BULLISH'
  },
  {
    type: 'HUNT_SHORT',
    title: 'Ayı Tuzağı Tespit Edildi',
    desc: '{coin} kilit desteğin altına indi ama hızla toparladı. Tuzağa düşen shortlar yükselişi besliyor.',
    impact: 'MEDIUM',
    sentiment: 'BULLISH'
  }
];

export const RECURRING_EVENTS = {
  SEC_DATA: { title: "SEC Regulatory Data Release", impact: "LOW" },
  RATE_EXPECTATION: { title: "Interest Rate Expectation Data", impact: "MEDIUM" },
  FED_DECISION: { title: "Fed Interest Rate Decision", impact: "HIGH" }
};

export const RECURRING_EVENTS_TR = {
  SEC_DATA: { title: "SEC Düzenleyici Veri Açıklaması", impact: "LOW" },
  RATE_EXPECTATION: { title: "Faiz Beklenti Verisi", impact: "MEDIUM" },
  FED_DECISION: { title: "FED Faiz Kararı", impact: "HIGH" }
};

export const GENERATE_INITIAL_CALENDAR = (currentDay: number): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    for (let d = currentDay; d <= currentDay + 60; d++) {
        if (d % 7 === 0) {
            events.push({ 
                id: `sec-${d}`, date: `Day ${d}`, title: RECURRING_EVENTS.SEC_DATA.title, 
                impact: 'LOW', actualDirection: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH', daysUntil: d - currentDay, isRecurring: true, applied: false 
            });
        }
        if (d % 14 === 0) {
            events.push({ 
                id: `rates-${d}`, date: `Day ${d}`, title: RECURRING_EVENTS.RATE_EXPECTATION.title, 
                impact: 'MEDIUM', actualDirection: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH', daysUntil: d - currentDay, isRecurring: true, applied: false 
            });
        }
        if (d % 30 === 0) {
             events.push({ 
                 id: `fed-${d}`, date: `Day ${d}`, title: RECURRING_EVENTS.FED_DECISION.title, 
                 impact: 'HIGH', actualDirection: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH', daysUntil: d - currentDay, isRecurring: true, applied: false 
             });
        }
    }
    return events;
};

export const TRANSLATIONS = {
  EN: {
    dashboard: "Dashboard",
    market: "Spot Market",
    futures: "Futures",
    social: "Social Net",
    news: "News & Calendar",
    whales: "Whale Watch",
    bank: "Bank & Assets",
    mining: "Mining Farm",
    settings: "Settings",
    netWorth: "Net Worth",
    liquidCash: "Exchange Balance",
    bankBalance: "Bank Balance",
    day: "Day",
    buy: "Buy",
    sell: "Sell",
    long: "Long",
    short: "Short",
    openPos: "Open Positions",
    noPos: "No active positions",
    tax: "Tax Office",
    deposit: "Deposit",
    withdraw: "Withdraw",
    tweet: "Post Tweet",
    analysis: "Analysis",
    hype: "Hype",
    fud: "FUD",
    send: "Send",
    entities: "Market Entities",
    holdings: "Holdings",
    worldMarket: "World Market",
    indices: "Indices",
    stocks: "Stocks",
    commodities: "Commodities",
    coldWallet: "Cold Wallet",
    createWallet: "Create Wallet",
    transfer: "Transfer",
    miningMode: "Mining Mode",
    legal: "Legal",
    offshore: "Offshore",
    illegal: "Illegal Bunker",
    energySource: "Energy Source",
    solar: "Solar",
    nuclear: "Nuclear",
    grid: "Grid",
    rigShop: "Rig Marketplace",
    mineToken: "MINE Token",
    stake: "Stake",
    unstake: "Unstake",
    profile: "Profile",
    statistics: "Statistics",
    amount: "Amount",
    payTax: "Pay Taxes Now",
    margin: "Margin",
    leverage: "Leverage",
    size: "Size",
    entry: "Entry",
    mark: "Mark",
    liqPrice: "Liq. Price",
    close: "Close",
    addMargin: "+ Margin",
    globalNews: "Global News Feed",
    whaleClash: "Whale Clash",
    unpaidLiability: "Unpaid Liability",
    totalTrades: "Total Trades",
    wins: "Wins",
    losses: "Losses",
    winRate: "Win Rate",
    netPnl: "Net PnL",
    devTools: "Developer Tools",
    setFunds: "Set Funds",
    setLevel: "Set Level",
    freezeAssets: "Freeze Assets",
    selectWallet: "Select Wallet",
    totalHashrate: "Total Hashrate",
    mined24h: "Mined (24h)",
    dailyProfit: "Daily Profit",
    myFarms: "My Farms",
    noFarms: "No farms yet. Create one to start mining!",
    createFarm: "Start New Mining Farm",
    farmName: "Farm Name",
    location: "Location",
    establishFarm: "Establish Farm ($5,000 Fee)",
    miningModesInfo: "Mining Modes (Unlockable)",
    miningModesDesc: "Farms start as Legal. Upgrade later for higher risk/reward.",
    marketOverview: "Market Overview",
    vol24h: "Vol 24h",
    balance: "Balance",
    held: "Held",
    usdAmount: "USD Amount",
    buySpot: "Buy Spot",
    futuresPnl: "Futures PnL",
    activeFutures: "Active Futures",
    coldWalletManager: "Cold Wallet Manager",
    secureAssets: "Secure your assets off-exchange",
    walletName: "Wallet Name",
    confirmTx: "Confirm Transaction",
    noTrades: "No trade history found.",
    history: "History",
    spotPortfolio: "Spot Portfolio",
    repair: "Repair",
    productionHalted: "Production Halted",
    fixFarmFirst: "Fix Farm First",
    buyFor: "Buy for",
    followers: "Followers",
    rep: "Rep",
    tone: "Tone",
    asset: "Asset",
    forecast: "Forecast",
    highImpact: "HIGH IMPACT",
    status: "Status"
  },
  TR: {
    dashboard: "Kontrol Paneli",
    market: "Spot Piyasa",
    futures: "Vadeli İşlemler",
    social: "Sosyal Ağ",
    news: "Haberler & Takvim",
    whales: "Balina İzleme",
    bank: "Banka & Varlıklar",
    mining: "Madencilik",
    settings: "Ayarlar",
    netWorth: "Net Varlık",
    liquidCash: "Borsa Bakiyesi",
    bankBalance: "Banka Hesabı",
    day: "Gün",
    buy: "Satın Al",
    sell: "Sat",
    long: "Uzun (Long)",
    short: "Kısa (Short)",
    openPos: "Açık Pozisyonlar",
    noPos: "Açık pozisyon yok",
    tax: "Vergi Dairesi",
    deposit: "Yatır",
    withdraw: "Çek",
    tweet: "Tweet At",
    analysis: "Analiz",
    hype: "Hype (Pompala)",
    fud: "FUD (Korku)",
    send: "Gönder",
    entities: "Piyasa Aktörleri",
    holdings: "Varlıklar",
    worldMarket: "Dünya Piyasaları",
    indices: "Endeksler",
    stocks: "Hisseler",
    commodities: "Emtialar",
    coldWallet: "Soğuk Cüzdan",
    createWallet: "Cüzdan Oluştur",
    transfer: "Transfer Et",
    miningMode: "Madencilik Modu",
    legal: "Yasal",
    offshore: "Offshore (Kıyı Ötesi)",
    illegal: "Yasa Dışı Sığınak",
    energySource: "Enerji Kaynağı",
    solar: "Güneş Enerjisi",
    nuclear: "Nükleer",
    grid: "Şebeke",
    rigShop: "Ekipman Marketi",
    mineToken: "MINE Token",
    stake: "Kilitle (Stake)",
    unstake: "Çöz (Unstake)",
    profile: "Profil",
    statistics: "İstatistikler",
    amount: "Miktar",
    payTax: "Vergileri Öde",
    margin: "Marjin",
    leverage: "Kaldıraç",
    size: "Büyüklük",
    entry: "Giriş",
    mark: "Piyasa",
    liqPrice: "Likidasyon",
    close: "Kapat",
    addMargin: "+ Ekle",
    globalNews: "Küresel Haber Akışı",
    whaleClash: "Balina Savaşı",
    unpaidLiability: "Ödenmemiş Borç",
    totalTrades: "Toplam İşlem",
    wins: "Kazanç",
    losses: "Kayıp",
    winRate: "Kazanma Oranı",
    netPnl: "Net K/Z",
    devTools: "Geliştirici Araçları",
    setFunds: "Fon Ayarla",
    setLevel: "Seviye Ayarla",
    freezeAssets: "Varlıkları Dondur",
    selectWallet: "Cüzdan Seç",
    totalHashrate: "Toplam Hashrate",
    mined24h: "Kazılan (24s)",
    dailyProfit: "Günlük Kar",
    myFarms: "Çiftliklerim",
    noFarms: "Henüz çiftlik yok. Başlamak için oluştur!",
    createFarm: "Yeni Madencilik Çiftliği Kur",
    farmName: "Çiftlik Adı",
    location: "Konum",
    establishFarm: "Çiftliği Kur ($5,000 Ücret)",
    miningModesInfo: "Madencilik Modları (Açılabilir)",
    miningModesDesc: "Çiftlikler Yasal başlar. Daha yüksek risk/ödül için yükseltilebilir.",
    marketOverview: "Piyasa Özeti",
    vol24h: "Hacim 24s",
    balance: "Bakiye",
    held: "Eldeki",
    usdAmount: "USD Tutarı",
    buySpot: "Spot Al",
    futuresPnl: "Vadeli K/Z",
    activeFutures: "Aktif Vadeli İşlemler",
    coldWalletManager: "Soğuk Cüzdan Yöneticisi",
    secureAssets: "Varlıklarını borsa dışında sakla",
    walletName: "Cüzdan Adı",
    confirmTx: "İşlemi Onayla",
    noTrades: "İşlem geçmişi bulunamadı.",
    history: "Geçmiş",
    spotPortfolio: "Spot Portföy",
    repair: "Tamir Et",
    productionHalted: "Üretim Durdu",
    fixFarmFirst: "Önce Çiftliği Onar",
    buyFor: "Satın Al:",
    followers: "Takipçi",
    rep: "İtibar",
    tone: "Ton",
    asset: "Varlık",
    forecast: "Beklenti",
    highImpact: "YÜKSEK ETKİ",
    status: "Durum"
  },
  DE: {
    dashboard: "Armaturenbrett",
    market: "Spotmarkt",
    futures: "Termingeschäfte",
    social: "Soziales Netz",
    news: "Nachrichten",
    whales: "Walbeobachtung",
    bank: "Bank & Vermögen",
    mining: "Bergbau",
    settings: "Einstellungen",
    netWorth: "Reinvermögen",
    liquidCash: "Börsenguthaben",
    bankBalance: "Bankguthaben",
    day: "Tag",
    buy: "Kaufen",
    sell: "Verkaufen",
    long: "Lang",
    short: "Kurz",
    openPos: "Offene Positionen",
    noPos: "Keine offenen Positionen",
    tax: "Finanzamt",
    deposit: "Einzahlen",
    withdraw: "Abheben",
    tweet: "Tweeten",
    analysis: "Analyse",
    hype: "Hype",
    fud: "FUD",
    send: "Senden",
    entities: "Marktteilnehmer",
    holdings: "Bestände",
    worldMarket: "Weltmarkt",
    indices: "Indizes",
    stocks: "Aktien",
    commodities: "Rohstoffe",
    coldWallet: "Cold Wallet",
    createWallet: "Wallet erstellen",
    transfer: "Überweisen",
    miningMode: "Bergbaumodus",
    legal: "Legal",
    offshore: "Offshore",
    illegal: "Illegal",
    energySource: "Energiequelle",
    solar: "Solar",
    nuclear: "Atomkraft",
    grid: "Netz",
    rigShop: "Ausrüstungsmarkt",
    mineToken: "MINE Token",
    stake: "Einsatz",
    unstake: "Auszahlen",
    profile: "Profil",
    statistics: "Statistiken",
    amount: "Menge",
    payTax: "Steuern zahlen",
    margin: "Marge",
    leverage: "Hebel",
    size: "Größe",
    entry: "Einstieg",
    mark: "Markt",
    liqPrice: "Liq. Preis",
    close: "Schließen",
    addMargin: "+ Marge",
    globalNews: "Globale Nachrichten",
    whaleClash: "Walkampf",
    unpaidLiability: "Unbezahlte Verbindlichkeit",
    totalTrades: "Gesamthandel",
    wins: "Gewinne",
    losses: "Verluste",
    winRate: "Gewinnrate",
    netPnl: "Netto G/V",
    devTools: "Entwicklertools",
    setFunds: "Mittel festlegen",
    setLevel: "Level festlegen",
    freezeAssets: "Vermögen einfrieren",
    selectWallet: "Wallet wählen",
    totalHashrate: "Gesamt Hashrate",
    mined24h: "Geschürft (24h)",
    dailyProfit: "Tagesgewinn",
    myFarms: "Meine Farmen",
    noFarms: "Keine Farmen. Erstelle eine!",
    createFarm: "Neue Farm starten",
    farmName: "Farm Name",
    location: "Standort",
    establishFarm: "Farm gründen ($5.000)",
    miningModesInfo: "Bergbaumodi",
    miningModesDesc: "Beginnt Legal. Upgrade möglich.",
    marketOverview: "Marktübersicht",
    vol24h: "Vol 24h",
    balance: "Guthaben",
    held: "Gehalten",
    usdAmount: "USD Betrag",
    buySpot: "Spot Kaufen",
    futuresPnl: "Futures G/V",
    activeFutures: "Aktive Futures",
    coldWalletManager: "Cold Wallet Manager",
    secureAssets: "Sichere Vermögenswerte",
    walletName: "Wallet Name",
    confirmTx: "Transaktion bestätigen",
    noTrades: "Keine Handelshistorie",
    history: "Historie",
    spotPortfolio: "Spot Portfolio",
    repair: "Reparieren",
    productionHalted: "Produktion gestoppt",
    fixFarmFirst: "Erst Farm reparieren",
    buyFor: "Kaufen für",
    followers: "Follower",
    rep: "Ruf",
    tone: "Ton",
    asset: "Anlage",
    forecast: "Prognose",
    highImpact: "HOHE AUSWIRKUNG",
    status: "Status"
  },
  FR: {
    dashboard: "Tableau de bord",
    market: "Marché Spot",
    futures: "Contrats à terme",
    social: "Réseau Social",
    news: "Actualités",
    whales: "Suivi des Baleines",
    bank: "Banque & Actifs",
    mining: "Minage",
    settings: "Paramètres",
    netWorth: "Valeur Nette",
    liquidCash: "Solde Échange",
    bankBalance: "Solde Bancaire",
    day: "Jour",
    buy: "Acheter",
    sell: "Vendre",
    long: "Long",
    short: "Court",
    openPos: "Positions Ouvertes",
    noPos: "Aucune position",
    tax: "Bureau des impôts",
    deposit: "Dépôt",
    withdraw: "Retrait",
    tweet: "Tweeter",
    analysis: "Analyse",
    hype: "Hype",
    fud: "FUD",
    send: "Envoyer",
    entities: "Entités du Marché",
    holdings: "Avoirs",
    worldMarket: "Marché Mondial",
    indices: "Indices",
    stocks: "Actions",
    commodities: "Matières Premières",
    coldWallet: "Portefeuille Froid",
    createWallet: "Créer Portefeuille",
    transfer: "Transférer",
    miningMode: "Mode de Minage",
    legal: "Légal",
    offshore: "Offshore",
    illegal: "Illégal",
    energySource: "Source d'énergie",
    solar: "Solaire",
    nuclear: "Nucléaire",
    grid: "Réseau",
    rigShop: "Magasin d'équipement",
    mineToken: "Jeton MINE",
    stake: "Jalonner",
    unstake: "Retirer",
    profile: "Profil",
    statistics: "Statistiques",
    amount: "Montant",
    payTax: "Payer Taxes",
    margin: "Marge",
    leverage: "Levier",
    size: "Taille",
    entry: "Entrée",
    mark: "Marque",
    liqPrice: "Prix Liq.",
    close: "Fermer",
    addMargin: "+ Marge",
    globalNews: "Actualités Mondiales",
    whaleClash: "Choc des Baleines",
    unpaidLiability: "Dette Impayée",
    totalTrades: "Total Trades",
    wins: "Gains",
    losses: "Pertes",
    winRate: "Taux de Gain",
    netPnl: "P&L Net",
    devTools: "Outils Développeur",
    setFunds: "Définir Fonds",
    setLevel: "Définir Niveau",
    freezeAssets: "Geler Actifs",
    selectWallet: "Choisir Portefeuille",
    totalHashrate: "Hashrate Total",
    mined24h: "Miné (24h)",
    dailyProfit: "Profit Quotidien",
    myFarms: "Mes Fermes",
    noFarms: "Pas de fermes. Créez-en une !",
    createFarm: "Nouvelle Ferme",
    farmName: "Nom de la Ferme",
    location: "Emplacement",
    establishFarm: "Établir Ferme (5 000 $)",
    miningModesInfo: "Modes de Minage",
    miningModesDesc: "Commence Légal. Amélioration possible.",
    marketOverview: "Vue du Marché",
    vol24h: "Vol 24h",
    balance: "Solde",
    held: "Détenu",
    usdAmount: "Montant USD",
    buySpot: "Acheter Spot",
    futuresPnl: "P&L Futures",
    activeFutures: "Futures Actifs",
    coldWalletManager: "Gestionnaire Portefeuille Froid",
    secureAssets: "Sécuriser hors échange",
    walletName: "Nom du Portefeuille",
    confirmTx: "Confirmer Transaction",
    noTrades: "Aucun historique",
    history: "Historique",
    spotPortfolio: "Portefeuille Spot",
    repair: "Réparer",
    productionHalted: "Production Arrêtée",
    fixFarmFirst: "Réparer d'abord",
    buyFor: "Acheter pour",
    followers: "Abonnés",
    rep: "Réputation",
    tone: "Ton",
    asset: "Actif",
    forecast: "Prévision",
    highImpact: "IMPACT ÉLEVÉ",
    status: "Statut"
  }
};

export const ENTITY_NAMES = {
  COUNTRIES: ['El Salvador', 'USA (Gov)', 'China (Seized)', 'Germany', 'Bhutan', 'Ukraine', 'Brazil'],
  COMPANIES: ['MicroStrategy', 'Tesla', 'Block', 'Marathon Digital', 'Coinbase', 'Riot Platforms'],
  WHALES_PREFIXES: ['0xSatoshi', 'WhaleAlert', 'DeepPocket', 'DiamondHands', 'AlphaSeeker', 'MoonWalker', 'HodlKing', 'PumpMaster', 'Liquidator']
};
