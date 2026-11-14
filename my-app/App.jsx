import React, { useState, useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { TABS, MATERI } from './src/constants/data';
import common from './src/styles/common';
import BottomTabBar from './src/components/BottomTabBar';
import { getLastOpened, saveOpened } from './src/services/progress';

import HomeScreen from './src/screens/HomeScreen';
import MateriScreen from './src/screens/MateriScreen';
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
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ScanScreen from './src/screens/ScanScreen';
import DynamicFormScreen from './src/screens/DynamicFormScreen';
import GenerateScreen from './src/screens/GenerateScreen';
import LoginScreen from './src/screens/Login';
import SigninScreen from './src/screens/Signin';
import { getSavedUser, logoutUser } from './src/services/auth';
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

// const AUTH_ENABLED = !__DEV__;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [navigationStack, setNavigationStack] = useState(['home']);
  const [scannedForm, setScannedForm] = useState(null);
  const [lastOpenedId, setLastOpenedId] = useState(null);
  const [selectedMateriId, setSelectedMateriId] = useState(null);
  const [gameConfig, setGameConfig] = useState(null);
  const [lastProgress, setLastProgress] = useState(0);
  const lastOpened = MATERI.find((m) => m.id === lastOpenedId) ?? null;
  const activeTab = navigationStack[navigationStack.length - 1];
  const [fontsLoaded] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, InstrumentSerif_400Regular_Italic, });

  useEffect(() => {
    /*
    getSavedUser().then((savedUser) => {
      if (savedUser) {
        setCurrentUser(savedUser);
        setNavigationStack(['home']);
      } else {
        setNavigationStack(['login']);
      }
    });
    */

    getLastOpened()
      .then((last) => {
        if (!last) return;
        setLastOpenedId(last.materiId);
        setLastProgress(last.progress ?? 0);
      })
      .catch((e) => console.warn('Gagal memuat materi terakhir', e));
  }, []);

  if (!fontsLoaded) return null;

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setNavigationStack(['home']);
  };

  const handleLogout = async () => {
    setNavigationStack(['home']);
    /*
    await logoutUser();
    setCurrentUser(null);
    setNavigationStack(['login']);
    */
  };

  const handleStart = (materi) => {
    setLastOpenedId(materi.id);
    setLastProgress(0);
    saveOpened(materi.id).catch((e) => console.warn('Gagal menyimpan', e));
    setSelectedMateriId(materi.id);
    navigateTo('game-setup');
  };

  const navigateTo = (nextScreen) => {
    if (nextScreen === activeTab) return;
    setNavigationStack((prev) => [...prev, nextScreen]);
  };

  const goBack = () => {
    setNavigationStack((prev) => {
      if (prev.length <= 1) {
        return ['home'];
        // return currentUser ? ['home'] : ['login'];
      }
      return prev.slice(0, -1);
    });
  };

  let screen;
  switch (activeTab) {
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
          onStart={handleStart}
        />
      );
      break;
    case 'games':
      screen = (
        <MiniGameScreen
          onBack={goBack}
          onPlay={(game) => {
            setSelectedMateriId(game.materiId);
            navigateTo('game-setup');
          }}
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
        <GameScreen level={gameConfig.level} onBack={goBack} />
      ) : (
        <GamePlayScreen config={gameConfig} onBack={goBack} />
      );
      break;
    }
    case 'profile':
      screen = (
        <ProfileScreen
          onBack={goBack}
          onLogout={handleLogout}
          user={currentUser}
        />
      );
      break;
    case 'leaderboard':
      screen = <LeaderboardScreen user={currentUser} />;
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
    case 'home':
    default:
      screen = (
        <HomeScreen
          lastOpened={lastOpened}
          lastProgress={lastProgress}
          onGoMateri={() => {
            setSelectedMateriId(null);
            navigateTo('materi');
          }}
          onContinue={() => {
            setSelectedMateriId(lastOpenedId);
            navigateTo('materi');
          }}
          onGoScan={() => navigateTo('scan')}
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
