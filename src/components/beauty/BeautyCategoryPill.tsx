import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BeautyCategory } from '../../types/beauty';

export const BEAUTY_CATEGORY_COLORS: Record<BeautyCategory, string> = {
  skincare: '#F2B4CC',
  'body-care': '#9B86D4',
  'hair-care': '#8FA886',
  'gua-sha': '#E2CBB2',
  'lip-care': '#F9C4B7',
  'scalp-care': '#D4D1AA',
  'shower-ritual': '#D3DBE2',
  custom: '#FFF6F2',
};

export const BEAUTY_CATEGORY_LABELS: Record<BeautyCategory, string> = {
  skincare: 'Skincare',
  'body-care': 'Body Care',
  'hair-care': 'Hair Care',
  'gua-sha': 'Gua Sha',
  'lip-care': 'Lip Care',
  'scalp-care': 'Scalp Care',
  'shower-ritual': 'Shower Ritual',
  custom: 'Custom',
};

interface BeautyCategoryPillProps {
  category: BeautyCategory;
}

export const BeautyCategoryPill: React.FC<BeautyCategoryPillProps> = ({ category }) => {
  const color = BEAUTY_CATEGORY_COLORS[category];
  return (
    <View style={[styles.pill, { backgroundColor: color }]}>
      <Text style={styles.label}>{BEAUTY_CATEGORY_LABELS[category]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 10,
    fontFamily: 'DMSans',
    fontWeight: '600',
    color: '#3A2E2B',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
