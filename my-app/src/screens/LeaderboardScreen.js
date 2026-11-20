import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { subscribeLeaderboard } from '../services/userData';

const MEDALS = ['trophy', 'medal', 'medal'];
const MEDAL_COLORS = ['#E4A900', '#7F8B99', '#B66B3D'];
const AVATAR_COLORS = [COLORS.pink, COLORS.sky, COLORS.mint, COLORS.yellow];

function Avatar({ player, size = 44 }) {
  const initials = player.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: player.color,
        },
      ]}
    >
      <Text style={styles.avatarText}>{initials}</Text>
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

export default function LeaderboardScreen({ user, points = 0 }) {
  const [leaderboardState, setLeaderboardState] = useState(null);

  useEffect(() => {
    if (!user?.uid) return undefined;
    const uid = user.uid;
    return subscribeLeaderboard(
      (entries) => {
        setLeaderboardState({ uid, entries, error: null });
      },
      (subscriptionError) => {
        console.warn('Gagal memuat leaderboard:', subscriptionError);
        setLeaderboardState({
          uid,
          entries: [],
          error: 'Leaderboard gagal dimuat. Periksa koneksi internet.',
        });
      },
    );
  }, [user?.uid]);

  const loading = Boolean(user?.uid) && leaderboardState?.uid !== user.uid;
  const error = user?.uid
    ? leaderboardState?.uid === user.uid
      ? leaderboardState.error
      : null
    : 'Masuk ke akun untuk melihat leaderboard.';
  const players =
    leaderboardState?.uid === user?.uid ? leaderboardState.entries : [];
  const rankedPlayers = players.map((player, index) => ({
    ...player,
    color: AVATAR_COLORS[index % AVATAR_COLORS.length],
  }));
  const currentUserRank = rankedPlayers.findIndex(
    (player) => player.uid === user?.uid,
  ) + 1;
  const podium = rankedPlayers.slice(0, 3);
  const leaderboardUser = rankedPlayers.find((player) => player.uid === user?.uid);
  const currentUserPoints =
    leaderboardUser?.points ?? user?.lifetimePoints ?? points;
  const remainingPlayers = rankedPlayers.slice(rankedPlayers.length >= 3 ? 3 : 0);

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
          <Text style={styles.highlightTitle}>
            {currentUserRank
              ? `Kamu di peringkat ${currentUserRank}!`
              : 'Peringkat sepanjang masa'}
          </Text>
          <Text style={styles.highlightSubtitle}>
            {currentUserRank
              ? 'Kumpulkan poin lagi dan kejar posisi berikutnya.'
              : 'Kumpulkan poin agar masuk 50 besar.'}
          </Text>
        </View>
        <Text style={styles.highlightPoints}>
          {currentUserPoints.toLocaleString('id-ID')}
          {'\n'}
          <Text style={styles.highlightPointsLabel}>poin</Text>
        </Text>
      </View>

      <View style={styles.periodSelector}>
        <View style={[styles.periodButton, styles.periodButtonActive]}>
          <Text style={[styles.periodText, styles.periodTextActive]}>
            Sepanjang masa
          </Text>
        </View>
      </View>

      {loading ? (
        <Text style={styles.statusMessage}>Memuat leaderboard...</Text>
      ) : error ? (
        <Text style={styles.statusMessage}>{error}</Text>
      ) : rankedPlayers.length === 0 ? (
        <Text style={styles.statusMessage}>
          Belum ada peringkat. Selesaikan game untuk mendapatkan poin pertama!
        </Text>
      ) : (
        <>
          {podium.length === 3 ? (
            <View style={styles.podiumCard}>
              <View style={styles.sectionHeading}>
                <View>
                  <Text style={styles.sectionTitle}>Paling rajin</Text>
                  <Text style={styles.sectionCaption}>Tiga teratas sepanjang masa</Text>
                </View>
                <Ionicons name="people-outline" size={21} color={COLORS.ink} />
              </View>
              <View style={styles.podium}>
                <PodiumPlayer player={rankedPlayers[1]} rank={2} />
                <PodiumPlayer player={rankedPlayers[0]} rank={1} />
                <PodiumPlayer player={rankedPlayers[2]} rank={3} />
              </View>
            </View>
          ) : null}

          <View style={styles.rankingHeading}>
            <Text style={styles.sectionTitle}>
              {podium.length === 3 ? 'Peringkat lainnya' : 'Peringkat'}
            </Text>
            <Text style={styles.sectionCaption}>
              {rankedPlayers.length} siswa · 50 teratas
            </Text>
          </View>
          <View style={styles.rankingList}>
            {remainingPlayers.map((player, index) => {
              const rank = rankedPlayers.length >= 3 ? index + 4 : index + 1;
              return (
                <RankingRow
                  key={player.uid}
                  player={player}
                  rank={rank}
                  isCurrentUser={player.uid === user?.uid}
                />
              );
            })}
          </View>
          <Text style={styles.footerNote}>
            Poin dihitung dari aktivitas belajar. Hanya nama dan poin yang
            ditampilkan kepada pengguna lain.
          </Text>
        </>
      )}
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
    alignSelf: 'flex-start',
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
  statusMessage: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: COLORS.muted,
    paddingVertical: 28,
  },
});