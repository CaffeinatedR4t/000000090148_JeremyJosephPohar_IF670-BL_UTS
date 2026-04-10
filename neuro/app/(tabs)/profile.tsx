import React from 'react';
import {
  View, Text, StyleSheet, Image, Switch, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Colors } from '../../constants/Colors';
import { formatIDRFull } from '../../constants/Coins';
import Navbar from '../../components/Navbar';

const PROFILE_PHOTO = 'https://ui-avatars.com/api/?name=Jeremy+Joseph+Pohar&background=3054AF&color=fff&size=200&bold=true';

export default function ProfileScreen() {
  const { isDark, toggleTheme, walletBalance, portfolioValue, history, cart } = useApp();
  const C = isDark ? Colors.dark : Colors.light;

  const stats = [
    { label: 'Trades', value: history.length.toString(), icon: 'swap-horizontal-outline' },
    { label: 'In Queue', value: cart.length.toString(), icon: 'bag-outline' },
    { label: 'Portfolio', value: formatIDRFull(portfolioValue), icon: 'trending-up-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]} edges={['top']}>
      <Navbar />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: PROFILE_PHOTO }} style={styles.avatar} />
            <View style={[styles.avatarBadge, { backgroundColor: C.primary }]}>
              <Ionicons name="person" size={12} color="#FFFFFF" />
            </View>
          </View>
          <Text style={[styles.name, { color: C.textPrimary }]}>Jeremy Joseph Pohar</Text>
          <Text style={[styles.nim, { color: C.textSecondary }]}>00000090148</Text>

          <View style={[styles.walletPill, { backgroundColor: `${C.primary}15` }]}>
            <Ionicons name="wallet-outline" size={14} color={C.primary} />
            <Text style={[styles.walletText, { color: C.primary }]}>
              {formatIDRFull(walletBalance)}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: C.card, borderColor: C.border }]}>
              <Ionicons name={stat.icon as any} size={20} color={C.primary} />
              <Text style={[styles.statValue, { color: C.textPrimary }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: C.textSecondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={[styles.settingsCard, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.settingsTitle, { color: C.textSecondary }]}>PREFERENCES</Text>

          {/* Dark Mode */}
          <View style={[styles.settingRow, { borderBottomColor: C.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#3054AF20' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={C.primary} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: C.textPrimary }]}>Dark Mode</Text>
                <Text style={[styles.settingDesc, { color: C.textSecondary }]}>
                  {isDark ? 'Dark theme active' : 'Light theme active'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor="#FFFFFF"
              accessibilityLabel="Toggle dark mode"
            />
          </View>

          {/* App Info */}
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#0ECB8120' }]}>
                <Ionicons name="information-circle-outline" size={18} color="#0ECB81" />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: C.textPrimary }]}>NEURO v1.0</Text>
                <Text style={[styles.settingDesc, { color: C.textSecondary }]}>
                  Crypto Trading App
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Course Info */}
        <View style={[styles.courseCard, { backgroundColor: `${C.primary}10`, borderColor: `${C.primary}30` }]}>
          <Text style={[styles.courseLabel, { color: C.textSecondary }]}>Course</Text>
          <Text style={[styles.courseValue, { color: C.textPrimary }]}>IF670L - Cross Mobile Platform</Text>
          <Text style={[styles.courseLabel, { color: C.textSecondary }]}>Lecturer</Text>
          <Text style={[styles.courseValue, { color: C.textPrimary }]}>Vincentius Kurniawan</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scroll: { padding: 16, gap: 12 },

  profileCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  avatarWrapper: { position: 'relative', marginBottom: 4 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 20, fontWeight: '800' },
  nim: { fontSize: 14 },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  walletText: { fontSize: 14, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 8 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  statLabel: { fontSize: 10, textAlign: 'center' },

  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsTitle: { fontSize: 11, fontWeight: '700', padding: 14, paddingBottom: 8, letterSpacing: 1 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingDesc: { fontSize: 12, marginTop: 1 },

  courseCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  courseLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  courseValue: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
});
