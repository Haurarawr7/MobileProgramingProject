import React, { useState, useEffect } from 'react';
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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  loginWithEmail,
  loginAsGuest,
  resetPassword,
  loginWithGoogleCredential,
} from '../services/auth';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ onLoginSuccess, onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Hook Google Auth dari expo-auth-session
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token, authentication } = response.params;
      handleGoogleResponse(id_token || authentication?.idToken, authentication?.accessToken);
    }
  }, [response]);

  const handleGoogleResponse = async (idToken, accessToken) => {
    setGoogleLoading(true);
    let userInfo = null;
    if (accessToken) {
      try {
        const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        userInfo = await res.json();
      } catch (e) {
        // ignore
      }
    }
    const result = await loginWithGoogleCredential(idToken, userInfo);
    setGoogleLoading(false);
    if (result.success) {
      onLoginSuccess?.(result.user);
    } else {
      Alert.alert('Gagal Masuk dengan Google', result.error || 'Terjadi kesalahan.');
    }
  };

  const handleGooglePress = async () => {
    if (request && process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) {
      promptAsync();
    } else {
      // Fallback cepat (Demo) jika Client ID belum dipasang di .env
      setGoogleLoading(true);
      const result = await loginWithGoogleCredential(null, {
        name: 'Pengguna Google',
        email: 'user.google@gmail.com',
      });
      setGoogleLoading(false);
      if (result.success) {
        onLoginSuccess?.(result.user);
      }
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
    const result = await loginWithEmail(email, password);
    setLoading(false);

    if (result.success) {
      onLoginSuccess?.(result.user);
    } else {
      Alert.alert('Gagal Masuk', result.error || 'Email atau kata sandi tidak cocok.');
    }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    const result = await loginAsGuest();
    setGuestLoading(false);
    if (result.success) {
      onLoginSuccess?.(result.user);
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
        {/* Logo Placeholder */}
        <View style={styles.logoBox}>
          <View style={styles.logoCross1} />
          <View style={styles.logoCross2} />
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>Selamat datang di{'\n'}Logiterm</Text>
        <Text style={styles.subtitle}>
          Belajar logika, algoritma, dan OOP dengan mini-game dan simulasi interaktif.{'\n'}
          Masuk untuk melanjutkan belajar.
        </Text>

        {/* Form Email */}
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

        {/* Form Kata Sandi */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Kata sandi</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Masukkan kata sandi"
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
              accessibilityLabel="Lihat kata sandi"
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ingat Saya & Lupa Kata Sandi */}
        <View style={styles.rowOptions}>
          <TouchableOpacity
            style={styles.rememberRow}
            activeOpacity={0.8}
            onPress={() => setRememberMe((prev) => !prev)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
              {rememberMe && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
            </View>
            <Text style={styles.rememberText}>Ingat saya</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword} hitSlop={8}>
            <Text style={styles.forgotText}>Lupa kata sandi?</Text>
          </TouchableOpacity>
        </View>

        {/* Tombol Utama: Lanjutkan Belajar */}
        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Lanjutkan belajar</Text>
          )}
        </TouchableOpacity>

        {/* Divider "atau" */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>atau</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Tombol Masuk dengan Google */}
        <TouchableOpacity
          style={styles.googleButton}
          activeOpacity={0.85}
          onPress={handleGooglePress}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <ActivityIndicator color="#1F2937" />
          ) : (
            <View style={styles.googleButtonContent}>
              <Ionicons
                name="logo-google"
                size={18}
                color="#EA4335"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Tombol Sekunder: Coba sebagai tamu */}
        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.85}
          onPress={handleGuest}
          disabled={guestLoading}
        >
          {guestLoading ? (
            <ActivityIndicator color="#1F2937" />
          ) : (
            <Text style={styles.secondaryButtonText}>Coba sebagai tamu</Text>
          )}
        </TouchableOpacity>

        {/* Footer: Belum punya akun? Daftar */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={onGoRegister} hitSlop={8}>
            <Text style={styles.footerLink}>Daftar</Text>
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
    paddingTop: 36,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#EBEBEB',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  logoCross1: {
    position: 'absolute',
    top: -10,
    left: 33,
    width: 1,
    height: 90,
    backgroundColor: '#D1D5DB',
    transform: [{ rotate: '45deg' }],
  },
  logoCross2: {
    position: 'absolute',
    top: -10,
    left: 33,
    width: 1,
    height: 90,
    backgroundColor: '#D1D5DB',
    transform: [{ rotate: '-45deg' }],
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1E1E1E',
    lineHeight: 38,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 21,
    color: '#555555',
    marginBottom: 28,
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
  rowOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 24,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  rememberText: {
    fontSize: 13,
    color: '#4B5563',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1E1E',
    textDecorationLine: 'underline',
  },
  primaryButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: '#3A3A3C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 13,
    color: '#6B7280',
  },
  googleButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1F2937',
  },
  secondaryButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  secondaryButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1F2937',
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

