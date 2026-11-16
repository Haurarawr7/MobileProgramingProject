import React, { useMemo, useRef, useState } from 'react';
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';
import common from '../styles/common';

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`;
};

const createPlayerHtml = (videoId) => `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <style>
      html, body, #player { width: 100%; height: 100%; margin: 0; background: #22222F; }
    </style>
  </head>
  <body>
    <div id="player"></div>
    <script>
      var player;
      function send(type, data) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({ type: type }, data || {})));
        }
      }
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          videoId: '${videoId}',
          playerVars: { playsinline: 1, enablejsapi: 1, origin: 'https://www.youtube.com' },
          events: {
            onReady: function() {
              send('ready');
              setInterval(function() {
                if (!player || !player.getDuration) return;
                send('time', {
                  currentTime: player.getCurrentTime(),
                  duration: player.getDuration()
                });
              }, 500);
            },
            onError: function(event) { send('error', { code: event.data }); }
          }
        });
      }
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    </script>
  </body>
</html>`;

export default function VideoLessonScreen({
  materi,
  video,
  onBack,
  onProgress,
}) {
  const webView = useRef(null);
  const handledCheckpoints = useRef(new Set());
  const activeCheckpoint = useRef(null);
  const resultsRef = useRef({});
  const durationRef = useRef(0);
  const previousTime = useRef(0);
  const [playback, setPlayback] = useState({ currentTime: 0, duration: 0 });
  const [checkpoint, setCheckpoint] = useState(null);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState({});
  const [playerError, setPlayerError] = useState('');
  const html = useMemo(
    () => (video ? createPlayerHtml(video.videoId) : ''),
    [video?.videoId],
  );

  const runPlayerCommand = (command) => {
    webView.current?.injectJavaScript(
      `if (window.player) { ${command} } true;`,
    );
  };

  const closeCheckpoint = () => {
    activeCheckpoint.current = null;
    setCheckpoint(null);
    setSelected(null);
  };

  const handleMessage = (event) => {
    let message;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch (error) {
      console.warn('Pesan dari pemutar video tidak valid', error);
      return;
    }

    if (message.type === 'error') {
      setPlayerError(`Video YouTube tidak dapat diputar (kode ${message.code}).`);
      return;
    }

    if (message.type !== 'time') return;

    const currentTime = Number(message.currentTime) || 0;
    const duration = Number(message.duration) || 0;
    const lastTime = previousTime.current;
    previousTime.current = currentTime;
    durationRef.current = duration;
    setPlayback({ currentTime, duration });

    if (activeCheckpoint.current || duration <= 0) return;
    const nextCheckpoint = video.checkpoints.find(
      (item) =>
        !handledCheckpoints.current.has(item.id) &&
        lastTime < duration * item.at &&
        currentTime >= duration * item.at &&
        currentTime < duration * item.at + 1,
    );

    if (nextCheckpoint) {
      handledCheckpoints.current.add(nextCheckpoint.id);
      activeCheckpoint.current = nextCheckpoint;
      setCheckpoint(nextCheckpoint);
      setSelected(null);
      runPlayerCommand('player.pauseVideo();');
    }
  };

  const saveResult = (item, value) => {
    const nextResults = { ...resultsRef.current, [item.id]: value };
    resultsRef.current = nextResults;
    setResults(nextResults);
    const correctCount = Object.values(nextResults).filter(
      (result) => result === 'correct',
    ).length;
    onProgress?.(
      materi.id,
      video.checkpoints.length
        ? correctCount / video.checkpoints.length
        : 0,
    );
  };

  const selectOption = (index) => {
    if (selected !== null || !checkpoint) return;
    setSelected(index);
    if (index === checkpoint.answer) {
      saveResult(checkpoint, 'correct');
    }
  };

  const continueVideo = () => {
    if (!checkpoint) return;
    if (selected !== checkpoint.answer) {
      saveResult(checkpoint, 'wrong');
    }
    closeCheckpoint();
    runPlayerCommand('player.playVideo();');
  };

  const replayCheckpoint = () => {
    if (!checkpoint || !durationRef.current) return;
    const replayAt = Math.max(
      0,
      durationRef.current * checkpoint.at - 8,
    );
    closeCheckpoint();
    runPlayerCommand(`player.seekTo(${replayAt}, true); player.playVideo();`);
    handledCheckpoints.current.delete(checkpoint.id);
  };

  const jumpToChapter = (chapter) => {
    if (!durationRef.current) return;
    closeCheckpoint();
    runPlayerCommand(
      `player.seekTo(${durationRef.current * chapter.at}, true); player.playVideo();`,
    );
  };

  const openVideoOnWeb = async () => {
    try {
      await Linking.openURL(`https://www.youtube.com/watch?v=${video.videoId}`);
    } catch (error) {
      console.warn('Gagal membuka video YouTube', error);
      setPlayerError('Video tidak dapat dibuka. Periksa koneksi internet lalu coba lagi.');
    }
  };

  if (!materi || !video) {
    return (
      <View style={common.mScreen}>
        <View style={common.mHeader}>
          <TouchableOpacity onPress={onBack} hitSlop={12}>
            <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={common.mHeaderTitle}>Video pelajaran</Text>
        </View>
        <View style={common.emptyBox}>
          <Text style={common.emptyDesc}>Video untuk materi ini belum tersedia.</Text>
        </View>
      </View>
    );
  }

  const correctCount = Object.values(results).filter(
    (result) => result === 'correct',
  ).length;
  const activeChapterIndex = video.chapters.reduce(
    (activeIndex, chapter, index) =>
      playback.duration && playback.currentTime >= playback.duration * chapter.at
        ? index
        : activeIndex,
    0,
  );

  return (
    <View style={common.mScreen}>
      <View style={common.mHeader}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="arrow-back" size={28} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={[common.mHeaderTitle, styles.headerTitle]} numberOfLines={1}>
          {materi.title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.videoBox}>
          {Platform.OS === 'web' ? (
            <View style={styles.webFallback}>
              <Ionicons name="logo-youtube" size={38} color={COLORS.red} />
              <Text style={styles.webFallbackText}>
                Pemutaran di dalam aplikasi tersedia di Android dan iOS.
              </Text>
              <TouchableOpacity
                style={styles.webButton}
                onPress={openVideoOnWeb}
                activeOpacity={0.85}
              >
                <Text style={styles.webButtonText}>Buka video di YouTube</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              ref={webView}
              source={{ html, baseUrl: 'https://www.youtube.com' }}
              style={styles.webView}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction
              originWhitelist={['https://*']}
              onMessage={handleMessage}
              onError={(event) => {
                setPlayerError(
                  event.nativeEvent.description || 'Pemutar video mengalami gangguan.',
                );
              }}
            />
          )}
          {checkpoint ? (
            <View style={styles.overlay}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.checkpointTag}>Checkpoint</Text>
                <Text style={styles.question}>{checkpoint.question}</Text>
                {checkpoint.options.map((option, index) => {
                  const answered = selected !== null;
                  const isCorrect = answered && index === checkpoint.answer;
                  const isWrong = answered && index === selected && !isCorrect;
                  return (
                    <TouchableOpacity
                      key={option}
                      activeOpacity={0.85}
                      onPress={() => selectOption(index)}
                      style={[
                        styles.option,
                        isCorrect && styles.correctOption,
                        isWrong && styles.wrongOption,
                      ]}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
                {selected !== null ? (
                  <>
                    <Text style={styles.explanation}>
                      {selected === checkpoint.answer ? 'Benar! ' : 'Belum tepat. '}
                      {checkpoint.explanation}
                    </Text>
                    <View style={styles.actionRow}>
                      {selected !== checkpoint.answer ? (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.replayButton]}
                          onPress={replayCheckpoint}
                        >
                          <Text style={styles.actionText}>Ulangi bagian</Text>
                        </TouchableOpacity>
                      ) : null}
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={continueVideo}
                      >
                        <Text style={styles.actionText}>Lanjut</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : null}
              </ScrollView>
            </View>
          ) : null}
        </View>

        {playerError ? (
          <Text accessibilityRole="alert" style={styles.errorText}>
            {playerError}
          </Text>
        ) : null}

        <View style={styles.summary}>
          <Ionicons name="flag-outline" size={18} color={COLORS.ink} />
          <Text style={styles.summaryText}>
            Checkpoint benar: {correctCount}/{video.checkpoints.length}
          </Text>
        </View>

        <Text style={[common.sectionTitle, common.sectionTitleSolo]}>Bab video</Text>
        {video.chapters.map((chapter, index) => (
          <TouchableOpacity
            key={chapter.title}
            activeOpacity={0.85}
            onPress={() => jumpToChapter(chapter)}
            style={[
              styles.chapter,
              index === activeChapterIndex && styles.chapterActive,
            ]}
          >
            <Text style={styles.chapterTime}>
              {formatTime(playback.duration * chapter.at)}
            </Text>
            <Text style={styles.chapterTitle} numberOfLines={2}>
              {chapter.title}
            </Text>
            {video.checkpoints.some(
              (item) => item.at >= chapter.at &&
                item.at < (video.chapters[index + 1]?.at ?? 1),
            ) ? (
              <Ionicons
                name="help-circle-outline"
                size={22}
                color={COLORS.blue}
              />
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  headerTitle: { flex: 1, fontSize: 30, lineHeight: 38 },
  videoBox: {
    aspectRatio: 16 / 9,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.ink,
    overflow: 'hidden',
    marginBottom: 14,
  },
  webView: { flex: 1, backgroundColor: COLORS.ink },
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  webFallbackText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.white,
    textAlign: 'center',
  },
  webButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.yellow,
  },
  webButtonText: { fontFamily: FONTS.sansMedium, color: COLORS.ink },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(34,34,47,0.95)',
    padding: 14,
  },
  checkpointTag: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.yellow,
    marginBottom: 4,
  },
  question: {
    fontFamily: FONTS.sansSemi,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.white,
    marginBottom: 10,
  },
  option: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
    marginBottom: 6,
  },
  correctOption: { backgroundColor: COLORS.mint },
  wrongOption: { backgroundColor: COLORS.pink },
  optionText: { fontFamily: FONTS.sans, fontSize: 13, color: COLORS.ink },
  explanation: {
    fontFamily: FONTS.sans,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.white,
    marginTop: 6,
  },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginBottom: 4 },
  actionButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replayButton: { backgroundColor: COLORS.white },
  actionText: { fontFamily: FONTS.sansMedium, fontSize: 13, color: COLORS.ink },
  errorText: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.red,
    marginBottom: 12,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.sky,
    marginBottom: 24,
  },
  summaryText: { fontFamily: FONTS.sansMedium, fontSize: 13, color: COLORS.ink },
  chapter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.white,
    marginBottom: 10,
  },
  chapterActive: { backgroundColor: COLORS.yellow },
  chapterTime: { fontFamily: FONTS.sansMedium, fontSize: 12, color: COLORS.text, width: 38 },
  chapterTitle: { flex: 1, fontFamily: FONTS.sansMedium, fontSize: 14, color: COLORS.ink },
});
