import React, { useRef, useState } from 'react';
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

const STORY_STEPS = [
  {
    character: 'Raka',
    message: 'Kita perlu mencari angka 23 dalam daftar yang sudah terurut. Metode mana yang paling cepat untuk daftar besar?',
    options: ['Sequential Search', 'Binary Search', 'Bubble Sort'],
    answer: 1,
    response: 'Binary Search cocok karena daftar sudah terurut dan ruang pencariannya bisa dibagi dua.',
  },
  {
    character: 'Dina',
    message: 'Daftarnya [2, 5, 8, 12, 16, 20, 23, 27]. Nilai tengah pertama yang kita periksa adalah…',
    options: ['12', '16', '23'],
    answer: 0,
    response: 'Dengan indeks tengah (0 + 7) // 2, kita memeriksa nilai 12.',
  },
  {
    character: 'Raka',
    message: 'Target kita 23, lebih besar dari 12. Bagian mana yang masih mungkin berisi target?',
    options: ['Bagian kiri', 'Bagian kanan'],
    answer: 1,
    response: 'Benar, buang bagian kiri dan lanjutkan ke [16, 20, 23, 27].',
  },
  {
    character: 'Dina',
    message: 'Nilai tengah pada bagian baru adalah 20. Karena 23 lebih besar dari 20, apa berikutnya?',
    options: ['Cari di kiri 20', 'Cari di kanan 20'],
    answer: 1,
    response: 'Betul. Sisa bagian pencarian adalah [23, 27].',
  },
  {
    character: 'Raka',
    message: 'Terakhir, kita menemukan 23. Apa yang membuat langkah-langkah tadi efisien?',
    options: ['Selalu memeriksa dari awal', 'Membuang setengah bagian yang tidak diperlukan', 'Mengurutkan ulang setiap langkah'],
    answer: 1,
    response: 'Tepat! Binary Search membuang setengah ruang pencarian pada setiap langkah.',
  },
];

export default function StoryChatScreen({ onBack, onComplete }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const completionRecorded = useRef(false);
  const step = STORY_STEPS[index];

  const advance = () => {
    if (index === STORY_STEPS.length - 1) {
      setFinished(true);
      if (!completionRecorded.current) {
        completionRecorded.current = true;
        onComplete?.();
      }
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
  };

  return (
    <View style={common.mScreen}>
      <View style={common.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={common.mHeaderTitle}>Chat: Misi Mencari 23</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressRow}>
          <Ionicons name="chatbubbles-outline" size={20} color={COLORS.blue} />
          <Text style={styles.progressText}>
            {finished ? 'Cerita selesai' : `Adegan ${index + 1} dari ${STORY_STEPS.length}`}
          </Text>
        </View>

        {finished ? (
          <View style={styles.ending}>
            <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.blue} />
            <Text style={styles.endingTitle}>Misi berhasil!</Text>
            <Text style={styles.endingText}>
              Kamu membantu Raka dan Dina memahami Binary Search. Coba baca materi Binary Search untuk mempelajari langkah dan kompleksitasnya lebih lanjut.
            </Text>
            <TouchableOpacity
              style={styles.nextButton}
              activeOpacity={0.85}
              onPress={onBack}
            >
              <Text style={styles.nextButtonText}>Kembali ke game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.chatBubble}>
              <Text style={styles.character}>{step.character}</Text>
              <Text style={styles.message}>{step.message}</Text>
            </View>
            {step.options.map((option, optionIndex) => (
              <TouchableOpacity
                key={option}
                disabled={selected !== null}
                activeOpacity={0.85}
                onPress={() => setSelected(optionIndex)}
                style={[
                  styles.choice,
                  selected === optionIndex && styles.choiceSelected,
                  selected !== null && optionIndex === step.answer && styles.choiceCorrect,
                  selected === optionIndex && selected !== step.answer && styles.choiceWrong,
                ]}
              >
                <Text style={styles.choiceText}>{option}</Text>
              </TouchableOpacity>
            ))}
            {selected !== null ? (
              <>
                <View style={styles.replyBubble}>
                  <Text style={styles.character}>
                    {selected === step.answer ? 'Dina' : 'Raka'}
                  </Text>
                  <Text style={styles.message}>
                    {selected === step.answer
                      ? step.response
                      : `Belum tepat. ${step.response}`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.nextButton}
                  activeOpacity={0.85}
                  onPress={advance}
                >
                  <Text style={styles.nextButtonText}>
                    {index === STORY_STEPS.length - 1 ? 'Selesaikan cerita' : 'Lanjutkan chat'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  progressText: { fontFamily: FONTS.sansMedium, fontSize: 13, color: COLORS.text },
  chatBubble: {
    alignSelf: 'flex-start',
    maxWidth: '92%',
    padding: 14,
    borderRadius: 14,
    borderTopLeftRadius: 4,
    backgroundColor: COLORS.sky,
    marginBottom: 16,
  },
  replyBubble: {
    alignSelf: 'flex-end',
    maxWidth: '92%',
    padding: 14,
    borderRadius: 14,
    borderTopRightRadius: 4,
    backgroundColor: COLORS.mint,
    marginTop: 10,
    marginBottom: 16,
  },
  character: {
    fontFamily: FONTS.sansSemi,
    fontSize: 12,
    color: COLORS.blue,
    marginBottom: 4,
  },
  message: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 21, color: COLORS.ink },
  choice: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
    marginBottom: 8,
  },
  choiceSelected: { backgroundColor: COLORS.sky },
  choiceCorrect: { backgroundColor: COLORS.mint },
  choiceWrong: { backgroundColor: COLORS.pink },
  choiceText: { fontFamily: FONTS.sansMedium, fontSize: 13, color: COLORS.ink },
  nextButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellow,
  },
  nextButtonText: { fontFamily: FONTS.sansMedium, fontSize: 14, color: COLORS.ink },
  ending: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
    backgroundColor: COLORS.white,
  },
  endingTitle: {
    fontFamily: FONTS.sansSemi,
    fontSize: 22,
    color: COLORS.ink,
    marginTop: 10,
    marginBottom: 8,
  },
  endingText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 18,
  },
});
