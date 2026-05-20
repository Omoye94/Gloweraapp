import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { GARDEN_THEME_LIST, GardenThemeId } from '../../constants/gardenThemes';
import { spacing, borderRadius, shadows } from '../../theme';

interface GardenThemePickerProps {
  activeTheme: GardenThemeId;
  onSelectTheme: (themeId: GardenThemeId) => void;
}

export const GardenThemePicker: React.FC<GardenThemePickerProps> = ({
  activeTheme,
  onSelectTheme,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {GARDEN_THEME_LIST.map((theme) => {
        const isActive = theme.id === activeTheme;
        return (
          <Pressable
            key={theme.id}
            style={({ pressed }) => [
              styles.card,
              isActive && styles.cardActive,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
            onPress={() => onSelectTheme(theme.id)}
          >
            <Text style={styles.emoji}>{theme.emoji}</Text>
            <Text style={[styles.name, isActive && styles.nameActive]}>{theme.name}</Text>
            <Text style={styles.description}>{theme.description}</Text>
            <View style={styles.swatchRow}>
              {theme.swatchColors.map((color, i) => (
                <View
                  key={i}
                  style={[styles.swatch, { backgroundColor: color }]}
                />
              ))}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  card: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  cardActive: {
    borderColor: '#F2B4CC',
  },
  emoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3A2E2B',
    textAlign: 'center',
    marginBottom: 2,
  },
  nameActive: {
    color: '#F2B4CC',
  },
  description: {
    fontSize: 11,
    color: '#9E8880',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 6,
  },
  swatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
});
