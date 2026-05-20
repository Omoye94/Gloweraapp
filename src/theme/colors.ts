// Glowera Brand Color System — Modern Bloom (2026)
// Warm cream base + saturated magenta/lavender/peach gradient accents, deep plum ink.
// Pulls from Serenity Waves gradient language on a Breathe-style warm neutral.

export const colors = {
  // Brand Primary
  porcelain: '#FFF6F2',    // Warm cream base (app background)
  linen: '#F4E8E0',        // Deeper warm cream surface
  bloom: '#E87FA6',        // Saturated magenta — primary accent / CTAs
  blush: '#F2B4CC',        // Soft pink (tints, pill bgs)
  rose: '#C45A82',         // Deep magenta (pressed / active states)
  lavender: '#9B86D4',     // Saturated lavender (gradient mid, reflect contexts)
  lilac: '#D8C9EC',        // Soft lavender tint
  peach: '#F4A888',        // Warm peach (gradient warm stop, accent)
  apricot: '#FBD4BF',      // Soft peach tint
  ink: '#3A2E2B',          // Warm dark brown (primary text)
  mocha: '#3A2E2B',        // alias for ink (legacy)
  brandDark: '#2D1A1B',    // Warm dark brown from logo background

  // Extended Palette
  sage: '#8FA886',         // Deeper moss green (nature/growth accent)
  mint: '#B8CFB1',         // Soft sage tint
  vanilla: '#E8D2B0',      // Warm neutral
  sky: '#B8C8D9',          // Cool neutral accent
  teal: '#6FA8A3',         // Deeper teal accent (mixed-warm palette)
  pearl: '#F8EFEE',        // Pink-tinted white for overlays
  sunrise: '#F4A888',      // alias for peach (legacy)

  // Text — warm brown hierarchy on warm cream
  textPrimary: '#3A2E2B',
  textSecondary: '#6B5752',
  textMuted: '#9E8880',
  textLight: '#B8A9A5',

  // Semantic
  success: '#8FA886',
  warning: '#F4C072',
  error: '#C45A82',

  // Base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

// Category colors - brand extended palette
export const categoryColors: Record<string, string> = {
  nutrition: '#B8CFB1',      // Mint
  movement: '#F4A888',       // Peach
  supplements: '#F2B4CC',    // Blush
  hobbies: '#8FA886',        // Sage
  'self-care': '#9B86D4',    // Lavender
  reflection: '#E8D2B0',     // Vanilla
};

// Gradient definitions — multi-stop, saturated. Use with expo-linear-gradient.
export const gradients = {
  // Hero card — Serenity Waves-style lavender → magenta → peach
  heroBloom:     ['#9B86D4', '#E87FA6', '#F4A888'],
  // Softer version for secondary cards
  softBloom:     ['#D8C9EC', '#F2B4CC', '#FBD4BF'],
  // Reflect / journal — lavender dominant
  lavenderMist:  ['#9B86D4', '#D8C9EC', '#FFF6F2'],
  // Garden / nature — sage dominant, warm peach glow
  sageBloom:     ['#8FA886', '#B8CFB1', '#FBD4BF'],
  // Dawn — for morning / rituals
  etherealDawn:  ['#F4A888', '#F2B4CC', '#D8C9EC'],
  // Subtle cream surface gradient
  warmCream:     ['#FFF6F2', '#F4E8E0'],
  // Progress / glow
  bloomGlow:     ['#E87FA6', '#F4A888'],
  // Legacy aliases
  lavenderBloom: ['#D8C9EC', '#F2B4CC'],
  softBlush:     ['#F2B4CC', '#FBD4BF'],
  plumGlow:      ['#9B86D4', '#E87FA6'],
  sageMist:      ['#B8CFB1', '#FFF6F2'],
};

// Light theme
export const lightTheme = {
  // Core colors
  primary: colors.bloom,
  primaryLight: colors.blush,
  primaryDark: colors.rose,

  secondary: colors.lavender,
  secondaryLight: colors.lilac,

  accent: colors.peach,
  accentLight: colors.apricot,

  tertiary: colors.sage,

  // Backgrounds
  background: colors.porcelain,
  backgroundWarm: colors.linen,
  backgroundGradientStart: colors.porcelain,
  backgroundGradientEnd: colors.linen,

  // Surfaces
  surface: '#FFFAF8',
  surfaceSecondary: colors.linen,
  surfaceTertiary: colors.pearl,
  surfaceElevated: '#FFFAF8',

  // Text - warm brown hierarchy
  text: colors.ink,
  textSecondary: '#6B5752',
  textMuted: '#9E8880',
  textLight: '#B8A9A5',
  textOnPrimary: '#FFFAF8',

  // Borders
  border: '#EADBD4',
  borderLight: '#F4E8E0',
  borderSubtle: '#F4E8E0',

  // Semantic
  success: colors.success,
  warning: colors.warning,
  error: colors.error,

  // Shadows
  shadowColor: 'rgba(58,46,43,0.08)',

  // Status bar
  statusBarStyle: 'dark' as const,
};

// Dark theme - Deep Plum
export const darkTheme = {
  // Core colors
  primary: colors.bloom,
  primaryLight: '#3A2847',
  primaryDark: colors.rose,

  secondary: colors.lavender,
  secondaryLight: '#3A2847',

  accent: colors.peach,
  accentLight: '#4A3B5C',

  tertiary: colors.sage,

  // Backgrounds
  background: colors.ink,
  backgroundWarm: '#2A1D3F',
  backgroundGradientStart: colors.ink,
  backgroundGradientEnd: '#2A1D3F',

  // Surfaces
  surface: '#2A1D3F',
  surfaceSecondary: '#3A2847',
  surfaceTertiary: '#4A3555',
  surfaceElevated: '#2A1D3F',

  // Text
  text: colors.porcelain,
  textSecondary: '#D8C9EC',
  textMuted: '#9A8BA5',
  textLight: '#6A5B75',
  textOnPrimary: colors.ink,

  // Borders
  border: '#4A3555',
  borderLight: '#3A2847',
  borderSubtle: '#2A1D3F',

  // Semantic
  success: colors.success,
  warning: colors.warning,
  error: colors.error,

  // Shadows
  shadowColor: '#000000',

  // Status bar
  statusBarStyle: 'light' as const,
};

// Dark mode gradients
export const darkGradients = {
  heroBloom:     ['#4A3555', '#7B5C9A', '#B15C7E'],
  softBloom:     ['#3A2847', '#4A3555', '#5A4365'],
  lavenderMist:  ['#4A3555', '#3A2847', '#1F1530'],
  sageBloom:     ['#3E5A3A', '#4A3555', '#1F1530'],
  etherealDawn:  ['#5A4365', '#4A3555', '#3A2847'],
  warmCream:     ['#1F1530', '#2A1D3F'],
  bloomGlow:     ['#B15C7E', '#7B5C9A'],
  lavenderBloom: ['#4A3555', '#3A2847'],
  softBlush:     ['#3A2847', '#1F1530'],
  plumGlow:      ['#4A3555', '#3A2847'],
  sageMist:      ['#3E5A3A', '#1F1530'],
};

// Default theme (light)
export const theme = lightTheme;

export type ThemeColors = Omit<typeof lightTheme, 'statusBarStyle'> & {
  statusBarStyle: 'light' | 'dark';
};
