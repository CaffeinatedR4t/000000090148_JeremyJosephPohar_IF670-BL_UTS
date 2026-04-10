import React from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/Colors';
import { Coin, formatIDR } from '../../constants/Coins';
import Navbar from '../../components/Navbar';

function SwipeRow({ coin, C }: { coin: Coin; C: typeof Colors.dark }) {
  const { removeFromWatchlist, addToCart } = useApp();
  const isUp = coin.price_change_percentage_24h >= 0;

  const renderRightActions = () => (
    <TouchableOpacity
      style={[styles.swipeAction, styles.swipeDelete, { backgroundColor: C.danger }]}
      onPress={() => removeFromWatchlist(coin.id)}
      accessibilityLabel="Remove from watchlist"
    >
      <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
      <Text style={styles.swipeText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = () => (
    <TouchableOpacity
      style={[styles.swipeAction, styles.swipeCart, { backgroundColor: C.primary }]}
      onPress={() => addToCart(coin)}
      accessibilityLabel="Add to trade queue"
    >
      <Ionicons name="bag-add-outline" size={22} color="#FFFFFF" />
      <Text style={styles.swipeText}>Queue</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootRight={false}
      overshootLeft={false}
    >
      <View style={[styles.row, { backgroundColor: C.background, borderBottomColor: C.border }]}>
        <Image source={{ uri: coin.image }} style={styles.img} />
        <View style={styles.info}>
          <Text style={[styles.symbol, { color: C.textPrimary }]}>{coin.symbol.toUpperCase()}</Text>
          <Text style={[styles.name, { color: C.textSecondary }]}>{coin.name.toUpperCase()}</Text>
        </View>
        <View style={styles.priceCol}>
          <Text style={[styles.price, { color: C.textPrimary }]}>{formatIDR(coin.current_price)}</Text>
          <Text style={[styles.change, { color: isUp ? C.success : C.danger }]}>
            {isUp ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
          </Text>
        </View>
        <Ionicons name="reorder-three-outline" size={20} color={C.textSecondary} style={{ marginLeft: 8 }} />
      </View>
    </Swipeable>
  );
}

export default function WatchlistScreen() {
  const { isDark, watchlist } = useApp();
  const C = isDark ? Colors.dark : Colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <Navbar />
      <View style={styles.header}>
        <Text style={[styles.title, { color: C.textPrimary }]}>Watchlist</Text>
        <Text style={[styles.hint, { color: C.textSecondary }]}>
          ← Swipe to queue  •  Swipe to delete →
        </Text>
      </View>

      {watchlist.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="star-outline" size={56} color={C.textSecondary} />
          <Text style={[styles.emptyTitle, { color: C.textPrimary }]}>No coins watched</Text>
          <Text style={[styles.emptyHint, { color: C.textSecondary }]}>
            Tap ★ on any coin to add it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={watchlist}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SwipeRow coin={item} C={C} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  hint: { fontSize: 12, marginTop: 4 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 10,
  },
  img: { width: 40, height: 40, borderRadius: 20 },
  info: { flex: 1 },
  symbol: { fontSize: 15, fontWeight: '700' },
  name: { fontSize: 12, marginTop: 2 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: 14, fontWeight: '600' },
  change: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  swipeAction: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  swipeDelete: { borderRadius: 0 },
  swipeCart: { borderRadius: 0 },
  swipeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyHint: { fontSize: 14 },
});
