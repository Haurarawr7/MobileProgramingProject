import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import common from '../styles/common';

export default function SectionHeader({
  title,
  linkLabel = 'Lihat semua',
  onPressLink,
}) {
  return (
    <View style={common.sectionHeader}>
      <Text style={common.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onPressLink}>
        <Text style={common.linkAll}>{linkLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
