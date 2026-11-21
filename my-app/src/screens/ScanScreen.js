import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { COLORS } from '../constants/colors';
import { isValidFormConfig } from '../utils/forms';
import {
  createLessonFromTopic,
  isValidQrLesson,
  isValidQrLessonTopic,
  SUPPORTED_LESSON_TOPICS,
} from '../utils/lessonQr';
import common from '../styles/common';

export default function ScanScreen({ onBack, onScanned, onGoGenerate }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleScan = ({ data }) => {
    if (scanned) return;

    setScanned(true);
    let payload;
    try {
      if (typeof data !== 'string' || data.length > 5000) {
        throw new Error('Invalid QR data');
      }
      payload = JSON.parse(data);
    } catch {
      Alert.alert('QR tidak valid', 'QR ini bukan materi atau form yang didukung.');
      setScanned(false);
      return;
    }

    if (isValidQrLessonTopic(payload)) {
      const lesson = createLessonFromTopic(payload.topic);
      if (!lesson) {
        Alert.alert(
          'Topik belum didukung',
          `QR berisi topik yang belum tersedia. Topik yang didukung: ${SUPPORTED_LESSON_TOPICS}.`,
        );
        setScanned(false);
        return;
      }
      onScanned({ type: 'lesson', lesson });
      return;
    }

    if (isValidQrLesson(payload)) {
      onScanned({
        type: 'lesson',
        lesson: {
          ...payload,
          title: payload.title.trim(),
          topic: payload.topic.trim(),
          level: payload.level.trim(),
          duration: payload.duration.trim(),
          summary: payload.summary.trim(),
          content: payload.content.trim(),
        },
      });
      return;
    }

    if (!isValidFormConfig(payload)) {
      Alert.alert('QR tidak valid', 'QR ini bukan materi atau form yang didukung.');
      setScanned(false);
      return;
    }

    onScanned({
      type: 'form',
      form: {
        title: payload.title.trim(),
        fields: payload.fields.map((field) => ({
          type: field.type,
          label: field.label.trim(),
        })),
      },
    });
  };

  return (
    <View style={common.mScreen}>
      <View style={common.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={common.mHeaderTitle}>Scan QR</Text>
      </View>

      {!permission ? (
        <View style={common.emptyBox}>
          <Text style={common.emptyDesc}>Memeriksa izin kamera...</Text>
        </View>
      ) : !permission.granted ? (
        <View style={common.emptyBox}>
          <Text style={common.emptyDesc}>
            Aplikasi membutuhkan izin kamera untuk memindai QR.
          </Text>
          <TouchableOpacity
            style={[common.quizButton, styles.permissionButton]}
            onPress={requestPermission}
          >
            <Text style={common.quizButtonText}>Izinkan Kamera</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cameraPreview}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleScan}
          />
        </View>
      )}

      <TouchableOpacity
        accessibilityRole="button"
        style={[common.logoutButton, styles.scanGenerateButton]}
        onPress={onGoGenerate}
      >
        <MaterialCommunityIcons name="qrcode" size={20} color={COLORS.secondary} />
        <Text style={common.logoutText}>Buat QR Pelajaran</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraPreview: {
    flex: 1,
    marginHorizontal: 24,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
  },
  permissionButton: { marginTop: 16, paddingHorizontal: 24 },
  scanGenerateButton: { margin: 24 },
});
