import React, { useEffect, useRef, useState } from 'react';
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
import common from '../styles/common';

function ContentBlock({ block }) {
  if (block.type === 'p') {
    return <Text style={styles.paragraph}>{block.text}</Text>;
  }

  if (block.type === 'list' || block.type === 'steps') {
    return (
      <View style={styles.list}>
        {block.items.map((item, index) => (
          <View key={`${index}-${item}`} style={styles.listRow}>
            {block.type === 'steps' ? (
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
            ) : (
              <View style={styles.bullet} />
            )}
            <Text style={styles.listText}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (block.type === 'code') {
    return (
      <ScrollView
        horizontal
        style={styles.codeBox}
        showsHorizontalScrollIndicator
      >
        <Text selectable style={styles.code}>{block.text}</Text>
      </ScrollView>
    );
  }

  if (block.type === 'tip') {
    return (
      <View style={styles.tip}>
        <Ionicons name="bulb-outline" size={20} color={COLORS.blue} />
        <Text style={styles.tipText}>{block.text}</Text>
      </View>
    );
  }

  return null;
}

export default function LessonReaderScreen({
  materi,
  progress = 0,
  completed = false,
  onBack,
  onProgress,
  onComplete,
}) {
  const [readingProgress, setReadingProgress] = useState(progress);
  const maxProgress = useRef(progress);

  useEffect(() => {
    maxProgress.current = Math.max(maxProgress.current, progress);
    setReadingProgress(maxProgress.current);
  }, [progress]);

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollableHeight = contentSize.height - layoutMeasurement.height;
    const nextProgress =
      scrollableHeight <= 0
        ? 1
        : Math.min(1, Math.max(0, contentOffset.y / scrollableHeight));

    if (nextProgress > maxProgress.current) {
      maxProgress.current = nextProgress;
      setReadingProgress(nextProgress);
      onProgress?.(materi.id, nextProgress);
    }
  };

  return (
    <View style={common.mScreen}>
      <View style={common.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={[common.mHeaderTitle, styles.headerTitle]} numberOfLines={1}>
          {materi.title}
        </Text>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(readingProgress * 100) }}
        style={styles.progressTrack}
      >
        <View
          style={[styles.progressFill, { width: `${readingProgress * 100}%` }]}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={100}
        onScroll={handleScroll}
      >
        <View style={styles.metaRow}>
          {[materi.level, materi.topic, materi.duration].map((label) => (
            <View key={label} style={styles.chip}>
              <Text style={styles.chipText}>{label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.title}>{materi.title}</Text>
        <Text style={styles.summary}>{materi.summary}</Text>

        {materi.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.blocks.map((block, index) => (
              <ContentBlock key={`${section.heading}-${index}`} block={block} />
            ))}
          </View>
        ))}

        {completed ? (
          <Text style={styles.completed}>Materi ini sudah selesai dibaca.</Text>
        ) : null}
        <TouchableOpacity
          style={common.quizButton}
          activeOpacity={0.85}
          onPress={() => onComplete?.(materi.id)}
        >
          <Text style={common.quizButtonText}>
            {completed ? 'Ulangi kuis materi' : 'Selesai membaca & kerjakan kuis'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.85}
          onPress={onBack}
        >
          <Text style={styles.backButtonText}>Kembali ke materi</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTitle: { flex: 1, fontSize: 30, lineHeight: 38 },
  progressTrack: {
    height: 6,
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 3,
    backgroundColor: COLORS.sky,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.blue,
  },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.sky,
  },
  chipText: { fontFamily: FONTS.sansMedium, fontSize: 12, color: COLORS.ink },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 34,
    lineHeight: 40,
    color: COLORS.ink,
    marginBottom: 8,
  },
  summary: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
    marginBottom: 24,
  },
  section: { marginBottom: 20 },
  heading: {
    fontFamily: FONTS.sansSemi,
    fontSize: 19,
    color: COLORS.ink,
    marginBottom: 12,
  },
  paragraph: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text,
    marginBottom: 12,
  },
  list: { gap: 10, marginBottom: 12 },
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.blue,
    marginTop: 8,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.yellow,
  },
  stepNumberText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.ink,
  },
  listText: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
  },
  codeBox: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: COLORS.ink,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.white,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: COLORS.sky,
  },
  tipText: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.ink,
  },
  completed: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.blue,
    marginBottom: 12,
  },
  backButton: { alignItems: 'center', paddingVertical: 14 },
  backButtonText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.secondary,
  },
});
