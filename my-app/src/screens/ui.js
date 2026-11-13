import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/fonts';

const TILE_COLORS = {
  idle: COLORS.white,
  active: COLORS.yellow,
  good: COLORS.mint,
  bad: COLORS.pink,
  dim: COLORS.sky,
};

export function Tile({ value, hidden = false, state = 'idle', size, onPress }) {
  const content = (
    <Text style={[styles.tileText, size === 'big' && styles.tileTextBig]}>
      {hidden ? '?' : value}
    </Text>
  );
  const tileStyle = [
    styles.tile,
    size === 'small' && styles.tileSmall,
    size === 'big' && styles.tileBig,
    { backgroundColor: TILE_COLORS[state] || TILE_COLORS.idle },
  ];

  return onPress ? (
    <TouchableOpacity style={tileStyle} onPress={onPress} activeOpacity={0.75}>
      {content}
    </TouchableOpacity>
  ) : (
    <View style={tileStyle}>{content}</View>
  );
}

export function Row({ children, wrap = false }) {
  return (
    <View style={[styles.row, wrap && styles.rowWrap]}>
      {children}
    </View>
  );
}

export function Prompt({ children }) {
  return <Text style={styles.prompt}>{children}</Text>;
}

export function Label({ children }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function Msg({ children }) {
  return <Text style={styles.message}>{children}</Text>;
}

export function Btn({ label, kind = 'primary', onPress }) {
  const secondary = kind === 'secondary';
  return (
    <TouchableOpacity
      style={[styles.button, secondary && styles.buttonSecondary]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonTextSecondary]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSmall: { minWidth: 36, height: 36, paddingHorizontal: 6 },
  tileBig: { minWidth: 64, height: 64 },
  tileText: { fontFamily: FONTS.sansMedium, fontSize: 16, color: COLORS.ink },
  tileTextBig: { fontSize: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  rowWrap: { flexWrap: 'wrap' },
  prompt: {
    fontFamily: FONTS.sansMedium,
    fontSize: 15,
    color: COLORS.ink,
    marginBottom: 14,
  },
  label: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 8,
  },
  message: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.text,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: COLORS.ink,
    borderRadius: 10,
    backgroundColor: COLORS.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: { backgroundColor: COLORS.white },
  buttonText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.ink,
    textAlign: 'center',
  },
  buttonTextSecondary: { color: COLORS.secondary },
});
