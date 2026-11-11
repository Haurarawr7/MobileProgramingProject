import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

const LEADERBOARDS = {
  'Minggu ini': [
    { id: '1', name: 'Nabila Putri', points: 520, initials: 'NP', color: COLORS.pink },
    { id: '2', name: 'Arka Pratama', points: 480, initials: 'AP', color: COLORS.sky },
    { id: '3', name: 'Citra Lestari', points: 420, initials: 'CL', color: COLORS.mint },
    { id: 'you', name: 'Kamu', points: 360, initials: 'K', color: COLORS.yellow },
    { id: '5', name: 'Rafi Ramadhan', points: 310, initials: 'RR', color: COLORS.sky },
    { id: '6', name: 'Dinda Aulia', points: 275, initials: 'DA', color: COLORS.pink },
    { id: '7', name: 'Bima Saputra', points: 240, initials: 'BS', color: COLORS.mint },
  ],
  'Bulan ini': [
    { id: '1', name: 'Arka Pratama', points: 2140, initials: 'AP', color: COLORS.sky },
    { id: '2', name: 'Nabila Putri', points: 1980, initials: 'NP', color: COLORS.pink },
    { id: '3', name: 'Kamu', points: 1760, initials: 'K', color: COLORS.yellow },
    { id: '4', name: 'Citra Lestari', points: 1690, initials: 'CL', color: COLORS.mint },
    { id: '5', name: 'Rafi Ramadhan', points: 1510, initials: 'RR', color: COLORS.sky },
    { id: '6', name: 'Dinda Aulia', points: 1320, initials: 'DA', color: COLORS.pink },
    { id: '7', name: 'Bima Saputra', points: 1180, initials: 'BS', color: COLORS.mint },
  ],
};

const MEDALS = ['trophy', 'medal', 'medal'];
const MEDAL_COLORS = ['#E4A900', '#7F8B99', '#B66B3D'];

function Avatar({ player, size = 44 }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: player.color },
      ]}
    >
      <Text style={styles.avatarText}>{player.initials}</Text>
    </View>
  );
}

function PodiumPlayer({ player, rank }) {
  const podiumHeight = rank === 1 ? 112 : 88;

  return (
    <View style={styles.podiumPlayer}>
      <View style={styles.podiumAvatarWrap}>
        <Avatar player={player} size={rank === 1 ? 68 : 58} />
        <View style={[styles.medalBadge, { backgroundColor: MEDAL_COLORS[rank - 1] }]}>
          <Ionicons name={MEDALS[rank - 1]} size={13} color={COLORS.white} />
        </View>
      </View>
      <Text style={styles.podiumName} numberOfLines={1}>
        {player.name}
      </Text>
      <Text style={styles.podiumPoints}>{player.points.toLocaleString('id-ID')} poin</Text>
      <View
        style={[
          styles.podiumStand,
          { height: podiumHeight, backgroundColor: rank === 1 ? COLORS.yellow : COLORS.sky },
        ]}
      >
        <Text style={styles.podiumRank}>{rank}</Text>
      </View>
    </View>
  );
}

function RankingRow({ player, rank, isCurrentUser }) {
  return (
    <View style={[styles.rankingRow, isCurrentUser && styles.currentUserRow]}>
      <Text style={[styles.rankNumber, isCurrentUser && styles.currentUserText]}>
        {rank}
      </Text>
      <Avatar player={player} />
      <View style={styles.playerDetails}>
        <Text
          style={[styles.playerName, isCurrentUser && styles.currentUserText]}
          numberOfLines={1}
        >
          {player.name}
          {isCurrentUser ? ' (kamu)' : ''}
        </Text>
        <Text style={styles.playerSubtitle}>
          {isCurrentUser ? 'Terus pertahankan!' : 'Teman belajar'}
        </Text>
      </View>
      <View style={styles.pointsWrap}>
        <Text style={[styles.pointsValue, isCurrentUser && styles.currentUserText]}>
          {player.points.toLocaleString('id-ID')}
        </Text>
        <Text style={styles.pointsLabel}>poin</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen({ user }) {
  const [period, setPeriod] = useState('Minggu ini');
  const players = LEADERBOARDS[period].map((player) =>
    player.id === 'you' && user?.name ? { ...player, name: user.name } : player,
  );
  const podium = players.slice(0, 3);
  const currentUserRank = players.findIndex((player) => player.id === 'you') + 1;
  const currentUser = players.find((player) => player.id === 'you');

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Belajar bareng, jadi juara</Text>
          <Text style={styles.title}>Leaderboard</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="trophy-outline" size={23} color={COLORS.ink} />
        </View>
      </View>

      <View style={styles.highlightCard}>
        <View style={styles.highlightIcon}>
          <Ionicons name="sparkles" size={20} color={COLORS.ink} />
        </View>
        <View style={styles.highlightCopy}>
          <Text style={styles.highlightTitle}>Kamu di peringkat {currentUserRank}!</Text>
          <Text style={styles.highlightSubtitle}>
            Kumpulkan poin lagi dan kejar posisi berikutnya.
          </Text>
        </View>
        <Text style={styles.highlightPoints}>
          {currentUser?.points.toLocaleString('id-ID')}
          {'\n'}
          <Text style={styles.highlightPointsLabel}>poin</Text>
        </Text>
      </View>

      <View style={styles.periodSelector}>
        {Object.keys(LEADERBOARDS).map((item) => {
          const isActive = item === period;
          return (
            <TouchableOpacity
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => setPeriod(item)}
              style={[styles.periodButton, isActive && styles.periodButtonActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, isActive && styles.periodTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.podiumCard}>
        <View style={styles.sectionHeading}>
          <View>
            <Text style={styles.sectionTitle}>Paling rajin</Text>
            <Text style={styles.sectionCaption}>Tiga teratas periode ini</Text>
          </View>
          <Ionicons name="people-outline" size={21} color={COLORS.ink} />
        </View>
        <View style={styles.podium}>
          <PodiumPlayer player={podium[1]} rank={2} />
          <PodiumPlayer player={podium[0]} rank={1} />
          <PodiumPlayer player={podium[2]} rank={3} />
        </View>
      </View>

      <View style={styles.rankingHeading}>
        <Text style={styles.sectionTitle}>Peringkat lainnya</Text>
        <Text style={styles.sectionCaption}>{players.length} siswa</Text>
      </View>
      <View style={styles.rankingList}>
        {players.slice(3).map((player, index) => {
          const rank = index + 4;
          return (
            <RankingRow
              key={player.id}
              player={player}
              rank={rank}
              isCurrentUser={player.id === 'you'}
            />
          );
        })}
      </View>
      <Text style={styles.footerNote}>
        Poin dihitung dari aktivitas belajar dan kuis.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  eyebrow: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 2,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 34,
    lineHeight: 40,
    color: COLORS.ink,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellow,
    marginBottom: 18,
  },
  highlightIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  highlightCopy: { flex: 1 },
  highlightTitle: {
    fontFamily: FONTS.sansSemi,
    fontSize: 13,
    color: COLORS.ink,
    marginBottom: 3,
  },
  highlightSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    lineHeight: 15,
    color: COLORS.ink,
  },
  highlightPoints: {
    fontFamily: FONTS.sansSemi,
    fontSize: 15,
    lineHeight: 18,
    textAlign: 'right',
    color: COLORS.ink,
  },
  highlightPointsLabel: {
    fontFamily: FONTS.sans,
    fontSize: 10,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  periodButton: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  periodButtonActive: { backgroundColor: COLORS.ink },
  periodText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.ink,
  },
  periodTextActive: { color: COLORS.white },
  podiumCard: {
    padding: 16,
    paddingBottom: 0,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    marginBottom: 24,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: FONTS.serif,
    fontSize: 25,
    lineHeight: 30,
    color: COLORS.ink,
  },
  sectionCaption: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 22,
  },
  podiumPlayer: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  podiumAvatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  avatarText: {
    fontFamily: FONTS.sansSemi,
    fontSize: 14,
    color: COLORS.ink,
  },
  medalBadge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumName: {
    width: '100%',
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    textAlign: 'center',
    color: COLORS.ink,
  },
  podiumPoints: {
    fontFamily: FONTS.sans,
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 2,
    marginBottom: 8,
  },
  podiumStand: {
    width: '88%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRank: {
    fontFamily: FONTS.serif,
    fontSize: 35,
    color: COLORS.ink,
  },
  rankingHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rankingList: {
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 14,
    backgroundColor: COLORS.white,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sky,
  },
  currentUserRow: { backgroundColor: '#FFF7C8' },
  rankNumber: {
    width: 26,
    fontFamily: FONTS.sansSemi,
    fontSize: 13,
    color: COLORS.muted,
  },
  currentUserText: { color: COLORS.ink },
  playerDetails: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  playerName: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.ink,
  },
  playerSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 2,
  },
  pointsWrap: { alignItems: 'flex-end', marginLeft: 6 },
  pointsValue: {
    fontFamily: FONTS.sansSemi,
    fontSize: 12,
    color: COLORS.ink,
  },
  pointsLabel: {
    fontFamily: FONTS.sans,
    fontSize: 9,
    color: COLORS.muted,
  },
  footerNote: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    textAlign: 'center',
    color: COLORS.muted,
    marginTop: 14,
  },
});