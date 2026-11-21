import React, { useState, useEffect, useRef } from 'react';
import { Alert, ActivityIndicator, View, Text, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { TABS, MATERI } from './src/constants/data';
import { LESSON_CONTENT, buildDailyQuiz } from './src/constants/lessonContent';
import { VIDEO_LESSONS } from './src/constants/videoLessons';
import { STORY_EPISODE_COST } from './src/constants/gameEconomy';
import { COLORS } from './src/constants/colors';
import common from './src/styles/common';
import BottomTabBar from './src/components/BottomTabBar';
import { saveOpened, saveProgress } from './src/services/progress';
import {
  recordLearningActivity,
  subscribeUserData,
  unlockStoryWithPoints,
} from './src/services/userData';

import HomeScreen from './src/screens/HomeScreen';
import MateriScreen from './src/screens/MateriScreen';
import LessonReaderScreen from './src/screens/LessonReaderScreen';
import LessonQuizScreen from './src/screens/LessonQuizScreen';
import VideoLessonScreen from './src/screens/VideoLessonScreen';
import PracticeGameScreen from './src/screens/PracticeGameScreen';
import StoryChatScreen from './src/screens/StoryChatScreen';
import MiniGameScreen from './src/screens/MiniGameScreen';
import GameSetupScreen from './src/screens/GameSetupScreen';
import GamePlayScreen from './src/screens/GamePlayScreen';
import MiniGame1 from './src/screens/inMiniGame1';
import MiniGame2 from './src/screens/inMiniGame2';
import MiniGame3 from './src/screens/inMiniGame3';
import MiniGame4 from './src/screens/inMiniGame4';
import MiniGame5 from './src/screens/inMiniGame5';
import MiniGame6 from './src/screens/inMiniGame6';
import ProfileScreen from './src/screens/ProfileScreen';
import InfoScreen from './src/screens/InfoScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ScanScreen from './src/screens/ScanScreen';
import DynamicFormScreen from './src/screens/DynamicFormScreen';
import GenerateScreen from './src/screens/GenerateScreen';
import LoginScreen from './src/screens/Login';
import SigninScreen from './src/screens/Signin';
import {
  getSavedUser,
  logoutUser,
  saveAuthenticatedProfile,
} from './src/services/auth';
import { useFonts } from 'expo-font';
import { Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold,} from '@expo-google-fonts/poppins';
import { InstrumentSerif_400Regular_Italic } from '@expo-google-fonts/instrument-serif';

const MINI_GAME_SCREENS = {
  m1: MiniGame1,
  m2: MiniGame2,
  m3: MiniGame3,
  m4: MiniGame4,
  m5: MiniGame5,
  m6: MiniGame6,
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [navigationStack, setNavigationStack] = useState(['auth-loading']);
  const [scannedForm, setScannedForm] = useState(null);
  const [scannedLesson, setScannedLesson] = useState(null);
  const [lastOpenedId, setLastOpenedId] = useState(null);
  const [selectedMateriId, setSelectedMateriId] = useState(null);
  const [selectedPracticeGameId, setSelectedPracticeGameId] = useState(null);
  const [gameConfig, setGameConfig] = useState(null);
  const [userData, setUserData] = useState(null);
  const [readingProgress, setReadingProgress] = useState({});
  const [completedMateri, setCompletedMateri] = useState([]);
  const lastSavedProgress = useRef({});
  const [dailyQuestions] = useState(() => buildDailyQuiz(5));
  const lastOpened = MATERI.find((m) => m.id === lastOpenedId) ?? null;
  const points = userData?.points || 0;
  const storyUnlocked = userData?.unlockedStories?.includes('story-binary-search') || false;
  const learningStats = {
    completedLessons: completedMateri.length,
    quizCount: userData?.quizCount || 0,
    points,
    summary: [
      { id: 'lessons', value: completedMateri.length, label: 'Materi' },
      { id: 'quizzes', value: userData?.quizCount || 0, label: 'Kuis' },
      { id: 'points', value: points, label: 'Poin' },
    ],
  };
  const activeTab = navigationStack[navigationStack.length - 1];
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, InstrumentSerif_400Regular_Italic, });

  useEffect(() => {
    getSavedUser().then((savedUser) => {
      if (savedUser) {
        setCurrentUser(savedUser);
        setNavigationStack(['home']);
      } else {
        setNavigationStack(['login']);
      }
    }).catch((error) => {
      console.warn('Gagal memulihkan sesi pengguna', error);
      setNavigationStack(['login']);
    });
  }, []);

  useEffect(() => {
    const uid = currentUser?.uid;
    if (!uid) {
      lastSavedProgress.current = {};
      return undefined;
    }

    lastSavedProgress.current = {};

    return subscribeUserData(
      uid,
      (data) => {
        setUserData(data);
        setReadingProgress(data.readingProgress);
        setCompletedMateri(data.completedMateri);
        setLastOpenedId(data.lastOpenedId);
        setCurrentUser((user) =>
          user?.uid === uid ? { ...user, ...data } : user,
        );
      },
      (error) => {
        console.warn('Gagal menyinkronkan data akun:', error);
        Alert.alert(
          'Gagal menyinkronkan data',
          'Periksa koneksi internet dan coba buka kembali aplikasi.',
        );
      },
    );
  }, [currentUser?.uid]);

  if (!fontsLoaded) return null;

  const handleLoginSuccess = (user) => {
    setUserData(null);
    setReadingProgress({});
    setCompletedMateri([]);
    setLastOpenedId(null);
    lastSavedProgress.current = {};
    setCurrentUser(user);
    setNavigationStack(['home']);
  };

  const handleLogout = async () => {
    const result = await logoutUser();
    if (!result.success) {
      Alert.alert('Gagal Keluar', result.error || 'Silakan coba lagi.');
      return;
    }
    setCurrentUser(null);
    setUserData(null);
    setReadingProgress({});
    setCompletedMateri([]);
    setLastOpenedId(null);
    setSelectedMateriId(null);
    setNavigationStack(['login']);
  };

  const handleRead = (materi) => {
    setLastOpenedId(materi.id);
    setSelectedMateriId(materi.id);
    saveOpened(materi.id, currentUser?.uid).catch((error) => {
      console.warn('Gagal menyimpan materi yang dibuka:', error);
      Alert.alert('Gagal menyimpan progres', 'Periksa koneksi internet lalu coba lagi.');
    });
    navigateTo('reader');
  };

  const handleQuiz = (materi) => {
    setSelectedMateriId(materi.id);
    navigateTo('lesson-quiz');
  };

  const updateReadingProgress = (materiId, progress) => {
    setReadingProgress((current) => ({
      ...current,
      [materiId]: Math.max(current[materiId] || 0, progress),
    }));
    const lastSaved = lastSavedProgress.current[materiId] || 0;
    if (progress - lastSaved >= 0.05) {
      lastSavedProgress.current[materiId] = progress;
      saveProgress(materiId, progress, null, currentUser?.uid).catch((error) => {
        console.warn('Gagal menyimpan progres materi:', error);
        Alert.alert('Gagal menyimpan progres', 'Periksa koneksi internet lalu coba lagi.');
      });
    }
  };

  const finishReading = (materiId) => {
    lastSavedProgress.current[materiId] = 1;
    setReadingProgress((current) => ({ ...current, [materiId]: 1 }));
    setCompletedMateri((current) =>
      current.includes(materiId) ? current : [...current, materiId],
    );
    setLastOpenedId(materiId);
    setSelectedMateriId(materiId);
    saveProgress(materiId, 1, true, currentUser?.uid).catch((error) => {
      console.warn('Gagal menyelesaikan progres materi:', error);
      Alert.alert('Gagal menyimpan progres', 'Periksa koneksi internet lalu coba lagi.');
    });
    recordLearningActivity(currentUser.uid, {
      activityId: `lesson_completed_${materiId}`,
      result: {
        kind: 'lesson',
        icon: 'book-outline',
        title: 'Materi selesai',
        subtitle: MATERI.find((item) => item.id === materiId)?.title || materiId,
      },
    }).catch((error) => {
      console.warn('Gagal menyimpan aktivitas materi:', error);
    });
    navigateTo('lesson-quiz');
  };

  const handleQuizFinished = (quizId, title, result) => {
    recordLearningActivity(currentUser.uid, {
      activityId: result.activityId,
      result: {
        kind: 'quiz',
        icon: 'help-circle-outline',
        title,
        subtitle: `${result.correctCount} dari ${result.totalQuestions} benar`,
        correctCount: result.correctCount,
        totalQuestions: result.totalQuestions,
        quizId,
      },
    }).catch((error) => {
      console.warn('Gagal menyimpan hasil kuis:', error);
      Alert.alert('Gagal menyimpan hasil', 'Hasil kuis belum tersinkron ke akun.');
    });
  };

  const awardGamePoints = async (gameId, result = {}) => {
    const practice = gameId === 'flashcards' || gameId === 'matching' || gameId === 'speed-quiz';
    const rewardKey = practice
      ? `practice-${gameId}`
      : gameId.startsWith('simulation-')
        ? gameId
        : `simulation-${gameId}`;
    try {
      await recordLearningActivity(currentUser.uid, {
        activityId: `${rewardKey}_${Date.now()}`,
        rewardKey,
        result: {
          ...result,
          kind: gameId === 'speed-quiz' ? 'quiz' : practice ? 'practice-game' : 'simulation',
          icon: 'game-controller-outline',
          title: practice ? 'Game latihan selesai' : 'Simulasi selesai',
          subtitle: `${gameId} · ${result.correct ?? result.correctCount ?? 0} benar`,
        },
      });
    } catch (error) {
      console.warn('Gagal menyimpan hasil game:', error);
      Alert.alert('Gagal menyimpan hasil', 'Poin game belum tersinkron ke akun.');
    }
  };

  const openStoryChat = async () => {
    try {
      const result = await unlockStoryWithPoints(
        currentUser.uid,
        'story-binary-search',
        STORY_EPISODE_COST,
      );
      if (!result.success) {
        Alert.alert('Poin belum cukup', `Cerita ini memerlukan ${STORY_EPISODE_COST} poin.`);
        return;
      }
      navigateTo('story-chat');
    } catch (error) {
      console.warn('Gagal membuka cerita:', error);
      Alert.alert('Gagal membuka cerita', 'Periksa koneksi internet lalu coba lagi.');
    }
  };

  const handleStoryComplete = () => {
    recordLearningActivity(currentUser.uid, {
      activityId: 'story_completed_binary-search',
      result: {
        kind: 'story',
        icon: 'chatbubbles-outline',
        title: 'Cerita selesai',
        subtitle: 'Misi Mencari 23',
      },
    }).catch((error) => {
      console.warn('Gagal menyimpan aktivitas cerita:', error);
    });
  };

  const handleProfileSave = async (profile) => {
    const result = await saveAuthenticatedProfile(profile);
    if (result.success) setCurrentUser((user) => ({ ...user, ...result.user }));
    return result;
  };

  const navigateTo = (nextScreen) => {
    if (nextScreen === activeTab) return;
    setNavigationStack((prev) => [...prev, nextScreen]);
  };

  const goBack = () => {
    setNavigationStack((prev) => {
      if (prev.length <= 1) {
        return ['home'];
      }
      return prev.slice(0, -1);
    });
  };

  let screen;
  switch (activeTab) {
    case 'auth-loading':
      screen = (
        <View style={common.emptyBox}>
          <ActivityIndicator size="large" color={COLORS.blue} />
          <Text style={common.emptyDesc}>Memeriksa sesi akun...</Text>
        </View>
      );
      break;
    case 'login':
      screen = (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onGoRegister={() => navigateTo('signin')}
        />
      );
      break;
    case 'signin':
      screen = (
        <SigninScreen
          onBack={goBack}
          onGoLogin={goBack}
          onRegisterSuccess={handleLoginSuccess}
        />
      );
      break;
    case 'materi':
      screen = (
        <MateriScreen
          onBack={goBack}
          initialMateriId={selectedMateriId}
          progressByMateri={readingProgress}
          completedMateri={completedMateri}
          onRead={handleRead}
          onQuiz={handleQuiz}
        />
      );
      break;
    case 'reader': {
      const lesson = LESSON_CONTENT.find(
        (item) => item.id === selectedMateriId,
      );
      screen = lesson ? (
        <LessonReaderScreen
          materi={lesson}
          progress={readingProgress[lesson.id] || 0}
          completed={completedMateri.includes(lesson.id)}
          onBack={goBack}
          onProgress={updateReadingProgress}
          onComplete={finishReading}
          onWatchVideo={(materiId) => {
            setSelectedMateriId(materiId);
            navigateTo('video-lesson');
          }}
        />
      ) : (
        <View style={common.emptyBox}>
          <Text style={common.emptyDesc}>Materi tidak ditemukan.</Text>
        </View>
      );
      break;
    }
    case 'video-lesson': {
      const lesson = LESSON_CONTENT.find(
        (item) => item.id === selectedMateriId,
      );
      screen = lesson && VIDEO_LESSONS[lesson.id] ? (
        <VideoLessonScreen
          materi={lesson}
          video={VIDEO_LESSONS[lesson.id]}
          onBack={goBack}
        />
      ) : (
        <View style={common.emptyBox}>
          <Text style={common.emptyDesc}>Video untuk materi ini belum tersedia.</Text>
        </View>
      );
      break;
    }
    case 'lesson-quiz':
    case 'daily-quiz': {
      const isDailyQuiz = activeTab === 'daily-quiz';
      const lesson = LESSON_CONTENT.find(
        (item) => item.id === selectedMateriId,
      );
      screen = (
        <LessonQuizScreen
          title={isDailyQuiz ? 'Kuis Harian' : `Kuis ${lesson?.title || ''}`}
          quizId={isDailyQuiz ? 'daily' : selectedMateriId || 'lesson'}
          questions={
            isDailyQuiz ? dailyQuestions : lesson?.quiz || []
          }
          onBack={goBack}
          onFinished={(result) =>
            handleQuizFinished(
              isDailyQuiz ? 'daily' : selectedMateriId || 'lesson',
              isDailyQuiz ? 'Kuis harian selesai' : `Kuis ${lesson?.title || ''} selesai`,
              result,
            )
          }
        />
      );
      break;
    }
    case 'games':
      screen = (
        <MiniGameScreen
          onBack={goBack}
          points={points}
          storyUnlocked={storyUnlocked}
          onReadMateri={handleRead}
          onPlaySimulation={(game) => {
            setSelectedMateriId(game.materiId);
            navigateTo('game-setup');
          }}
          onPlayPractice={(game) => {
            setSelectedPracticeGameId(game.id);
            navigateTo('practice-game');
          }}
          onOpenStory={openStoryChat}
        />
      );
      break;
    case 'game-setup':
      screen = (
        <GameSetupScreen
          initialMateriId={selectedMateriId}
          onBack={goBack}
          onStart={(config) => {
            setGameConfig(config);
            navigateTo('game-play');
          }}
        />
      );
      break;
    case 'game-play': {
      const GameScreen = MINI_GAME_SCREENS[gameConfig?.materiId];
      screen = GameScreen ? (
        <GameScreen
          level={gameConfig.level}
          onBack={goBack}
          onReward={(result) => awardGamePoints(`simulation-${gameConfig.materiId}`, result)}
        />
      ) : (
        <GamePlayScreen
          config={gameConfig}
          onBack={goBack}
          onReward={(result) => awardGamePoints(`simulation-${gameConfig?.materiId}`, result)}
        />
      );
      break;
    }
    case 'practice-game':
      screen = (
        <PracticeGameScreen
          key={selectedPracticeGameId}
          gameId={selectedPracticeGameId}
          onBack={goBack}
          onReward={(gameId, result) => awardGamePoints(gameId, result)}
        />
      );
      break;
    case 'story-chat':
      screen = <StoryChatScreen onBack={goBack} onComplete={handleStoryComplete} />;
      break;
    case 'profile':
      screen = (
        <ProfileScreen
          onBack={goBack}
          onLogout={handleLogout}
          user={currentUser}
          points={points}
          learningStats={learningStats}
          onSaveProfile={handleProfileSave}
          onOpenInfo={navigateTo}
        />
      );
      break;
    case 'help':
    case 'about':
      screen = <InfoScreen type={activeTab} onBack={goBack} />;
      break;
    case 'leaderboard':
      screen = <LeaderboardScreen user={currentUser} points={points} />;
      break;
    case 'scan':
      screen = (
        <ScanScreen
          onBack={goBack}
          onGoGenerate={() => navigateTo('generate')}
          onScanned={(result) => {
            if (result.type === 'lesson') {
              setScannedLesson(result.lesson);
              navigateTo('qr-lesson');
              return;
            }
            setScannedForm(result.form);
            navigateTo('form');
          }}
        />
      );
      break;
    case 'form':
      screen = <DynamicFormScreen config={scannedForm} onBack={goBack} />;
      break;
    case 'qr-lesson':
      screen = scannedLesson ? (
        <LessonReaderScreen
          materi={{
            ...scannedLesson,
            id: 'qr-lesson',
            sections: [
              {
                heading: 'Isi Pelajaran',
                blocks: scannedLesson.content
                  .split(/\n+/)
                  .map((text) => text.trim())
                  .filter(Boolean)
                  .map((text) => ({ type: 'p', text })),
              },
            ],
          }}
          onBack={goBack}
          showLessonActions={false}
          backLabel="Kembali ke pemindai"
        />
      ) : (
        <View style={common.emptyBox}>
          <Text style={common.emptyDesc}>Materi QR tidak ditemukan.</Text>
        </View>
      );
      break;
    case 'generate':
      screen = <GenerateScreen onBack={goBack} />;
      break;
    case 'home':
    default:
      screen = (
        <HomeScreen
          lastOpened={lastOpened}
          lastProgress={readingProgress[lastOpenedId] || 0}
          learningStats={learningStats}
          activities={userData?.activities || []}
          streakDays={userData?.streakDays || []}
          currentStreak={userData?.currentStreak || 0}
          userName={currentUser?.name || 'Siswa'}
          points={points}
          onGoMateri={() => {
            setSelectedMateriId(null);
            navigateTo('materi');
          }}
          onContinue={() => {
            setSelectedMateriId(lastOpenedId);
            navigateTo('reader');
          }}
          onGoScan={() => navigateTo('scan')}
          onDailyQuiz={() => navigateTo('daily-quiz')}
        />
      );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={common.safe} edges={['top']}>
        <View style={common.screen}>{screen}</View>
        {TABS.some((tab) => tab.key === activeTab) ? (
          <BottomTabBar active={activeTab} onChange={navigateTo} />
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
