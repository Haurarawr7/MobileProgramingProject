import React from 'react';
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

const CONTENT = {
  help: {
    eyebrow: 'Panduan penggunaan',
    title: 'Bantuan',
    icon: 'help-circle-outline',
    sections: [
      {
        title: 'Mulai belajar',
        body: 'Pilih Materi untuk membaca pelajaran. Selesaikan bacaan dan kuis untuk mencatat progres belajar.',
      },
      {
        title: 'Mini Game dan poin',
        body: 'Buka Mini Game, pilih latihan atau simulasi, lalu selesaikan permainan. Poin yang tersedia dapat digunakan untuk membuka cerita.',
      },
      {
        title: 'Akun dan profil',
        body: 'Buka Profil untuk mengubah nama, sekolah, dan kelas. Gunakan Keluar jika ingin berganti akun.',
      },
      {
        title: 'Data belum tersimpan?',
        body: 'Pastikan perangkat terhubung ke internet dan coba lagi. Progres akun disimpan di Firebase.',
      },
    ],
  },
  about: {
    eyebrow: 'Tentang aplikasi',
    title: 'LogiTerm',
    icon: 'information-circle-outline',
    sections: [
      {
        title: 'Belajar algoritma dengan cara interaktif',
        body: 'LogiTerm membantu siswa mempelajari konsep pencarian dan pengurutan melalui materi, kuis, simulasi, dan permainan latihan.',
      },
      {
        title: 'Peringkat',
        body: 'Peringkat menampilkan poin sepanjang masa dari akun yang masuk. Poin digunakan untuk menunjukkan aktivitas belajar, bukan sebagai sertifikat hasil belajar.',
      },
    ],
  },
};

export default function InfoScreen({ type, onBack }) {
  const content = CONTENT[type] || CONTENT.help;

  return (
    <ScrollView
      contentContainerStyle={common.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Kembali ke profil"
        onPress={onBack}
        hitSlop={12}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
      </TouchableOpacity>

      <View style={common.header}>
        <View>
          <Text style={common.greeting}>{content.eyebrow}</Text>
          <Text style={common.title}>{content.title}</Text>
        </View>
        <Ionicons name={content.icon} size={30} color={COLORS.ink} />
      </View>

      {content.sections.map((section) => (
        <View key={section.title} style={styles.card}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.body}>{section.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backButton: { marginBottom: 16, alignSelf: 'flex-start' },
  card: {
    borderWidth: 1,
    borderColor: COLORS.ink,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.ink,
    marginBottom: 8,
  },
  body: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text,
  },
});
