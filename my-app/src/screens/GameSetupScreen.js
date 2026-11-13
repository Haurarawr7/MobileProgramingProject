import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { ILLUSTRATION } from '../constants/assets';
import { MATERI } from '../constants/data';
import common from '../styles/common';

const LEVELS = [1, 2, 3, 4, 5];

export default function GameSetupScreen({
  initialMateriId = null,
  initialLevel = 3,
  onBack,
  onStart,
}) {
  const [materiId, setMateriId] = useState(initialMateriId);
  const [level, setLevel] = useState(initialLevel);
  const [open, setOpen] = useState(false);
  const selected = MATERI.find((m) => m.id === materiId);

  return (
    <View style={common.mScreen}>
      <View style={common.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={common.mHeaderTitle}>Mini Game</Text>
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.card}>
          <View style={s.cover}>
            <Image source={ILLUSTRATION} style={StyleSheet.absoluteFill} resizeMode="contain" />
          </View>

          <Text style={s.label}>Materi</Text>
          <TouchableOpacity style={s.select} onPress={() => setOpen((o) => !o)} activeOpacity={0.8}>
            <Text style={[s.selectText, !selected && { color: COLORS.muted }]} numberOfLines={1}>
              {selected ? selected.title : 'Pilih materi yang sudah kamu pelajari'}
            </Text>
            <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.ink} />
          </TouchableOpacity>

          {open && (
            <View style={s.options}>
              {MATERI.map((m, i) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    s.option,
                    i < MATERI.length - 1 && common.activityDivider,
                    m.id === materiId && { backgroundColor: COLORS.yellow },
                  ]}
                  onPress={() => {
                    setMateriId(m.id);
                    setOpen(false);
                  }}
                >
                  <Text style={s.optionText}>{m.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={s.levelRow}>
            <Text style={s.levelLabel}>Mudah</Text>
            <View style={s.track}>
              {LEVELS.map((l, i) => (
                <React.Fragment key={l}>
                  <TouchableOpacity
                    onPress={() => setLevel(l)}
                    hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                    accessibilityLabel={`Level ${l}`}
                    style={[s.dot, l === level && s.dotActive]}
                  />
                  {i < LEVELS.length - 1 && <View style={s.line} />}
                </React.Fragment>
              ))}
            </View>
            <Text style={s.levelLabel}>Sulit</Text>
          </View>

          <TouchableOpacity
            disabled={!selected}
            activeOpacity={0.85}
            style={[s.start, !selected && s.startOff]}
            onPress={() => onStart({ materiId, level })}
          >
            <Text style={[s.startText, !selected && { color: COLORS.white }]}>Mulai</Text>
          </TouchableOpacity>
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
  cover: {
    height: 220,
    borderRadius: 8,
    backgroundColor: COLORS.sky,
    overflow: 'hidden',
    marginBottom: 18,
  },
  label: { fontFamily: FONTS.sansMedium, fontSize: 14, color: COLORS.ink, marginBottom: 8 },
  select: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  selectText: { flex: 1, fontFamily: FONTS.sans, fontSize: 13, color: COLORS.ink },
  options: {
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    overflow: 'hidden',
  },
  option: { paddingVertical: 12, paddingHorizontal: 14 },
  optionText: { fontFamily: FONTS.sans, fontSize: 14, color: COLORS.ink },

  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 24 },
  levelLabel: { fontFamily: FONTS.sansMedium, fontSize: 13, color: COLORS.ink },
  track: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.sky,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
  },
  dotActive: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.yellow },
  line: { flex: 1, height: 3, backgroundColor: COLORS.sky },

  start: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startOff: { backgroundColor: COLORS.gray, borderColor: COLORS.gray },
  startText: { fontFamily: FONTS.sansMedium, fontSize: 16, color: COLORS.ink },
});
