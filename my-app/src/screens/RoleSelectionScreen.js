import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import {
  TEACHER_EMAIL,
  USER_ROLE_STUDENT,
  USER_ROLE_TEACHER,
} from '../constants/userRoles';

const ROLES = [
  {
    id: USER_ROLE_TEACHER,
    title: 'Guru',
    description: `Khusus ${TEACHER_EMAIL}. Buat dan bagikan QR pelajaran.`,
    icon: 'school-outline',
  },
  {
    id: USER_ROLE_STUDENT,
    title: 'Siswa',
    description: 'Pindai QR dari guru dan mulai belajar.',
    icon: 'book-outline',
  },
];

export default function RoleSelectionScreen({ onSelectRole }) {
  return (
    <View style={styles.container}>
      <View style={styles.brandBadge}>
        <Text style={styles.brandText}>Logiterm</Text>
      </View>
      <Text style={styles.title}>Masuk sebagai siapa?</Text>
      <Text style={styles.subtitle}>
        Pilih peranmu untuk melanjutkan.
      </Text>

      <View style={styles.options}>
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role.id}
            accessibilityRole="button"
            style={styles.option}
            activeOpacity={0.85}
            onPress={() => onSelectRole(role.id)}
          >
            <View style={styles.iconBox}>
              <Ionicons name={role.icon} size={28} color={COLORS.ink} />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{role.title}</Text>
              <Text style={styles.optionDescription}>{role.description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={COLORS.ink} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },
  brandBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.sky,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 20,
  },
  brandText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.ink,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 36,
    lineHeight: 42,
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.text,
    marginTop: 8,
    marginBottom: 24,
  },
  options: {
    gap: 14,
  },
  option: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 12,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  iconBox: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.yellow,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FONTS.sansSemi,
    fontSize: 16,
    color: COLORS.ink,
    marginBottom: 4,
  },
  optionDescription: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.text,
  },
});
