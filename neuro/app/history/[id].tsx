import React from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/Colors';
import { formatIDR, formatIDRFull } from '../../constants/Coins';

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark, history } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  const trade = history.find((h) => h.id === id);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!trade) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={C.textPrimary} />
          <Text style={[styles.backText, { color: C.textPrimary }]}>Back</Text>
        </TouchableOpacity>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={C.textSecondary} />
          <Text style={[styles.notFoundText, { color: C.textPrimary }]}>Trade not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: C.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={C.textPrimary} />
          <Text style={[styles.backText, { color: C.textPrimary }]}>History</Text>
        </TouchableOpacity>
        <View style={[styles.tradeIdBadge, { backgroundColor: `${C.primary}20` }]}>
          <Text style={[styles.tradeIdText, { color: C.primary }]}>{trade.tradeId}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: '#0ECB8115', borderColor: '#0ECB8130' }]}>
          <Ionicons name="checkmark-circle" size={20} color="#0ECB81" />
          <Text style={[styles.statusText, { color: '#0ECB81' }]}>Trade Executed Successfully</Text>
        </View>

        {/* Meta */}
        <View style={[styles.metaCard, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: C.textSecondary }]}>Trade ID</Text>
            <Text style={[styles.metaValue, { color: C.primary, fontWeight: '800', letterSpacing: 2 }]}>
              {trade.tradeId}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: C.border }]} />
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: C.textSecondary }]}>Date & Time</Text>
            <Text style={[styles.metaValue, { color: C.textPrimary }]}>{formatDate(trade.timestamp)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: C.border }]} />
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, { color: C.textSecondary }]}>Total Items</Text>
            <Text style={[styles.metaValue, { color: C.textPrimary }]}>
              {trade.items.reduce((s, i) => s + i.quantity, 0)} units
            </Text>
          </View>
        </View>

        {/* Products Section */}
        <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Products</Text>

        <View style={[styles.productsCard, { backgroundColor: C.card, borderColor: C.border }]}>
          {trade.items.map((item, idx) => (
            <View key={item.coin.id}>
              <View style={styles.productRow}>
                <Image source={{ uri: item.coin.image }} style={styles.coinImg} />
                <View style={styles.productInfo}>
                  <Text style={[styles.productSymbol, { color: C.textPrimary }]}>{item.coin.symbol.toUpperCase()}</Text>
                  <Text style={[styles.productName, { color: C.textSecondary }]}>{item.coin.name.toUpperCase()}</Text>
                  <Text style={[styles.productPrice, { color: C.textSecondary }]}>
                    @ {formatIDR(item.priceAtAdd)} per unit
                  </Text>
                </View>
                <View style={styles.productRight}>
                  <View style={[styles.qtyBadge, { backgroundColor: `${C.primary}20` }]}>
                    <Text style={[styles.qtyText, { color: C.primary }]}>×{item.quantity}</Text>
                  </View>
                  <Text style={[styles.productTotal, { color: C.textPrimary }]}>
                    {formatIDRFull(item.priceAtAdd * item.quantity)}
                  </Text>
                </View>
              </View>
              {idx < trade.items.length - 1 && (
                <View style={[styles.rowDivider, { backgroundColor: C.border }]} />
              )}
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>Price Breakdown</Text>

        <View style={[styles.breakdownCard, { backgroundColor: C.card, borderColor: C.border }]}>
          {trade.items.map((item) => (
            <View key={item.coin.id} style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: C.textSecondary }]}>
                {item.coin.symbol.toUpperCase()} ({item.quantity}×)
              </Text>
              <Text style={[styles.breakdownValue, { color: C.textPrimary }]}>
                {formatIDRFull(item.priceAtAdd * item.quantity)}
              </Text>
            </View>
          ))}

          <View style={[styles.totalDivider, { backgroundColor: C.border }]} />

          <View style={styles.breakdownRow}>
            <Text style={[styles.totalLabel, { color: C.textPrimary }]}>Total</Text>
            <Text style={[styles.totalValue, { color: C.primary }]}>
              {formatIDRFull(trade.total)}
            </Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
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
    borderBottomWidth: 1,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 15, fontWeight: '600' },
  tradeIdBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  tradeIdText: { fontSize: 15, fontWeight: '800', letterSpacing: 2 },

  content: { padding: 16, gap: 12 },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  statusText: { fontSize: 14, fontWeight: '600' },

  metaCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  metaLabel: { fontSize: 13 },
  metaValue: { fontSize: 13, fontWeight: '600' },
  divider: { height: 1 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },

  productsCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  coinImg: { width: 44, height: 44, borderRadius: 22 },
  productInfo: { flex: 1 },
  productSymbol: { fontSize: 15, fontWeight: '700' },
  productName: { fontSize: 12, marginTop: 1 },
  productPrice: { fontSize: 11, marginTop: 2 },
  productRight: { alignItems: 'flex-end', gap: 6 },
  qtyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  qtyText: { fontSize: 13, fontWeight: '700' },
  productTotal: { fontSize: 13, fontWeight: '700' },
  rowDivider: { height: 1, marginHorizontal: 14 },

  breakdownCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { fontSize: 14 },
  breakdownValue: { fontSize: 14, fontWeight: '600' },
  totalDivider: { height: 1, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 18, fontWeight: '800' },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 18, fontWeight: '700' },
});
