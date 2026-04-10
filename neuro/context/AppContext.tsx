import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Coin } from '../constants/Coins';
import { generateTradeId } from '../constants/Coins';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  coin: Coin;
  quantity: number;
  priceAtAdd: number;
}

export interface HoldingItem {
  coin: Coin;
  quantity: number;
  averageBuyPrice: number;
}

export type TradeSide = 'BUY' | 'SELL';

export interface TradeHistoryItem {
  id: string;
  tradeId: string;
  side: TradeSide;
  timestamp: number;
  items: CartItem[];
  total: number;
}

interface AppContextType {
  // Theme
  isDark: boolean;
  toggleTheme: () => void;

  // Wallet
  walletBalance: number;
  portfolioValue: number;

  // Cart
  cart: CartItem[];
  sellCart: CartItem[];
  holdings: HoldingItem[];
  cartCount: number;
  addToCart: (coin: Coin) => void;
  removeFromCart: (coinId: string) => void;
  updateQuantity: (coinId: string, delta: number) => void;
  setQuantity: (coinId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => string | null;
  addToSellCart: (coin: Coin) => void;
  removeFromSellCart: (coinId: string) => void;
  updateSellQuantity: (coinId: string, delta: number) => void;
  setSellQuantity: (coinId: string, quantity: number) => void;
  clearSellCart: () => void;
  sellCheckout: () => string | null;
  getHoldingQuantity: (coinId: string) => number;

  // Watchlist
  watchlist: Coin[];
  addToWatchlist: (coin: Coin) => void;
  removeFromWatchlist: (coinId: string) => void;
  toggleWatchlist: (coin: Coin) => void;
  isInWatchlist: (coinId: string) => boolean;

  // History
  history: TradeHistoryItem[];

  // Live prices
  livePrices: Record<string, number>;
  setLivePrices: (prices: Record<string, number>) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextType | null>(null);

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const QUANTITY_STEP = 0.001;
  const roundQuantity = (value: number): number => {
    return Math.round(value * 1_000_000) / 1_000_000;
  };

  const [isDark, setIsDark] = useState(true);
  const [walletBalance, setWalletBalance] = useState(1_000_000_000_000);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sellCart, setSellCart] = useState<CartItem[]>([]);
  const [holdings, setHoldings] = useState<HoldingItem[]>([]);
  const [watchlist, setWatchlist] = useState<Coin[]>([]);
  const [history, setHistory] = useState<TradeHistoryItem[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});

  // ── Theme ──
  const toggleTheme = useCallback(() => setIsDark((d) => !d), []);

  // ── Cart ──
  const cartCount = cart.length + sellCart.length;

  const addToCart = useCallback((coin: Coin) => {
    const fallbackPrice = livePrices[coin.id] ?? coin.current_price ?? 0;
    const safePrice = Number.isFinite(fallbackPrice) ? fallbackPrice : 0;

    setCart((prev) => {
      const existing = prev.find((i) => i.coin.id === coin.id);
      if (existing) {
        return prev.map((i) =>
          i.coin.id === coin.id
            ? {
                ...i,
                coin,
                quantity: roundQuantity(i.quantity + 1),
                priceAtAdd: safePrice,
              }
            : i
        );
      }
      return [...prev, { coin, quantity: 1, priceAtAdd: safePrice }];
    });
  }, [livePrices]);

  const removeFromCart = useCallback((coinId: string) => {
    setCart((prev) => prev.filter((i) => i.coin.id !== coinId));
  }, []);

  const updateQuantity = useCallback((coinId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.coin.id !== coinId) return i;
          const nextQty = roundQuantity(i.quantity + delta);
          return { ...i, quantity: nextQty };
        })
        .filter((i) => i.quantity > 0);
    });
  }, []);

  const setQuantity = useCallback((coinId: string, quantity: number) => {
    const safeQuantity = roundQuantity(Math.max(0, quantity));
    setCart((prev) => {
      return prev
        .map((i) => i.coin.id === coinId ? { ...i, quantity: safeQuantity } : i)
        .filter((i) => i.quantity > 0);
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const checkout = useCallback((): string | null => {
    if (cart.length === 0) return null;
    const total = cart.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
    if (total > walletBalance) return null;

    const tradeId = generateTradeId();
    const tradeItem: TradeHistoryItem = {
      id: Date.now().toString(),
      tradeId,
      side: 'BUY',
      timestamp: Date.now(),
      items: [...cart],
      total,
    };

    setHoldings((prev) => {
      const next = [...prev];
      cart.forEach((item) => {
        const idx = next.findIndex((h) => h.coin.id === item.coin.id);
        if (idx === -1) {
          next.push({
            coin: item.coin,
            quantity: item.quantity,
            averageBuyPrice: item.priceAtAdd,
          });
          return;
        }

        const existing = next[idx];
        const totalQty = existing.quantity + item.quantity;
        const totalCost =
          existing.averageBuyPrice * existing.quantity + item.priceAtAdd * item.quantity;

        next[idx] = {
          ...existing,
          coin: item.coin,
          quantity: totalQty,
          averageBuyPrice: totalCost / totalQty,
        };
      });
      return next;
    });

    setHistory((prev) => [tradeItem, ...prev]);
    setWalletBalance((prev) => prev - total);
    setCart([]);
    return tradeId;
  }, [cart, walletBalance]);

  const getHoldingQuantity = useCallback(
    (coinId: string) => holdings.find((h) => h.coin.id === coinId)?.quantity ?? 0,
    [holdings]
  );

  const addToSellCart = useCallback((coin: Coin) => {
    setSellCart((prev) => {
      const maxQty = holdings.find((h) => h.coin.id === coin.id)?.quantity ?? 0;
      if (maxQty <= 0) return prev;

      const existing = prev.find((i) => i.coin.id === coin.id);
      const marketPrice = livePrices[coin.id] ?? coin.current_price ?? 0;

      if (existing) {
        if (existing.quantity >= maxQty) return prev;
        return prev.map((i) =>
          i.coin.id === coin.id
            ? {
                ...i,
                quantity: roundQuantity(Math.min(maxQty, i.quantity + 1)),
                priceAtAdd: marketPrice,
              }
            : i
        );
      }

      return [...prev, { coin, quantity: Math.min(maxQty, 1), priceAtAdd: marketPrice }];
    });
  }, [holdings, livePrices]);

  const removeFromSellCart = useCallback((coinId: string) => {
    setSellCart((prev) => prev.filter((i) => i.coin.id !== coinId));
  }, []);

  const updateSellQuantity = useCallback((coinId: string, delta: number) => {
    setSellCart((prev) => {
      return prev
        .map((i) => {
          if (i.coin.id !== coinId) return i;
          const maxQty = holdings.find((h) => h.coin.id === coinId)?.quantity ?? 0;
          const nextQty = roundQuantity(Math.max(0, Math.min(maxQty, i.quantity + delta)));
          return { ...i, quantity: nextQty };
        })
        .filter((i) => i.quantity > 0);
    });
  }, [holdings]);

  const setSellQuantity = useCallback((coinId: string, quantity: number) => {
    setSellCart((prev) => {
      return prev
        .map((i) => {
          if (i.coin.id !== coinId) return i;
          const maxQty = holdings.find((h) => h.coin.id === coinId)?.quantity ?? 0;
          const safeQuantity = roundQuantity(Math.max(0, Math.min(maxQty, quantity)));
          return { ...i, quantity: safeQuantity };
        })
        .filter((i) => i.quantity > 0);
    });
  }, [holdings]);

  const clearSellCart = useCallback(() => setSellCart([]), []);

  const sellCheckout = useCallback((): string | null => {
    if (sellCart.length === 0) return null;

    const canSellAll = sellCart.every((item) => {
      const owned = holdings.find((h) => h.coin.id === item.coin.id)?.quantity ?? 0;
      return owned >= item.quantity;
    });

    if (!canSellAll) return null;

    const total = sellCart.reduce((sum, item) => {
      const livePrice = livePrices[item.coin.id] ?? item.coin.current_price ?? item.priceAtAdd;
      return sum + livePrice * item.quantity;
    }, 0);

    const pricedItems = sellCart.map((item) => ({
      ...item,
      priceAtAdd: livePrices[item.coin.id] ?? item.coin.current_price ?? item.priceAtAdd,
    }));

    const tradeId = generateTradeId();
    const tradeItem: TradeHistoryItem = {
      id: Date.now().toString(),
      tradeId,
      side: 'SELL',
      timestamp: Date.now(),
      items: pricedItems,
      total,
    };

    setHoldings((prev) => {
      const next = [...prev];
      pricedItems.forEach((item) => {
        const idx = next.findIndex((h) => h.coin.id === item.coin.id);
        if (idx === -1) return;

        const remaining = next[idx].quantity - item.quantity;
        if (remaining <= 0) {
          next.splice(idx, 1);
          return;
        }

        next[idx] = { ...next[idx], quantity: remaining };
      });
      return next;
    });

    setHistory((prev) => [tradeItem, ...prev]);
    setWalletBalance((prev) => prev + total);
    setSellCart([]);
    return tradeId;
  }, [holdings, livePrices, sellCart]);

  // ── Watchlist ──
  const addToWatchlist = useCallback((coin: Coin) => {
    setWatchlist((prev) => {
      if (prev.find((c) => c.id === coin.id)) return prev;
      return [...prev, coin];
    });
  }, []);

  const removeFromWatchlist = useCallback((coinId: string) => {
    setWatchlist((prev) => prev.filter((c) => c.id !== coinId));
  }, []);

  const toggleWatchlist = useCallback((coin: Coin) => {
    setWatchlist((prev) => {
      const exists = prev.some((c) => c.id === coin.id);
      if (exists) return prev.filter((c) => c.id !== coin.id);
      return [...prev, coin];
    });
  }, []);

  const isInWatchlist = useCallback(
    (coinId: string) => watchlist.some((c) => c.id === coinId),
    [watchlist]
  );

  // ── Portfolio value ──
  const portfolioValue = holdings.reduce((sum, holding) => {
    const livePrice = livePrices[holding.coin.id] ?? holding.coin.current_price ?? holding.averageBuyPrice;
    return sum + livePrice * holding.quantity;
  }, 0);

  return (
    <AppContext.Provider
      value={{
        isDark,
        toggleTheme,
        walletBalance,
        portfolioValue,
        cart,
        sellCart,
        holdings,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        setQuantity,
        clearCart,
        checkout,
        addToSellCart,
        removeFromSellCart,
        updateSellQuantity,
        setSellQuantity,
        clearSellCart,
        sellCheckout,
        getHoldingQuantity,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        history,
        livePrices,
        setLivePrices,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
