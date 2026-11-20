import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_IDS = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
};

function GoogleButton({ action, loading, onPress, buttonStyle, contentStyle, textStyle }) {
  return (
    <TouchableOpacity
      style={buttonStyle}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#1F2937" />
      ) : (
        <View style={contentStyle}>
          <Ionicons
            name="logo-google"
            size={18}
            color="#EA4335"
            style={{ marginRight: 10 }}
          />
          <Text style={textStyle}>{action} dengan Google</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function GoogleAuthButton(props) {
  const clientId = Platform.select({
    android: GOOGLE_CLIENT_IDS.androidClientId,
    ios: GOOGLE_CLIENT_IDS.iosClientId,
    default: GOOGLE_CLIENT_IDS.webClientId,
  });

  if (!clientId) {
    return (
      <GoogleButton
        {...props}
        onPress={() =>
          Alert.alert(
            'Google belum dikonfigurasi',
            `Tambahkan EXPO_PUBLIC_GOOGLE_${Platform.OS.toUpperCase()}_CLIENT_ID pada file .env untuk mengaktifkan Google Sign-In.`,
          )
        }
      />
    );
  }

  return <ConfiguredGoogleAuthButton {...props} />;
}

function ConfiguredGoogleAuthButton({
  action,
  loading,
  onLoadingChange,
  onTokens,
  buttonStyle,
  contentStyle,
  textStyle,
}) {
  const [request, response, promptAsync] = Google.useAuthRequest(GOOGLE_CLIENT_IDS);
  const callbacks = useRef({ onLoadingChange, onTokens });

  useEffect(() => {
    callbacks.current = { onLoadingChange, onTokens };
  }, [onLoadingChange, onTokens]);

  useEffect(() => {
    if (!response) return;
    if (response.type !== 'success') {
      callbacks.current.onLoadingChange(false);
      return;
    }

    const idToken = response.params?.id_token || response.authentication?.idToken;
    const accessToken =
      response.authentication?.accessToken || response.params?.access_token;
    if (!idToken) {
      callbacks.current.onLoadingChange(false);
      Alert.alert(
        `Gagal ${action} dengan Google`,
        'Google tidak mengembalikan token autentikasi.',
      );
      return;
    }

    Promise.resolve(callbacks.current.onTokens(idToken, accessToken)).catch((error) => {
      callbacks.current.onLoadingChange(false);
      console.warn('Google authentication response failed', error);
      Alert.alert(`Gagal ${action} dengan Google`, 'Silakan coba lagi.');
    });
  }, [action, response]);

  const handlePress = async () => {
    if (!request) {
      Alert.alert('Google belum siap', 'Tunggu sebentar, lalu coba lagi.');
      return;
    }

    onLoadingChange(true);
    try {
      const result = await promptAsync();
      if (result?.type !== 'success') onLoadingChange(false);
    } catch (error) {
      onLoadingChange(false);
      console.warn('Google authentication prompt failed', error);
      Alert.alert(`Gagal ${action} dengan Google`, 'Silakan coba lagi.');
    }
  };

  return (
    <GoogleButton
      action={action}
      loading={loading}
      onPress={handlePress}
      buttonStyle={buttonStyle}
      contentStyle={contentStyle}
      textStyle={textStyle}
    />
  );
}
