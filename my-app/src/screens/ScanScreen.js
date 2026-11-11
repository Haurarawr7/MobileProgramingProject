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
import common from '../styles/common';

export default function ScanScreen({ onBack, onScanned, onGoGenerate }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleScan = ({ data }) => {
    if (scanned) return;

    setScanned(true);
    let form;
    try {
      if (typeof data !== 'string' || data.length > 5000) {
        throw new Error('Invalid QR form data');
      }
      form = JSON.parse(data);
    } catch {
      Alert.alert('QR tidak valid', 'QR ini bukan form yang didukung.');
      setScanned(false);
      return;
    }

    if (!isValidFormConfig(form)) {
      Alert.alert('QR tidak valid', 'QR ini bukan form yang didukung.');
      setScanned(false);
      return;
    }

    onScanned({
      title: form.title.trim(),
      fields: form.fields.map((field) => ({
        type: field.type,
        label: field.label.trim(),
      })),
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
        <Text style={common.logoutText}>Buat QR Form</Text>
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
