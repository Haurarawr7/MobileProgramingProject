import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const COLORS = {
  primary: '#102A6B',
  primaryMid: '#015185',
  secondary: '#B3282D',
  addAmber: '#CEA273',
  addSky: '#5990C0',
  addCream: '#FCEDD3',
  addCreamDark: '#F3DDB8',
  surface: '#FFF7E8',
  text: '#3F4B73',
  muted: '#7F89A8',
  white: '#FFFFFF',
};

const ILLUSTRATION = require('./assets/images/icon.png');

const STREAK_TOTAL = 7;
const STREAK_ACTIVE = 4;

const SUMMARY = [
  { id: 's1', value: '84%', label: 'Kemajuan materi' },
  { id: 's2', value: '4', label: 'Peringkat' },
  { id: 's3', value: '360', label: 'Poin' },
];

const ACTIVITIES = [
  {
    id: '1',
    icon: 'document-text-outline',
    title: 'Materi Pencarian Sequential Selesai',
    subtitle: 'Hebat, kamu barusaja menyelesaikan materi Pencarian Berurutan',
    time: 'Hari ini',
  },
];

const MATERI = [
  { id: 'm1', title: 'Sequential Search', level: 'SMA', topic: 'Struktur Data', duration: '12 menit' },
  { id: 'm2', title: 'Binary Search', level: 'SMA', topic: 'Struktur Data', duration: '15 menit' },
  { id: 'm3', title: 'Bubble Sort', level: 'SMA', topic: 'Algoritma', duration: '14 menit' },
  { id: 'm4', title: 'Selection Sort', level: 'SMA', topic: 'Algoritma', duration: '14 menit' },
  { id: 'm5', title: 'Quick Sort', level: 'SMA', topic: 'Algoritma', duration: '20 menit' },
];

const TABS = [
  { key: 'home', label: 'Beranda', icon: 'home-outline' },
  { key: 'materi', label: 'Materi', icon: 'grid-outline' },
  { key: 'saved', label: 'Tersimpan', icon: 'bookmark-outline' },
  { key: 'profile', label: 'Profil', icon: 'person-outline' },
];

const SAVED_INITIAL = [
  { id: 'v1', title: 'Binary Search', topic: 'Struktur Data', duration: '15 menit', type: 'Materi' },
  { id: 'v2', title: 'Bubble Sort', topic: 'Algoritma', duration: '14 menit', type: 'Materi' },
  { id: 'v3', title: 'Kuis Pencarian Data', topic: 'Struktur Data', duration: '10 soal', type: 'Kuis' },
  { id: 'v4', title: 'Quick Sort', topic: 'Algoritma', duration: '20 menit', type: 'Materi' },
];

const SAVED_FILTERS = ['Semua', 'Materi', 'Kuis'];

const PROFILE = {
  name: 'Siswa Informatika',
  school: 'SMA Negeri 1',
  grade: 'Kelas X',
};

const BADGES = [
  { id: 'b1', icon: 'flame-outline', label: 'Streak 4 hari' },
  { id: 'b2', icon: 'ribbon-outline', label: 'Materi pertama' },
  { id: 'b3', icon: 'trophy-outline', label: '360 poin' },
];

const MENU = [
  { id: 'edit', icon: 'person-outline', label: 'Ubah profil' },
  { id: 'help', icon: 'help-circle-outline', label: 'Bantuan' },
  { id: 'about', icon: 'information-circle-outline', label: 'Tentang aplikasi' },
];

function SectionHeader({ title, linkLabel = 'Lihat semua', onPressLink }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onPressLink}>
        <Text style={styles.linkAll}>{linkLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

function BottomTabBar({ active, onChange }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => onChange(tab.key)} activeOpacity={0.8}>
            <Ionicons name={tab.icon} size={22} color={isActive ? COLORS.primary : COLORS.muted} />
            <Text style={[styles.tabLabel, isActive && { color: COLORS.primary }]}>{tab.label}</Text>
            {isActive && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function StreakRow({ total = STREAK_TOTAL, active = STREAK_ACTIVE }) {
  return (
    <View style={styles.streakRow}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < active;
        const lineFilled = i < active - 1;
        return (
          <React.Fragment key={i}>
            <View style={[styles.streakDot, filled && styles.streakDotActive]} />
            {i < total - 1 && <View style={[styles.streakLine, lineFilled && styles.streakLineActive]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function SummaryCard({ value, label }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function ContinueCard({ progress = 0.5, onPress }) {
  return (
    <View style={styles.featuredCard}>
      <View style={styles.featuredImage}>
        <Image source={ILLUSTRATION} style={StyleSheet.absoluteFill} resizeMode="contain" />
      </View>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTag}>Bagian 1</Text>
        <Text style={styles.featuredTitle}>Pencarian Berurutan</Text>
        <Text style={styles.featuredDesc}>Cari data secara berurutan dan pelajari cara algoritma bekerja.</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.featuredLink}>Lanjutkan →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ActivityItem({ item, isLast }) {
  return (
    <View style={[styles.activityRow, !isLast && styles.activityDivider]}>
      <View style={styles.activityIconBox}>
        <Ionicons name={item.icon} size={20} color={COLORS.text} />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.activitySubtitle} numberOfLines={1}>{item.subtitle}</Text>
      </View>
      <Text style={styles.activityTime}>{item.time}</Text>
    </View>
  );
}

function HomeScreen({ onGoMateri }) {
  const [query, setQuery] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, Siswa</Text>
          <Text style={styles.title}>Beranda Belajar</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={COLORS.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cari materi atau kuis"
          placeholderTextColor={COLORS.muted}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.streakCard}>
        <View style={styles.streakHeader}>
          <Text style={styles.streakTitle}>Streak belajar</Text>
          <Text style={styles.streakMeta}>{STREAK_ACTIVE}/7 hari</Text>
        </View>
        <StreakRow total={STREAK_TOTAL} active={STREAK_ACTIVE} />
      </View>

      <View style={styles.summaryRow}>
        {SUMMARY.map((item) => (
          <SummaryCard key={item.id} value={item.value} label={item.label} />
        ))}
      </View>

      <ContinueCard progress={0.72} onPress={onGoMateri} />

      <SectionHeader title="Aktivitas terbaru" linkLabel="Lihat semua" />
      <View style={styles.activityBox}>
        {ACTIVITIES.map((item, idx) => (
          <ActivityItem key={item.id} item={item} isLast={idx === ACTIVITIES.length - 1} />
        ))}
      </View>
    </ScrollView>
  );
}

function MateriScreen({ onBack }) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 64) / 2;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionTopBar}>
        <TouchableOpacity onPress={onBack} style={styles.topBackButton}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Materi</Text>
      </View>

      <View style={styles.suggestBox}>
        <Text style={styles.suggestMain}>Yuk lanjutkan belajar</Text>
        <Text style={styles.suggestSub}>Rekomendasi materi Berdasarkan progres kamu</Text>
      </View>

      <View style={styles.gridWrap}>
        {MATERI.map((item) => (
          <TouchableOpacity key={item.id} style={[styles.materiCard, { width: cardWidth }]} activeOpacity={0.85}>
            <View style={styles.courseBadge}><Text style={styles.courseBadgeText}>{item.level}</Text></View>
            <Text style={styles.materiTitle}>{item.title}</Text>
            <Text style={styles.materiMeta}>{item.topic}</Text>
            <View style={styles.materiFooter}>
              <Ionicons name="time-outline" size={16} color={COLORS.primaryMid} />
              <Text style={styles.materiTime}>{item.duration}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function SavedScreen() {
  const [filter, setFilter] = useState('Semua');
  const filtered = SAVED_INITIAL.filter((item) => filter === 'Semua' || item.type === filter);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionTopBar}>
        <Text style={styles.title}>Tersimpan</Text>
      </View>

      <View style={styles.filterRow}>
        {SAVED_FILTERS.map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.filterChip, filter === item && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === item && styles.filterChipTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.savedList}>
        {filtered.map((item) => (
          <View key={item.id} style={styles.savedItem}>
            <View style={styles.savedIconWrap}>
              <MaterialCommunityIcons name={item.type === 'Kuis' ? 'clipboard-check-outline' : 'book-open-page-variant'} size={22} color={COLORS.primaryMid} />
            </View>
            <View style={styles.savedInfo}>
              <Text style={styles.savedTitle}>{item.title}</Text>
              <Text style={styles.savedMeta}>{item.topic} · {item.duration}</Text>
            </View>
            <View style={styles.savedTypePill}>
              <Text style={styles.savedTypeText}>{item.type}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function ProfileScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionTopBar}>
        <Text style={styles.title}>Profil</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{PROFILE.name}</Text>
          <Text style={styles.profileSub}>{PROFILE.school}</Text>
          <Text style={styles.profileSub}>{PROFILE.grade}</Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        {BADGES.map((badge) => (
          <View key={badge.id} style={styles.badge}>
            <View style={styles.badgeIcon}>
              <Ionicons name={badge.icon} size={22} color={COLORS.primaryMid} />
            </View>
            <Text style={styles.badgeLabel}>{badge.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.menuBox}>
        {MENU.map((m, i) => (
          <TouchableOpacity key={m.id} style={[styles.menuRow, i < MENU.length - 1 && styles.activityDivider]} activeOpacity={0.7}>
            <Ionicons name={m.icon} size={22} color={COLORS.text} />
            <Text style={styles.menuLabel}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.secondary} />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  let screen;
  switch (activeTab) {
    case 'home':
      screen = <HomeScreen onGoMateri={() => setActiveTab('materi')} />;
      break;
    case 'materi':
      screen = <MateriScreen onBack={() => setActiveTab('home')} />;
      break;
    case 'saved':
      screen = <SavedScreen />;
      break;
    default:
      screen = <ProfileScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.screen}>{screen}</View>
        <BottomTabBar active={activeTab} onChange={setActiveTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  screen: { flex: 1, backgroundColor: COLORS.surface },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  greeting: { fontSize: 14, color: COLORS.text, marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.addCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D7B0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 18,
  },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14 },
  streakCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    padding: 16,
    marginBottom: 18,
  },
  streakHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  streakTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  streakMeta: { fontSize: 13, color: COLORS.primaryMid, fontWeight: '700' },
  streakRow: { flexDirection: 'row', alignItems: 'center' },
  streakDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E4F0',
  },
  streakDotActive: { backgroundColor: COLORS.addAmber },
  streakLine: {
    width: 26,
    height: 3,
    borderRadius: 3,
    backgroundColor: '#E0E4F0',
    marginHorizontal: 4,
  },
  streakLineActive: { backgroundColor: COLORS.addAmber },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  summaryLabel: { marginTop: 6, fontSize: 12, color: COLORS.text, textAlign: 'center' },
  featuredCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    overflow: 'hidden',
    marginBottom: 20,
  },
  featuredImage: {
    height: 140,
    backgroundColor: COLORS.addCream,
  },
  featuredInfo: { padding: 16 },
  featuredTag: { fontSize: 12, color: COLORS.primaryMid, fontWeight: '700', marginBottom: 6 },
  featuredTitle: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  featuredDesc: { fontSize: 13, color: COLORS.text, marginTop: 8, lineHeight: 18 },
  progressTrack: {
    height: 8,
    backgroundColor: '#F0E6D8',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 14,
    marginBottom: 10,
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primaryMid, borderRadius: 10 },
  featuredLink: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  linkAll: { fontSize: 12, color: COLORS.primaryMid, fontWeight: '700' },
  activityBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 6,
  },
  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  activityDivider: { borderBottomWidth: 1, borderBottomColor: '#F2E5D0' },
  activityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.addCream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  activitySubtitle: { marginTop: 4, fontSize: 11, color: COLORS.text },
  activityTime: { fontSize: 11, color: COLORS.muted, marginLeft: 8 },
  sectionTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  topBackButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.addCream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestBox: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    padding: 16,
    marginBottom: 18,
  },
  suggestMain: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  suggestSub: { marginTop: 4, fontSize: 12, color: COLORS.text },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  materiCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    padding: 12,
    minHeight: 160,
  },
  courseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.addCreamDark,
    marginBottom: 10,
  },
  courseBadgeText: { color: COLORS.primaryMid, fontSize: 11, fontWeight: '700' },
  materiTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primary, marginBottom: 6 },
  materiMeta: { fontSize: 12, color: COLORS.text },
  materiFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  materiTime: { marginLeft: 6, fontSize: 12, color: COLORS.primaryMid },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    backgroundColor: COLORS.white,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  filterChipTextActive: { color: COLORS.white },
  savedList: { gap: 12 },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    padding: 12,
  },
  savedIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.addCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedInfo: { flex: 1, marginLeft: 12 },
  savedTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  savedMeta: { marginTop: 4, fontSize: 11, color: COLORS.text },
  savedTypePill: {
    backgroundColor: COLORS.addCreamDark,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  savedTypeText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryMid },
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
  profileName: { fontSize: 18, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  profileSub: { fontSize: 13, color: COLORS.text },
  badgeRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
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
  badgeLabel: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  menuBox: { borderRadius: 8, borderWidth: 1, borderColor: COLORS.addAmber, paddingHorizontal: 14, marginBottom: 24 },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.primary },
  logoutButton: {
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: COLORS.secondary },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.addAmber,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.surface,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  tabIndicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.addAmber,
    marginTop: 4,
  },
});
