import { TextStyle, Platform } from 'react-native';

export const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '900' as const,
};

// Font families - Brand typography system
// Satoshi: Headings/Display | DM Sans: Body | Space Mono: Labels (ALL CAPS)
export const fontFamilies = {
  // Primary heading font
  sans: 'Satoshi-Medium',
  sansBold: 'Satoshi-Medium',
  sansMedium: 'Satoshi-Medium',
  sansItalic: 'Satoshi-Medium',
  // Monospace labels - Space Mono (ALL CAPS)
  mono: 'SpaceMono-Bold',
  // Body text - DM Sans
  body: 'DMSans',
  // Luxury display - Optima (humanist serif feel)
  display: 'Optima-Bold',
  displayMedium: 'Optima-Medium',
  displayItalic: 'Optima-Italic',
  displayRegular: 'Optima-Regular',
  // Serif fallback
  serif: 'Optima-Regular',
};

// Helper to get the right fontFamily for a given weight
export function getFontFamily(weight?: string): string {
  switch (weight) {
    case '700':
    case '800':
    case '900':
      return 'Satoshi-Medium';
    case '500':
    case '600':
      return 'Satoshi-Medium';
    default:
      return 'DMSans';
  }
}

export const typography: Record<string, TextStyle> = {
  // Optima display styles — luxury/editorial moments
  display: {
    fontSize: 36,
    fontFamily: 'Optima-Bold',
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Optima-Medium',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 18,
    fontFamily: 'Optima-Italic',
    lineHeight: 26,
  },
  quote: {
    fontSize: 16,
    fontFamily: 'Optima-Italic',
    lineHeight: 24,
  },

  // Display - Satoshi (for section/card headings)
  displaySmall: {
    fontSize: 28,
    fontFamily: 'Satoshi-Medium',
    lineHeight: 34,
    letterSpacing: -0.3,
  },

  // Headings - Satoshi
  h1: {
    fontSize: 28,
    fontFamily: 'Satoshi-Medium',
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: 24,
    fontFamily: 'Satoshi-Medium',
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 22,
    fontFamily: 'Satoshi-Medium',
    lineHeight: 28,
  },
  h4: {
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
    lineHeight: 26,
  },

  // Body text - DM Sans
  bodyLarge: {
    fontSize: 17,
    fontFamily: 'DMSans',
    lineHeight: 26,
  },
  body: {
    fontSize: 15,
    fontFamily: 'DMSans',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 14,
    fontFamily: 'DMSans',
    lineHeight: 20,
  },

  // Labels - Space Mono ALL CAPS
  label: {
    fontSize: 13,
    fontFamily: 'SpaceMono-Bold',
    lineHeight: 18,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  labelSmall: {
    fontSize: 12,
    fontFamily: 'SpaceMono-Bold',
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  caption: {
    fontSize: 13,
    fontFamily: 'DMSans',
    lineHeight: 18,
  },

  // Buttons - DM Sans
  button: {
    fontSize: 15,
    fontFamily: 'DMSans',
    lineHeight: 22,
  },
  buttonSmall: {
    fontSize: 14,
    fontFamily: 'DMSans',
    lineHeight: 20,
  },
};
