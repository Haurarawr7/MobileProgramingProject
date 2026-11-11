import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { TABS } from './src/constants/data';
import common from './src/styles/common';
import BottomTabBar from './src/components/BottomTabBar';

import HomeScreen from './src/screens/HomeScreen';
import MateriScreen from './src/screens/MateriScreen';
import MiniGameScreen from './src/screens/MiniGameScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ScanScreen from './src/screens/ScanScreen';
import DynamicFormScreen from './src/screens/DynamicFormScreen';
import GenerateScreen from './src/screens/GenerateScreen';

export default function App() {
  const [navigationStack, setNavigationStack] = useState(['home']);
  const [scannedForm, setScannedForm] = useState(null);
  const activeTab = navigationStack[navigationStack.length - 1];

  const navigateTo = (nextScreen) => {
    if (nextScreen === activeTab) return;
    setNavigationStack((prev) => [...prev, nextScreen]);
  };

  const goBack = () => {
    setNavigationStack((prev) => (prev.length <= 1 ? ['home'] : prev.slice(0, -1)));
  };

  let screen;
  switch (activeTab) {
    case 'materi':
      screen = <MateriScreen onBack={goBack} />;
      break;
    case 'games':
      screen = <MiniGameScreen onBack={goBack} />;
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
    case 'home':
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
      <SafeAreaView style={common.safe} edges={['top']}>
        <View style={common.screen}>{screen}</View>
        {TABS.some((tab) => tab.key === activeTab) ? (
          <BottomTabBar active={activeTab} onChange={navigateTo} />
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
