export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  market_cap: number;
  isFeatured?: boolean;
}

// Fallback static IDR prices (used when API fails)
export const STATIC_COINS: Coin[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'BITCOIN',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 1650000000,
    price_change_percentage_24h: 2.45,
    market_cap: 32000000000000,
    isFeatured: true,
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'ETHEREUM',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 52000000,
    price_change_percentage_24h: -1.23,
    market_cap: 6200000000000,
    isFeatured: true,
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'SOLANA',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    current_price: 2450000,
    price_change_percentage_24h: 5.67,
    market_cap: 1100000000000,
    isFeatured: true,
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    current_price: 9800000,
    price_change_percentage_24h: 0.89,
    market_cap: 1400000000000,
    isFeatured: true,
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    image: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
    current_price: 38500,
    price_change_percentage_24h: -2.11,
    market_cap: 2200000000000,
    isFeatured: true,
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'CARDANO',
    image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
    current_price: 12800,
    price_change_percentage_24h: 3.14,
    market_cap: 450000000000,
    isFeatured: false,
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'DOGECOIN',
    image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
    current_price: 2850,
    price_change_percentage_24h: -0.77,
    market_cap: 410000000000,
    isFeatured: false,
  },
  {
    id: 'avalanche-2',
    symbol: 'AVAX',
    name: 'AVALANCHE',
    image: 'https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png',
    current_price: 595000,
    price_change_percentage_24h: 4.32,
    market_cap: 245000000000,
    isFeatured: false,
  },
  {
    id: 'matic-network',
    symbol: 'MATIC',
    name: 'POLYGON',
    image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
    current_price: 8200,
    price_change_percentage_24h: -1.88,
    market_cap: 82000000000,
    isFeatured: false,
  },
  {
    id: 'polkadot',
    symbol: 'DOT',
    name: 'POLKADOT',
    image: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    current_price: 115000,
    price_change_percentage_24h: 2.03,
    market_cap: 170000000000,
    isFeatured: false,
  },
];

export const FEATURED_COINS = STATIC_COINS.filter((c) => c.isFeatured);

const normalizeAmount = (amount: number | null | undefined): number => {
  if (typeof amount !== 'number' || Number.isNaN(amount) || !Number.isFinite(amount)) {
    return 0;
  }
  return amount;
};

export const formatIDR = (amount: number | null | undefined): string => {
  const safeAmount = normalizeAmount(amount);
  const hasFraction = Math.abs(safeAmount % 1) > 1e-9;
  return `Rp${safeAmount.toLocaleString('id-ID', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 6,
  })}`;
};

export const formatIDRFull = (amount: number | null | undefined): string => {
  const safeAmount = normalizeAmount(amount);
  const hasFraction = Math.abs(safeAmount % 1) > 1e-9;
  return `Rp${safeAmount.toLocaleString('id-ID', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 6,
  })}`;
};

export const generateTradeId = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  let id = '';
  for (let i = 0; i < 3; i++) id += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 3; i++) id += nums[Math.floor(Math.random() * nums.length)];
  return id;
};
