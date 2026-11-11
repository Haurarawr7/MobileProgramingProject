import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../constants/colors';
import common from '../styles/common';

export default function SummaryCard({ value, label, isProfile = false }) {
  return (
    <View style={common.summaryCard}>
      <Text
        style={[common.summaryValue, isProfile && { color: COLORS.addGold }]}
      >
        {value}
      </Text>
      <Text style={common.summaryLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
