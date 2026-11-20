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
import { LESSON_CONTENT } from '../constants/lessonContent';
import common from '../styles/common';
import LessonQuizScreen from './LessonQuizScreen';

const FLASHCARDS = [
  { front: 'Sequential Search', back: 'Memeriksa elemen satu per satu sampai target ditemukan.' },
  { front: 'Binary Search', back: 'Mencari pada data terurut dengan membagi ruang pencarian menjadi dua.' },
  { front: 'Bubble Sort', back: 'Membandingkan dan menukar elemen yang bersebelahan.' },
  { front: 'Selection Sort', back: 'Memilih nilai terkecil dari bagian yang belum terurut.' },
  { front: 'Quick Sort', back: 'Mempartisi data berdasarkan pivot, lalu mengurutkan tiap bagian.' },
  { front: 'Insertion Sort', back: 'Menyisipkan tiap elemen ke posisi yang tepat pada bagian terurut.' },
];

const MATCH_PAIRS = [
  { id: 'sequential', term: 'Sequential Search', definition: 'Memeriksa item satu per satu' },
  { id: 'binary', term: 'Binary Search', definition: 'Membagi pencarian pada data terurut' },
  { id: 'bubble', term: 'Bubble Sort', definition: 'Membandingkan elemen bersebelahan' },
  { id: 'insertion', term: 'Insertion Sort', definition: 'Menyisipkan nilai ke bagian terurut' },
];

const PRACTICE_QUESTIONS = LESSON_CONTENT
  .map((lesson) => lesson.quiz[0])
  .filter(Boolean)
  .slice(0, 5);

function Header({ title, onBack }) {
  return (
    <View style={common.mHeader}>
      <TouchableOpacity onPress={onBack} hitSlop={12}>
        <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
      </TouchableOpacity>
      <Text style={common.mHeaderTitle} numberOfLines={1}>{title}</Text>
    </View>
  );
}

function FlashcardGame({ onReward }) {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const card = FLASHCARDS[index];

  const next = () => {
    if (index === FLASHCARDS.length - 1) {
      setFinished(true);
      onReward('flashcards', { correct: FLASHCARDS.length, total: FLASHCARDS.length });
      return;
    }
    setIndex((current) => current + 1);
    setShowAnswer(false);
  };

  return (
    <View>
      {finished ? (
        <CompletionCard title="Flashcard selesai!" onRewarded />
      ) : (
        <>
          <Text style={styles.counter}>Kartu {index + 1} dari {FLASHCARDS.length}</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.flashcard}
            onPress={() => setShowAnswer((visible) => !visible)}
          >
            <Ionicons
              name={showAnswer ? 'checkmark-circle-outline' : 'albums-outline'}
              size={32}
              color={COLORS.blue}
            />
            <Text style={styles.flashcardLabel}>
              {showAnswer ? 'Jawaban' : 'Ketuk untuk melihat jawaban'}
            </Text>
            <Text style={styles.flashcardText}>
              {showAnswer ? card.back : card.front}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={!showAnswer}
            activeOpacity={0.85}
            style={[styles.primaryButton, !showAnswer && styles.disabledButton]}
            onPress={next}
          >
            <Text style={styles.primaryButtonText}>
              {index === FLASHCARDS.length - 1 ? 'Selesai' : 'Kartu berikutnya'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function MatchingGame({ onReward }) {
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [matched, setMatched] = useState([]);
  const [message, setMessage] = useState('Pilih algoritma, lalu pilih definisi yang cocok.');
  const finished = matched.length === MATCH_PAIRS.length;

  const chooseDefinition = (pairId) => {
    if (!selectedTerm || matched.includes(pairId)) return;
    if (selectedTerm === pairId) {
      const nextMatched = [...matched, pairId];
      setMatched(nextMatched);
      setSelectedTerm(null);
      setMessage(nextMatched.length === MATCH_PAIRS.length
        ? 'Semua pasangan cocok!'
        : 'Benar! Pilih pasangan berikutnya.');
      if (nextMatched.length === MATCH_PAIRS.length) {
        onReward('matching', {
          correct: MATCH_PAIRS.length,
          total: MATCH_PAIRS.length,
        });
      }
      return;
    }
    setSelectedTerm(null);
    setMessage('Belum cocok. Coba pasangkan lagi.');
  };

  return finished ? (
    <CompletionCard title="Semua pasangan cocok!" onRewarded />
  ) : (
    <View>
      <Text style={styles.instruction}>{message}</Text>
      <Text style={styles.columnHeading}>Algoritma</Text>
      {MATCH_PAIRS.map((pair) => (
        <TouchableOpacity
          key={pair.id}
          disabled={matched.includes(pair.id)}
          activeOpacity={0.85}
          onPress={() => {
            setSelectedTerm(pair.id);
            setMessage(`Sekarang cari definisi untuk ${pair.term}.`);
          }}
          style={[
            styles.matchOption,
            selectedTerm === pair.id && styles.selectedOption,
            matched.includes(pair.id) && styles.matchedOption,
          ]}
        >
          <Text style={styles.matchText}>{pair.term}</Text>
          {matched.includes(pair.id) ? (
            <Ionicons name="checkmark-circle" size={20} color={COLORS.blue} />
          ) : null}
        </TouchableOpacity>
      ))}
      <Text style={[styles.columnHeading, styles.definitionHeading]}>Definisi</Text>
      {MATCH_PAIRS.map((pair) => (
        <TouchableOpacity
          key={pair.id}
          disabled={matched.includes(pair.id)}
          activeOpacity={0.85}
          onPress={() => chooseDefinition(pair.id)}
          style={[
            styles.matchOption,
            matched.includes(pair.id) && styles.matchedOption,
          ]}
        >
          <Text style={styles.matchText}>{pair.definition}</Text>
          {matched.includes(pair.id) ? (
            <Ionicons name="checkmark-circle" size={20} color={COLORS.blue} />
          ) : null}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CompletionCard({ title, onRewarded }) {
  return (
    <View style={styles.completion}>
      <Ionicons name="trophy-outline" size={40} color={COLORS.blue} />
      <Text style={styles.completionTitle}>{title}</Text>
      {onRewarded ? (
        <Text style={styles.rewardMessage}>+10 poin pertama kali selesai</Text>
      ) : null}
    </View>
  );
}

export default function PracticeGameScreen({
  gameId,
  onBack,
  onReward = () => {},
}) {
  const titleById = {
    flashcards: 'Flashcard Algoritma',
    matching: 'Cocokkan Pasangan',
  };

  if (gameId === 'speed-quiz') {
    return (
      <LessonQuizScreen
        title="Kuis Cepat"
        quizId="speed-quiz"
        questions={PRACTICE_QUESTIONS}
        onBack={onBack}
        onFinished={(result) => onReward('speed-quiz', result)}
      />
    );
  }

  const title = titleById[gameId] || 'Latihan';
  return (
    <View style={common.mScreen}>
      <Header title={title} onBack={onBack} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {gameId === 'flashcards' ? (
          <FlashcardGame onReward={onReward} />
        ) : (
          <MatchingGame onReward={onReward} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  counter: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 12,
  },
  flashcard: {
    minHeight: 230,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
    marginBottom: 18,
  },
  flashcardLabel: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 16,
    marginBottom: 8,
  },
  flashcardText: {
    fontFamily: FONTS.sansSemi,
    fontSize: 19,
    lineHeight: 27,
    color: COLORS.ink,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellow,
  },
  disabledButton: { backgroundColor: COLORS.gray },
  primaryButtonText: { fontFamily: FONTS.sansMedium, color: COLORS.ink },
  instruction: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 14,
  },
  columnHeading: {
    fontFamily: FONTS.sansSemi,
    fontSize: 15,
    color: COLORS.ink,
    marginBottom: 8,
  },
  definitionHeading: { marginTop: 18 },
  matchOption: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  selectedOption: { backgroundColor: COLORS.yellow },
  matchedOption: { backgroundColor: COLORS.mint },
  matchText: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.ink,
  },
  completion: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 14,
    backgroundColor: COLORS.mint,
  },
  completionTitle: {
    fontFamily: FONTS.sansSemi,
    fontSize: 18,
    color: COLORS.ink,
    marginTop: 12,
  },
  rewardMessage: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.text,
    marginTop: 6,
  },
});
