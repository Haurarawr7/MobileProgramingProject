import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { COLORS } from '../constants/colors';
import {
  createLessonFromTopic,
  SUPPORTED_LESSON_TOPICS,
} from '../utils/lessonQr';
import common from '../styles/common';

export default function GenerateScreen({ onBack }) {
  const [topic, setTopic] = useState('');
  const [qrValue, setQrValue] = useState(null);

  const updateTopic = (value) => {
    setTopic(value);
    setQrValue(null);
  };

  const generate = () => {
    const normalizedTopic = topic.trim();
    if (!normalizedTopic || normalizedTopic.length > 100) {
      Alert.alert('Topik belum valid', 'Isi topik pelajaran (maksimal 100 karakter).');
      return;
    }

    if (!createLessonFromTopic(normalizedTopic)) {
      Alert.alert(
        'Topik belum didukung',
        `Coba salah satu topik ini: ${SUPPORTED_LESSON_TOPICS}.`,
      );
      return;
    }

    const payload = {
      type: 'lesson-topic',
      version: 1,
      topic: normalizedTopic,
    };
    const value = JSON.stringify(payload);
    setQrValue(value);
  };

  return (
    <ScrollView
      contentContainerStyle={common.content}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity onPress={onBack} hitSlop={12} style={common.formBackIcon}>
        <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
      </TouchableOpacity>
      <Text style={[common.title, common.formTitle]}>Buat QR Pelajaran</Text>
      <Text style={styles.description}>
        Masukkan topik, lalu bagikan QR. Saat dipindai, aplikasi akan membuat
        pelajaran dari topik tersebut.
      </Text>

      <View style={common.searchBox}>
        <TextInput
          style={[common.searchInput, common.formInput]}
          placeholder="Topik (contoh: tree in coding)"
          placeholderTextColor={COLORS.muted}
          value={topic}
          maxLength={100}
          onChangeText={updateTopic}
        />
      </View>
      <Text style={styles.supportedTopics}>
        Topik yang tersedia: {SUPPORTED_LESSON_TOPICS}.
      </Text>

      <TouchableOpacity style={common.quizButton} onPress={generate}>
        <Text style={common.quizButtonText}>Generate QR Pelajaran</Text>
      </TouchableOpacity>

      {qrValue ? (
        <View style={styles.generatedQr}>
          <QRCode value={qrValue} size={220} />
          <Text style={styles.qrCaption}>Pindai QR untuk membuka pelajaran</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
    marginBottom: 20,
  },
  supportedTopics: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.text,
    marginTop: -18,
    marginBottom: 20,
  },
  generatedQr: {
    alignItems: 'center',
    padding: 24,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  qrCaption: { marginTop: 16, color: COLORS.text, textAlign: 'center' },
});
