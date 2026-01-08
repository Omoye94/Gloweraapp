import { TextStyle } from 'react-native';

export const fontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const typography: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: fontWeights.bold,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: fontWeights.bold,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 24,
    fontWeight: fontWeights.semibold,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: fontWeights.semibold,
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

  // Labels and captions
  label: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    lineHeight: 20,
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: fontWeights.medium,
    lineHeight: 16,
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
