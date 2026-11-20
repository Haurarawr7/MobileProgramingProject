import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { MENU } from '../constants/data';
import common from '../styles/common';
import SummaryCard from '../components/SummaryCard';

const EMPTY_LEARNING_STATS = {
  completedLessons: 0,
  quizCount: 0,
  points: 0,
  summary: [],
};

export default function ProfileScreen({
  onBack,
  onLogout,
  user,
  learningStats = EMPTY_LEARNING_STATS,
  onSaveProfile,
  onOpenInfo,
}) {
  const [notif, setNotif] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileDraft, setProfileDraft] = useState(null);
  const name = profileDraft?.name ?? user?.name ?? '';
  const school = profileDraft?.school ?? user?.school ?? '';
  const grade = profileDraft?.grade ?? user?.grade ?? '';
  const displayName = user?.name || 'Siswa';
  const initial = displayName.charAt(0).toUpperCase();

  const startEditing = () => {
    setProfileDraft({
      name: user?.name || '',
      school: user?.school || '',
      grade: user?.grade || '',
    });
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Nama belum diisi', 'Masukkan nama sebelum menyimpan profil.');
      return;
    }

    setSaving(true);
    try {
      const result = await onSaveProfile?.({ name, school, grade });
      if (!result?.success) {
        Alert.alert('Gagal menyimpan profil', result?.error || 'Silakan coba lagi.');
        return;
      }
      setEditing(false);
      setProfileDraft(null);
    } catch (error) {
      console.warn('Gagal menyimpan profil', error);
      Alert.alert('Gagal menyimpan profil', 'Periksa koneksi internet lalu coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const profileBadges = [
    learningStats.completedLessons > 0
      ? { id: 'first-lesson', icon: 'book-outline', label: 'Mulai belajar' }
      : null,
    learningStats.quizCount > 0
      ? { id: 'first-quiz', icon: 'help-circle-outline', label: 'Kuis pertama' }
      : null,
    learningStats.points >= 50
      ? { id: 'points', icon: 'trophy-outline', label: '50 poin' }
      : null,
  ].filter(Boolean);

  return (
    <ScrollView
      contentContainerStyle={common.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={onBack}
        hitSlop={12}
        style={{ marginBottom: 16 }}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
      </TouchableOpacity>

      {/* Header */}
      <View style={common.header}>
        <View>
          <Text style={common.greeting}>Akun kamu</Text>
          <Text style={common.title}>Profil</Text>
        </View>
      </View>

      {/* Identitas */}
      <View style={styles.profileCard}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.profileSub}>{user?.email || 'Akun tamu'}</Text>
          {user?.school || user?.grade ? (
            <Text style={styles.profileSub}>
              {[user.grade, user.school].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Edit profil"
          onPress={() => {
            if (editing) {
              setEditing(false);
              setProfileDraft(null);
            } else {
              startEditing();
            }
          }}
          hitSlop={10}
        >
          <Ionicons
            name={editing ? 'close-outline' : 'create-outline'}
            size={22}
            color={COLORS.ink}
          />
        </TouchableOpacity>
      </View>

      {editing ? (
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>Edit profil</Text>
          {[
            { label: 'Nama', key: 'name', value: name, placeholder: 'Nama kamu' },
            { label: 'Sekolah', key: 'school', value: school, placeholder: 'Nama sekolah' },
            { label: 'Kelas', key: 'grade', value: grade, placeholder: 'Contoh: Kelas X' },
          ].map((field) => (
            <View key={field.label} style={styles.editField}>
              <Text style={styles.editLabel}>{field.label}</Text>
              <TextInput
                accessibilityLabel={field.label}
                style={styles.editInput}
                value={field.value}
                onChangeText={(value) =>
                  setProfileDraft((current) => ({ ...current, [field.key]: value }))
                }
                placeholder={field.placeholder}
                placeholderTextColor={COLORS.muted}
                autoCapitalize="words"
              />
            </View>
          ))}
          <TouchableOpacity
            disabled={saving}
            style={styles.saveButton}
            onPress={saveProfile}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.ink} />
            ) : (
              <Text style={styles.saveButtonText}>Simpan ke akun</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Ringkasan */}
      <Text style={[common.sectionTitle, common.sectionTitleSolo]}>
        Ringkasan Belajar
      </Text>
      <View style={common.summaryRow}>
        {learningStats.summary.map((item) => (
          <SummaryCard key={item.id} value={item.value} label={item.label} isProfile />
        ))}
      </View>

      {/* Pencapaian */}
      <Text style={[common.sectionTitle, common.sectionTitleSolo]}>
        Pencapaian
      </Text>
      <View style={styles.badgeRow}>
        {profileBadges.length ? profileBadges.map((b) => (
          <View key={b.id} style={styles.badge}>
            <View style={styles.badgeIcon}>
              <Ionicons name={b.icon} size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.badgeLabel}>{b.label}</Text>
          </View>
        )) : (
          <Text style={styles.noBadges}>Selesaikan materi atau kuis untuk membuka pencapaian.</Text>
        )}
      </View>

      {/* Pengaturan */}
      <Text style={[common.sectionTitle, common.sectionTitleSolo]}>
        Pengaturan
      </Text>
      <View style={styles.menuBox}>
        <View style={[styles.menuRow, common.activityDivider]}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          <Text style={styles.menuLabel}>Notifikasi belajar</Text>
          <Switch
            value={notif}
            onValueChange={setNotif}
            trackColor={{ false: COLORS.addCreamDark, true: COLORS.primaryMid }}
            thumbColor={COLORS.white}
          />
        </View>
        {MENU.map((m, i) => (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.menuRow,
              i < MENU.length - 1 && common.activityDivider,
            ]}
            activeOpacity={0.7}
            onPress={() => {
              if (m.id === 'edit') {
                if (editing) {
                  setEditing(false);
                  setProfileDraft(null);
                } else {
                  startEditing();
                }
                return;
              }
              onOpenInfo?.(m.id);
            }}
          >
            <Ionicons name={m.icon} size={22} color={COLORS.text} />
            <Text style={styles.menuLabel}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Keluar */}
      <TouchableOpacity
        style={common.logoutButton}
        activeOpacity={0.85}
        onPress={onLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.secondary} />
        <Text style={common.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    gap: 16,
    marginBottom: 28,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '800', color: COLORS.white },
  profileInfo: { flex: 1 },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.sky,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  profileSub: { fontSize: 13, color: COLORS.text },
  editCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    marginBottom: 24,
  },
  editTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 14,
  },
  editField: { marginBottom: 12 },
  editLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  editInput: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addCreamDark,
    paddingHorizontal: 12,
    fontSize: 14,
    color: COLORS.ink,
  },
  saveButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.yellow,
    marginTop: 4,
  },
  saveButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.ink },

  badgeRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  noBadges: { fontSize: 13, color: COLORS.text, marginBottom: 28 },
  badge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.addCreamDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },

  menuBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.primary },
});
