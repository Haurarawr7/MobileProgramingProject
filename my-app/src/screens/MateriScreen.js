import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { ILLUSTRATION } from '../constants/assets';
import { MATERI } from '../constants/data';
import common from '../styles/common';

function LevelSlider({ count, index, onPressDot }) {
  return (
    <View style={styles.levelRow}>
      <Text style={styles.levelLabel}>Dasar</Text>
      <View style={styles.levelTrack}>
        {Array.from({ length: count }).map((_, i) => (
          <React.Fragment key={i}>
            <TouchableOpacity
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              onPress={() => onPressDot(i)}
              style={[styles.levelDot, i === index && styles.levelDotActive]}
            />
            {i < count - 1 && <View style={styles.levelLine} />}
          </React.Fragment>
        ))}
      </View>
      <Text style={styles.levelLabel}>Lanjutan</Text>
    </View>
  );
}

function MateriCard({ item, width, height, onStart }) {
  return (
    <View style={[styles.mCard, { width, height }]}>
      {/* Atas: judul + tag */}
      <View style={styles.mCardTop}>
        <Text style={styles.mTitle}>{item.title}</Text>
        <View style={styles.mMetaRow}>
          <View style={styles.mChips}>
            <View style={styles.mChip}>
              <Text style={styles.mChipText}>{item.level}</Text>
            </View>
            <View style={styles.mChip}>
              <Text style={styles.mChipText}>{item.topic}</Text>
            </View>
          </View>
          <Text style={styles.mDuration}>{item.duration}</Text>
        </View>
      </View>

      {/* Pemisah tiket */}
      <View style={styles.mDividerWrap}>
        <View style={[styles.mNotch, { left: -10 }]} />
        <View style={styles.mDashClip}>
          <View style={styles.mDash} />
        </View>
        <View style={[styles.mNotch, { right: -10 }]} />
      </View>

      {/* Bawah: gambar + tombol */}
      <View style={styles.mCardBottom}>
        <View style={styles.mImageWrap}>
          <Image
            source={ILLUSTRATION}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity
          style={styles.mButton}
          activeOpacity={0.85}
          onPress={() => onStart?.(item)}
        >
          <Text style={styles.mButtonText}>Mulai belajar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function MateriScreen({ onBack, initialMateriId, onStart }) {
  const { width, height } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const initialIndex = Math.max(
    0,
    MATERI.findIndex((m) => m.id === initialMateriId),
  );
  const [index, setIndex] = useState(initialIndex);
  const listRef = useRef(null);

  const CARD_W = width - 64;
  const GAP = 12;
  const INTERVAL = CARD_W + GAP;
  const CARD_H = Math.min(560, height * 0.62);

  useEffect(() => {
    if (initialIndex < 1) return;
    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollTo({ x: initialIndex * INTERVAL, animated: false });
    });
    return () => cancelAnimationFrame(frame);
  }, [initialIndex, INTERVAL]);

  const data = MATERI.filter((m) =>
    m.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const onScrollEnd = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / INTERVAL);
    setIndex(Math.max(0, Math.min(i, data.length - 1)));
  };

  const goTo = (i) => {
    listRef.current?.scrollTo({ x: i * INTERVAL, animated: true });
    setIndex(i);
  };

  const onChangeQuery = (t) => {
    setQuery(t);
    setIndex(0);
    listRef.current?.scrollTo({ x: 0, animated: false });
  };

  return (
    <View style={common.mScreen}>
      {/* Header */}
      <View style={common.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={common.mHeaderTitle}>Materi</Text>
      </View>

      {/* Search */}
      <View style={styles.mSearch}>
        <TextInput
          style={styles.mSearchInput}
          placeholder="Cari materi algoritma"
          placeholderTextColor={COLORS.muted}
          value={query}
          onChangeText={onChangeQuery}
        />
      </View>

      {/* Dasar -> Lanjutan */}
      {data.length > 0 && (
        <LevelSlider count={data.length} index={index} onPressDot={goTo} />
      )}

      {/* Carousel */}
      {data.length > 0 ? (
        <ScrollView
          ref={listRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={INTERVAL}
          snapToAlignment="start"
          decelerationRate="fast"
          onMomentumScrollEnd={onScrollEnd}
          contentContainerStyle={{ paddingHorizontal: 24, gap: GAP }}
          style={styles.mList}
        >
          {data.map((item) => (
            <MateriCard
              key={item.id}
              item={item}
              width={CARD_W}
              height={CARD_H}
              onStart={onStart}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.mEmpty}>Materi tidak ditemukan</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mSearch: {
    marginHorizontal: 24,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  mSearchInput: { fontSize: 15, color: COLORS.primary },

  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  levelLabel: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  levelTrack: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.addAmber,
  },
  levelDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  levelLine: { flex: 1, height: 4, backgroundColor: COLORS.white },

  mList: { flexGrow: 0 },
  mEmpty: {
    textAlign: 'center',
    color: COLORS.text,
    marginTop: 48,
    fontSize: 14,
  },

  // Card
  mCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mCardTop: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 18 },
  mTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 14,
  },
  mMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mChips: { flexDirection: 'row', gap: 8 },
  mChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.addCreamDark,
  },
  mChipText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  mDuration: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  mDividerWrap: { height: 20, justifyContent: 'center' },
  mDashClip: { height: 1, overflow: 'hidden', marginHorizontal: 14 },
  mDash: {
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: 1,
  },
  mNotch: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.addCream,
  },

  mCardBottom: { flex: 1, padding: 18, paddingTop: 8 },
  mImageWrap: { flex: 1, marginBottom: 16 },
  mButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.white },
});
