import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, FlatList,
  Alert, Modal, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/Colors';
import { formatIDR, formatIDRFull } from '../../constants/Coins';
import Navbar from '../../components/Navbar';

type TradeMode = 'BUY' | 'SELL';
const QTY_STEP = 1;

const formatQty = (qty: number): string => {
  return qty.toFixed(6).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
};

export default function TradeScreen() {
  const {
    isDark,
    cart,
    sellCart,
    holdings,
    updateQuantity,
    setQuantity,
    removeFromCart,
    checkout,
    addToSellCart,
    updateSellQuantity,
    setSellQuantity,
    removeFromSellCart,
    sellCheckout,
    walletBalance,
    livePrices,
  } = useApp();

  const C = isDark ? Colors.dark : Colors.light;
  const [successId, setSuccessId] = useState<string | null>(null);
  const [mode, setMode] = useState<TradeMode>('BUY');
  const [qtyDrafts, setQtyDrafts] = useState<Record<string, string>>({});

  const buyTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0),
    [cart]
  );

  const sellTotal = useMemo(
    () => sellCart.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0),
    [sellCart]
  );

  const activeQueue = mode === 'BUY' ? cart : sellCart;
  const activeTotal = mode === 'BUY' ? buyTotal : sellTotal;

  const handleQtyCommit = (coinId: string, rawValue: string) => {
    const normalized = rawValue.replace(',', '.').trim();
    const parsed = Number.parseFloat(normalized);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setQtyDrafts((prev) => {
        const next = { ...prev };
        delete next[coinId];
        return next;
      });
      return;
    }

    if (mode === 'BUY') {
      setQuantity(coinId, parsed);
    } else {
      setSellQuantity(coinId, parsed);
    }

    setQtyDrafts((prev) => {
      const next = { ...prev };
      delete next[coinId];
      return next;
    });
  };

  const handleBuyCheckout = () => {
    if (cart.length === 0) return;

    if (buyTotal > walletBalance) {
      Alert.alert('Insufficient Money', 'INSUFFICIENT MONEY TO BUY THE COIN');
      return;
    }

    Alert.alert(
      'Execute Buy',
      `Confirm buy for ${formatIDRFull(buyTotal)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Execute',
          style: 'default',
          onPress: () => {
            const id = checkout();
            if (id) setSuccessId(id);
          },
        },
      ]
    );
  };

  const handleSellCheckout = () => {
    if (sellCart.length === 0) return;

    Alert.alert(
      'Execute Sell',
      `Confirm sell for ${formatIDRFull(sellTotal)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Execute',
          style: 'default',
          onPress: () => {
            const id = sellCheckout();
            if (id) setSuccessId(id);
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (mode === 'BUY') {
      handleBuyCheckout();
      return;
    }
    handleSellCheckout();
  };

  const renderQueueEmpty = (emptyMode: TradeMode) => (
    <View style={styles.empty}>
      <Ionicons
        name={emptyMode === 'BUY' ? 'bag-outline' : 'trending-down-outline'}
        size={56}
        color={C.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: C.textPrimary }]}>
        {emptyMode === 'BUY' ? 'Buy queue is empty' : 'Sell queue is empty'}
      </Text>
      <Text style={[styles.emptyHint, { color: C.textSecondary }]}> 
        {emptyMode === 'BUY'
          ? 'Tap + on any coin to queue a buy order'
          : 'Tap Sell from Owned Coins below'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <Navbar />

      <View style={styles.header}>
        <Text style={[styles.title, { color: C.textPrimary }]}>Trade Queue</Text>
        <Text style={[styles.subtitle, { color: C.textSecondary }]}>Wallet {formatIDRFull(walletBalance)}</Text>
      </View>

      <View style={styles.modeWrap}>
        <TouchableOpacity
          style={[styles.modeBtn, { backgroundColor: mode === 'BUY' ? C.primary : C.surface2 }]}
          onPress={() => setMode('BUY')}
        >
          <Text style={[styles.modeText, { color: mode === 'BUY' ? '#FFFFFF' : C.textSecondary }]}>BUY</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, { backgroundColor: mode === 'SELL' ? C.primary : C.surface2 }]}
          onPress={() => setMode('SELL')}
        >
          <Text style={[styles.modeText, { color: mode === 'SELL' ? '#FFFFFF' : C.textSecondary }]}>SELL</Text>
        </TouchableOpacity>
      </View>

      {mode === 'BUY' ? (
        activeQueue.length === 0 ? (
          renderQueueEmpty('BUY')
        ) : (
          <FlatList
            data={activeQueue}
            keyExtractor={(item) => item.coin.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={[styles.cartRow, { backgroundColor: C.card, borderColor: C.border }]}>
                <Image source={{ uri: item.coin.image }} style={styles.img} />
                <View style={styles.coinInfo}>
                  <Text style={[styles.symbol, { color: C.textPrimary }]}>{item.coin.symbol.toUpperCase()}</Text>
                  <Text style={[styles.priceAt, { color: C.textSecondary }]}>@ {formatIDR(item.priceAtAdd)}</Text>
                </View>
                <View style={styles.rightCol}>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: C.surface2 }]}
                      onPress={() => updateQuantity(item.coin.id, -QTY_STEP)}
                      accessibilityLabel="Decrease quantity"
                    >
                      <Ionicons name="remove" size={16} color={C.textPrimary} />
                    </TouchableOpacity>

                    <TextInput
                      style={[styles.qtyInput, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.surface2 }]}
                      keyboardType="decimal-pad"
                      value={qtyDrafts[item.coin.id] ?? formatQty(item.quantity)}
                      onChangeText={(text) => setQtyDrafts((prev) => ({ ...prev, [item.coin.id]: text }))}
                      onBlur={() => handleQtyCommit(item.coin.id, qtyDrafts[item.coin.id] ?? formatQty(item.quantity))}
                      onSubmitEditing={() => handleQtyCommit(item.coin.id, qtyDrafts[item.coin.id] ?? formatQty(item.quantity))}
                      selectTextOnFocus
                    />

                    <TouchableOpacity
                      style={[styles.qtyBtn, { backgroundColor: C.primary }]}
                      onPress={() => updateQuantity(item.coin.id, QTY_STEP)}
                      accessibilityLabel="Increase quantity"
                    >
                      <Ionicons name="add" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rowMeta}>
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => removeFromCart(item.coin.id)}
                      accessibilityLabel="Remove row"
                    >
                      <Ionicons name="close-circle" size={18} color={C.textSecondary} />
                    </TouchableOpacity>
                    <Text style={[styles.itemTotal, { color: C.textPrimary }]}> 
                      {formatIDRFull(item.priceAtAdd * item.quantity)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            ListFooterComponent={
              <View style={[styles.summary, { backgroundColor: C.card, borderColor: C.border }]}> 
                <Text style={[styles.summaryTitle, { color: C.textSecondary }]}>Order Summary</Text>
                {activeQueue.map((item) => (
                  <View key={item.coin.id} style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: C.textSecondary }]}> 
                      {item.coin.symbol.toUpperCase()} ({formatQty(item.quantity)}x)
                    </Text>
                    <Text style={[styles.summaryValue, { color: C.textPrimary }]}>
                      {formatIDRFull(item.priceAtAdd * item.quantity)}
                    </Text>
                  </View>
                ))}
                <View style={[styles.totalDivider, { backgroundColor: C.border }]} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.totalLabel, { color: C.textPrimary }]}>Total</Text>
                  <Text style={[styles.totalValue, { color: C.primary }]}> 
                    {formatIDRFull(activeTotal)}
                  </Text>
                </View>
              </View>
            }
          />
        )
      ) : (
        <FlatList
          data={sellCart}
          keyExtractor={(item) => item.coin.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={[styles.holdingsCard, { backgroundColor: C.card, borderColor: C.border }]}> 
              <Text style={[styles.holdingsTitle, { color: C.textPrimary }]}>Owned Coins</Text>
              {holdings.length === 0 ? (
                <Text style={[styles.holdingsHint, { color: C.textSecondary }]}>No holdings yet. Buy coins first.</Text>
              ) : (
                holdings.map((holding) => {
                  const livePrice = livePrices[holding.coin.id] ?? holding.coin.current_price ?? holding.averageBuyPrice;
                  return (
                    <View key={holding.coin.id} style={styles.holdingRow}>
                      <View>
                        <Text style={[styles.holdingSymbol, { color: C.textPrimary }]}>{holding.coin.symbol.toUpperCase()}</Text>
                        <Text style={[styles.holdingMeta, { color: C.textSecondary }]}> 
                          OWNED {formatQty(holding.quantity)} | PRICE {formatIDR(livePrice)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.holdingSellBtn, { backgroundColor: C.primary }]}
                        onPress={() => addToSellCart(holding.coin)}
                      >
                        <Text style={styles.holdingSellText}>SELL</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          }
          ListEmptyComponent={renderQueueEmpty('SELL')}
          renderItem={({ item }) => (
            <View style={[styles.cartRow, { backgroundColor: C.card, borderColor: C.border }]}>
              <Image source={{ uri: item.coin.image }} style={styles.img} />
              <View style={styles.coinInfo}>
                <Text style={[styles.symbol, { color: C.textPrimary }]}>{item.coin.symbol.toUpperCase()}</Text>
                <Text style={[styles.priceAt, { color: C.textSecondary }]}>@ {formatIDR(item.priceAtAdd)}</Text>
              </View>
              <View style={styles.rightCol}>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: C.surface2 }]}
                    onPress={() => updateSellQuantity(item.coin.id, -QTY_STEP)}
                    accessibilityLabel="Decrease quantity"
                  >
                    <Ionicons name="remove" size={16} color={C.textPrimary} />
                  </TouchableOpacity>

                  <TextInput
                    style={[styles.qtyInput, { color: C.textPrimary, borderColor: C.border, backgroundColor: C.surface2 }]}
                    keyboardType="decimal-pad"
                    value={qtyDrafts[item.coin.id] ?? formatQty(item.quantity)}
                    onChangeText={(text) => setQtyDrafts((prev) => ({ ...prev, [item.coin.id]: text }))}
                    onBlur={() => handleQtyCommit(item.coin.id, qtyDrafts[item.coin.id] ?? formatQty(item.quantity))}
                    onSubmitEditing={() => handleQtyCommit(item.coin.id, qtyDrafts[item.coin.id] ?? formatQty(item.quantity))}
                    selectTextOnFocus
                  />

                  <TouchableOpacity
                    style={[styles.qtyBtn, { backgroundColor: C.primary }]}
                    onPress={() => updateSellQuantity(item.coin.id, QTY_STEP)}
                    accessibilityLabel="Increase quantity"
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.rowMeta}>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeFromSellCart(item.coin.id)}
                    accessibilityLabel="Remove row"
                  >
                    <Ionicons name="close-circle" size={18} color={C.textSecondary} />
                  </TouchableOpacity>
                  <Text style={[styles.itemTotal, { color: C.textPrimary }]}>
                    {formatIDRFull(item.priceAtAdd * item.quantity)}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={[styles.summary, { backgroundColor: C.card, borderColor: C.border }]}> 
              <Text style={[styles.summaryTitle, { color: C.textSecondary }]}>Order Summary</Text>
              {activeQueue.map((item) => (
                <View key={item.coin.id} style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: C.textSecondary }]}> 
                    {item.coin.symbol.toUpperCase()} ({formatQty(item.quantity)}x)
                  </Text>
                  <Text style={[styles.summaryValue, { color: C.textPrimary }]}>
                    {formatIDRFull(item.priceAtAdd * item.quantity)}
                  </Text>
                </View>
              ))}
              <View style={[styles.totalDivider, { backgroundColor: C.border }]} />
              <View style={styles.summaryRow}>
                <Text style={[styles.totalLabel, { color: C.textPrimary }]}>Total</Text>
                <Text style={[styles.totalValue, { color: C.success }]}> 
                  {formatIDRFull(activeTotal)}
                </Text>
              </View>
            </View>
          }
        />
      )}

      <View style={[styles.checkoutBar, { backgroundColor: C.background, borderTopColor: C.border }]}> 
        <TouchableOpacity
          style={[
            styles.checkoutBtn,
            {
              backgroundColor: activeQueue.length === 0
                ? C.textSecondary
                : mode === 'BUY'
                  ? C.primary
                  : C.success,
            },
          ]}
          onPress={handleCheckout}
          disabled={activeQueue.length === 0}
        >
          <Text style={styles.checkoutText}>{mode === 'BUY' ? 'Execute Buy' : 'Execute Sell'}</Text>
          <Text style={styles.checkoutAmount}>{formatIDRFull(activeTotal)}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!successId} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: C.surface }]}> 
            <View style={[styles.successIcon, { backgroundColor: '#0ECB8120' }]}> 
              <Ionicons name="checkmark-circle" size={48} color="#0ECB81" />
            </View>
            <Text style={[styles.successTitle, { color: C.textPrimary }]}>Trade Executed!</Text>
            <Text style={[styles.successId, { color: C.textSecondary }]}>Trade ID</Text>
            <Text style={[styles.successCode, { color: C.primary }]}>{successId}</Text>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: C.primary }]}
              onPress={() => setSuccessId(null)}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },

  modeWrap: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  modeBtn: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modeText: { fontSize: 13, fontWeight: '800', letterSpacing: 1 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyHint: { fontSize: 14, textAlign: 'center' },

  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  img: { width: 40, height: 40, borderRadius: 20 },
  coinInfo: { flex: 1 },
  rightCol: { alignItems: 'flex-end', gap: 6, marginLeft: 8 },
  symbol: { fontSize: 15, fontWeight: '700' },
  priceAt: { fontSize: 11, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    width: 96,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    paddingVertical: 0,
    paddingHorizontal: 6,
  },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  removeBtn: { marginLeft: 0 },
  itemTotal: { fontSize: 13, fontWeight: '700', minWidth: 96, textAlign: 'right' },

  summary: {
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
    marginBottom: 112,
  },
  summaryTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  summaryLabel: { fontSize: 13, flex: 1, flexShrink: 1 },
  summaryValue: { fontSize: 13, textAlign: 'right' },
  totalDivider: { height: 1, marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700' },
  totalValue: { fontSize: 16, fontWeight: '800' },

  holdingsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  holdingsTitle: { fontSize: 14, fontWeight: '700' },
  holdingsHint: { fontSize: 12 },
  holdingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  holdingSymbol: { fontSize: 14, fontWeight: '700' },
  holdingMeta: { fontSize: 11, marginTop: 2 },
  holdingSellBtn: {
    borderRadius: 10,
    height: 32,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holdingSellText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },

  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  checkoutBtn: {
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  checkoutText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  checkoutAmount: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: 300,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: { fontSize: 22, fontWeight: '800' },
  successId: { fontSize: 13, marginTop: 8 },
  successCode: { fontSize: 28, fontWeight: '900', letterSpacing: 4 },
  doneBtn: {
    marginTop: 16,
    width: '100%',
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
