import React from 'react';
import GamePlayScreen from './GamePlayScreen';

export default function MiniGame5({ onBack, level = 3 }) {
  return (
    <GamePlayScreen
      config={{ materiId: 'm5', level }}
      onBack={onBack}
    />
  );
}
