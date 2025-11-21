
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  MARKET = 'MARKET',
  FUTURES = 'FUTURES',
  SOCIAL = 'SOCIAL',
  NEWS_CALENDAR = 'NEWS_CALENDAR',
  WHALES = 'WHALES',
  BANK = 'BANK',
  MINING = 'MINING',
  SETTINGS = 'SETTINGS'
}

export type Language = 'TR' | 'EN' | 'DE' | 'FR';

export type TimeFrame = '15m' | '1H' | '4H' | '1D' | '1W' | '1M';

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  candleIndex?: number; // Used for synchronization
}

export type VolatilityTag = 'BTC' | 'BIG_ALT' | 'SMALL_ALT' | 'MEME';

export interface CoinProfile {
  beta: number;
  maxDailyMove: number;
  parabolicFactor: number;
}

export interface LiquidityProfile {
  baseDepth: number; // Base USD depth at best bid/ask
  decayFactor: number; // How fast liquidity thins out (higher = thinner book)
}

export interface OrderBookLevel {
  price: number;
  size: number; // Size in COIN
  total: number; // Cumulative size
  source?: 'MARKET_MAKER' | 'WHALE' | 'PLAYER';
}

export interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

export interface ExecutionResult {
  vwapPrice: number; // Volume Weighted Average Price (The real price you got)
  finalPrice: number; // The price of the last filled order (New market price)
  filledSize: number;
  slippagePct: number;
  impact: number; // Price change percentage
  filledLevels: OrderBookLevel[]; // For visualization or debugging
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  intrinsicValue: number; 
  change24h: number; 
  volume: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  history: Candle[];
  volatility: number; 
  trend: number; 
  correlationBeta: number; 
  volatilityProfile: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'; 
  volatilityTag: VolatilityTag; 
  consecutiveCandles: number; 
  
  // Simulation State
  daysSinceLastParabolic: number;
  openLeverageRisk: number; // 0-1
  
  // Funding State
  currentFundingRate: number;
  fundingExtremeDuration: number; // How many hours it has been extreme
}

export interface PatternDefinition {
  formasyon_adi: string;
  yön: 'yükseliş' | 'düşüş';
  coin: string;
  ortalama_süre_saat: number;
  fiyat_oluşum_pct: any;
  breakout_pct: { min: string; max: string; ortalama: string };
  fake_break: { olasılık: string; hareket: string };
  indikator_sartlari: {
    basari: { sentiment: string; RSI14: string; fear_greed: string; MACD: string };
    basarisizlik: { sentiment: string; RSI14: string; fear_greed: string; MACD: string };
  };
}

export interface PatternResult {
  name: string;
  confidence: number;
  direction: 'BULLISH' | 'BEARISH';
  targetRange: string;
  fakeoutProb: string;
  fakeoutTarget: string;
  indicators: string;
  failureCondition: string;
}

export interface PortfolioItem {
  coinId: string;
  amount: number;
  avgBuyPrice: number;
}

export type FuturesType = 'CROSS' | 'ISOLATED';

export interface FuturesPosition {
  id: string;
  coinId: string;
  type: 'LONG' | 'SHORT';
  marginType: FuturesType;
  leverage: number;
  entryPrice: number;
  margin: number; 
  size: number; 
  liquidationPrice: number;
  
  // PnL Components
  pnl: number; // Unrealized (Gross)
  realizedPnl: number; 
  
  // Fees
  tradingFees: number;
  fundingFees: number;
  
  // Computed
  netPnl: number; // Gross + Realized - Fees
  
  tp?: number; // Take Profit Price
  sl?: number; // Stop Loss Price
}

export interface Transaction {
  id: string;
  timestamp: number;
  type: 'SPOT_BUY' | 'SPOT_SELL' | 'FUTURES_OPEN' | 'FUTURES_CLOSE' | 'LIQUIDATION' | 'TP_HIT' | 'SL_HIT' | 'FUNDING_FEE';
  coinSymbol: string;
  amount: number; // Coin amount or Contract size
  price: number;
  pnl?: number; // Only for closes
  slippage?: number;
  impact?: number; // Price impact of this trade
}

export interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  netPnL: number;
}

// Mining Types
export type RigType = 'GPU' | 'ASIC' | 'NEXT_GEN' | 'HELIUM' | 'LIQUID' | 'NUCLEAR' | 'SPACE';
export type MiningDisasterType = 'FIRE' | 'FLOOD' | 'RAID' | 'RADIATION' | 'NONE';
export type MiningMode = 'LEGAL' | 'OFFSHORE' | 'ILLEGAL';
export type EnergySource = 'GRID' | 'SOLAR' | 'NUCLEAR';

export interface MiningRig {
  id: string;
  model: string;
  type: RigType;
  hashrate: number; // TH/s
  power: number; // Watts
  efficiency: number; // 0-1 (degrades over time)
  purchaseDate: number;
}

export interface MiningFarm {
  id: string;
  countryId: string;
  name: string;
  rigs: MiningRig[];
  totalHashrate: number;
  totalPower: number; // kW
  dailyCost: number;
  status: 'ACTIVE' | 'STOPPED';
  disaster: { type: MiningDisasterType, costToFix: number };
  mode: MiningMode;
  energySource: EnergySource;
  solarCapacity: number; // kW provided for free
}

export interface MiningStats {
  totalHashrate: number; // TH/s
  dailyRevenue: number; // BTC
  dailyCost: number; // USD
  dailyProfit: number; // USD
  networkDifficulty: number;
  networkHashrate: number; // Global TH/s
  btcMinedLast24h: number;
  mineTokens: number; // New MINE token balance
}

export interface ColdWallet {
  id: string;
  name: string;
  balanceBTC: number;
  balanceETH: number;
  balanceSOL: number;
}

export interface PlayerState {
  playerName: string;
  cash: number; 
  bankBalance: number; 
  netWorth: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  reputation: number; 
  taxDue: number; 
  futuresUnlocked: boolean;
  portfolio: PortfolioItem[];
  positions: FuturesPosition[];
  inventory: string[];
  transactions: Transaction[];
  tradeStats: TradeStats;
  lastTradeTime: number;
  miningFarms: MiningFarm[];
  miningStats: MiningStats;
  coldWallets: ColdWallet[]; 
}

export interface FeedItem {
  id: string;
  author: string;
  handle: string;
  avatarColor: string;
  content: string;
  timestamp: number; // Game Minute
  likes: number;
  comments: number;
  isVerified?: boolean;
  type: 'USER' | 'WHALE' | 'NEWS' | 'ALERT';
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  timestamp: number; // Game Minute
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actualDirection: 'BULLISH' | 'BEARISH';
  daysUntil: number;
  isRecurring?: boolean;
  applied?: boolean; // Track if event has been processed
}

export interface GameTime {
  totalMinutes: number; // Single source of truth for simulation time
  day: number;
  hour: number;
  minute: number;
  speed: number; 
}

export type EntityType = 'COUNTRY' | 'COMPANY' | 'WHALE' | 'MINER';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  btcHoldings: number;
  ethHoldings: number;
  solHoldings: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'HODL';
  lastAction?: string;
  tradeFrequency: number; 
  tradeSizeMultiplier: number;
  lastPostTime?: number; // Game minutes when last posted
}

// Simulation Types
export type MarketPhase = 'ACCUMULATION' | 'BULL_RUN' | 'DISTRIBUTION' | 'BEAR_MARKET';

export interface MarketState {
  phase: MarketPhase;
  phaseDay: number; // Current day within the phase
  phaseTotalDays: number; // Total duration of current phase
  globalSentiment: number; 
  volatilityIndex: number; 
  
  // Global Momentum for smooth curves
  globalMomentum: number;
  // Active news impact force (-1 to 1, decays over time)
  newsSentimentBias: number;
  
  // Funding Timer
  nextFundingTimestamp: number;
}

// Technical Analysis Types
export interface SupportResistance {
  price: number;
  type: 'SUPPORT' | 'RESISTANCE';
  strength: number; // 0-1
  touches: number;
}

export interface TechnicalIndicators {
  rsi: number; 
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  fearGreed: number; 
  signal: 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
  pattern?: PatternResult;
  srLevels: SupportResistance[];
}

export interface WorldAsset {
  id: string;
  symbol: string;
  name: string;
  type: 'STOCK' | 'COMMODITY' | 'FOREX' | string;
  price: number;
  change24h: number;
  history: Candle[];
}

export interface IndexData {
  name: string;
  value: number;
  change24h: number;
  history: Candle[];
}
