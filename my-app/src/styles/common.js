import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

// Style yang dipakai di banyak halaman.
// Style khusus satu halaman ada di file halaman itu sendiri.
export default StyleSheet.create({
  safe: { flex: 1 },
  screen: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  greeting: { fontSize: 14, color: COLORS.text, marginBottom: 2 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header halaman dengan tombol back
  mScreen: { flex: 1, paddingTop: 16 },
  mHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  mHeaderTitle: { fontSize: 26, fontWeight: '800', color: COLORS.primary },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: COLORS.primary },
  sectionTitleSolo: { marginBottom: 14 },
  linkAll: {
    fontSize: 13,
    color: COLORS.text,
    textDecorationLine: 'underline',
  },

  // Summary (Home & Profil)
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.addGold,
    marginBottom: 6,
  },
  summaryLabel: { fontSize: 12, color: COLORS.text },

  // Buttons
  quizButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quizButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
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

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    paddingHorizontal: 14,
    marginBottom: 28,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.primary,
  },

  // Filter chip (dipakai di Generate)
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  filterTextActive: { color: COLORS.white },

  // Misc
  activityDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.addAmber,
  },
  emptyBox: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.text,
    textAlign: 'center',
  },

  // Form (Scan -> Form, Generate)
  formBackIcon: { marginBottom: 16 },
  formTitle: { marginBottom: 24 },
  formField: { marginBottom: 16 },
  formInputBox: { marginBottom: 0 },
  formInput: { marginLeft: 0 },
});
