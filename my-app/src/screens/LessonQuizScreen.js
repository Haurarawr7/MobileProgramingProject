import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { shuffle } from '../constants/lessonContent';
import common from '../styles/common';

export default function LessonQuizScreen({
  title,
  quizId = 'quiz',
  questions = [],
  onBack,
  onFinished,
}) {
  const [attempt, setAttempt] = useState(0);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const rewardSent = useRef(false);
  const attemptId = useRef(null);

  useEffect(() => {
    if (finished && !rewardSent.current) {
      rewardSent.current = true;
      attemptId.current ||= Date.now();
      onFinished?.({
        activityId: `${quizId}_${attemptId.current}`,
        correctCount,
        totalQuestions: questions.length,
      });
    }
  }, [correctCount, finished, onFinished, questions.length, quizId]);

  const preparedQuestions = useMemo(
    () =>
      questions.map((question) => ({
        ...question,
        options: shuffle(
          question.options.map((text, optionIndex) => ({
            text,
            correct: optionIndex === question.answer,
          })),
        ),
      })),
    [attempt, questions],
  );

  const question = preparedQuestions[index];

  const selectAnswer = (optionIndex) => {
    if (selected !== null) return;
    setSelected(optionIndex);
    if (question.options[optionIndex].correct) {
      setCorrectCount((count) => count + 1);
    }
  };

  const advance = () => {
    if (index < preparedQuestions.length - 1) {
      setIndex((current) => current + 1);
      setSelected(null);
      return;
    }

    setFinished(true);
  };

  const restart = () => {
    rewardSent.current = false;
    attemptId.current = null;
    setAttempt((current) => current + 1);
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
  };

  if (preparedQuestions.length === 0) {
    return (
      <View style={common.mScreen}>
        <View style={common.mHeader}>
          <TouchableOpacity onPress={onBack} hitSlop={12}>
            <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={common.mHeaderTitle}>Kuis</Text>
        </View>
        <View style={common.emptyBox}>
          <Text style={common.emptyDesc}>Soal untuk kuis ini belum tersedia.</Text>
        </View>
      </View>
    );
  }

  if (finished) {
    const ratio = correctCount / preparedQuestions.length;
    const resultMessage =
      ratio >= 0.8
        ? 'Hebat! Pemahamanmu sudah kuat.'
        : ratio >= 0.6
          ? 'Bagus! Coba lagi untuk mendapatkan skor lebih tinggi.'
          : 'Baca kembali materi, lalu coba lagi.';

    return (
      <View style={common.mScreen}>
        <View style={common.mHeader}>
          <TouchableOpacity onPress={onBack} hitSlop={12}>
            <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={common.mHeaderTitle} numberOfLines={1}>{title}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <View style={styles.resultCircle}>
            <Text style={styles.resultPercent}>
              {Math.round(ratio * 100)}%
            </Text>
          </View>
          <Text style={styles.resultTitle}>
            {correctCount} dari {preparedQuestions.length} benar
          </Text>
          <Text style={styles.resultMessage}>{resultMessage}</Text>
          <TouchableOpacity
            style={common.quizButton}
            activeOpacity={0.85}
            onPress={restart}
          >
            <Text style={common.quizButtonText}>Ulangi kuis</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.85}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>Selesai</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={common.mScreen}>
      <View style={common.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={common.mHeaderTitle} numberOfLines={1}>{title}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.counterRow}>
          <Text style={styles.counter}>
            Soal {index + 1} dari {preparedQuestions.length}
          </Text>
          {question.from ? (
            <Text style={styles.from}>{question.from}</Text>
          ) : null}
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${
                  ((index + (selected === null ? 0 : 1)) /
                    preparedQuestions.length) *
                  100
                }%`,
              },
            ]}
          />
        </View>
        <Text style={styles.question}>{question.q}</Text>

        {question.options.map((option, optionIndex) => {
          const isCorrect = selected !== null && option.correct;
          const isWrong =
            selected === optionIndex && selected !== null && !option.correct;
          return (
            <TouchableOpacity
              key={`${index}-${option.text}`}
              activeOpacity={0.8}
              disabled={selected !== null}
              onPress={() => selectAnswer(optionIndex)}
              style={[
                styles.option,
                isCorrect && styles.optionCorrect,
                isWrong && styles.optionWrong,
              ]}
            >
              <View
                style={[
                  styles.optionLetter,
                  isCorrect && styles.optionLetterCorrect,
                  isWrong && styles.optionLetterWrong,
                ]}
              >
                <Text
                  style={[
                    styles.optionLetterText,
                    (isCorrect || isWrong) && styles.optionLetterTextSelected,
                  ]}
                >
                  {String.fromCharCode(65 + optionIndex)}
                </Text>
              </View>
              <Text style={styles.optionText}>{option.text}</Text>
              {isCorrect ? (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={COLORS.blue}
                />
              ) : null}
              {isWrong ? (
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={COLORS.secondary}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}

        {selected !== null ? (
          <View
            style={[
              styles.explanation,
              question.options[selected].correct
                ? styles.explanationCorrect
                : styles.explanationWrong,
            ]}
          >
            <Text style={styles.explanationTitle}>
              {question.options[selected].correct ? 'Benar!' : 'Belum tepat.'}
            </Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        ) : null}

        {selected !== null ? (
          <TouchableOpacity
            style={common.quizButton}
            activeOpacity={0.85}
            onPress={advance}
          >
            <Text style={common.quizButtonText}>
              {index < preparedQuestions.length - 1
                ? 'Soal berikutnya'
                : 'Lihat hasil'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  counter: { fontFamily: FONTS.sansMedium, fontSize: 13, color: COLORS.ink },
  from: { fontFamily: FONTS.sans, fontSize: 12, color: COLORS.muted },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.sky,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.blue },
  question: {
    fontFamily: FONTS.sansSemi,
    fontSize: 19,
    lineHeight: 27,
    color: COLORS.ink,
    marginBottom: 18,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.sky,
    backgroundColor: COLORS.white,
  },
  optionCorrect: { borderColor: COLORS.blue, backgroundColor: '#DDF0D2' },
  optionWrong: { borderColor: COLORS.secondary, backgroundColor: '#FFCFE2' },
  optionLetter: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.sky,
  },
  optionLetterCorrect: { backgroundColor: COLORS.blue },
  optionLetterWrong: { backgroundColor: COLORS.secondary },
  optionLetterText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.ink,
  },
  optionLetterTextSelected: { color: COLORS.white },
  optionText: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.ink,
  },
  explanation: { padding: 14, marginVertical: 10, borderRadius: 10 },
  explanationCorrect: { backgroundColor: '#DDF0D2' },
  explanationWrong: { backgroundColor: '#FFCFE2' },
  explanationTitle: {
    fontFamily: FONTS.sansSemi,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 4,
  },
  explanationText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.text,
  },
  resultContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  resultCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 8,
    borderColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  resultPercent: {
    fontFamily: FONTS.serif,
    fontSize: 44,
    color: COLORS.ink,
  },
  resultTitle: {
    fontFamily: FONTS.sansSemi,
    fontSize: 20,
    color: COLORS.ink,
    textAlign: 'center',
  },
  resultMessage: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: { alignItems: 'center', paddingVertical: 14 },
  backButtonText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.secondary,
  },
});
