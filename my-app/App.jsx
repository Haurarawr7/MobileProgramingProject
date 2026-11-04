import React, { useState, useRef, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'react-native-qrcode-svg';

const COLORS = {
  // Primary (biru)
  primary: '#102A6B', // Silent Navy
  primaryMid: '#015185', // Blue Current

  // Secondary (merah)
  secondary: '#B3282D',

  // Tambahan
  addAmber: '#CEA273', // Sandy Amber
  addSky: '#5990C0', // Blue Haze
  addCream: '#FCEDD3', // Light Cream
  addGold: '#aa8631', // Mustard Gold
  addCreamDark: '#F3DDB8',

  // Netral
  surface: '#FFF7E8',
  text: '#3F4B73',
  muted: '#7F89A8',
  white: '#FFFFFF',
};

const ILLUSTRATION = require('./assets/images/tutorial-web.png');
const FORM_FIELD_TYPES = ['text', 'number', 'switch'];
const MAX_FORM_FIELDS = 10;

const isValidFormConfig = (form) =>
  form &&
  typeof form === 'object' &&
  typeof form.title === 'string' &&
  form.title.trim().length > 0 &&
  form.title.trim().length <= 100 &&
  Array.isArray(form.fields) &&
  form.fields.length > 0 &&
  form.fields.length <= MAX_FORM_FIELDS &&
  form.fields.every(
    (field) =>
      field &&
      typeof field.label === 'string' &&
      field.label.trim().length > 0 &&
      field.label.trim().length <= 40 &&
      FORM_FIELD_TYPES.includes(field.type),
  ) &&
  new Set(form.fields.map((field) => field.label.trim().toLowerCase())).size ===
    form.fields.length;

// ---------- Data ----------
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
    subtitle: 'Hebat, kamu baru saja menyelesaikan materi Pencarian Berurutan',
    time: 'Hari ini',
  },
];

// Urut dari Dasar -> Lanjutan
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
  { key: 'saved', label: 'Bookmark', icon: 'bookmark-outline' },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
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

// ---------- Shared components ----------
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
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={
                isActive
                  ? tab.key === 'materi'
                    ? COLORS.secondary
                    : COLORS.primary
                  : COLORS.muted
              }
            />
            <Text
              style={[
                styles.tabLabel,
                isActive && {
                  color: tab.key === 'materi'
                    ? COLORS.secondary
                    : COLORS.primary,
                  fontWeight: '700',
                },
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---------- Home ----------
function StreakBar({ total, active }) {
  return (
    <View style={styles.streakRow}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < active;
        const lineFilled = i < active - 1;
        return (
          <React.Fragment key={i}>
            <View style={[styles.streakDot, filled && styles.streakDotActive]} />
            {i < total - 1 && (
              <View
                style={[styles.streakLine, lineFilled && styles.streakLineActive]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function SummaryCard({ value, label, isProfile = false }) {
  return (
    <View style={styles.summaryCard}>
      <Text
        style={[
          styles.summaryValue,
          isProfile && { color: COLORS.addGold },
        ]}
      >
        {value}
      </Text>
      <Text style={styles.summaryLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}


function ContinueCard({ progress = 0.5, onPress }) {
  return (
    <View style={styles.featuredCard}>
      <View style={styles.featuredImage}>
        <Image
          source={ILLUSTRATION}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
        />
      </View>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTag}>Bagian 1</Text>
        <Text style={styles.featuredTitle}>Pencarian Berurutan</Text>
        <Text style={styles.featuredDesc}>
          Cari data secara berurutan dan pelajari cara algoritma bekerja.
        </Text>
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
        <Text style={styles.activityTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.activitySubtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
      <Text style={styles.activityTime}>{item.time}</Text>
    </View>
  );
}

function HomeScreen({ onGoMateri, onGoScan }) {
  const [query, setQuery] = useState('');

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Halo, Siswa</Text>
          <Text style={styles.title}>Beranda Belajar</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Scan QR form"
            style={styles.iconButton}
            onPress={onGoScan}
          >
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Streak */}
      <SectionHeader title="Streak" linkLabel="Lihat statistik" />
      <StreakBar total={STREAK_TOTAL} active={STREAK_ACTIVE} />

      {/* Ringkasan Belajar */}
      <Text style={[styles.sectionTitle, styles.sectionTitleSolo]}>
        Ringkasan Belajar
      </Text>
      <View style={styles.summaryRow}>
        {SUMMARY.map((s) => (
          <SummaryCard key={s.id} value={s.value} label={s.label} />
        ))}
      </View>

      {/* CTA Kuis */}
      <TouchableOpacity style={styles.quizButton} activeOpacity={0.85}>
        <Text style={styles.quizButtonText}>Kerjakan Kuis Harian</Text>
      </TouchableOpacity>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color={COLORS.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari materi"
          placeholderTextColor={COLORS.muted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Lanjutkan Materi */}
      <SectionHeader title="Lanjutkan Materi" onPressLink={onGoMateri} />
      <ContinueCard progress={0.5} onPress={onGoMateri} />

      {/* Aktivitas Belajar */}
      <SectionHeader title="Aktivitas Belajar" />
      <View>
        {ACTIVITIES.map((item) => (
          <ActivityItem key={item.id} item={item} isLast={false} />
        ))}
      </View>
    </ScrollView>
  );
}



// ---------- QR Form ----------
function ScanScreen({ onBack, onScanned, onGoGenerate }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleScan = ({ data }) => {
    if (scanned) {
      return;
    }

    setScanned(true);
    let form;
    try {
      if (typeof data !== 'string' || data.length > 5000) {
        throw new Error('Invalid QR form data');
      }

      form = JSON.parse(data);
    } catch {
      Alert.alert('QR tidak valid', 'QR ini bukan form yang didukung.');
      setScanned(false);
      return;
    }

    if (!isValidFormConfig(form)) {
      Alert.alert('QR tidak valid', 'QR ini bukan form yang didukung.');
      setScanned(false);
      return;
    }

    onScanned({
      title: form.title.trim(),
      fields: form.fields.map((field) => ({
        type: field.type,
        label: field.label.trim(),
      })),
    });
  };

  return (
    <View style={styles.mScreen}>
      <View style={styles.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.mHeaderTitle}>Scan QR</Text>
      </View>

      {!permission ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyDesc}>Memeriksa izin kamera...</Text>
        </View>
      ) : !permission.granted ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyDesc}>
            Aplikasi membutuhkan izin kamera untuk memindai QR.
          </Text>
          <TouchableOpacity
            style={[styles.quizButton, styles.permissionButton]}
            onPress={requestPermission}
          >
            <Text style={styles.quizButtonText}>Izinkan Kamera</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cameraPreview}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleScan}
          />
        </View>
      )}

      <TouchableOpacity
        accessibilityRole="button"
        style={[styles.logoutButton, styles.scanGenerateButton]}
        onPress={onGoGenerate}
      >
        <MaterialCommunityIcons
          name="qrcode"
          size={20}
          color={COLORS.secondary}
        />
        <Text style={styles.logoutText}>Buat QR Form</Text>
      </TouchableOpacity>
    </View>
  );
}

function DynamicFormScreen({ config, onBack }) {
  const [values, setValues] = useState({});

  const setValue = (label, value) =>
    setValues((currentValues) => ({ ...currentValues, [label]: value }));

  if (!isValidFormConfig(config)) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyDesc}>Data form tidak valid.</Text>
        <TouchableOpacity onPress={onBack} style={styles.formBackButton}>
          <Text style={styles.quizButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        onPress={onBack}
        hitSlop={12}
        style={styles.formBackIcon}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
      </TouchableOpacity>
      <Text style={[styles.title, styles.formTitle]}>{config.title}</Text>

      {config.fields.map((field) => (
        <View key={field.label} style={styles.formField}>
          <Text style={styles.greeting}>{field.label}</Text>
          {field.type === 'switch' ? (
            <Switch
              value={Boolean(values[field.label])}
              onValueChange={(value) => setValue(field.label, value)}
              trackColor={{
                false: COLORS.addCreamDark,
                true: COLORS.primaryMid,
              }}
            />
          ) : (
            <View style={[styles.searchBox, styles.formInputBox]}>
              <TextInput
                style={[styles.searchInput, styles.formInput]}
                keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                placeholder={field.label}
                placeholderTextColor={COLORS.muted}
                value={values[field.label] ?? ''}
                onChangeText={(value) => setValue(field.label, value)}
              />
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity
        style={styles.quizButton}
        onPress={() =>
          Alert.alert(
            'Jawaban Form',
            JSON.stringify(values, null, 2) || 'Tidak ada jawaban.',
          )
        }
      >
        <Text style={styles.quizButtonText}>Kirim</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function GenerateScreen({ onBack }) {
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState([{ type: 'text', label: '' }]);
  const [qrValue, setQrValue] = useState(null);

  const updateField = (index, patch) => {
    setFields((currentFields) =>
      currentFields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...patch } : field,
      ),
    );
    setQrValue(null);
  };

  const addField = () => {
    setFields((currentFields) => [
      ...currentFields,
      { type: 'text', label: '' },
    ]);
    setQrValue(null);
  };

  const removeField = (index) => {
    setFields((currentFields) =>
      currentFields.filter((_, fieldIndex) => fieldIndex !== index),
    );
    setQrValue(null);
  };

  const generate = () => {
    const form = {
      title: title.trim(),
      fields: fields.map((field) => ({
        type: field.type,
        label: field.label.trim(),
      })),
    };

    if (form.title.length > 100) {
      Alert.alert('Judul terlalu panjang', 'Gunakan maksimal 100 karakter.');
      return;
    }
    if (!isValidFormConfig(form)) {
      Alert.alert(
        'Form belum lengkap',
        'Isi judul dan 1–10 field dengan label unik (maksimal 40 karakter).',
      );
      return;
    }

    const value = JSON.stringify(form);
    if (value.length > 2000) {
      Alert.alert('Form terlalu besar', 'Kurangi jumlah atau panjang field.');
      return;
    }
    setQrValue(value);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        onPress={onBack}
        hitSlop={12}
        style={styles.formBackIcon}
      >
        <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
      </TouchableOpacity>
      <Text style={[styles.title, styles.formTitle]}>Buat QR Form</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={[styles.searchInput, styles.formInput]}
          placeholder="Judul form"
          placeholderTextColor={COLORS.muted}
          value={title}
          maxLength={100}
          onChangeText={(value) => {
            setTitle(value);
            setQrValue(null);
          }}
        />
      </View>

      {fields.map((field, index) => (
        <View key={index} style={styles.formField}>
          <View style={[styles.searchBox, styles.formFieldLabelBox]}>
            <TextInput
              style={[styles.searchInput, styles.formInput]}
              placeholder={`Label field ${index + 1}`}
              placeholderTextColor={COLORS.muted}
              value={field.label}
              maxLength={40}
              onChangeText={(value) => updateField(index, { label: value })}
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Hapus field ${index + 1}`}
              onPress={() => removeField(index)}
              disabled={fields.length === 1}
              hitSlop={12}
            >
              <Ionicons
                name="close-circle-outline"
                size={22}
                color={
                  fields.length === 1 ? COLORS.muted : COLORS.secondary
                }
              />
            </TouchableOpacity>
          </View>
          <View style={styles.filterRow}>
            {FORM_FIELD_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => updateField(index, { type })}
                style={[
                  styles.filterChip,
                  field.type === type && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    field.type === type && styles.filterTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={[styles.logoutButton, styles.addFieldButton]}
        onPress={addField}
        disabled={fields.length >= MAX_FORM_FIELDS}
      >
        <Ionicons name="add" size={20} color={COLORS.secondary} />
        <Text style={styles.logoutText}>Tambah field</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.quizButton} onPress={generate}>
        <Text style={styles.quizButtonText}>Generate QR</Text>
      </TouchableOpacity>

      {qrValue ? (
        <View style={styles.generatedQr}>
          <QRCode value={qrValue} size={220} />
        </View>
      ) : null}
    </ScrollView>
  );
}

// ---------- Materi ----------
function LevelSlider({ count, index, onPressDot }) {
  return (
    <View style={styles.levelRow}>
      <Text style={styles.levelLabel}>Dasar</Text>
      <View style={styles.levelTrack}>
        {Array.from({ length: count }).map((_, i) => (
          <React.Fragment key={i}>
            <TouchableOpacity
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              onPress={() => onPressDot(i)}
              style={[styles.levelDot, i === index && styles.levelDotActive]}
            />
            {i < count - 1 && <View style={styles.levelLine} />}
          </React.Fragment>
        ))}
      </View>
      <Text style={styles.levelLabel}>Lanjutan</Text>
    </View>
  );
}

function MateriCard({ item, width, height }) {
  return (
    <View style={[styles.mCard, { width, height }]}>
      {/* Atas: judul + tag */}
      <View style={styles.mCardTop}>
        <Text style={styles.mTitle}>{item.title}</Text>
        <View style={styles.mMetaRow}>
          <View style={styles.mChips}>
            <View style={styles.mChip}>
              <Text style={styles.mChipText}>{item.level}</Text>
            </View>
            <View style={styles.mChip}>
              <Text style={styles.mChipText}>{item.topic}</Text>
            </View>
          </View>
          <Text style={styles.mDuration}>{item.duration}</Text>
        </View>
      </View>

      {/* Pemisah tiket */}
      <View style={styles.mDividerWrap}>
        <View style={[styles.mNotch, { left: -10 }]} />
        <View style={styles.mDashClip}>
          <View style={styles.mDash} />
        </View>
        <View style={[styles.mNotch, { right: -10 }]} />
      </View>

      {/* Bawah: gambar + tombol */}
      <View style={styles.mCardBottom}>
        <View style={styles.mImageWrap}>
          <Image
            source={ILLUSTRATION}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity style={styles.mButton} activeOpacity={0.85}>
          <Text style={styles.mButtonText}>Mulai belajar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MateriScreen({
  onBack,
  initialMateriTitle,
  bookmarks,
  onToggleBookmark,
}) {
  const { width, height } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const initialIndex = MATERI.findIndex((materi) => materi.title === initialMateriTitle);
  const [index, setIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const listRef = useRef(null);

  const CARD_W = width - 64;
  const GAP = 12;
  const INTERVAL = CARD_W + GAP;
  const CARD_H = Math.min(560, height * 0.62);

  useEffect(() => {
    if (initialIndex < 1) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      listRef.current?.scrollTo({ x: initialIndex * INTERVAL, animated: false });
    });

    return () => cancelAnimationFrame(frame);
  }, [initialIndex, INTERVAL]);

  const data = MATERI.filter((m) =>
    m.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  const onScrollEnd = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / INTERVAL);
    setIndex(Math.max(0, Math.min(i, data.length - 1)));
  };

  const goTo = (i) => {
    listRef.current?.scrollTo({ x: i * INTERVAL, animated: true });
    setIndex(i);
  };

  const onChangeQuery = (t) => {
    setQuery(t);
    setIndex(0);
    listRef.current?.scrollTo({ x: 0, animated: false });
  };

  const current = data[index];
  const currentKey = current ? `materi:${current.id}` : null;
  const isBookmarked = currentKey ? bookmarks.includes(currentKey) : false;

  return (
    <View style={styles.mScreen}>
      {/* Header */}
      <View style={styles.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={[styles.mHeaderTitle, { flex: 1 }]}>Materi</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? 'Hapus bookmark' : 'Simpan bookmark'}
          style={[styles.iconButton, isBookmarked && styles.iconButtonActive]}
          disabled={!current}
          onPress={() => onToggleBookmark(currentKey)}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isBookmarked ? COLORS.secondary : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.mSearch}>
        <TextInput
          style={styles.mSearchInput}
          placeholder="Cari materi algoritma"
          placeholderTextColor={COLORS.muted}
          value={query}
          onChangeText={onChangeQuery}
        />
      </View>

      {/* Dasar -> Lanjutan */}
      {data.length > 0 && (
        <LevelSlider count={data.length} index={index} onPressDot={goTo} />
      )}

      {/* Carousel */}
      {data.length > 0 ? (
        <ScrollView
          ref={listRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={INTERVAL}
          snapToAlignment="start"
          decelerationRate="fast"
          onMomentumScrollEnd={onScrollEnd}
          contentContainerStyle={{ paddingHorizontal: 24, gap: GAP }}
          style={styles.mList}
        >
          {data.map((item) => (
            <MateriCard
              key={item.id}
              item={item}
              width={CARD_W}
              height={CARD_H}
            />
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.mEmpty}>Materi tidak ditemukan</Text>
      )}
    </View>
  );
}

// ---------- Tersimpan ----------
function SavedItem({ item, onToggle, onPress }) {
  const isQuiz = item.type === 'Kuis';
  return (
    <View style={styles.savedCard}>

      <TouchableOpacity
        style={styles.savedInfo}
        onPress={() => onPress?.(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.savedTitle} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.savedMeta}>
          <View style={styles.mChip}>
            <Text style={styles.mChipText}>{item.type}</Text>
          </View>

          <Text style={styles.savedSub} numberOfLines={1}>
            {item.topic} · {item.duration}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onToggle(item.bookmarkKey)} hitSlop={12}>
        <Ionicons name="bookmark" size={24} color={COLORS.secondary} />
      </TouchableOpacity>
    </View>
  );
}

function SavedScreen({ items, onToggleBookmark, onOpenItem }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Semua');

  const data = items.filter(
    (i) =>
      (filter === 'Semua' || i.type === filter) &&
      i.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{items.length} item disimpan</Text>
          <Text style={styles.title}>Bookmarks</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color={COLORS.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari yang tersimpan"
          placeholderTextColor={COLORS.muted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {SAVED_FILTERS.map((f) => {
          const active = f === filter;
          return (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, active && styles.filterChipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      {data.length > 0 ? (
        data.map((item) => (
          <SavedItem key={item.bookmarkKey} item={item} onToggle={onToggleBookmark} onPress={onOpenItem} />
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Ionicons name="bookmark-outline" size={40} color={COLORS.addAmber} />
          <Text style={styles.emptyTitle}>
            {items.length === 0 ? 'Belum ada yang tersimpan' : 'Tidak ditemukan'}
          </Text>
          <Text style={styles.emptyDesc}>
            {items.length === 0
              ? 'Ketuk ikon bookmark pada materi untuk menyimpannya di sini.'
              : 'Coba kata kunci atau filter yang lain.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ---------- Profile ----------
function ProfileScreen({onBack}) {
  const [notif, setNotif] = useState(true);
  const initial = PROFILE.name.charAt(0).toUpperCase();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={onBack}
        hitSlop={12}
        style={{ marginBottom: 16 }}
      >
        <Ionicons
          name="arrow-back"
          size={28}
          color={COLORS.secondary}
        />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Akun kamu</Text>
          <Text style={styles.title}>Profil</Text>
        </View>
      </View>

      {/* Identitas */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {PROFILE.name}
          </Text>
          <Text style={styles.profileSub}>
            {PROFILE.grade} · {PROFILE.school}
          </Text>
        </View>
      </View>

      {/* Ringkasan */}
      <Text style={[styles.sectionTitle, styles.sectionTitleSolo]}>
        Ringkasan Belajar
      </Text>
      <View style={styles.summaryRow}>
        {SUMMARY.map((s) => (
          <SummaryCard
            key={s.id}
            value={s.value}
            label={s.label}
            isProfile={true}
          />
        ))}
      </View>

      {/* Pencapaian */}
      <Text style={[styles.sectionTitle, styles.sectionTitleSolo]}>Pencapaian</Text>
      <View style={styles.badgeRow}>
        {BADGES.map((b) => (
          <View key={b.id} style={styles.badge}>
            <View style={styles.badgeIcon}>
              <Ionicons name={b.icon} size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.badgeLabel}>{b.label}</Text>
          </View>
        ))}
      </View>

      {/* Pengaturan */}
      <Text style={[styles.sectionTitle, styles.sectionTitleSolo]}>Pengaturan</Text>
      <View style={styles.menuBox}>
        <View style={[styles.menuRow, styles.activityDivider]}>
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
            style={[styles.menuRow, i < MENU.length - 1 && styles.activityDivider]}
            activeOpacity={0.7}
          >
            <Ionicons name={m.icon} size={22} color={COLORS.text} />
            <Text style={styles.menuLabel}>{m.label}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Keluar */}
      <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.secondary} />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ---------- App ----------
export default function App() {
  const [navigationStack, setNavigationStack] = useState(['home']);
  const [savedItems, setSavedItems] = useState(() =>
    SAVED_INITIAL.map((item) => ({
      ...item,
      bookmarkKey:
        item.type === 'Materi'
          ? `materi:${MATERI.find((materi) => materi.title === item.title)?.id ?? item.id}`
          : `kuis:${item.id}`,
    })),
  );

  // Menentukan materi terpilih berdasarkan page Tersimpan
  const [selectedMateriTitle, setSelectedMateriTitle] = useState(null);
  const [scannedForm, setScannedForm] = useState(null);
  const activeTab = navigationStack[navigationStack.length - 1];
  const bookmarks = savedItems.map((item) => item.bookmarkKey);

  const onToggleBookmark = (bookmarkKey) => {
    setSavedItems((previousItems) => {
      if (previousItems.some((item) => item.bookmarkKey === bookmarkKey)) {
        return previousItems.filter((item) => item.bookmarkKey !== bookmarkKey);
      }

      const [type, id] = bookmarkKey.split(':');
      if (type !== 'materi') {
        return previousItems;
      }

      const materi = MATERI.find((item) => item.id === id);
      if (!materi) {
        return previousItems;
      }

      return [
        ...previousItems,
        {
          id: bookmarkKey,
          bookmarkKey,
          title: materi.title,
          topic: materi.topic,
          duration: materi.duration,
          type: 'Materi',
        },
      ];
    });
  };

  const navigateTo = (nextScreen) => {
    if (nextScreen === activeTab) {
      return;
    }

    setNavigationStack((previousStack) => [...previousStack, nextScreen,]);
  };

  const goBack = () => {
    setNavigationStack((previousStack) => {
      if (previousStack.length <= 1) {
        return ['home'];
      }

      return previousStack.slice(0, -1);
    });
  };

  let screen;
  switch (activeTab) {
    case 'home':
      screen = (
        <HomeScreen
          onGoMateri={() => navigateTo('materi')}
          onGoScan={() => navigateTo('scan')}
        />
      );
      break;
    case 'materi':
      screen = (
        <MateriScreen
          onBack={goBack}
          initialMateriTitle={selectedMateriTitle}
          bookmarks={bookmarks}
          onToggleBookmark={onToggleBookmark}
        />
      );
      break;
    case 'saved':
      screen = (
        <SavedScreen
          items={savedItems}
          onToggleBookmark={onToggleBookmark}
          onOpenItem={(item) => {
            if (item.type === 'Materi') {
              setSelectedMateriTitle(item.title);
              navigateTo('materi');
            }
          }}
        />
      );
      break;
    case 'profile':
      screen = <ProfileScreen onBack={goBack} />;
      break;
    case 'scan':
      screen = (
        <ScanScreen
          onBack={goBack}
          onGoGenerate={() => navigateTo('generate')}
          onScanned={(form) => {
            setScannedForm(form);
            navigateTo('form');
          }}
        />
      );
      break;
    case 'form':
      screen = <DynamicFormScreen config={scannedForm} onBack={goBack} />;
      break;
    case 'generate':
      screen = <GenerateScreen onBack={goBack} />;
      break;

    default:
      screen = (
        <HomeScreen
          onGoMateri={() => navigateTo('materi')}
          onGoScan={() => navigateTo('scan')}
        />
      );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.screen}>{screen}</View>

        {TABS.some((tab) => tab.key === activeTab) ? (
          <BottomTabBar active={activeTab} onChange={navigateTo} />
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
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
  headerActions: { flexDirection: 'row', gap: 12 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: COLORS.addCreamDark,
    borderColor: COLORS.secondary,
  },
  cameraPreview: {
    flex: 1,
    marginHorizontal: 24,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
  },
  permissionButton: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  scanGenerateButton: {
    margin: 24,
  },
  formBackIcon: {
    marginBottom: 16,
  },
  formTitle: {
    marginBottom: 24,
  },
  formField: {
    marginBottom: 16,
  },
  formInputBox: {
    marginBottom: 0,
  },
  formInput: {
    marginLeft: 0,
  },
  formFieldLabelBox: {
    marginBottom: 8,
  },
  addFieldButton: {
    marginBottom: 12,
  },
  formBackButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  generatedQr: {
    alignItems: 'center',
    padding: 24,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },

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

  // Streak
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  streakDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.addCreamDark,
  },
  streakDotActive: { backgroundColor: COLORS.primary },
  streakLine: { flex: 1, height: 6, backgroundColor: COLORS.addCreamDark },
  streakLineActive: { backgroundColor: COLORS.primary },

  // Summary
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

  // Quiz button
  quizButton: {
    height: 52,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  quizButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },

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

  // Featured / Lanjutkan
  featuredCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,

    gap: 14,
    marginBottom: 28,
  },
  featuredImage: {
    width: 90,
    height: 110,
    overflow: 'hidden',
  },
  featuredInfo: { flex: 1 },
  featuredTag: { fontSize: 12, color: COLORS.text, marginBottom: 4 },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  featuredDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.text,
    marginBottom: 10,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.addCreamDark,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: COLORS.primaryMid,
  },
  featuredLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
    textDecorationLine: 'underline',
  },

  // Activity
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  activityDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.addAmber,
  },
  activityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  activityInfo: { flex: 1, marginRight: 8 },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryMid,
    marginBottom: 2,
  },
  activitySubtitle: { fontSize: 12, color: COLORS.text },
  activityTime: { fontSize: 12, color: COLORS.text },

  // Materi screen
  mScreen: { flex: 1, paddingTop: 16 },
  mHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  mHeaderTitle: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  mSearch: {
    marginHorizontal: 24,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  mSearchInput: { fontSize: 15, color: COLORS.primary },

  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  levelLabel: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  levelTrack: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  levelDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.addAmber,
  },
  levelDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  levelLine: { flex: 1, height: 4, backgroundColor: COLORS.white },

  mList: { flexGrow: 0 },
  mEmpty: {
    textAlign: 'center',
    color: COLORS.text,
    marginTop: 48,
    fontSize: 14,
  },

  // Materi card
  mCard: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mCardTop: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 18 },
  mTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 14,
  },
  mMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mChips: { flexDirection: 'row', gap: 8 },
  mChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: COLORS.addCreamDark,
  },
  mChipText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  mDuration: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  mDividerWrap: { height: 20, justifyContent: 'center' },
  mDashClip: { height: 1, overflow: 'hidden', marginHorizontal: 14 },
  mDash: {
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: 1,
  },
  mNotch: {
    position: 'absolute',
    top: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.addCream,
  },

  mCardBottom: { flex: 1, padding: 18, paddingTop: 8 },
  mImageWrap: { flex: 1, marginBottom: 16 },
  mButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mButtonText: { fontSize: 15, fontWeight: '700', color: COLORS.white },

  // Tersimpan
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

  savedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.addAmber,
    marginBottom: 12,
    gap: 14,
  },
  savedIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.addCreamDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedInfo: { flex: 1 },
  savedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },
  savedMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  savedSub: { flex: 1, fontSize: 12, color: COLORS.text },

  emptyBox: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.text,
    textAlign: 'center',
  },

  // Profil
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
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
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

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.addAmber,
    paddingTop: 12,
    paddingBottom: 16,
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
