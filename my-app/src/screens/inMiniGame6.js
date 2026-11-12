import React from 'react';
import GamePlayScreen from './GamePlayScreen';

export default function MiniGame6({ onBack, level = 3 }) {
  return (
    <GamePlayScreen
      config={{ materiId: 'm6', level }}
      onBack={onBack}
    />
  );
}
