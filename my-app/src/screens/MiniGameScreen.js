import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { GAMES } from '../constants/data';
import common from '../styles/common';

const SIDE_PADDING = 24;
const GAP = 12;

function GameCard({ item, width, onPlay }) {
  return (
    <View style={[styles.card, { width }]}>
      {/* Placeholder gambar (ganti dengan <Image /> kalau sudah ada aset) */}
      <View style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <TouchableOpacity onPress={() => onPlay(item)} hitSlop={8}>
          <Text style={styles.cardPlay}>Mainkan →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MiniGameScreen({ onBack }) {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');

  const cardWidth = (width - SIDE_PADDING * 2 - GAP) / 2;

  const data = GAMES.filter((g) =>
    g.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const onPlay = (game) => {
    // TODO: arahkan ke layar game sesungguhnya
    Alert.alert(game.title, 'Game ini segera hadir.');
  };

  return (
    <View style={common.mScreen}>
      {/* Header */}
      <View style={common.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={common.mHeaderTitle}>Mini Game</Text>
      </View>

      {/* Search */}
      <View style={styles.search}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari materi algoritma"
          placeholderTextColor={COLORS.muted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Grid 2 kolom */}
      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {data.length > 0 ? (
          data.map((item) => (
            <GameCard
              key={item.id}
              item={item}
              width={cardWidth}
              onPlay={onPlay}
            />
          ))
        ) : (
          <Text style={styles.empty}>Mini game tidak ditemukan</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    marginHorizontal: SIDE_PADDING,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchInput: { fontSize: 15, color: COLORS.primary },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 24,
  },
  empty: {
    width: '100%',
    textAlign: 'center',
    color: COLORS.text,
    marginTop: 48,
    fontSize: 14,
  },

  card: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  cardImage: { height: 105, backgroundColor: COLORS.addCreamDark },
  cardInfo: { paddingHorizontal: 16, paddingVertical: 12 },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  cardPlay: {
    fontSize: 12,
    color: COLORS.text,
    textDecorationLine: 'underline',
  },
});
