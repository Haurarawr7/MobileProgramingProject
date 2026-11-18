import React from 'react';
import GamePlayScreen from './GamePlayScreen';

export default function MiniGame2({ onBack, onReward, level = 3 }) {
  return (
    <GamePlayScreen
      config={{ materiId: 'm2', level }}
      onBack={onBack}
      onReward={onReward}
    />
  );
}
