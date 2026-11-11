import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registerWithEmail } from '../services/auth';

export default function SigninScreen({ onBack, onGoLogin, onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Perhatian', 'Silakan masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Perhatian', 'Silakan masukkan alamat email Anda.');
      return;
    }
    if (!password) {
      Alert.alert('Perhatian', 'Silakan buat kata sandi.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Perhatian', 'Kata sandi harus terdiri dari minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Perhatian', 'Konfirmasi kata sandi tidak cocok.');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('Perhatian', 'Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi untuk melanjutkan.');
      return;
    }

    setLoading(true);
    const result = await registerWithEmail(name, email, password);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Pendaftaran Berhasil',
        `Selamat datang di Logiterm, ${result.user.name}!`,
        [{ text: 'Lanjutkan', onPress: () => onRegisterSuccess?.(result.user) }]
      );
    } else {
      Alert.alert('Pendaftaran Gagal', result.error || 'Terjadi kesalahan saat membuat akun.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Tombol Kembali */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack || onGoLogin}
          hitSlop={12}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
          <Text style={styles.backText}>Kembali</Text>
        </TouchableOpacity>

        {/* Judul & Subjudul */}
        <Text style={styles.title}>Buat akun Logiterm</Text>
        <Text style={styles.subtitle}>
          Buat akun untuk memulai belajar algoritma, membuka mini-game logika, dan
          menyelesaikan tantangan interaktif di Logithm.
        </Text>

        {/* Input: Nama Lengkap */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nama lengkap</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan nama lengkap"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Input: Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan email Anda"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Input: Kata Sandi */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Kata sandi</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Buat kata sandi"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeButton}
              hitSlop={10}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>Gunakan minimal 8 karakter.</Text>
        </View>

        {/* Input: Konfirmasi Kata Sandi */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Konfirmasi kata sandi</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ulangi kata sandi"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              style={styles.eyeButton}
              hitSlop={10}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Persetujuan Syarat & Ketentuan */}
        <TouchableOpacity
          style={styles.agreementRow}
          activeOpacity={0.8}
          onPress={() => setAgreeTerms((prev) => !prev)}
        >
          <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
            {agreeTerms && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
          </View>
          <Text style={styles.agreementText}>
            Saya menyetujui Syarat & Ketentuan serta Kebijakan Privasi.
          </Text>
        </TouchableOpacity>

        {/* Tombol Utama: Mulai Belajar */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Mulai belajar</Text>
          )}
        </TouchableOpacity>

        {/* Footer: Sudah punya akun? Masuk */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Sudah punya akun Logithm? </Text>
          <TouchableOpacity onPress={onGoLogin} hitSlop={8}>
            <Text style={styles.footerLink}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E1E1E',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 21,
    color: '#555555',
    marginBottom: 26,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    fontSize: 14.5,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  passwordContainer: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 14.5,
    color: '#111827',
  },
  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    marginBottom: 26,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  agreementText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },
  primaryButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#3A3A3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13.5,
    color: '#4B5563',
  },
  footerLink: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#111827',
    textDecorationLine: 'underline',
  },
});

