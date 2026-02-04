import { TextStyle, Platform } from 'react-native';

export const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

// Font families - using system fonts with fallbacks
export const fontFamilies = {
  // Sans-serif for main UI
  sans: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  // Monospace for labels (like in Figma design)
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    default: 'monospace',
  }),
  // Serif for display headlines
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'serif',
  }),
};

export const typography: Record<string, TextStyle> = {
  // Display - Bold condensed italic (for hero text like "GLOW WITH US")
  display: {
    fontSize: 42,
    fontWeight: fontWeights.black,
    lineHeight: 46,
    letterSpacing: -1,
    fontStyle: 'italic',
    fontFamily: fontFamilies.serif,
  },
  displaySmall: {
    fontSize: 32,
    fontWeight: fontWeights.bold,
    lineHeight: 36,
    letterSpacing: -0.5,
    fontStyle: 'italic',
    fontFamily: fontFamilies.serif,
  },

  // Headings - Clean geometric sans
  h1: {
    fontSize: 32,
    fontWeight: fontWeights.light,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: fontWeights.light,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: fontWeights.regular,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: fontWeights.medium,
    lineHeight: 28,
  },

  // Body text
  bodyLarge: {
    fontSize: 18,
    fontWeight: fontWeights.regular,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  },

  // Labels - Monospace (like "Daily Rituals" in Figma)
  label: {
    fontSize: 14,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
    fontFamily: fontFamilies.mono,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: fontWeights.regular,
    lineHeight: 16,
    fontFamily: fontFamilies.mono,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 12,
    fontWeight: fontWeights.regular,
    lineHeight: 16,
  },

  // Buttons
  button: {
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: fontWeights.semibold,
    lineHeight: 20,
  },
};
