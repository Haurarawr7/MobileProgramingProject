import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { STREAK_TOTAL } from '../constants/data';
import { getCurrentWeekDateKeys } from '../utils/streak';
import common from '../styles/common';
import SectionHeader from '../components/SectionHeader';
import SummaryCard from '../components/SummaryCard';

function StreakBar({ days = [], currentStreak = 0 }) {
  const weekDateKeys = getCurrentWeekDateKeys();
  const activeDays = new Set(days);
  const labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  return (
    <View style={styles.streakContainer}>
      <Text style={styles.streakLabel}>
        {currentStreak > 0
          ? `${currentStreak} hari berturut-turut`
          : 'Mulai streak belajarmu hari ini'}
      </Text>
      <View style={styles.streakRow}>
        {Array.from({ length: STREAK_TOTAL }).map((_, i) => {
          const filled = activeDays.has(weekDateKeys[i]);
          const lineFilled =
            i < STREAK_TOTAL - 1 &&
            filled &&
            activeDays.has(weekDateKeys[i + 1]);
          return (
            <React.Fragment key={weekDateKeys[i]}>
              <View style={[styles.streakDot, filled && styles.streakDotActive]} />
              {i < STREAK_TOTAL - 1 && (
                <View
                  style={[styles.streakLine, lineFilled && styles.streakLineActive]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <View style={styles.streakWeekLabels}>
        {labels.map((label, index) => (
          <Text key={weekDateKeys[index]} style={styles.streakWeekLabel}>
            {label}
          </Text>
        ))}
      </View>
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
  onDailyQuiz,
  learningStats,
  activities = [],
  userName = 'Siswa',
  streakDays = [],
  currentStreak = 0,
}) {
  return (
    <ScrollView
      contentContainerStyle={common.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={common.header}>
        <View>
          <Text style={common.greeting}>Halo, {userName}</Text>
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
        {learningStats.summary.map((item) => (
          <SummaryCard
            key={item.id}
            value={item.value}
            label={item.label}
          />
        ))}
      </View>
      <StreakBar days={streakDays} currentStreak={currentStreak} />
      <SectionHeader />
      {/* CTA Kuis */}
      <TouchableOpacity
        style={common.quizButton}
        activeOpacity={0.85}
        onPress={onDailyQuiz}
      >
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
      {activities.length ? (
        <View>
          {activities.slice(0, 5).map((item, index) => (
            <ActivityItem
              key={item.id}
              item={item}
              isLast={index === Math.min(activities.length, 5) - 1}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.emptyActivity}>
          Aktivitas belajar kamu akan muncul di sini.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerActions: { flexDirection: 'row', gap: 12 },
  emptyActivity: { fontSize: 13, color: COLORS.text, paddingVertical: 12 },

  // Streak
  streakContainer: { marginBottom: 28 },
  streakLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 10,
  },
  streakRow: { flexDirection: 'row', alignItems: 'center' },
  streakWeekLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  streakWeekLabel: {
    width: 24,
    textAlign: 'center',
    fontSize: 10,
    color: COLORS.text,
  },
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
