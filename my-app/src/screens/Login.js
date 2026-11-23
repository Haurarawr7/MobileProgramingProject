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
import {
  loginWithEmail,
  loginAsGuest,
  resetPassword,
  loginWithGoogleCredential,
} from '../services/auth';

export default function LoginScreen({ onLoginSuccess, onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
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
      onLoginSuccess?.(result.user);
      if (result.syncError) {
        Alert.alert('Profil belum tersinkron', result.syncError);
      }
    } else {
      Alert.alert('Gagal Masuk dengan Google', result.error || 'Terjadi kesalahan.');
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Perhatian', 'Silakan masukkan alamat email Anda.');
      return;
    }
    if (!password) {
      Alert.alert('Perhatian', 'Silakan masukkan kata sandi.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithEmail(email, password);
      if (result.success) {
        onLoginSuccess?.(result.user);
        if (result.syncError) {
          Alert.alert('Profil belum tersinkron', result.syncError);
        }
      } else {
        Alert.alert('Gagal Masuk', result.error || 'Email atau kata sandi tidak cocok.');
      }
    } catch (error) {
      console.warn('Email sign-in failed', error);
      Alert.alert('Gagal Masuk', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    try {
      const result = await loginAsGuest();
      if (result.success) {
        onLoginSuccess?.(result.user);
        if (result.syncError) {
          Alert.alert('Profil belum tersinkron', result.syncError);
        }
      } else {
        Alert.alert('Gagal Masuk sebagai Tamu', result.error || 'Silakan coba lagi.');
      }
    } catch (error) {
      console.warn('Guest sign-in failed', error);
      Alert.alert('Gagal Masuk sebagai Tamu', 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setGuestLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      Alert.alert('Lupa Kata Sandi', 'Masukkan email Anda di kolom email terlebih dahulu.');
      return;
    }
    Alert.alert(
      'Kirim Tautan Reset',
      `Kirim tautan reset kata sandi ke ${email.trim()}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kirim',
          onPress: async () => {
            const res = await resetPassword(email);
            if (res.success) {
              Alert.alert('Sukses', 'Tautan pemulihan kata sandi telah dikirim ke email Anda.');
            } else {
              Alert.alert('Gagal', res.error || 'Tidak dapat mengirim email reset.');
            }
          },
        },
      ]
    );
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
        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>{'<>'}</Text>
            </View>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>Belajar interaktif</Text>
            </View>
          </View>

          <Text style={styles.title}>Selamat datang di{'\n'}Logiterm</Text>
          <Text style={styles.subtitle}>
            Masuk untuk melanjutkan materi, mini-game, dan perkembangan belajarmu.
          </Text>

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

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Kata sandi</Text>
            <View style={styles.passwordContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray} />
              <TextInput
                style={styles.passwordInput}
                placeholder="Masukkan kata sandi"
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
          </View>

          <View style={styles.rowOptions}>
            <TouchableOpacity
              style={styles.rememberRow}
              activeOpacity={0.8}
              onPress={() => setRememberMe((prev) => !prev)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                {rememberMe && <Ionicons name="checkmark" size={12} color={COLORS.ink} />}
              </View>
              <Text style={styles.rememberText}>Ingat saya</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} hitSlop={8}>
              <Text style={styles.forgotText}>Lupa kata sandi?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.ink} />
            ) : (
              <Text style={styles.primaryButtonText}>Lanjutkan belajar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>atau</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleAuthButton
            action="Masuk"
            loading={googleLoading}
            onLoadingChange={setGoogleLoading}
            onTokens={handleGoogleResponse}
            buttonStyle={styles.googleButton}
            contentStyle={styles.googleButtonContent}
            textStyle={styles.googleButtonText}
          />

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={handleGuest}
            disabled={guestLoading}
          >
            {guestLoading ? (
              <ActivityIndicator color={COLORS.ink} />
            ) : (
              <>
                <Ionicons name="person-outline" size={18} color={COLORS.ink} />
                <Text style={styles.secondaryButtonText}>Coba sebagai tamu</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={onGoRegister} hitSlop={8}>
              <Text style={styles.footerLink}>Daftar sekarang</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  content: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  logoBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: FONTS.sansSemi,
    fontSize: 16,
    color: COLORS.ink,
  },
  brandBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.sky,
  },
  brandBadgeText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.ink,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 44,
    lineHeight: 48,
    color: COLORS.ink,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 16,
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
  rowOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 0,
    marginBottom: 20,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: COLORS.white,
  },
  checkboxActive: {
    backgroundColor: COLORS.yellow,
  },
  rememberText: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    color: COLORS.text,
  },
  forgotText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12.5,
    color: COLORS.ink,
    textDecorationLine: 'underline',
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
    marginBottom: 10,
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
  secondaryButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  secondaryButtonText: {
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
