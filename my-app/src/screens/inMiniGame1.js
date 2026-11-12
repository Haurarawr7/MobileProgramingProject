import React from 'react';
import GamePlayScreen from './GamePlayScreen';

export default function MiniGame1({ onBack, level = 3 }) {
  return (
    <GamePlayScreen
      config={{ materiId: 'm1', level }}
      onBack={onBack}
    />
  );
}
