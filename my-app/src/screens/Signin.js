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
import GoogleAuthButton from '../components/GoogleAuthButton';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import { registerWithEmail, loginWithGoogleCredential } from '../services/auth';

export default function SigninScreen({ onBack, onGoLogin, onRegisterSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleResponse = async (idToken, accessToken) => {
    setGoogleLoading(true);
    let userInfo = null;
    if (accessToken) {
      try {
        const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error(`Google profile request failed: ${res.status}`);
        userInfo = await res.json();
      } catch (error) {
        console.warn('Could not retrieve Google profile details:', error);
      }
    }
    const result = await loginWithGoogleCredential(idToken, userInfo);
    setGoogleLoading(false);
    if (result.success) {
      onRegisterSuccess?.(result.user);
      if (result.syncError) {
        Alert.alert('Profil belum tersinkron', result.syncError);
      }
    } else {
      Alert.alert('Gagal Daftar dengan Google', result.error || 'Terjadi kesalahan.');
    }
  };

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
    try {
      const result = await registerWithEmail(name, email, password);
      if (result.success) {
        const syncMessage = result.syncError
          ? `\n\n${result.syncError}`
          : '';
        Alert.alert(
          'Pendaftaran Berhasil',
          `Selamat datang di Logiterm, ${result.user.name}!${syncMessage}`,
          [{ text: 'Lanjutkan', onPress: () => onRegisterSuccess?.(result.user) }]
        );
      } else {
        Alert.alert('Pendaftaran Gagal', result.error || 'Terjadi kesalahan saat membuat akun.');
      }
    } catch (error) {
      console.warn('Email registration failed', error);
      Alert.alert('Pendaftaran Gagal', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
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
        <View style={styles.brandBadge}>
          <Text style={styles.brandBadgeText}>Mulai belajar hari ini</Text>
        </View>
        <Text style={styles.title}>Buat akun Logiterm</Text>
        <Text style={styles.subtitle}>
          Pelajari algoritma, selesaikan mini-game logika, dan pantau setiap perkembanganmu.
        </Text>

        {/* Input: Nama Lengkap */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Nama lengkap</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor={COLORS.gray}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Input: Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.input}
              placeholder="Masukkan email Anda"
              placeholderTextColor={COLORS.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Input: Kata Sandi */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Kata sandi</Text>
          <View style={styles.passwordContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.passwordInput}
              placeholder="Buat kata sandi"
              placeholderTextColor={COLORS.gray}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeButton}
              hitSlop={10}
              accessibilityLabel={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={COLORS.ink}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.helperText}>Gunakan minimal 8 karakter.</Text>
        </View>

        {/* Input: Konfirmasi Kata Sandi */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Konfirmasi kata sandi</Text>
          <View style={styles.passwordContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} />
            <TextInput
              style={styles.passwordInput}
              placeholder="Ulangi kata sandi"
              placeholderTextColor={COLORS.gray}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              style={styles.eyeButton}
              hitSlop={10}
              accessibilityLabel={showConfirmPassword ? 'Sembunyikan konfirmasi kata sandi' : 'Lihat konfirmasi kata sandi'}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={COLORS.ink}
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
            {agreeTerms && <Ionicons name="checkmark" size={12} color={COLORS.ink} />}
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
            <ActivityIndicator color={COLORS.ink} />
          ) : (
            <Text style={styles.primaryButtonText}>Mulai belajar</Text>
          )}
        </TouchableOpacity>

        {/* Divider "atau" */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>atau</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Tombol Daftar dengan Google */}
        <GoogleAuthButton
          action="Daftar"
          loading={googleLoading}
          onLoadingChange={setGoogleLoading}
          onTokens={handleGoogleResponse}
          buttonStyle={styles.googleButton}
          contentStyle={styles.googleButtonContent}
          textStyle={styles.googleButtonText}
        />

        {/* Footer: Sudah punya akun? Masuk */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
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
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
    marginBottom: 18,
    gap: 8,
  },
  backText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.ink,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.sky,
    marginBottom: 10,
  },
  brandBadgeText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.ink,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 42,
    lineHeight: 46,
    color: COLORS.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
    marginBottom: 22,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.ink,
    marginBottom: 7,
  },
  inputContainer: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.ink,
  },
  passwordContainer: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.ink,
  },
  eyeButton: {
    padding: 4,
  },
  helperText: {
    fontFamily: FONTS.sans,
    fontSize: 11.5,
    color: COLORS.text,
    marginTop: 5,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: COLORS.yellow,
  },
  agreementText: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    color: COLORS.text,
    lineHeight: 18,
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontFamily: FONTS.sansSemi,
    fontSize: 15,
    color: COLORS.ink,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: COLORS.sky,
  },
  dividerText: {
    marginHorizontal: 12,
    fontFamily: FONTS.sans,
    fontSize: 12,
    color: COLORS.text,
  },
  googleButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.ink,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    color: COLORS.text,
  },
  footerLink: {
    fontFamily: FONTS.sansSemi,
    fontSize: 12.5,
    color: COLORS.ink,
    textDecorationLine: 'underline',
  },
});
