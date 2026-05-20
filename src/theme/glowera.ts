import { colors, lightTheme } from './colors';
import { fontFamilies } from './typography';

export const gloweraScreen = {
  colors: {
    background: lightTheme.background,
    backgroundDeep: colors.brandDark,
    surface: lightTheme.surface,
    surfaceSoft: lightTheme.surfaceSecondary,
    surfaceTint: lightTheme.surfaceTertiary,
    primary: lightTheme.primary,
    primarySoft: lightTheme.primaryLight,
    primaryPressed: lightTheme.primaryDark,
    sage: colors.sage,
    sageSoft: colors.mint,
    lavender: colors.lavender,
    lavenderSoft: colors.lilac,
    peach: colors.peach,
    peachSoft: colors.apricot,
    text: lightTheme.text,
    textSoft: lightTheme.textSecondary,
    textMuted: lightTheme.textMuted,
    textFaint: lightTheme.textLight,
    textOnDeep: colors.porcelain,
    textOnPrimary: lightTheme.textOnPrimary,
    border: lightTheme.border,
    borderSoft: lightTheme.borderLight,
    error: lightTheme.error,
    shadow: colors.ink,
  },
  fonts: {
    display: fontFamilies.displayMedium,
    displayRegular: fontFamilies.displayRegular,
    displayItalic: fontFamilies.displayItalic,
    body: fontFamilies.body,
    label: fontFamilies.mono,
    button: fontFamilies.body,
  },
  radii: {
    input: 16,
    control: 18,
    sheet: 28,
    pill: 999,
  },
  copy: {
    appTagline: 'A daily ritual for your inner glow',
    accountSubtitle: 'Begin with a few gentle rituals, then let Glowera hold the rhythm with you.',
    welcomeBack: 'Return to your ritual space',
  },
} as const;

export type GloweraScreenTokens = typeof gloweraScreen;
