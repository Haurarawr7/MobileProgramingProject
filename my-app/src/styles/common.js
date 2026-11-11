import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

// Catatan: dengan font custom, JANGAN pakai fontWeight.
// Pilih bobot lewat fontFamily (sans / sansMedium / sansSemi).

const OUTLINE = 1.5;

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  screen: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  greeting: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.ink,
    marginBottom: 2,
  },
  title: {
    fontFamily: FONTS.serif,
    fontSize: 30,
    lineHeight: 36,
    color: COLORS.ink,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: OUTLINE,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
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
  mHeaderTitle: {
    fontFamily: FONTS.serif,
    fontSize: 40,
    lineHeight: 46,
    color: COLORS.ink,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: FONTS.serif,
    fontSize: 28,
    lineHeight: 34,
    color: COLORS.ink,
  },
  sectionTitleSolo: { marginBottom: 14 },
  linkAll: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.ink,
    textDecorationLine: 'underline',
  },

  // Summary (Home & Profil)
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: OUTLINE,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
  },
  summaryValue: {
    fontFamily: FONTS.serif,
    fontSize: 32,
    lineHeight: 36,
    color: COLORS.blue,
    marginBottom: 4,
  },
  summaryLabel: { fontFamily: FONTS.sans, fontSize: 12, color: COLORS.ink },

  // Buttons: kuning, outline ink (tombol utama)
  quizButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: OUTLINE,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quizButtonText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.ink,
  },
  // Tombol sekunder / destruktif: outline merah
  logoutButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: OUTLINE,
    borderColor: COLORS.red,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.red,
  },

  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 8,
    borderWidth: OUTLINE,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    marginBottom: 28,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: FONTS.sans,
    fontSize: 15,
    color: COLORS.ink,
  },

  // Filter chip: pill, aktif = kuning
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: OUTLINE,
    borderColor: COLORS.blue,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.ink,
  },
  filterText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.blue,
  },
  filterTextActive: { color: COLORS.ink },

  // Misc
  activityDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.sky,
  },
  emptyBox: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyDesc: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.ink,
    textAlign: 'center',
  },

  // Form (Scan -> Form, Generate)
  formBackIcon: { marginBottom: 16 },
  formTitle: { marginBottom: 24 },
  formField: { marginBottom: 16 },
  formInputBox: { marginBottom: 0 },
  formInput: { marginLeft: 0 },
});