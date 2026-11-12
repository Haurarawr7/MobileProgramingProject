import React from 'react';
import GamePlayScreen from './GamePlayScreen';

export default function MiniGame4({ onBack, level = 3 }) {
  return (
    <GamePlayScreen
      config={{ materiId: 'm4', level }}
      onBack={onBack}
    />
  );
}
