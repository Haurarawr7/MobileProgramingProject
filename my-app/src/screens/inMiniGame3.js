import React from 'react';
import GamePlayScreen from './GamePlayScreen';

export default function MiniGame3({ onBack, level = 3 }) {
  return (
    <GamePlayScreen
      config={{ materiId: 'm3', level }}
      onBack={onBack}
    />
  );
}
