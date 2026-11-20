import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { MATERI } from '../constants/data';
import common from '../styles/common';
import { Btn, Row } from './ui';
import SequentialGame from './SequentialGame';
import BinaryGame from './BinaryGame';
import BubbleGame from './BubbleGame';
import SelectionGame from './SelectionGame';
import InsertionGame from './InsertionGame';
import QuickGame from './QuickGame';

// id materi -> komponen game + petunjuk
const GAMES = {
  m1: { Game: SequentialGame, tip: 'Cari angka target dengan membuka kartu satu per satu dari kiri.' },
  m2: { Game: BinaryGame, tip: 'Daftar sudah terurut. Selalu buka kartu di tengah rentang yang tersisa.' },
  m3: { Game: BubbleGame, tip: 'Bandingkan dua angka bersebelahan, tukar jika kiri lebih besar dari kanan.' },
  m4: { Game: SelectionGame, tip: 'Ketuk angka terkecil dari bagian yang belum terurut.' },
  m5: { Game: QuickGame, tip: 'Pisahkan angka: lebih kecil dari pivot ke kiri, lebih besar ke kanan.' },
  m6: { Game: InsertionGame, tip: 'Sisipkan kartu baru ke posisi yang tepat di antara angka yang sudah terurut.' },
};

function Result({ stats, onAgain, onDone }) {
  const total = stats.correct + stats.mistakes;
  const acc = total === 0 ? 0 : stats.correct / total;
  const stars = acc >= 0.9 ? 3 : acc >= 0.6 ? 2 : 1;
  return (
    <View style={s.result}>
      <Text style={s.resultTitle}>Selesai!</Text>
      <View style={s.stars}>
        {[1, 2, 3].map((n) => (
          <Ionicons
            key={n}
            name={n <= stars ? 'star' : 'star-outline'}
            size={40}
            color={n <= stars ? COLORS.ink : COLORS.gray}
            style={n <= stars && s.starOn}
          />
        ))}
      </View>
      <Text style={s.points}>{Math.round(acc * 100)}</Text>
      <Text style={s.detail}>
        {stats.correct} langkah benar · {stats.mistakes} salah
      </Text>
      <Row>
        <Btn label="Main lagi" onPress={onAgain} />
        <Btn label="Selesai" kind="secondary" onPress={onDone} />
      </Row>
    </View>
  );
}

export default function GamePlayScreen({ config, onBack, onReward }) {
  const materi = MATERI.find((m) => m.id === config?.materiId);
  const entry = config ? GAMES[config.materiId] : null;
  const [result, setResult] = useState(null);
  const [runKey, setRunKey] = useState(0);
  const rewardSent = useRef(false);

  const finishGame = (stats) => {
    setResult(stats);
    if (!rewardSent.current) {
      rewardSent.current = true;
      onReward?.(stats);
    }
  };

  if (!materi || !entry) {
    return (
      <View style={common.emptyBox}>
        <Text style={common.emptyDesc}>Game untuk materi ini belum tersedia.</Text>
        <Btn label="Kembali" kind="secondary" onPress={onBack} />
      </View>
    );
  }
  const { Game, tip } = entry;

  return (
    <View style={common.mScreen}>
      <View style={common.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={[common.mHeaderTitle, { flex: 1 }]} numberOfLines={1}>
          {materi.title}
        </Text>
        <View style={s.levelChip}>
          <Text style={s.levelChipText}>Level {config.level}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          {result ? (
            <Result
              stats={result}
              onAgain={() => {
                setResult(null);
                setRunKey((k) => k + 1);
              }}
              onDone={onBack}
            />
          ) : (
            <>
              <Text style={s.tip}>{tip}</Text>
              <Game key={runKey} level={config.level} onFinish={finishGame} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 24 },
  card: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  tip: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.text,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.sky,
  },
  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellow,
  },
  levelChipText: { fontFamily: FONTS.sansMedium, fontSize: 12, color: COLORS.ink },

  result: { alignItems: 'center', paddingVertical: 8 },
  resultTitle: { fontFamily: FONTS.serif, fontSize: 40, color: COLORS.ink },
  stars: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  starOn: {},
  points: { fontFamily: FONTS.serif, fontSize: 72, lineHeight: 76, color: COLORS.blue },
  detail: { fontFamily: FONTS.sans, fontSize: 13, color: COLORS.text, marginBottom: 20 },
});
