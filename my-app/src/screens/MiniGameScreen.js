import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { MATERI, GAMES } from '../constants/data';
import { GAME_COMPLETION_REWARD, STORY_EPISODE_COST } from '../constants/gameEconomy';
import common from '../styles/common';

const CATEGORIES = [
  { id: 'simulation', label: 'Simulasi', icon: 'hardware-chip-outline' },
  { id: 'practice', label: 'Latihan cepat', icon: 'flash-outline' },
  { id: 'story', label: 'Story chat', icon: 'chatbubbles-outline' },
];

const PRACTICE_GAMES = [
  {
    id: 'flashcards',
    title: 'Flashcard Algoritma',
    description: 'Balik kartu untuk mengingat istilah dan cara kerja algoritma.',
    icon: 'albums-outline',
  },
  {
    id: 'matching',
    title: 'Cocokkan Pasangan',
    description: 'Pasangkan nama algoritma dengan deskripsinya.',
    icon: 'git-compare-outline',
  },
  {
    id: 'speed-quiz',
    title: 'Kuis Cepat',
    description: 'Jawab pertanyaan singkat seputar materi algoritma.',
    icon: 'timer-outline',
  },
];

function SimulationCard({ item, onPlay, onRead }) {
  const materi = MATERI.find((lesson) => lesson.id === item.materiId);
  return (
    <View style={styles.card}>
      <View style={styles.cardIcon}>
        <Ionicons name="git-network-outline" size={25} color={COLORS.ink} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>
          Simulasi {materi?.topic || 'algoritma'} · {materi?.title || 'Materi'}
        </Text>
        <Text style={styles.rewardText}>
          +{GAME_COMPLETION_REWARD} poin saat pertama selesai
        </Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.secondaryButton}
            onPress={() => onRead(materi)}
          >
            <Text style={styles.secondaryButtonText}>Baca materi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.primaryButton}
            onPress={() => onPlay(item)}
          >
            <Text style={styles.primaryButtonText}>Mainkan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function PracticeCard({ item, onPlay }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => onPlay(item)}
    >
      <View style={[styles.cardIcon, styles.practiceIcon]}>
        <Ionicons name={item.icon} size={25} color={COLORS.ink} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription}>{item.description}</Text>
        <Text style={styles.rewardText}>
          +{GAME_COMPLETION_REWARD} poin saat pertama selesai
        </Text>
        <Text style={styles.linkText}>Mainkan →</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MiniGameScreen({
  onBack,
  onPlaySimulation,
  onPlayPractice,
  onReadMateri,
  onOpenStory,
  points = 0,
  storyUnlocked = false,
}) {
  const [category, setCategory] = useState('simulation');
  const [query, setQuery] = useState('');
  const [storyNotice, setStoryNotice] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredSimulations = useMemo(
    () => GAMES.filter((game) => game.title.toLowerCase().includes(normalizedQuery)),
    [normalizedQuery],
  );
  const filteredPractice = useMemo(
    () => PRACTICE_GAMES.filter((game) =>
      `${game.title} ${game.description}`.toLowerCase().includes(normalizedQuery)),
    [normalizedQuery],
  );
  const showSearch = category !== 'story';

  const openStory = () => {
    if (storyUnlocked) {
      onOpenStory();
      return;
    }
    if (points < STORY_EPISODE_COST) {
      setStoryNotice(`Kamu masih membutuhkan ${STORY_EPISODE_COST - points} poin lagi.`);
      return;
    }
    setStoryNotice('');
    onOpenStory();
  };

  return (
    <View style={common.mScreen}>
      <View style={common.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={common.mHeaderTitle}>Mini Game</Text>
      </View>

      <View style={styles.wallet}>
        <Ionicons name="wallet-outline" size={19} color={COLORS.ink} />
        <View style={styles.walletCopy}>
          <Text style={styles.walletText}>Poin kamu</Text>
          <Text style={styles.walletHint}>Sesi ini · reset saat aplikasi ditutup</Text>
        </View>
        <Text style={styles.walletValue}>{points}</Text>
      </View>

      <View style={styles.categoryRow}>
        {CATEGORIES.map((item) => {
          const active = category === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              activeOpacity={0.85}
              onPress={() => {
                setCategory(item.id);
                setQuery('');
                setStoryNotice('');
              }}
              style={[styles.categoryButton, active && styles.categoryButtonActive]}
            >
              <Ionicons
                name={item.icon}
                size={17}
                color={active ? COLORS.ink : COLORS.text}
              />
              <Text style={[styles.categoryText, active && styles.categoryTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showSearch ? (
        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={COLORS.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder={category === 'simulation' ? 'Cari simulasi materi' : 'Cari permainan'}
            placeholderTextColor={COLORS.muted}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {category === 'simulation' ? (
          <>
            <Text style={styles.sectionTitle}>Simulasi algoritma</Text>
            <Text style={styles.sectionDescription}>
              Enam permainan yang terhubung langsung dengan materi pelajaran.
            </Text>
            {filteredSimulations.length ? filteredSimulations.map((item) => (
              <SimulationCard
                key={item.id}
                item={item}
                onPlay={onPlaySimulation}
                onRead={onReadMateri}
              />
            )) : <Text style={styles.empty}>Simulasi tidak ditemukan.</Text>}
          </>
        ) : null}

        {category === 'practice' ? (
          <>
            <Text style={styles.sectionTitle}>Latihan cepat</Text>
            <Text style={styles.sectionDescription}>
              Selesaikan permainan untuk mendapatkan poin pertama kali.
            </Text>
            {filteredPractice.length ? filteredPractice.map((item) => (
              <PracticeCard key={item.id} item={item} onPlay={onPlayPractice} />
            )) : <Text style={styles.empty}>Permainan tidak ditemukan.</Text>}
          </>
        ) : null}

        {category === 'story' ? (
          <>
            <Text style={styles.sectionTitle}>Story chat</Text>
            <Text style={styles.sectionDescription}>
              Bantu temanmu memecahkan tantangan algoritma lewat percakapan interaktif.
            </Text>
            <View style={styles.storyCard}>
              <View style={[styles.cardIcon, styles.storyIcon]}>
                <Ionicons name="chatbubbles-outline" size={26} color={COLORS.ink} />
              </View>
              <Text style={styles.storyTag}>EPISODE 1 · BINARY SEARCH</Text>
              <Text style={styles.cardTitle}>Misi Mencari 23</Text>
              <Text style={styles.cardDescription}>
                Raka dan Dina perlu menemukan angka dalam daftar terurut. Bantu mereka memilih langkah yang tepat.
              </Text>
              <View style={styles.priceRow}>
                <Ionicons
                  name={storyUnlocked ? 'lock-open-outline' : 'key-outline'}
                  size={18}
                  color={COLORS.ink}
                />
                <Text style={styles.priceText}>
                  {storyUnlocked ? 'Sudah terbuka' : `${STORY_EPISODE_COST} poin`}
                </Text>
                <Text style={styles.balanceText}>Saldo: {points}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.primaryButton,
                  styles.storyButton,
                  !storyUnlocked && points < STORY_EPISODE_COST && styles.disabledButton,
                ]}
                onPress={openStory}
              >
                <Text style={styles.primaryButtonText}>
                  {storyUnlocked ? 'Lanjutkan cerita' : 'Buka cerita'}
                </Text>
              </TouchableOpacity>
              {storyNotice ? <Text style={styles.notice}>{storyNotice}</Text> : null}
              {!storyUnlocked ? (
                <Text style={styles.earnHint}>
                  Dapatkan {GAME_COMPLETION_REWARD} poin dengan menyelesaikan permainan baru di bagian Simulasi atau Latihan cepat.
                </Text>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wallet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.yellow,
  },
  walletText: { flex: 1, fontFamily: FONTS.sansMedium, fontSize: 13, color: COLORS.ink },
  walletCopy: { flex: 1 },
  walletHint: { fontFamily: FONTS.sans, fontSize: 9, color: COLORS.text },
  walletValue: { fontFamily: FONTS.sansSemi, fontSize: 16, color: COLORS.ink },
  categoryRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  categoryButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 3,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  categoryButtonActive: {
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.sky,
  },
  categoryText: {
    fontFamily: FONTS.sans,
    fontSize: 10,
    color: COLORS.text,
    textAlign: 'center',
  },
  categoryTextActive: { fontFamily: FONTS.sansMedium, color: COLORS.ink },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 24,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontFamily: FONTS.sans, fontSize: 13, color: COLORS.ink },
  list: { paddingHorizontal: 24, paddingBottom: 28 },
  sectionTitle: {
    fontFamily: FONTS.sansSemi,
    fontSize: 19,
    color: COLORS.ink,
    marginBottom: 4,
  },
  sectionDescription: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.text,
    marginBottom: 14,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.sky,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  cardIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.sky,
  },
  practiceIcon: { backgroundColor: COLORS.mint },
  cardCopy: { flex: 1 },
  cardTitle: {
    fontFamily: FONTS.sansSemi,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 4,
  },
  cardDescription: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.text,
  },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  primaryButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellow,
  },
  primaryButtonText: { fontFamily: FONTS.sansMedium, fontSize: 12, color: COLORS.ink },
  secondaryButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  secondaryButtonText: { fontFamily: FONTS.sansMedium, fontSize: 12, color: COLORS.ink },
  rewardText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.blue,
    marginTop: 7,
  },
  linkText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.ink,
    marginTop: 8,
  },
  storyCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  storyIcon: { backgroundColor: COLORS.pink, marginBottom: 14 },
  storyTag: {
    fontFamily: FONTS.sansMedium,
    fontSize: 10,
    letterSpacing: 0.6,
    color: COLORS.blue,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    marginBottom: 12,
  },
  priceText: { fontFamily: FONTS.sansSemi, fontSize: 13, color: COLORS.ink },
  balanceText: { marginLeft: 'auto', fontFamily: FONTS.sans, fontSize: 11, color: COLORS.text },
  storyButton: { width: '100%' },
  disabledButton: { backgroundColor: COLORS.gray, borderColor: COLORS.gray },
  notice: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 10,
  },
  earnHint: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 10,
  },
  empty: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 24,
  },
});
