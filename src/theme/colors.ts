// Glowera Color System - "Golden Hour Sanctuary"
// Warm, nurturing palette inspired by sunrise moments

export const colors = {
  // Primary - Warm Peach to Rose gradient range
  peach50: '#FFF8F5',
  peach100: '#FFEDE5',
  peach200: '#FFDDD0',
  peach300: '#FFCAB8',
  peach400: '#FFB199',  // Primary accent
  peach500: '#FF9B7A',

  // Secondary - Soft Blush Pinks
  blush50: '#FFF5F7',
  blush100: '#FFE8ED',
  blush200: '#FFD4DE',
  blush300: '#FFBDCC',
  blush400: '#FF99B5',  // Original primary
  blush500: '#FF7A9C',

  // Tertiary - Dusty Rose / Mauve
  rose50: '#FDF5F8',
  rose100: '#F8E8ED',
  rose200: '#F0D4DE',
  rose300: '#E5BDC9',
  rose400: '#D4A3B3',

  // Accent - Soft Sage (more muted than mint)
  sage50: '#F5FAF7',
  sage100: '#E8F4ED',
  sage200: '#D1E9DB',
  sage300: '#B8DCC6',
  sage400: '#9ECFB0',

  // Lavender - kept for variety
  lavender50: '#F9F7FF',
  lavender100: '#F0EBFF',
  lavender200: '#E2D9FF',
  lavender300: '#C9ADFF',
  lavender400: '#B591F5',

  // Warm Cream backgrounds
  cream50: '#FFFDFB',
  cream100: '#FFF9F5',
  cream200: '#FFF3EB',
  cream300: '#FFEDE0',
  cream400: '#FFE5D4',

  // Warm Tan for depth
  tan50: '#FAF7F5',
  tan100: '#F5EDE8',
  tan200: '#EBE0D8',
  tan300: '#DED0C5',

  // Text - warmer undertones
  textPrimary: '#3D3535',
  textSecondary: '#6B5B5B',
  textMuted: '#9A8B8B',
  textLight: '#C4B8B8',

  // Semantic - warmer versions
  success: '#9ECFB0',
  warning: '#FFD4A8',
  error: '#FFADA8',

  // Base
  white: '#FFFFFF',
  black: '#1A1A1A',
  transparent: 'transparent',
};

// Category colors - harmonious warm palette
export const categoryColors: Record<string, string> = {
  nutrition: '#FFB199',     // Warm peach
  movement: '#9ECFB0',      // Soft sage
  supplements: '#FFD4A8',   // Honey
  hobbies: '#C9ADFF',       // Lavender
  'self-care': '#FFBDCC',   // Blush
  reflection: '#E5BDC9',    // Dusty rose
};

// Gradient definitions for backgrounds
export const gradients = {
  warmSunrise: ['#FFF9F5', '#FFEDE5', '#FFE8ED'],
  peachGlow: ['#FFFDFB', '#FFF3EB', '#FFDDD0'],
  softBlush: ['#FFF5F7', '#FFE8ED', '#FFEDE5'],
  creamyRose: ['#FFFDFB', '#FFF8F5', '#FFF5F7'],
};

// Default theme
export const theme = {
  // Core colors
  primary: colors.blush400,
  primaryLight: colors.blush200,
  primaryDark: colors.blush500,

  secondary: colors.peach400,
  secondaryLight: colors.peach200,

  accent: colors.sage400,
  accentLight: colors.sage200,

  tertiary: colors.lavender300,

  // Backgrounds
  background: colors.cream50,
  backgroundWarm: colors.cream100,
  backgroundGradientStart: '#FFF9F5',
  backgroundGradientEnd: '#FFEDE5',

  // Surfaces
  surface: colors.white,
  surfaceSecondary: colors.cream100,
  surfaceTertiary: colors.cream200,
  surfaceElevated: colors.white,

  // Text
  text: colors.textPrimary,
  textSecondary: colors.textSecondary,
  textMuted: colors.textMuted,
  textLight: colors.textLight,
  textOnPrimary: colors.white,

  // Borders
  border: colors.cream300,
  borderLight: colors.cream200,
  borderSubtle: colors.tan100,

  // Semantic
  success: colors.success,
  warning: colors.warning,
  error: colors.error,

  // Shadows (warm-tinted)
  shadowColor: '#D4A3B3',
};

export type ThemeColors = typeof theme;
