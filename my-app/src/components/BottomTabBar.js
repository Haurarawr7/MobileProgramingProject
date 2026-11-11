import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { TABS } from '../constants/data';

export default function BottomTabBar({ active, onChange }) {
  return (
    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const activeColor =
          tab.key === 'materi' ? COLORS.secondary : COLORS.primary;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={isActive ? activeColor : COLORS.muted}
            />
            <Text
              style={[
                styles.tabLabel,
                isActive && { color: activeColor, fontWeight: '700' },
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.addAmber,
    paddingTop: 12,
    paddingBottom: 16,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabLabel: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  tabIndicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.addAmber,
    marginTop: 4,
  },
});
