import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/Colors';
import BrandLogo from './BrandLogo';

export default function Navbar({ title }: { title?: string }) {
  const { isDark, cartCount } = useApp();
  const C = isDark ? Colors.dark : Colors.light;
  const router = useRouter();

  return (
    <View style={[styles.navbar, { backgroundColor: C.background, borderBottomColor: C.border }]}>
      {/* Logo / Title */}
      <View style={styles.left}>
        <BrandLogo width={104} height={34} />
      </View>

      {/* Right - cart */}
      <TouchableOpacity
        style={styles.cartBtn}
        onPress={() => router.push('/(tabs)/trade')}
        accessibilityLabel="Trade Queue"
      >
        <Ionicons name="bag-outline" size={24} color={C.textPrimary} />
        {cartCount > 0 && (
          <View style={[styles.badge, { backgroundColor: C.primary }]}>
            <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    borderBottomWidth: 0,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 0,
  },
  cartBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
