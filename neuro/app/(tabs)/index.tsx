import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Image, Dimensions, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/Colors';
import { STATIC_COINS, Coin, formatIDR, formatIDRFull } from '../../constants/Coins';
import Navbar from '../../components/Navbar';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Featured Slider Card ────────────────────────────────────────────────────

function FeaturedCard({ item, C }: { item: Coin; C: typeof Colors.dark }) {
  const { addToCart, addToSellCart, getHoldingQuantity, toggleWatchlist, isInWatchlist } = useApp();
  const change24h = item.price_change_percentage_24h ?? 0;
  const isUp = change24h >= 0;
  const inWL = isInWatchlist(item.id);
  const ownedQty = getHoldingQuantity(item.id);

  return (
    <View style={[styles.featuredCard, { backgroundColor: C.card, borderColor: C.border }]}>
      <View style={styles.featuredTop}>
        <Image source={{ uri: item.image }} style={styles.featuredImg} />
        <View style={styles.featuredInfo}>
          <Text style={[styles.featuredSymbol, { color: C.textPrimary }]}>{(item.symbol ?? '').toUpperCase()}</Text>
          <Text style={[styles.featuredName, { color: C.textSecondary }]}>{(item.name ?? '').toUpperCase()}</Text>
        </View>
        <View style={[styles.changeBadge, { backgroundColor: isUp ? '#0ECB8120' : '#F6465D20' }]}>
          <Ionicons
            name={isUp ? 'trending-up' : 'trending-down'}
            size={12}
            color={isUp ? C.success : C.danger}
          />
          <Text style={[styles.changeText, { color: isUp ? C.success : C.danger }]}>
            {isUp ? '+' : ''}{change24h.toFixed(2)}%
          </Text>
        </View>
      </View>

      <Text style={[styles.featuredPrice, { color: C.textPrimary }]}>
        {formatIDR(item.current_price)}
      </Text>

      <View style={styles.featuredActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: inWL ? C.primary : C.surface2, borderColor: C.border }]}
          onPress={() => toggleWatchlist(item)}
          accessibilityLabel="Add to watchlist"
        >
          <Ionicons name={inWL ? 'star' : 'star-outline'} size={16} color={inWL ? '#FFFFFF' : C.textSecondary} />
        </TouchableOpacity>
        {ownedQty > 0 && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: C.surface2, borderColor: C.border }]}
            onPress={() => addToSellCart(item)}
            accessibilityLabel="Queue sell"
          >
            <Ionicons name="trending-down" size={16} color={C.danger} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.addCartBtn, { backgroundColor: C.primary }]}
          onPress={() => addToCart(item)}
          accessibilityLabel="Add to trade queue"
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addCartText}>Queue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Market Row ───────────────────────────────────────────────────────────────

function MarketRow({ item, C }: { item: Coin; C: typeof Colors.dark }) {
  const { addToCart, addToSellCart, getHoldingQuantity, toggleWatchlist, isInWatchlist } = useApp();
  const change24h = item.price_change_percentage_24h ?? 0;
  const isUp = change24h >= 0;
  const inWL = isInWatchlist(item.id);
  const ownedQty = getHoldingQuantity(item.id);

  return (
    <View style={[styles.marketRow, { borderBottomColor: C.border }]}>
      <Image source={{ uri: item.image }} style={styles.marketImg} />
      <View style={styles.marketInfo}>
        <Text style={[styles.marketSymbol, { color: C.textPrimary }]}>{(item.symbol ?? '').toUpperCase()}</Text>
        <Text style={[styles.marketName, { color: C.textSecondary }]}>{(item.name ?? '').toUpperCase()}</Text>
      </View>
      <View style={styles.marketPriceCol}>
        <Text style={[styles.marketPrice, { color: C.textPrimary }]}>{formatIDR(item.current_price)}</Text>
        <Text style={[styles.marketChange, { color: isUp ? C.success : C.danger }]}>
          {isUp ? '+' : ''}{change24h.toFixed(2)}%
        </Text>
      </View>
      <View style={styles.marketBtns}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: C.surface2 }]}
          onPress={() => toggleWatchlist(item)}
          accessibilityLabel="Watch"
        >
          <Ionicons name={inWL ? 'star' : 'star-outline'} size={16} color={inWL ? '#F0B90B' : C.textSecondary} />
        </TouchableOpacity>
        {ownedQty > 0 && (
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: C.surface2 }]}
            onPress={() => addToSellCart(item)}
            accessibilityLabel="Queue sell"
          >
            <Ionicons name="trending-down" size={16} color={C.danger} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: C.primary }]}
          onPress={() => addToCart(item)}
          accessibilityLabel="Add to queue"
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Wallet Card ─────────────────────────────────────────────────────────────

function WalletCard({ C }: { C: typeof Colors.dark }) {
  const { walletBalance, portfolioValue } = useApp();
  return (
    <View style={[styles.walletCard, { backgroundColor: C.primary }]}>
      <Text style={styles.walletLabel}>Total Balance</Text>
      <Text style={styles.walletBalance}>{formatIDRFull(walletBalance)}</Text>
      <View style={styles.walletDivider} />
      <View style={styles.walletRow}>
        <View>
          <Text style={styles.walletSubLabel}>Portfolio Value</Text>
          <Text style={styles.walletSubValue}>{formatIDRFull(portfolioValue)}</Text>
        </View>
        <View style={styles.walletBadge}>
          <Ionicons name="wallet-outline" size={24} color="rgba(255,255,255,0.7)" />
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { isDark, setLivePrices } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const [coins, setCoins] = useState<Coin[]>(STATIC_COINS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLivePrices();
  }, []);

  const fetchLivePrices = async () => {
    try {
      const ids = STATIC_COINS.map((c) => c.id).join(',');
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=idr&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false`,
        { headers: { Accept: 'application/json' } }
      );
      if (!res.ok) throw new Error('API error');
      const data: Coin[] = await res.json();
      // Merge with featured flags from static
      const merged = data.map((live) => {
        const st = STATIC_COINS.find((s) => s.id === live.id);
        return {
          ...live,
          symbol: live.symbol.toUpperCase(),
          name: live.name.toUpperCase(),
          isFeatured: st?.isFeatured ?? false,
        };
      });
      setCoins(merged);
      const priceMap: Record<string, number> = {};
      merged.forEach((c) => { priceMap[c.id] = c.current_price ?? 0; });
      setLivePrices(priceMap);
    } catch (e) {
      // Silently fall back to static data
      setCoins(STATIC_COINS);
    } finally {
      setLoading(false);
    }
  };

  const featured = coins.filter((c) => c.isFeatured);
  const market = coins;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <Navbar />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Wallet */}
        <View style={styles.section}>
          <WalletCard C={C} />
        </View>

        {/* Featured Slider */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Featured</Text>
          {loading && <ActivityIndicator size="small" color={C.primary} />}
        </View>

        {featured.length > 0 && (
          <Carousel
            loop
            autoPlay
            autoPlayInterval={3500}
            width={SCREEN_W}
            height={200}
            data={featured}
            scrollAnimationDuration={600}
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: 16 }}>
                <FeaturedCard item={item} C={C} />
              </View>
            )}
          />
        )}

        {/* Market List */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Market</Text>
          <Text style={[styles.sectionSub, { color: C.textSecondary }]}>Live IDR</Text>
        </View>

        {market.map((coin) => (
          <MarketRow key={coin.id} item={coin} C={C} />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { paddingHorizontal: 16, paddingVertical: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionSub: { fontSize: 12 },

  // Wallet
  walletCard: {
    borderRadius: 16,
    padding: 20,
  },
  walletLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  walletBalance: { color: '#FFFFFF', fontSize: 28, fontWeight: '800', marginTop: 4 },
  walletDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 12 },
  walletRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletSubLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  walletSubValue: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginTop: 2 },
  walletBadge: {},

  // Featured Card
  featuredCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    height: 180,
    justifyContent: 'space-between',
  },
  featuredTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featuredImg: { width: 40, height: 40, borderRadius: 20 },
  featuredInfo: { flex: 1 },
  featuredSymbol: { fontSize: 16, fontWeight: '700' },
  featuredName: { fontSize: 12 },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  changeText: { fontSize: 12, fontWeight: '600' },
  featuredPrice: { fontSize: 22, fontWeight: '800' },
  featuredActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addCartBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addCartText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },

  // Market Row
  marketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  marketImg: { width: 36, height: 36, borderRadius: 18 },
  marketInfo: { flex: 1 },
  marketSymbol: { fontSize: 14, fontWeight: '700' },
  marketName: { fontSize: 11, marginTop: 1 },
  marketPriceCol: { alignItems: 'flex-end', minWidth: 90 },
  marketPrice: { fontSize: 13, fontWeight: '600' },
  marketChange: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  marketBtns: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
