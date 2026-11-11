import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { ILLUSTRATION } from '../constants/assets';
import {
  STREAK_TOTAL,
  STREAK_ACTIVE,
  SUMMARY,
  ACTIVITIES,
} from '../constants/data';
import common from '../styles/common';
import SectionHeader from '../components/SectionHeader';
import SummaryCard from '../components/SummaryCard';

function StreakBar({ total, active }) {
  return (
    <View style={styles.streakRow}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < active;
        const lineFilled = i < active - 1;
        return (
          <React.Fragment key={i}>
            <View style={[styles.streakDot, filled && styles.streakDotActive]} />
            {i < total - 1 && (
              <View
                style={[styles.streakLine, lineFilled && styles.streakLineActive]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function ContinueCard({ materi, progress = 0, onContinue, onPickMateri }) {
  const isEmpty = !materi;

  return (
    <View style={styles.featuredCard}>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTag}>
          {isEmpty ? 'Belum ada materi' : materi.topic}
        </Text>
        <Text style={styles.featuredTitle}>
          {isEmpty ? 'Mulai belajar' : materi.title}
        </Text>
        <Text style={styles.featuredDesc}>
          {isEmpty
            ? 'Pilih satu materi, nanti materi terakhirmu muncul di sini.'
            : `${materi.level} · ${materi.duration}`}
        </Text>
        {!isEmpty && (
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
        )}
        <TouchableOpacity onPress={isEmpty ? onPickMateri : onContinue}>
          <Text style={styles.featuredLink}>
            {isEmpty ? 'Pilih materi →' : 'Lanjutkan →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ActivityItem({ item, isLast }) {
  return (
    <View style={[styles.activityRow, !isLast && common.activityDivider]}>
      <View style={styles.activityIconBox}>
        <Ionicons name={item.icon} size={20} color={COLORS.text} />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.activitySubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <Text style={styles.activityTime}>{item.time}</Text>
    </View>
  );
}

export default function HomeScreen({
  lastOpened,
  lastProgress = 0,
  onGoMateri,
  onContinue,
  onGoScan,
}) {
  const [query, setQuery] = useState('');

  return (
    <ScrollView
      contentContainerStyle={common.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={common.header}>
        <View>
          <Text style={common.greeting}>Halo, Siswa</Text>
          <Text style={common.title}>Beranda Belajar</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Scan QR form"
            style={common.iconButton}
            onPress={onGoScan}
          >
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={common.iconButton}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={common.summaryRow}>
        {SUMMARY.map((s) => (
          <SummaryCard key={s.id} value={s.value} label={s.label} />
        ))}
      </View>
      <StreakBar total={STREAK_TOTAL} active={STREAK_ACTIVE} />
      <SectionHeader />
      {/* CTA Kuis */}
      <TouchableOpacity style={common.quizButton} activeOpacity={0.85}>
        <Text style={common.quizButtonText}>Kerjakan Kuis Harian</Text>
      </TouchableOpacity>

      {/* Lanjutkan Materi */}
      <SectionHeader title="Lanjutkan Materi" onPressLink={onGoMateri} />
      <ContinueCard
        materi={lastOpened}
        progress={lastProgress}
        onContinue={onContinue}
        onPickMateri={onGoMateri}
      />

      {/* Aktivitas Belajar */}
      <SectionHeader title="Aktivitas Belajar" />
      <View>
        {ACTIVITIES.map((item) => (
          <ActivityItem key={item.id} item={item} isLast={false} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: 12 },

  // Streak
  streakRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  streakDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.addCreamDark,
  },
  streakDotActive: { backgroundColor: COLORS.primary },
  streakLine: { flex: 1, height: 6, backgroundColor: COLORS.addCreamDark },
  streakLineActive: { backgroundColor: COLORS.primary },

  // Lanjutkan
  featuredCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    gap: 14,
    marginBottom: 28,
  },
  featuredImage: { width: 90, height: 110, overflow: 'hidden' },
  featuredInfo: { flex: 1 },
  featuredTag: { fontSize: 12, color: COLORS.text, marginBottom: 4 },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  featuredDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.text,
    marginBottom: 10,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.addCreamDark,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primaryMid,
  },
  featuredLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
    textDecorationLine: 'underline',
  },

  // Activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  activityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  activityInfo: { flex: 1, marginRight: 8 },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryMid,
    marginBottom: 2,
  },
  activitySubtitle: { fontSize: 12, color: COLORS.text },
  activityTime: { fontSize: 12, color: COLORS.text },
});
