// Glowera Color System - "Lavender Bloom"
// Soft lavender and plum palette inspired by spring blossoms

export const colors = {
  // Primary - Lavender range (flower petals)
  lavender50: '#FAF5FC',
  lavender100: '#F5EBF8',
  lavender200: '#E8D9F0',
  lavender300: '#D4C4E8',  // Main lavender accent
  lavender400: '#C4B0E0',
  lavender500: '#B09AD6',

  // Secondary - Blush Pink
  blush50: '#FDF5F8',
  blush100: '#FAE8ED',  // Main background
  blush200: '#F5D6E0',
  blush300: '#EDBED0',
  blush400: '#E8A4C8',  // Pink border/accent
  blush500: '#DE8AB8',

  // Tertiary - Deep Plum (for headlines)
  plum50: '#F5EBF0',
  plum100: '#E8D4DE',
  plum200: '#D4A8C0',
  plum300: '#A86890',
  plum400: '#7A4068',
  plum500: '#5C2D5C',  // Deep plum text

  // Accent - Soft Sage (kept for variety)
  sage50: '#F5FAF7',
  sage100: '#E8F4ED',
  sage200: '#D1E9DB',
  sage300: '#B8DCC6',
  sage400: '#9ECFB0',

  // Neutral backgrounds - soft pink tints
  cream50: '#FEFCFD',
  cream100: '#FCF8FA',
  cream200: '#FAF5F7',
  cream300: '#F5EDF0',
  cream400: '#EDE3E8',

  // Warm neutrals
  tan50: '#FAF7F8',
  tan100: '#F5EEEF',
  tan200: '#EBE3E5',
  tan300: '#DED3D6',

  // Text - with plum undertones
  textPrimary: '#1A1A1A',      // Near black for body
  textSecondary: '#5C4A52',    // Warm gray-plum
  textMuted: '#8A7A82',        // Muted plum-gray
  textLight: '#B8A8B0',        // Light muted

  // Semantic
  success: '#9ECFB0',
  warning: '#F5D4A8',
  error: '#E89090',

  // Base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Category colors - lavender bloom palette
export const categoryColors: Record<string, string> = {
  nutrition: '#D4C4E8',     // Lavender
  movement: '#9ECFB0',      // Soft sage
  supplements: '#E8A4C8',   // Pink
  hobbies: '#B09AD6',       // Deep lavender
  'self-care': '#EDBED0',   // Blush
  reflection: '#7A4068',    // Plum
};

// Gradient definitions for backgrounds
export const gradients = {
  lavenderBloom: ['#FAE8ED', '#F5EBF8', '#E8D9F0'],
  softBlush: ['#FDF5F8', '#FAE8ED', '#F5D6E0'],
  lavenderMist: ['#FAF5FC', '#F5EBF8', '#FAE8ED'],
  plumGlow: ['#FAE8ED', '#E8D4DE', '#D4A8C0'],
};

// Default theme
export const theme = {
  // Core colors
  primary: colors.plum500,       // Deep plum for primary actions
  primaryLight: colors.plum200,
  primaryDark: colors.plum500,

  secondary: colors.lavender300, // Lavender accent
  secondaryLight: colors.lavender100,

  accent: colors.blush400,       // Pink accent
  accentLight: colors.blush200,

  tertiary: colors.sage400,

  // Backgrounds
  background: colors.blush100,   // Main background - light pink
  backgroundWarm: colors.blush50,
  backgroundGradientStart: '#FAE8ED',
  backgroundGradientEnd: '#F5EBF8',

  // Surfaces
  surface: colors.white,
  surfaceSecondary: colors.blush50,
  surfaceTertiary: colors.cream200,
  surfaceElevated: colors.white,

  // Text
  text: colors.textPrimary,
  textSecondary: colors.textSecondary,
  textMuted: colors.textMuted,
  textLight: colors.textLight,
  textOnPrimary: colors.white,

  // Borders
  border: colors.blush300,
  borderLight: colors.blush200,
  borderSubtle: colors.cream200,

  // Semantic
  success: colors.success,
  warning: colors.warning,
  error: colors.error,

  // Shadows (lavender-tinted)
  shadowColor: colors.lavender300,
};

export type ThemeColors = typeof theme;
