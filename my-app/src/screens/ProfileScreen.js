import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { PROFILE, SUMMARY, BADGES, MENU } from '../constants/data';
import common from '../styles/common';
import SummaryCard from '../components/SummaryCard';

export default function ProfileScreen({ onBack, onLogout, user }) {
  const [notif, setNotif] = useState(true);
  const displayName = user?.name || PROFILE.name;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView
      contentContainerStyle={common.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={onBack}
        hitSlop={12}
        style={{ marginBottom: 16 }}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
      </TouchableOpacity>

      {/* Header */}
      <View style={common.header}>
        <View>
          <Text style={common.greeting}>Akun kamu</Text>
          <Text style={common.title}>Profil</Text>
        </View>
      </View>

      {/* Identitas */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.profileSub}>
            {user?.email || `${PROFILE.grade} · ${PROFILE.school}`}
          </Text>
        </View>
      </View>

      {/* Ringkasan */}
      <Text style={[common.sectionTitle, common.sectionTitleSolo]}>
        Ringkasan Belajar
      </Text>
      <View style={common.summaryRow}>
        {SUMMARY.map((s) => (
          <SummaryCard key={s.id} value={s.value} label={s.label} isProfile />
        ))}
      </View>

      {/* Pencapaian */}
      <Text style={[common.sectionTitle, common.sectionTitleSolo]}>
        Pencapaian
      </Text>
      <View style={styles.badgeRow}>
        {BADGES.map((b) => (
          <View key={b.id} style={styles.badge}>
            <View style={styles.badgeIcon}>
              <Ionicons name={b.icon} size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.badgeLabel}>{b.label}</Text>
          </View>
        ))}
      </View>

      {/* Pengaturan */}
      <Text style={[common.sectionTitle, common.sectionTitleSolo]}>
        Pengaturan
      </Text>
      <View style={styles.menuBox}>
        <View style={[styles.menuRow, common.activityDivider]}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          <Text style={styles.menuLabel}>Notifikasi belajar</Text>
          <Switch
            value={notif}
            onValueChange={setNotif}
            trackColor={{ false: COLORS.addCreamDark, true: COLORS.primaryMid }}
            thumbColor={COLORS.white}
          />
        </View>
        {MENU.map((m, i) => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.menuRow,
              i < MENU.length - 1 && common.activityDivider,
            ]}
            activeOpacity={0.7}
          >
            <Ionicons name={m.icon} size={22} color={COLORS.text} />
            <Text style={styles.menuLabel}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Keluar */}
      <TouchableOpacity
        style={common.logoutButton}
        activeOpacity={0.85}
        onPress={onLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.secondary} />
        <Text style={common.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    gap: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: COLORS.white },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  profileSub: { fontSize: 13, color: COLORS.text },

  badgeRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  badge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.addCreamDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },

  menuBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.primary },
});
