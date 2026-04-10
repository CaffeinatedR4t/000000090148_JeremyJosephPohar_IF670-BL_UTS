import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/Colors';
import { formatIDRFull } from '../../constants/Coins';
import Navbar from '../../components/Navbar';

export default function HistoryScreen() {
  const { isDark, history } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const router = useRouter();
  const [filter, setFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    if (!filter.trim()) return history;
    return history.filter((h) =>
      h.tradeId.toLowerCase().includes(filter.trim().toLowerCase())
    );
  }, [history, filter]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <Navbar />
      <View style={styles.header}>
        <Text style={[styles.title, { color: C.textPrimary }]}>Trade History</Text>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: showFilter ? C.primary : C.surface2 }]}
          onPress={() => setShowFilter((v) => !v)}
          accessibilityLabel="Toggle filter"
        >
          <Ionicons name="filter-outline" size={16} color={showFilter ? '#FFFFFF' : C.textSecondary} />
          <Text style={[styles.filterBtnText, { color: showFilter ? '#FFFFFF' : C.textSecondary }]}>
            Filter
          </Text>
        </TouchableOpacity>
      </View>

      {showFilter && (
        <View style={[styles.filterBox, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Ionicons name="search-outline" size={16} color={C.textSecondary} style={{ marginLeft: 8 }} />
          <TextInput
            style={[styles.filterInput, { color: C.textPrimary }]}
            value={filter}
            onChangeText={setFilter}
            placeholder="Search by Trade ID (e.g. TRX123)"
            placeholderTextColor={C.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {filter.length > 0 && (
            <TouchableOpacity onPress={() => setFilter('')}>
              <Ionicons name="close-circle" size={18} color={C.textSecondary} style={{ marginRight: 8 }} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={56} color={C.textSecondary} />
          <Text style={[styles.emptyTitle, { color: C.textPrimary }]}>
            {history.length === 0 ? 'No trades yet' : 'No results found'}
          </Text>
          <Text style={[styles.emptyHint, { color: C.textSecondary }]}>
            {history.length === 0
              ? 'Execute a trade to see it here'
              : `No trade found with ID "${filter}"`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
              <View style={styles.cardTop}>
                <View style={[styles.tradeBadge, { backgroundColor: `${C.primary}20` }]}>
                  <Text style={[styles.tradeCode, { color: C.primary }]}>{item.tradeId}</Text>
                </View>
                <Text style={[styles.tradeDate, { color: C.textSecondary }]}>{formatDate(item.timestamp)}</Text>
              </View>
              <View style={styles.coinsList}>
                {item.items.map((ci) => (
                  <Text key={ci.coin.id} style={[styles.coinLine, { color: C.textSecondary }]}>
                    {ci.coin.symbol.toUpperCase()} × {ci.quantity}
                  </Text>
                ))}
              </View>
              <View style={[styles.cardBottom, { borderTopColor: C.border }]}>
                <View>
                  <Text style={[styles.totalLabel, { color: C.textSecondary }]}>Total</Text>
                  <Text style={[styles.totalValue, { color: C.textPrimary }]}>
                    {formatIDRFull(item.total)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.detailBtn, { backgroundColor: C.primary }]}
                  onPress={() => router.push(`/history/${item.id}`)}
                  accessibilityLabel="View detail"
                >
                  <Text style={styles.detailBtnText}>Detail</Text>
                  <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: { fontSize: 22, fontWeight: '800' },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterBtnText: { fontSize: 13, fontWeight: '600' },

  filterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
  },
  filterInput: { flex: 1, paddingHorizontal: 8, fontSize: 14 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyHint: { fontSize: 14 },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  tradeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tradeCode: { fontSize: 16, fontWeight: '800', letterSpacing: 2 },
  tradeDate: { fontSize: 12 },
  coinsList: { paddingHorizontal: 14, paddingBottom: 12, gap: 4 },
  coinLine: { fontSize: 13 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 12 },
  totalValue: { fontSize: 16, fontWeight: '700' },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  detailBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
