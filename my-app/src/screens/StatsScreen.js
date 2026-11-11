import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { computeStreaks, toKey } from '../utils/streak';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function StatsScreen({ onBack, activeDays = [] }) {
  const activeSet = useMemo(() => new Set(activeDays), [activeDays]);
  const stats = useMemo(() => computeStreaks(activeSet), [activeSet]);

  const today = new Date();
  const todayKey = toKey(today);

  // State navigasi kalender bulanan (mulai dari tanggal 1 bulan berjalan)
  const [viewDate, setViewDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Tombol maju dinonaktifkan di bulan berjalan
  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth >= today.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = () => {
    if (!isCurrentMonth) {
      setViewDate(new Date(viewYear, viewMonth + 1, 1));
    }
  };

  // Kalkulasi grid kalender
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Senin = 0, Minggu = 6
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells = [];
    // Slot kosong sebelum tanggal 1
    for (let i = 0; i < startOffset; i++) {
      cells.push({ empty: true, key: `empty-${i}` });
    }
    // Slot tanggal 1 sampai akhir bulan
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(viewYear, viewMonth, day);
      const key = toKey(d);
      cells.push({
        empty: false,
        key,
        day,
        isActive: activeSet.has(key),
        isToday: key === todayKey,
      });
    }
    return cells;
  }, [viewYear, viewMonth, activeSet, todayKey]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={12} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={COLORS.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistik Belajar</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. KARTU STREAK */}
        <View style={styles.streakCard}>
          <View style={styles.streakCardTop}>
            <View style={styles.flameCircle}>
              <Ionicons name="flame" size={32} color={COLORS.ink} />
            </View>
            <View style={styles.streakCardTextWrap}>
              <View style={styles.streakNumberRow}>
                <Text style={styles.streakBigNumber}>{stats.current}</Text>
                <Text style={styles.streakUnit}>hari beruntun</Text>
              </View>
              <Text style={styles.streakSubtitle}>
                {stats.current > 0
                  ? 'Pertahankan api semangat belajarmu!'
                  : 'Mulai belajar hari ini untuk menyalakan streak!'}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. TIGA ANGKA RINGKASAN */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{stats.longest}</Text>
            <Text style={styles.summaryLabel}>Rekor terpanjang</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{stats.total}</Text>
            <Text style={styles.summaryLabel}>Total hari belajar</Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryValue}>{stats.thisWeekText}</Text>
            <Text style={styles.summaryLabel}>Minggu ini</Text>
          </View>
        </View>

        {/* 3. STRIP MINGGU INI */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Minggu Ini</Text>
            <Text style={styles.sectionSubBadge}>{stats.thisWeekText} hari aktif</Text>
          </View>
          <View style={styles.weekStripRow}>
            {stats.weekDays.map((item) => (
              <View key={item.key} style={styles.weekCol}>
                <Text style={styles.weekDayName}>{item.dayName}</Text>
                <View
                  style={[
                    styles.weekDayCircle,
                    item.isActive ? styles.weekDayActive : styles.weekDayInactive,
                    item.isToday && styles.weekDayToday,
                  ]}
                >
                  {item.isActive ? (
                    <Ionicons name="checkmark" size={16} color={COLORS.ink} />
                  ) : (
                    <Text style={styles.weekDayNum}>{item.dayNum}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 4. KALENDER BULANAN */}
        <View style={styles.sectionCard}>
          <View style={styles.calHeaderRow}>
            <Text style={styles.sectionTitle}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <View style={styles.calNavButtons}>
              <TouchableOpacity
                onPress={handlePrevMonth}
                hitSlop={10}
                style={styles.calNavBtn}
              >
                <Ionicons name="chevron-back" size={20} color={COLORS.ink} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNextMonth}
                disabled={isCurrentMonth}
                hitSlop={10}
                style={[styles.calNavBtn, isCurrentMonth && styles.calNavBtnDisabled]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isCurrentMonth ? COLORS.gray : COLORS.ink}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Label Hari */}
          <View style={styles.calGridRow}>
            {DAY_LABELS.map((label, idx) => (
              <View key={idx} style={styles.calCell}>
                <Text style={styles.calDayLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Grid Tanggal */}
          <View style={styles.calGridWrap}>
            {calendarDays.map((cell) => {
              if (cell.empty) {
                return <View key={cell.key} style={styles.calCell} />;
              }
              return (
                <View key={cell.key} style={styles.calCell}>
                  <View
                    style={[
                      styles.calDayBox,
                      cell.isActive ? styles.calDayActive : styles.calDaySky,
                      cell.isToday && styles.calDayToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.calDayText,
                        cell.isActive && styles.calDayTextActive,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Keterangan Warna (Legenda) */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.yellow }]} />
              <Text style={styles.legendText}>Sudah belajar</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.sky }]} />
              <Text style={styles.legendText}>Belum aktif</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.addCreamDark,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.sansSemi,
    color: COLORS.ink,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 18,
  },

  // 1. Kartu Streak Utama (Kuning)
  streakCard: {
    backgroundColor: COLORS.yellow,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    padding: 20,
  },
  streakCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  flameCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCardTextWrap: {
    flex: 1,
  },
  streakNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  streakBigNumber: {
    fontFamily: FONTS.serif,
    fontSize: 54,
    lineHeight: 58,
    color: COLORS.ink,
  },
  streakUnit: {
    fontFamily: FONTS.sansSemi,
    fontSize: 15,
    color: COLORS.ink,
  },
  streakSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.ink,
    marginTop: 2,
  },

  // 2. Tiga Angka Ringkasan
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    fontFamily: FONTS.serif,
    fontSize: 28,
    color: COLORS.ink,
    marginBottom: 4,
  },
  summaryLabel: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.ink,
    textAlign: 'center',
  },

  // Kartu Kontainer Bagian
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    padding: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.sansSemi,
    fontSize: 16,
    color: COLORS.ink,
  },
  sectionSubBadge: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.ink,
    backgroundColor: COLORS.sky,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  // 3. Strip Minggu Ini
  weekStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekCol: {
    alignItems: 'center',
    gap: 8,
  },
  weekDayName: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.ink,
  },
  weekDayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayActive: {
    backgroundColor: COLORS.yellow,
  },
  weekDayInactive: {
    backgroundColor: COLORS.background,
  },
  weekDayToday: {
    borderWidth: 2.5,
    borderColor: COLORS.ink,
  },
  weekDayNum: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.ink,
  },

  // 4. Kalender Bulanan
  calHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  calNavButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  calNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  calNavBtnDisabled: {
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    opacity: 0.5,
  },
  calGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calGridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calCell: {
    width: '14.28%', // 100% / 7 hari
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  calDayLabel: {
    fontFamily: FONTS.sansSemi,
    fontSize: 12,
    color: COLORS.gray,
  },
  calDayBox: {
    width: '88%',
    height: '88%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDayActive: {
    backgroundColor: COLORS.yellow,
  },
  calDaySky: {
    backgroundColor: COLORS.sky,
  },
  calDayToday: {
    borderWidth: 2.5,
    borderColor: COLORS.ink,
  },
  calDayText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.ink,
  },
  calDayTextActive: {
    fontFamily: FONTS.sansSemi,
    color: COLORS.ink,
  },

  // Legenda
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.addCreamDark,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.ink,
  },
  legendText: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.ink,
  },
});

